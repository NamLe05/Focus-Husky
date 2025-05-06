import { describe, it, expect, vi } from 'vitest';
import { PetController } from '../controller';

// Mock view update callback
const mockViewUpdateCallback = vi.fn();

// Create an instance of PetController
const controller = new PetController(mockViewUpdateCallback);

describe('PetController', () => {
  it('should create a new pet', () => {
    const petId = controller.handleCreatePet('Buddy', 'husky');

    // Get the pet created
    const pet = controller.getPet(petId);

    expect(pet).toBeDefined();
    expect(pet?.getName()).toBe('Buddy');
    expect(pet?.getSpecies()).toBe('husky');
  });
});