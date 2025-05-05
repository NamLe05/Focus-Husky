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
    return this.accessories;
  }

  /**
   * Renames the pet
   * @param {string} name the new name for the pet
   */
  public rename(name: string) {
    this.name = name;
  }

  /**
   * Adds a new accessory to the pet
   * @param {PetAccessory} accessory the unique accessory identifier
   */
  public addAccessory(accessory: PetAccessoryId) {
    if (this.accessories.has(accessory)) {
      throw new Error('Accessory is already added to pet');
    }
    this.accessories.add(accessory);
  }

  /**
   * Removes an existing accessory from the pet
   * @param {PetAccessory} accessory the new name for the pet
   */
  public removeAccessory(accessory: PetAccessoryId) {
    if (!this.accessories.has(accessory)) {
      throw new Error('Pet does not have accessory');
    }
    this.accessories.delete(accessory);
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


}
