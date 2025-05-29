import {PetModel, PetId, PetAccessoryId, PetState} from './model';

export class PetController {
  // Collection of all pet instances managed by this controller
  private pets: Map<PetId, PetModel>;

  // Multiple view update callbacks
  // Each view registers its callback and gets a unique ID
  private viewUpdateCallbacks: Map<string, (petId: PetId, state: PetState) => void>;
  private nextCallbackId: number = 0;

  // Update interval tracking for periodic update loop runs
  private updateIntervalId: NodeJS.Timeout | null = null;
  private lastUpdateTime: number;

  /**
   * Create a new pet controller instance
   * @param viewUpdateCallback Initial callback to notify view of updates
   */
  constructor(viewUpdateCallback?: (petId: PetId, state: PetState) => void) {
    this.pets = new Map();
    this.viewUpdateCallbacks = new Map();
    this.lastUpdateTime = Date.now();
    
    // Register the initial callback if provided
    if (viewUpdateCallback) {
      this.registerViewCallback(viewUpdateCallback);
    }
    
    this.startUpdateLoop();
  }

  /**
   * Register a new view callback and return its ID
   * @param callback The callback function
   * @returns Callback ID for later removal
   */
  public registerViewCallback(callback: (petId: PetId, state: PetState) => void): string {
    const callbackId = `callback_${this.nextCallbackId++}`;
    this.viewUpdateCallbacks.set(callbackId, callback);
    
    // Immediately notify the new callback about all existing pets
    this.pets.forEach((pet, petId) => {
      callback(petId, pet.getState());
    });
    
    console.log(`Registered view callback ${callbackId}. Total callbacks: ${this.viewUpdateCallbacks.size}`);
    return callbackId;
  }

  /**
   * Unregister a view callback
   * @param callbackId The ID returned from registerViewCallback
   */
  public unregisterViewCallback(callbackId: string): void {
    const removed = this.viewUpdateCallbacks.delete(callbackId);
    if (removed) {
      console.log(`Unregistered view callback ${callbackId}. Total callbacks: ${this.viewUpdateCallbacks.size}`);
    }
  }

  /**
   * Clean up resources when controller is destroyed
   */
  public destroy(): void {
    if (this.updateIntervalId) {
      clearInterval(this.updateIntervalId);
      this.updateIntervalId = null;
    }
    this.viewUpdateCallbacks.clear();
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

    // Notify all views
    this.notifyAllViews(petId, pet.getState());

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

    // Save and update all views
    this.savePetToDatabase(petId);
    this.notifyAllViews(petId, updatedState);
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

    // Save and notify all views
    this.savePetToDatabase(petId);
    this.notifyAllViews(petId, updatedState);
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

    // Save and notify all views
    this.savePetToDatabase(petId);
    this.notifyAllViews(petId, updatedState);
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

    // Save and notify all views
    this.savePetToDatabase(petId);
    this.notifyAllViews(petId, updatedState);
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

    // Only update views (no need to save position to database)
    this.notifyAllViews(petId, updatedState);
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

    // Save and notify all views
    this.savePetToDatabase(petId);
    this.notifyAllViews(petId, updatedState);
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

    // Save and notify all views
    this.savePetToDatabase(petId);
    this.notifyAllViews(petId, updatedState);
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
   * Notify all registered views of pet updates
   */
  private notifyAllViews(petId: PetId, petState: PetState): void {
    this.viewUpdateCallbacks.forEach((callback, callbackId) => {
      try {
        callback(petId, petState);
      } catch (error) {
        console.error(`Error in view callback ${callbackId}:`, error);
        // Optionally remove broken callbacks
        // this.viewUpdateCallbacks.delete(callbackId);
      }
    });
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
        const updatedState = pet.updateStats(deltaTime);
        this.notifyAllViews(petId, updatedState);
      });

      this.lastUpdateTime = currentTime;
    }, 1000);
  }

  /**
   * Legacy method for backward compatibility
   * @deprecated Use registerViewCallback instead
   */
  public updateCallback(
    viewUpdateCallback: (petId: PetId, state: PetState) => void,
  ): void {
    console.warn('updateCallback is deprecated. Use registerViewCallback instead.');
    this.registerViewCallback(viewUpdateCallback);
  }
}