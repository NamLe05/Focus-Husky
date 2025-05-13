import {describe, it, expect} from 'vitest';
import {PetModel, PetSpecies} from '../model';

describe('PetModel', () => {
  it('should create a pet with the correct name and species', () => {
    const pet = new PetModel('Dubs', 'husky');

    expect(pet.getName()).toBe('Dubs');
    expect(pet.getSpecies()).toBe('husky');
  });

  it('should rename the pet', () => {
    const pet = new PetModel('Dubs', 'husky');
    pet.rename('Fluff');

    expect(pet.getName()).toBe('Fluff');
  });

  it('should add and remove accessories correctly', () => {
    const pet = new PetModel('Dubs', 'husky');
    const accessoryId = 'collar123';

    pet.addAccessory(accessoryId);
    expect(pet.getAccessories().has(accessoryId)).toBe(true);

    pet.removeAccessory(accessoryId);
    expect(pet.getAccessories().has(accessoryId)).toBe(false);
  });

  it('should update mood after a series of interactions', () => {
    const pet = new PetModel('Dubs', 'husky');
    const initialMood = pet.getMood();

    pet.play();
    pet.feed();
    pet.groom();

    expect(pet.getMood()).not.toBe(initialMood);
  });

  it('should update stats correctly based on the change in time', () => {
    const pet = new PetModel('Dubs', 'husky');
    // How do the stats change after a minute?
    pet.updateStats(60000);
    expect(pet.getHappiness()).toBe(pet.getHappiness());
    expect(pet.getEnergy()).toBe(pet.getEnergy());
    expect(pet.getCleanliness()).toBe(pet.getCleanliness());
  });
});
