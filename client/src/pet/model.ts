import {v4 as uuid} from 'uuid';

export type PetSpecies = 'husky';
export type PetId = string;
export type PetAccessoryId = string;

export type PetMood = 'happy' | 'neutral' | 'sad' | 'excited' | 'tired';
export type PetAnimation = 'idle' | 'walking' | 'celebrating' | 'sleeping' | 'eating';

export interface PetState {
  mood: PetMood;
  animation: PetAnimation;
  position: { x: number; y: number };
  accessories: string[];
  happiness: number; // 0-100
  energy: number; // 0-100
  cleanliness: number; // 0-100
  lastInteraction: string;
}


export class PetModel {
  private name: string;
  private id: PetId;
  private species: PetSpecies;
  private accessories: Set<PetAccessoryId>;


  private mood: PetMood;
  private animation: PetAnimation;
  private position: { x: number; y: number };
  private happiness: number; // 0-100
  private energy: number; // 0-100
  private cleanliness: number; // 0-100
  private lastInteraction: Date;

  /**
   * Create a new pet instance with no accessories
   * @param id unique pet identifier
   * @param name name of the pet
   * @param species species
   */
  public constructor(name: string, species: PetSpecies) {
    // Generate a UUID identified for the pet
    this.id = uuid();
    // Set the pet's initial name and species
    this.name = name;
    this.species = species;
    // Create an empty set of accessories
    this.accessories = new Set();


    // Initialize state with default values
    this.mood = 'neutral';
    this.animation = 'idle';
    this.position = { x: 0, y: 0 };
    this.happiness = 70;
    this.energy = 100;
    this.cleanliness = 100;
    this.lastInteraction = new Date();
  }

  /**
   * Get the pet's ID
   * @returns {PetId} the unique, numerical identifier for the pet
   */
  public getId(): PetId {
    return this.id;
  }

  /**
   * Get the pet's name
   * @returns {string} the name of the pet
   */
  public getName(): string {
    return this.name;
  }

  /**
   * Get the pet's species
   * @returns {PetSpecies} the species of the pet
   */
  public getSpecies(): PetSpecies {
    return this.species;
  }

  /**
   * Get the pet's accessories
   * @returns {Set<PetAccessoryId>} the set of accessories that the pet owns
   */
  public getAccessories(): Set<PetAccessoryId> {
    // Returns a copy.
    return new Set(this.accessories);

    return this.accessories;
  }

  /**
   * Renames the pet
   * @param {string} name the new name for the pet
   */
  public rename(name: string): PetState {
    this.name = name;
    return this.getState();
  }

  /**
   * Adds a new accessory to the pet
   * @param {PetAccessory} accessory the unique accessory identifier
   */
  public addAccessory(accessory: PetAccessoryId): PetState {
    if (this.accessories.has(accessory)) {
      throw new Error('Accessory is already added to pet');
    }
    this.accessories.add(accessory);

    return this.getState();
  }

  /**
   * Removes an existing accessory from the pet
   * @param {PetAccessory} accessory the new name for the pet
   */
  public removeAccessory(accessory: PetAccessoryId): PetState {
    if (!this.accessories.has(accessory)) {
      throw new Error('Pet does not have accessory');
    }
    this.accessories.delete(accessory);

    return this.getState();
  }

  /**
   * Get the pet's current mood
   * @returns {PetMood} the current mood
   */
  public getMood(): PetMood {
    return this.mood;
  }

  /**
   * Get the pet's current animation state
   * @returns {PetAnimation} the current animation
   */
  public getAnimation(): PetAnimation {
    return this.animation;
  }

  /**
   * Get the pet's position on screen
   * @returns {object} x and y coordinates
   */
  public getPosition(): { x: number; y: number } {
    return { ...this.position };
  }

  /**
   * Get the pet's happiness value
   * @returns {number} happiness level (0-100)
   */
  public getHappiness(): number {
    return this.happiness;
  }

  /**
   * Get the pet's energy value
   * @returns {number} energy level (0-100)
   */
  public getEnergy(): number {
    return this.energy;
  }

  /**
   * Get the pet's cleanliness value
   * @returns {number} cleanliness level (0-100)
   */
  public getCleanliness(): number {
    return this.cleanliness;
  }

  /**
   * Get the pet's last interaction time
   * @returns {Date} timestamp of last interaction
   */
  public getLastInteraction(): Date {
    return new Date(this.lastInteraction);
  }

  /**
   * Get a complete snapshot of the pet's state
   * @returns {PetState} all pet state data
   */
  public getState(): PetState {
    return {
      accessories: Array.from(this.accessories),
      mood: this.mood,
      animation: this.animation,
      position: { ...this.position },
      happiness: this.happiness,
      energy: this.energy,
      cleanliness: this.cleanliness,
      lastInteraction: this.lastInteraction.toISOString(),
    };
  }

  /**
   * General interaction handler
   * @param interactionType Type of interaction
   * @returns Updated pet state
   */
  public interact(interactionType: 'feed' | 'play' | 'groom'): PetState {
    switch (interactionType) {
      case 'feed':
        return this.feed();
      case 'play':
        return this.play();
      case 'groom':
        return this.groom();
      default:
        return this.getState();
    }
  }

  /**
   * Feed the pet
   * @returns Updated pet state information
   */
  public feed(): PetState {
    this.setEnergy(this.energy + 30);
    this.setAnimation('eating');
    this.updateLastInteraction();
    this.updateMood();
    
    // Return current state for view updates
    return this.getState();
  }

  /**
   * Play with the pet
   * @returns Updated pet state information
   */
  public play(): PetState {
    this.setHappiness(this.happiness + 15);
    this.setEnergy(this.energy - 10);
    this.setAnimation('walking');
    this.updateLastInteraction();
    this.updateMood();
    
    // Return current state for view updates
    return this.getState();
  }

  /**
   * Groom the pet
   * @returns Updated pet state information
   */
  public groom(): PetState {
    this.setCleanliness(100);
    this.setHappiness(this.happiness + 5);
    this.updateLastInteraction();
    this.updateMood();
    
    // Return current state for view updates
    return this.getState();
  }

  /**
   * Update the pet's position
   * @param {number} x X coordinate
   * @param {number} y Y coordinate
   * @returns {PetState} updated pet state
   */
  public setPosition(x: number, y: number): PetState {
    this.position = { x, y };
    return this.getState();
  }

  /**
   * Update the last interaction timestamp
   */
  private updateLastInteraction(): void {
    this.lastInteraction = new Date();
  }

   /**
   * Update pet mood based on overall stats
   */
   private updateMood(): void {
    const average = (this.happiness + this.energy + this.cleanliness) / 3;
    
    if (average >= 80) {
      this.mood = 'excited';
    } else if (average >= 60) {
      this.mood = 'happy';
    } else if (average >= 40) {
      this.mood = 'neutral';
    } else if (average >= 20) {
      this.mood = 'tired';
    } else {
      this.mood = 'sad';
    }
  }

  /**
   * Set animation state
   * @param animation New animation state
   */
  private setAnimation(animation: PetAnimation): void {
    this.animation = animation;
  }

  /**
   * Update the pet's happiness (clamped between 0-100)
   * @param {number} value new happiness value
   */
  private setHappiness(value: number): void {
    this.happiness = Math.max(0, Math.min(100, value));
  }

  /**
   * Update the pet's energy (clamped between 0-100)
   * @param {number} value new energy value
   */
  private setEnergy(value: number): void {
    this.energy = Math.max(0, Math.min(100, value));
  }

  /**
   * Update the pet's cleanliness (clamped between 0-100)
   * @param {number} value new cleanliness value
   */
  private setCleanliness(value: number): void {
    this.cleanliness = Math.max(0, Math.min(100, value));
  }

   /**
   * Handle task completion event
   * @returns Updated pet state information
   */
   public onTaskComplete(): PetState {
    this.setHappiness(this.happiness + 10);
    this.setAnimation('celebrating');
    this.updateLastInteraction();
    this.updateMood();
    
    // Auto-reset animation after celebrating
    setTimeout(() => {
      this.setAnimation('idle');
    }, 3000);
    
    // Return current state for view updates
    return this.getState();
  }

  /**
   * Handle Pomodoro session completion
   * @returns Updated pet state information
   */
  public onPomodoroComplete(): PetState {
    this.setHappiness(this.happiness + 20);
    this.setEnergy(this.energy - 10);
    this.setAnimation('celebrating');
    this.updateLastInteraction();
    this.updateMood();
    
    // Auto-reset animation after celebrating
    setTimeout(() => {
      this.setAnimation('idle');
    }, 3000);
    
    // Return current state for view updates
    return this.getState();
  }

  /**
   * Update pet stats based on elapsed time
   * @param deltaTime Time in milliseconds since last update
   * @returns Updated pet state if changes occurred
   */
  public updateStats(deltaTime: number): PetState | null {
    // Skip tiny updates
    if (deltaTime < 100) return null;
    
    // Convert to minutes for easier calculation
    const minutes = deltaTime / (1000 * 60);
    
    // Store initial mood for comparison
    const initialMood = this.mood;
    const initialAnimation = this.animation;
    
    // Decrease stats over time
    this.setHappiness(this.happiness - 0.5 * minutes);
    this.setEnergy(this.energy - 0.3 * minutes);
    this.setCleanliness(this.cleanliness - 0.2 * minutes);
    
    // Update mood based on new stats
    this.updateMood();
    
    // Only return state if visible changes occurred
    if (this.mood !== initialMood || this.animation !== initialAnimation) {
      return this.getState();
    }
    
    return null;
  }
}
