"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const controller_1 = require("../controller");
// Mock view update callback
const mockViewUpdateCallback = vitest_1.vi.fn();
// Create an instance of PetController
const controller = new controller_1.PetController(mockViewUpdateCallback);
(0, vitest_1.describe)('PetController', () => {
    (0, vitest_1.it)('should create a new pet', () => {
        const petId = controller.handleCreatePet('Buddy', 'husky');
        // Get the pet created
        const pet = controller.getPet(petId);
        (0, vitest_1.expect)(pet).toBeDefined();
        (0, vitest_1.expect)(pet === null || pet === void 0 ? void 0 : pet.getName()).toBe('Buddy');
        (0, vitest_1.expect)(pet === null || pet === void 0 ? void 0 : pet.getSpecies()).toBe('husky');
    });
});
//# sourceMappingURL=controller.test.js.map