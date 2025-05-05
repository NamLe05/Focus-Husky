import { PetModel, PetId, PetAccessoryId } from './model';

export class PetController {
  // Collection of all pet instances managed by this controller
  private pets: Map<PetId, PetModel>;
  
  // View update callback
  // When called, the PetController will pass the petId of the updated pet 
  // to this callback function, allowing the view to then retrieve the 
  // latest data for that pet and update its display accordingly.
  private viewUpdateCallback: (petId: PetId) => void;

  // Update interval tracking for periodic update loop runs
  private updateIntervalId: NodeJS.Timeout | null = null;
  private lastUpdateTime: number;

  /**
    * Create a new pet controller instance
    * @param viewUpdateCallback Callback to notify view of updates
   */
  constructor(viewUpdateCallback: (petId: PetId) => void) {
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
    this.notifyViewUpdate(petId);
    
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
    pet.rename(newName);
    
    // Save and update view
    this.savePetToDatabase(petId);
    this.notifyViewUpdate(petId);
  }

  /**
   * Handle "Feed Pet" button press
   * @param petId ID of the pet
   */
  public handleFeedPet(petId: PetId): void {
    const pet = this.getPet(petId);
    if (!pet) return;
    
    // Let model handle the feeding logic
    pet.interact('feed');
    
    // Save and notify view
    this.savePetToDatabase(petId);
    this.notifyViewUpdate(petId);
  }

  /**
   * Handle "Play with Pet" button press
   * @param petId ID of the pet
   */
  public handlePlayWithPet(petId: PetId): void {
    const pet = this.getPet(petId);
    if (!pet) return;
    
    // Let model handle the play logic
    pet.interact('play');
    
    // Save and notify view
    this.savePetToDatabase(petId);
    this.notifyViewUpdate(petId);
  }

  /**
   * Handle "Groom Pet" button press
   * @param petId ID of the pet
   */
  public handleGroomPet(petId: PetId): void {
    const pet = this.getPet(petId);
    if (!pet) return;
    
    // Let model handle the grooming logic
    pet.interact('groom');
    
    // Save and notify view
    this.savePetToDatabase(petId);
    this.notifyViewUpdate(petId);
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
    pet.setPosition(x, y);
    
    // Only update view (no need to save position to database)
    this.notifyViewUpdate(petId);
  }

  /**
   * Handle task completion notification
   * @param petId ID of the pet
   */
  public handleTaskCompleted(petId: PetId): void {
    const pet = this.getPet(petId);
    if (!pet) return;
    
    // Let model handle task completion logic
    pet.onTaskComplete();
    
    // Save and notify view
    this.savePetToDatabase(petId);
    this.notifyViewUpdate(petId);
  }

  /**
   * Handle Pomodoro session completion
   * @param petId ID of the pet
   */
  public handlePomodoroCompleted(petId: PetId): void {
    const pet = this.getPet(petId);
    if (!pet) return;
    
    // Let model handle Pomodoro completion logic
    pet.onPomodoroComplete();
    
    // Save and notify view
    this.savePetToDatabase(petId);
    this.notifyViewUpdate(petId);
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
   * Load pets from database
   */
  public loadPetsFromDatabase(): void {
    console.log('Loading pets from database...');
    
    // TODO:: This SHOULD query database
    // For testing, created a mock pet
    if (this.pets.size === 0) {
      this.handleCreatePet('Default Husky', 'husky');
    }
  }

  /**
   * Simulate saving pet to database
   */
  private savePetToDatabase(petId: PetId): void {
    const pet = this.pets.get(petId);
    if (!pet) return;
    
    console.log(`Saving pet ${petId} to database:`, pet.getState());
    // TODO: call database APIs
  }

  /**
   * Notify view of pet updates
   */
  private notifyViewUpdate(petId: PetId): void {
    if (this.viewUpdateCallback) {
      this.viewUpdateCallback(petId);
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
        this.notifyViewUpdate(petId);
      });
      
      this.lastUpdateTime = currentTime;
    }, 1000);
  }

}