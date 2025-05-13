import {PetModel, PetId, PetAccessoryId, PetState} from './model';

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
    this.savePetToDatabase(petId);
    this.notifyViewUpdate(petId, updatedState);
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
    this.savePetToDatabase(petId);
    this.notifyViewUpdate(petId, updatedState);
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
    this.savePetToDatabase(petId);
    this.notifyViewUpdate(petId, updatedState);
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
   * Load pets from database
   */
  public loadPetsFromDatabase(): void {
    console.log('Loading pets from database...');

    try {
      // In a browser environment, we'll use localStorage instead of fs
      const loadFromLocalStorage = () => {
        try {
          const petsData = localStorage.getItem('focusHusky_pets');
          if (petsData) {
            return JSON.parse(petsData);
          }
        } catch (error) {
          console.error('Error loading from localStorage:', error);
        }
        return [];
      };

      // Load pets from localStorage
      const petStates = loadFromLocalStorage();

      if (petStates.length > 0) {
        console.log(`Found ${petStates.length} pets in local storage.`);

        // Create pet models from saved states
        petStates.forEach((state: PetState) => {
          const pet = this.createPetFromState(state);
          this.pets.set(pet.getId(), pet);

          // Notify view of loaded pet
          if (this.viewUpdateCallback) {
            this.viewUpdateCallback(pet.getId(), pet.getState());
          }
        });
      } else {
        console.log('No pets found in storage. Creating default pet...');
        // Create a default pet if none exist
        this.handleCreatePet('John', 'husky');
      }
    } catch (error) {
      console.error('Error loading pets:', error);
      // Create a default pet on error
      this.handleCreatePet('John', 'husky');
    }
  }

  /**
   * Save pet to database
   */
  private savePetToDatabase(petId: PetId): void {
    const pet = this.pets.get(petId);
    if (!pet) return;

    try {
      // Get current pets from storage
      let petsData: any[] = [];
      try {
        const existingData = localStorage.getItem('focusHusky_pets');
        if (existingData) {
          petsData = JSON.parse(existingData);
        }
      } catch (e) {
        console.warn('Error reading existing pets data:', e);
      }

      // Get the current pet state
      const petState = pet.getState();

      // Find if this pet already exists in storage
      const existingIndex = petsData.findIndex(p => p.id === petId);

      if (existingIndex >= 0) {
        // Update existing pet
        petsData[existingIndex] = petState;
      } else {
        // Add new pet
        petsData.push(petState);
      }

      // Save back to localStorage
      localStorage.setItem('focusHusky_pets', JSON.stringify(petsData));

      console.log(`Pet ${petId} saved to localStorage`);
    } catch (error) {
      console.error('Error saving pet to localStorage:', error);
    }
  }
  /**
   * Helper method to create a pet model from a saved state
   * @param state The saved pet state
   * @returns A new PetModel instance
   */
  private createPetFromState(state: any): PetModel {
    // Create a new pet
    const pet = new PetModel(state.name, state.species);

    // Set position
    pet.setPosition(state.position.x, state.position.y);

    // Access private fields for demo purposes
    // In a real app, you might have proper initialization methods
    const petAny = pet as any;

    // Copy all other properties
    if (state.mood) petAny.mood = state.mood;
    if (state.animation) petAny.animation = state.animation;
    if (state.happiness !== undefined) petAny.happiness = state.happiness;
    if (state.energy !== undefined) petAny.energy = state.energy;
    if (state.cleanliness !== undefined) petAny.cleanliness = state.cleanliness;
    if (state.lastInteraction)
      petAny.lastInteraction = new Date(state.lastInteraction);
    if (state.experience !== undefined) petAny.experience = state.experience;
    if (state.level !== undefined) petAny.level = state.level;

    // Set pet ID to match saved ID (special case for loading)
    if (state.id) petAny.id = state.id;

    // Add accessories
    if (Array.isArray(state.accessories)) {
      state.accessories.forEach((accessoryId: string) => {
        try {
          pet.addAccessory(accessoryId);
        } catch (e) {
          // Ignore duplicates
        }
      });
    }

    return pet;
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
}
