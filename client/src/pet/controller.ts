import {PetModel, PetId, PetAccessoryId, PetState} from './model';
import TypedDatastore from '../services/db';

export class PetController {
  // Collection of all pet instances managed by this controller
  private pets: Map<PetId, PetModel>;

  // View update callback
  // When called, the PetController will pass the petId of the updated pet
  // to this callback function, allowing the view to then retrieve the
  // latest data for that pet and update its display accordingly.
  private viewUpdateCallback: (petId: PetId, state: PetState) => void;

  // Update interval tracking for periodic update loop runs
  private updateIntervalId: NodeJS.Timeout | null = null;
  private lastUpdateTime: number;

  /**
   * Create a new pet controller instance
   * @param viewUpdateCallback Callback to notify view of updates
   */
  constructor(viewUpdateCallback: (petId: PetId, state: PetState) => void) {
    this.pets = new Map();
    this.viewUpdateCallback = viewUpdateCallback;
    this.lastUpdateTime = Date.now();
    this.startUpdateLoop();
  }

  /**
   * Clean up resources when controller is destroyed
   */
  public destroy(): void {
    if (this.updateIntervalId) {
      clearInterval(this.updateIntervalId);
      this.updateIntervalId = null;
    }
  }

  /**
   * Handle the "Create Pet" user action
   * @param name Name for the new pet
   * @param species Species of the new pet
   * @returns The new pet's ID
   */
  public handleCreatePet(name: string, species: 'husky'): PetId {
    // Create pet using the model
    const pet = new PetModel(name, species);
    const petId = pet.getId();

    // Store the pet
    this.pets.set(petId, pet);

    // Save to database
    this.savePetToDatabase(petId);

    // Notify view
    this.notifyViewUpdate(petId, pet.getState());

    return petId;
  }

  /**
   * Handle the "Rename Pet" user action
   * @param petId ID of the pet to rename
   * @param newName New name for the pet
   */
  public handleRenamePet(petId: PetId, newName: string): void {
    const pet = this.pets.get(petId);
    if (!pet) {
      console.error(`Cannot rename pet: Pet with ID ${petId} not found`);
      return;
    }

    // Update via model
    const updatedState = pet.rename(newName);

    // Save and update view
    this.savePetToDatabase(petId);
    this.notifyViewUpdate(petId, updatedState);
  }

  /**
   * Handle "Feed Pet" button press
   * @param petId ID of the pet
   */
  public handleFeedPet(petId: PetId): void {
    const pet = this.getPet(petId);
    if (!pet) return;

    // Let model handle the feeding logic
    const updatedState = pet.interact('feed');

    // Save and notify view
    this.notifyViewUpdate(petId, updatedState);
    this.savePetToDatabase(petId);
  }

  /**
   * Handle "Play with Pet" button press
   * @param petId ID of the pet
   */
  public handlePlayWithPet(petId: PetId): void {
    const pet = this.getPet(petId);
    if (!pet) return;

    // Let model handle the play logic
    const updatedState = pet.interact('play');

    // Save and notify view
    this.notifyViewUpdate(petId, updatedState);
    this.savePetToDatabase(petId);
  }

  /**
   * Handle "Groom Pet" button press
   * @param petId ID of the pet
   */
  public handleGroomPet(petId: PetId): void {
    const pet = this.getPet(petId);
    if (!pet) return;

    // Let model handle the grooming logic
    const updatedState = pet.interact('groom');

    // Save and notify view
    this.notifyViewUpdate(petId, updatedState);
    this.savePetToDatabase(petId);
  }

  /**
   * Handle pet movement on screen
   * @param petId ID of the pet
   * @param x X coordinate
   * @param y Y coordinate
   */
  public handleMovePet(petId: PetId, x: number, y: number): void {
    const pet = this.getPet(petId);
    if (!pet) return;

    // Let model update position
    const updatedState = pet.setPosition(x, y);

    // Only update view (no need to save position to database)
    this.notifyViewUpdate(petId, updatedState);
  }

  /**
   * Handle task completion notification
   * @param petId ID of the pet
   */
  public handleTaskCompleted(petId: PetId): void {
    const pet = this.getPet(petId);
    if (!pet) return;

    // Let model handle task completion logic
    const updatedState = pet.onTaskComplete();

    // Save and notify view
    this.savePetToDatabase(petId);
    this.notifyViewUpdate(petId, updatedState);
  }

  /**
   * Handle Pomodoro session completion
   * @param petId ID of the pet
   */
  public handlePomodoroCompleted(petId: PetId): void {
    const pet = this.getPet(petId);
    if (!pet) return;

    // Let model handle Pomodoro completion logic
    const updatedState = pet.onPomodoroComplete();

    // Save and notify view
    this.savePetToDatabase(petId);
    this.notifyViewUpdate(petId, updatedState);
  }

  /**
   * Get a pet by ID (for view access)
   * @param petId ID of the pet to retrieve
   */
  public getPet(petId: PetId): PetModel | undefined {
    return this.pets.get(petId);
  }

  /**
   * Get all pets (for view access)
   */
  public getAllPets(): PetModel[] {
    return Array.from(this.pets.values());
  }

  /**
   * Load pets from database (async, real DB)
   */
  public async loadPetsFromDatabase(): Promise<void> {
    const db = (global as any).getDbInstance ? (global as any).getDbInstance('pets.db') : null;
    if (!db) {
      console.warn('[PetController] No database instance found for loading pets.');
      return;
    }
    const docs = await db.findDoc({});
    for (const doc of docs) {
      const pet = new PetModel(doc.name, doc.species, doc._id);
      pet.setState(doc);
      this.pets.set(pet.getId(), pet);
    }
    if (this.pets.size === 0) {
      this.handleCreatePet('Default Husky', 'husky');
      console.log('[PetController] Created default pet.');
    }
    console.log('[PetController] All pets loaded from database.');
  }

  /**
   * Save a single pet to the database by ID (async, real DB)
   */
  public async savePetToDatabase(petId: PetId): Promise<void> {
    const db = (global as any).getDbInstance ? (global as any).getDbInstance('pets.db') : null;
    if (!db) {
      console.warn('[PetController] No database instance found for saving pets.');
      return;
    }
    const pet = this.pets.get(petId);
    if (!pet) return;
    try {
      const existing = await db.findDoc({ _id: pet.getId() });
      console.log('[PetController] findDoc result:', existing);
      if (existing && existing.length > 0) {
        const updateResult = await db.updateDoc({ _id: pet.getId() }, pet.getState());
        console.log('[PetController] updateDoc result:', updateResult);
        console.log(`[PetController] Updated pet ${petId} in database.`);
      } else {
        await db.insertDoc(pet.getState());
        console.log(`[PetController] Inserted new pet ${petId} to database.`);
      }
    } catch (err) {
      console.error(`[PetController] Failed to save pet ${petId} to database:`, err);
    }
  }

  /**
   * Notify view of pet updates
   */
  private notifyViewUpdate(petId: PetId, petState: PetState): void {
    if (this.viewUpdateCallback) {
      this.viewUpdateCallback(petId, petState);
    }
  }

  /**
   * Start the periodic update loop
   */
  private startUpdateLoop(): void {
    this.updateIntervalId = setInterval(() => {
      const currentTime = Date.now();
      const deltaTime = currentTime - this.lastUpdateTime;

      // Update each pet's stats via the model
      this.pets.forEach((pet, petId) => {
        pet.updateStats(deltaTime);
        this.notifyViewUpdate(petId, pet.getState());
      });

      this.lastUpdateTime = currentTime;
    }, 1000);
  }

  /**
   * Update the view callback function
   * This allows reusing the controller instance with a new view component
   * @param viewUpdateCallback New callback function
   */
  public updateCallback(
    viewUpdateCallback: (petId: PetId, state: PetState) => void,
  ): void {
    this.viewUpdateCallback = viewUpdateCallback;

    // Notify the new callback about all existing pets
    this.pets.forEach((pet, petId) => {
      this.notifyViewUpdate(petId, pet.getState());
    });
  }

  public setViewUpdateCallback(callback: (petId: PetId, state: PetState) => void) {
  this.viewUpdateCallback = callback;
  }

  public celebrateActivePet(): void {
    const pets = Array.from(this.pets.values());
    if (pets.length === 0) {
      console.warn('[PetController] No pets available to celebrate.');
      return;
    }

    const pet = pets[0];
    const petId = pet.getId();

    pet.onTaskComplete();
    this.notifyViewUpdate(petId, pet.getState());

    // Reset after 3 seconds
    setTimeout(() => {
      pet.setIdleAnimation();
      this.notifyViewUpdate(petId, pet.getState());
    }, 3000);
  }
}
