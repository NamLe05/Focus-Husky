"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const controller_1 = require("../controller");
// Mock view update callback
const mockViewUpdateCallback = vitest_1.vi.fn();
// Create an instance of PetController
let controller;
let createdPetId;
(0, vitest_1.describe)('PetController', () => {
    (0, vitest_1.beforeEach)(() => {
        // Reset mocks
        mockViewUpdateCallback.mockReset();
        // Create a fresh controller instance
        controller = new controller_1.PetController(mockViewUpdateCallback);
        // Create a test pet for use in tests
        createdPetId = controller.handleCreatePet('Johnny', 'husky');
        // Clear mock calls from setup
        mockViewUpdateCallback.mockClear();
    });
    (0, vitest_1.afterEach)(() => {
        // Clean up any intervals
        controller.destroy();
    });
    (0, vitest_1.it)('should create a new pet', () => {
        const petId = controller.handleCreatePet('Buddy', 'husky');
        // Get the pet created
        const pet = controller.getPet(petId);
        (0, vitest_1.expect)(pet).toBeDefined();
        (0, vitest_1.expect)(pet === null || pet === void 0 ? void 0 : pet.getName()).toBe('Buddy');
        (0, vitest_1.expect)(pet === null || pet === void 0 ? void 0 : pet.getSpecies()).toBe('husky');
    });
    (0, vitest_1.it)('should rename a pet', () => {
        controller.handleRenamePet(createdPetId, 'Rex');
        const pet = controller.getPet(createdPetId);
        (0, vitest_1.expect)(pet === null || pet === void 0 ? void 0 : pet.getName()).toBe('Rex');
        (0, vitest_1.expect)(mockViewUpdateCallback).toHaveBeenCalledWith(createdPetId, vitest_1.expect.any(Object));
    });
    (0, vitest_1.it)('should get all pets', () => {
        // Create additional pets
        controller.handleCreatePet('Max', 'husky');
        controller.handleCreatePet('Bella', 'husky');
        // Get all pets
        const allPets = controller.getAllPets();
        // Should have 3 pets in total (including the one from beforeEach)
        (0, vitest_1.expect)(allPets.length).toBe(3);
        (0, vitest_1.expect)(allPets.map(pet => pet.getName())).toContain('Johnny');
        (0, vitest_1.expect)(allPets.map(pet => pet.getName())).toContain('Max');
        (0, vitest_1.expect)(allPets.map(pet => pet.getName())).toContain('Bella');
    });
    (0, vitest_1.it)('should handle updating pet position', () => {
        const newX = 100;
        const newY = 200;
        controller.handleMovePet(createdPetId, newX, newY);
        const pet = controller.getPet(createdPetId);
        const position = pet === null || pet === void 0 ? void 0 : pet.getPosition();
        (0, vitest_1.expect)(position === null || position === void 0 ? void 0 : position.x).toBe(newX);
        (0, vitest_1.expect)(position === null || position === void 0 ? void 0 : position.y).toBe(newY);
        (0, vitest_1.expect)(mockViewUpdateCallback).toHaveBeenCalledWith(createdPetId, vitest_1.expect.any(Object));
    });
});
//# sourceMappingURL=controller.test.js.map