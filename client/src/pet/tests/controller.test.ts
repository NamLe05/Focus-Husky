import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {PetController} from '../controller';

// Mock view update callback
const mockViewUpdateCallback = vi.fn();

// Create an instance of PetController
let controller: PetController;
let createdPetId: string;

describe('PetController', () => {
  beforeEach(() => {
    // Reset mocks
    mockViewUpdateCallback.mockReset();

    // Create a fresh controller instance
    controller = new PetController(mockViewUpdateCallback);

    // Create a test pet for use in tests
    createdPetId = controller.handleCreatePet('Johnny', 'husky');

    // Clear mock calls from setup
    mockViewUpdateCallback.mockClear();
  });

  afterEach(() => {
    // Clean up any intervals
    controller.destroy();
  });

  it('should create a new pet', () => {
    const petId = controller.handleCreatePet('Buddy', 'husky');

    // Get the pet created
    const pet = controller.getPet(petId);

    expect(pet).toBeDefined();
    expect(pet?.getName()).toBe('Buddy');
    expect(pet?.getSpecies()).toBe('husky');
  });

  it('should rename a pet', () => {
    controller.handleRenamePet(createdPetId, 'Rex');
    const pet = controller.getPet(createdPetId);

    expect(pet?.getName()).toBe('Rex');
    expect(mockViewUpdateCallback).toHaveBeenCalledWith(
      createdPetId,
      expect.any(Object),
    );
  });

  it('should get all pets', () => {
    // Create additional pets
    controller.handleCreatePet('Max', 'husky');
    controller.handleCreatePet('Bella', 'husky');

    // Get all pets
    const allPets = controller.getAllPets();

    // Should have 3 pets in total (including the one from beforeEach)
    expect(allPets.length).toBe(3);
    expect(allPets.map(pet => pet.getName())).toContain('Johnny');
    expect(allPets.map(pet => pet.getName())).toContain('Max');
    expect(allPets.map(pet => pet.getName())).toContain('Bella');
  });

  it('should handle updating pet position', () => {
    const newX = 100;
    const newY = 200;

    controller.handleMovePet(createdPetId, newX, newY);

    const pet = controller.getPet(createdPetId);
    const position = pet?.getPosition();

    expect(position?.x).toBe(newX);
    expect(position?.y).toBe(newY);
    expect(mockViewUpdateCallback).toHaveBeenCalledWith(
      createdPetId,
      expect.any(Object),
    );
  });
});
