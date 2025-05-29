import {PetModel, PetId, PetAccessoryId, PetState} from './model';

export class PetController {
  // Collection of all pet instances managed by this controller
  private pets: Map<PetId, PetModel>;

  // Multiple view update callbacks
  private viewUpdateCallbacks: Array<(petId: PetId, state: PetState) => void> = [];

  // Update interval tracking for periodic update loop runs
  private updateIntervalId: NodeJS.Timeout | null = null;
  private lastUpdateTime: number;

  // Track initialization state
  private isInitialized: boolean = false;

  constructor(viewUpdateCallback?: (petId: PetId, state: PetState) => void) {
    this.pets = new Map();
    if (viewUpdateCallback) {
      this.viewUpdateCallbacks.push(viewUpdateCallback);
    }
    this.lastUpdateTime = Date.now();
    this.startUpdateLoop();
  }

  public initialize(): void {
    if (this.isInitialized) {
      console.log('PetController already initialized, skipping...');
      return;
    }

    console.log('Initializing PetController for the first time...');
    this.isInitialized = true;
    this.loadPetsFromDatabase();
  }

  public getInitializationStatus(): boolean {
    return this.isInitialized;
  }

  public destroy(): void {
    if (this.updateIntervalId) {
      clearInterval(this.updateIntervalId);
      this.updateIntervalId = null;
    }
    // Clear all callbacks
    this.viewUpdateCallbacks = [];
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
   * Get the first pet (convenience method for single-pet scenarios)
   */
  public getFirstPet(): PetModel | undefined {
    const pets = this.getAllPets();
    return pets.length > 0 ? pets[0] : undefined;
  }

  /**
   * Load pets from database
   */
  public loadPetsFromDatabase(): void {
    console.log('Loading pets from database...');

    // TODO: This SHOULD query database
    // For testing, create a mock pet if none exist
    if (this.pets.size === 0) {
      console.log('No existing pets found, creating default Husky...');
      this.handleCreatePet('Dubs', 'husky');
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
    if (this.viewUpdateCallbacks.length === 0) {
      // Optional: Log when there are no listeners
      console.debug(`No view callbacks registered for pet update: ${petId}`);
      return;
    }

    // Call all registered callbacks
    this.viewUpdateCallbacks.forEach((callback, index) => {
      try {
        callback(petId, petState);
      } catch (error) {
        console.error(`Error in view update callback ${index}:`, error);
      }
    });
  }

  /**
   * Start the periodic update loop (optimized)
   */
  private startUpdateLoop(): void {
    // Prevent multiple update loops
    if (this.updateIntervalId) {
      return;
    }

    this.updateIntervalId = setInterval(() => {
      // Skip updates if no callbacks are registered (optimization)
      if (this.viewUpdateCallbacks.length === 0) {
        console.debug('Skipping pet updates - no views registered');
        this.lastUpdateTime = Date.now(); // Keep time updated
        return;
      }

      const currentTime = Date.now();
      const deltaTime = currentTime - this.lastUpdateTime;

      // Update each pet's stats via the model
      this.pets.forEach((pet, petId) => {
        const updatedState = pet.updateStats(deltaTime);
        if (updatedState) {
          this.notifyAllViews(petId, updatedState);
        }
      });

      this.lastUpdateTime = currentTime;
    }, 1000);
  }

  /**
   * Register a new view callback
   * @param viewUpdateCallback New callback function to register
   * @returns Cleanup function to unregister the callback
   */
  public registerViewCallback(
    viewUpdateCallback: (petId: PetId, state: PetState) => void,
  ): () => void {
    console.log(`Registering view callback. Current count: ${this.viewUpdateCallbacks.length}`);
    
    // Add the new callback
    this.viewUpdateCallbacks.push(viewUpdateCallback);
    
    console.log(`View callback registered. New count: ${this.viewUpdateCallbacks.length}`);

    // Notify the new callback about all existing pets immediately
    this.pets.forEach((pet, petId) => {
      try {
        viewUpdateCallback(petId, pet.getState());
      } catch (error) {
        console.error('Error in new view callback during initial sync:', error);
      }
    });

    // Return cleanup function
    return () => this.unregisterViewCallback(viewUpdateCallback);
  }

  /**
   * Unregister a view callback
   * @param viewUpdateCallback Callback function to remove
   */
  public unregisterViewCallback(
    viewUpdateCallback: (petId: PetId, state: PetState) => void,
  ): void {
    const initialCount = this.viewUpdateCallbacks.length;
    const index = this.viewUpdateCallbacks.indexOf(viewUpdateCallback);
    
    if (index > -1) {
      this.viewUpdateCallbacks.splice(index, 1);
      console.log(`View callback unregistered. Count: ${initialCount} → ${this.viewUpdateCallbacks.length}`);
    } else {
      console.warn('Attempted to unregister callback that was not found');
    }
  }

  /**
   * FIXED: Legacy method for backward compatibility
   * @deprecated Use registerViewCallback instead
   */
  public updateCallback(
    viewUpdateCallback: (petId: PetId, state: PetState) => void,
  ): () => void {
    console.warn('updateCallback is deprecated, use registerViewCallback instead');
    return this.registerViewCallback(viewUpdateCallback);
  }

  /**
   * Get count of registered view callbacks (for debugging)
   */
  public getCallbackCount(): number {
    return this.viewUpdateCallbacks.length;
  }

  /**
   * Get detailed debug info about registered callbacks
   */
  public getDebugInfo(): { 
    callbackCount: number; 
    petCount: number; 
    updateLoopActive: boolean;
    isInitialized: boolean;
  } {
    return {
      callbackCount: this.viewUpdateCallbacks.length,
      petCount: this.pets.size,
      updateLoopActive: this.updateIntervalId !== null,
      isInitialized: this.isInitialized
    };
  }

  /**
   * Force update all views (for debugging)
   */
  public forceUpdateAllViews(): void {
    console.log('Force updating all views...');
    this.pets.forEach((pet, petId) => {
      this.notifyAllViews(petId, pet.getState());
    });
  }

}

// Create and export the singleton instance
export const petControllerInstance = new PetController();

// Initialize the controller when the module is loaded
petControllerInstance.initialize();