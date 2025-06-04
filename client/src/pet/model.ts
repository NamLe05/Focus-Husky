import {v4 as uuid} from 'uuid';

export type PetSpecies = 'husky';
export type PetId = string;
export type PetAccessoryId = string;

export type PetMood = 'happy' | 'neutral' | 'sad' | 'excited' | 'tired';
export type PetAnimation =
  | 'idle'
  | 'walking'
  | 'celebrating'
  | 'sleeping'
  | 'eating';

export interface PetState {
  name: string;
  species: PetSpecies;
  mood: PetMood;
  animation: PetAnimation;
  position: {x: number; y: number};
  accessories: Set<PetAccessoryId>;
  happiness: number; // 0-100
  energy: number; // 0-100
  cleanliness: number; // 0-100
  lastInteraction: Date;
}

export class PetModel {
  private id: PetId;
  private state: PetState;
  /**
   * Create a new pet instance with no accessories
   * @param id unique pet identifier
   * @param name name of the pet
   * @param species species
   */
  public constructor(name: string, species: PetSpecies, id?: PetId) {
    // Generate a UUID identified for the pet
    this.id = id ?? uuid();
    this.state = {
      name,
      species,
      accessories: new Set(),
      mood: 'neutral',
      animation: 'idle',
      position: {x: 300, y: 300},
      happiness: 10,
      energy: 60,
      cleanliness: 50,
      lastInteraction: new Date(),
    };
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
    return this.state.name;
  }

  /**
   * Get the pet's species
   * @returns {PetSpecies} the species of the pet
   */
  public getSpecies(): PetSpecies {
    return this.state.species;
  }

  /**
   * Get the pet's accessories
   * @returns {Set<PetAccessoryId>} the set of accessories that the pet owns
   */
  public getAccessories(): Set<PetAccessoryId> {
    // Returns a copy.
    return new Set(this.state.accessories);
  }

  /**
   * Renames the pet
   * @param {string} name the new name for the pet
   */
  public rename(name: string): PetState {
    this.state.name = name;
    return this.getState();
  }

  /**
   * Adds a new accessory to the pet
   * @param {PetAccessory} accessory the unique accessory identifier
   */
  public addAccessory(accessory: PetAccessoryId): PetState {
    if (this.state.accessories.has(accessory)) {
      throw new Error('Accessory is already added to pet');
    }
    this.state.accessories.add(accessory);

    return this.getState();
  }

  /**
   * Removes an existing accessory from the pet
   * @param {PetAccessory} accessory the new name for the pet
   */
  public removeAccessory(accessory: PetAccessoryId): PetState {
    if (!this.state.accessories.has(accessory)) {
      throw new Error('Pet does not have accessory');
    }
    this.state.accessories.delete(accessory);

    return this.getState();
  }

  /**
   * Get the pet's current mood
   * @returns {PetMood} the current mood
   */
  public getMood(): PetMood {
    return this.state.mood;
  }

  /**
   * Get the pet's current animation state
   * @returns {PetAnimation} the current animation
   */
  public getAnimation(): PetAnimation {
    return this.state.animation;
  }

  /**
   * Get the pet's position on screen
   * @returns {object} x and y coordinates
   */
  public getPosition(): {x: number; y: number} {
    return {...this.state.position};
  }

  /**
   * Get the pet's happiness value
   * @returns {number} happiness level (0-100)
   */
  public getHappiness(): number {
    return this.state.happiness;
  }

  /**
   * Get the pet's energy value
   * @returns {number} energy level (0-100)
   */
  public getEnergy(): number {
    return this.state.energy;
  }

  /**
   * Get the pet's cleanliness value
   * @returns {number} cleanliness level (0-100)
   */
  public getCleanliness(): number {
    return this.state.cleanliness;
  }

  /**
   * Get the pet's last interaction time
   * @returns {Date} timestamp of last interaction
   */
  public getLastInteraction(): Date {
    return new Date(this.state.lastInteraction);
  }

  /**
   * Get a complete snapshot of the pet's state
   * @returns {PetState & {_id: string}} all pet state data with _id
   */
  public getState(): PetState & { _id: string } {
    return { ...this.state, _id: this.id };
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
    this.setEnergy(this.state.energy + 80);
    this.setAnimation('eating');
    this.updateLastInteraction();
    this.updateMood();

    // Auto-reset animation after eating
    setTimeout(() => {
      this.setAnimation('idle');
    }, 6000);

    // Return current state for view updates
    return this.getState();
  }

  /**
   * Play with the pet
   * @returns Updated pet state information
   */
  public play(): PetState {
    this.setHappiness(this.state.happiness + 25);
    this.setEnergy(this.state.energy - 10);
    this.setAnimation('walking');
    this.updateLastInteraction();
    this.updateMood();

    // Auto-reset animation after playing
    setTimeout(() => {
      this.setAnimation('idle');
    }, 6000);

    // Return current state for view updates
    return this.getState();
  }

  /**
   * Groom the pet
   * @returns Updated pet state information
   */
  public groom(): PetState {
    this.setCleanliness(this.state.cleanliness + 10);
    this.setHappiness(this.state.happiness + 10);
    this.setAnimation('sleeping');
    this.updateLastInteraction();
    this.updateMood();

    // Auto-reset animation after grooming
    setTimeout(() => {
      this.setAnimation('idle');
    }, 6000);

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
    this.state.position = {x, y};
    return this.getState();
  }

  /**
   * Update the last interaction timestamp
   */
  private updateLastInteraction(): void {
    this.state.lastInteraction = new Date();
  }

  /**
   * Update pet mood based on overall stats
   */
  private updateMood(): void {
    const average =
      (this.state.happiness + this.state.energy + this.state.cleanliness) / 3;

    if (average >= 80) {
      this.state.mood = 'excited';
    } else if (average >= 60) {
      this.state.mood = 'happy';
    } else if (average >= 40) {
      this.state.mood = 'neutral';
    } else if (average >= 20) {
      this.state.mood = 'tired';
    } else {
      this.state.mood = 'sad';
    }
  }

  /**
   * Set animation state
   * @param animation New animation state
   */
  private setAnimation(animation: PetAnimation): void {
    this.state.animation = animation;
  }

  /**
   * Update the pet's happiness (clamped between 0-100)
   * @param {number} value new happiness value
   */
  private setHappiness(value: number): void {
    this.state.happiness = Math.max(0, Math.min(100, value));
  }

  /**
   * Update the pet's energy (clamped between 0-100)
   * @param {number} value new energy value
   */
  private setEnergy(value: number): void {
    this.state.energy = Math.max(0, Math.min(100, value));
  }

  /**
   * Update the pet's cleanliness (clamped between 0-100)
   * @param {number} value new cleanliness value
   */
  private setCleanliness(value: number): void {
    this.state.cleanliness = Math.max(0, Math.min(100, value));
  }

  /**
   * Handle task completion event
   * @returns Updated pet state information
   */
  public onTaskComplete(): PetState {
    this.setHappiness(this.state.happiness + 10);
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
    this.setHappiness(this.state.happiness + 20);
    this.setEnergy(this.state.energy - 10);
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
   * @returns Updated pet state (always returns state for UI refresh)
   */
  public updateStats(deltaTime: number): PetState {
    // Skip tiny updates
    if (deltaTime < 100) return this.getState();

    // Convert to minutes for easier calculation
    const minutes = deltaTime / (1000 * 60);

    // Store initial mood for comparison
    const initialMood = this.state.mood;
    const initialAnimation = this.state.animation;

    // Decrease stats over time
    this.setHappiness(this.state.happiness - 10 * minutes);
    this.setEnergy(this.state.energy - 5 * minutes);
    this.setCleanliness(this.state.cleanliness - 2.5 * minutes);

    // Update mood based on new stats
    this.updateMood();

    // Always return state for UI refresh
    return this.getState();
  }

  /**
   * Set the pet's state (for loading from database)
   * @param state The new state to set
   */
  public setState(state: PetState & { _id?: string }): void {
    this.state = state;
    if ((state as any)._id) {
      this.id = (state as any)._id;
    }
  }

  /**
   * Public method to set the animation to 'idle'
   */
  public setIdleAnimation(): void {
    this.setAnimation('idle');
  }
}
