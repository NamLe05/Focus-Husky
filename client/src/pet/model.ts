import {v4 as uuid} from 'uuid';

export type PetSpecies = 'husky';
export type PetId = string;
export type PetAccessoryId = string;

export class PetModel {
  private name: string;
  private id: PetId;
  private species: PetSpecies;
  private accessories: Set<PetAccessoryId>;

  /**
   * Create a new pet instance with no accessories
   * @param id unique pet identifier
   * @param name name of the pet
   * @param species species
   */
  public constructor(id: number, name: string, species: PetSpecies) {
    // Generate a UUID identified for the pet
    this.id = uuid();
    // Set the pet's initial name and species
    this.name = name;
    this.species = species;
    // Create an empty set of accessories
    this.accessories = new Set();
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
}
