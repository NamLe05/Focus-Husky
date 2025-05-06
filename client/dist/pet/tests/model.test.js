"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const model_1 = require("../model");
(0, vitest_1.describe)('PetModel', () => {
    (0, vitest_1.it)('should create a pet with the correct name and species', () => {
        const pet = new model_1.PetModel('Dubs', 'husky');
        (0, vitest_1.expect)(pet.getName()).toBe('Dubs');
        (0, vitest_1.expect)(pet.getSpecies()).toBe('husky');
    });
    (0, vitest_1.it)('should rename the pet', () => {
        const pet = new model_1.PetModel('Dubs', 'husky');
        pet.rename('Fluff');
        (0, vitest_1.expect)(pet.getName()).toBe('Fluff');
    });
    (0, vitest_1.it)('should add and remove accessories correctly', () => {
        const pet = new model_1.PetModel('Dubs', 'husky');
        const accessoryId = 'collar123';
        pet.addAccessory(accessoryId);
        (0, vitest_1.expect)(pet.getAccessories().has(accessoryId)).toBe(true);
        pet.removeAccessory(accessoryId);
        (0, vitest_1.expect)(pet.getAccessories().has(accessoryId)).toBe(false);
    });
    (0, vitest_1.it)('should update mood after a series of interactions', () => {
        const pet = new model_1.PetModel('Dubs', 'husky');
        const initialMood = pet.getMood();
        pet.play();
        pet.feed();
        pet.groom();
        (0, vitest_1.expect)(pet.getMood()).not.toBe(initialMood);
    });
});
//# sourceMappingURL=model.test.js.map