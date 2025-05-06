"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PetController = void 0;
const model_1 = require("./model");
class PetController {
    /**
     * Create a new pet controller instance
     * @param viewUpdateCallback Callback to notify view of updates
     */
    constructor(viewUpdateCallback) {
        // Update interval tracking for periodic update loop runs
        this.updateIntervalId = null;
        this.pets = new Map();
        this.viewUpdateCallback = viewUpdateCallback;
        this.lastUpdateTime = Date.now();
        this.startUpdateLoop();
    }
    /**
     * Clean up resources when controller is destroyed
     */
    destroy() {
        if (this.updateIntervalId) {
            clearInterval(this.updateIntervalId);
            this.updateIntervalId = null;
        }
    }
    /**
     * Handle the "Create Pet" user action
     * @param name Name for the new pet
     * @param species Species of the new pet
     * @returns The new pet's ID
     */
    handleCreatePet(name, species) {
        // Create pet using the model
        const pet = new model_1.PetModel(name, species);
        const petId = pet.getId();
        // Store the pet
        this.pets.set(petId, pet);
        // Save to database
        this.savePetToDatabase(petId);
        // Notify view
        this.notifyViewUpdate(petId, pet.getState());
        return petId;
    }
    /**
     * Handle the "Rename Pet" user action
     * @param petId ID of the pet to rename
     * @param newName New name for the pet
     */
    handleRenamePet(petId, newName) {
        const pet = this.pets.get(petId);
        if (!pet) {
            console.error(`Cannot rename pet: Pet with ID ${petId} not found`);
            return;
        }
        // Update via model
        const updatedState = pet.rename(newName);
        // Save and update view
        this.savePetToDatabase(petId);
        this.notifyViewUpdate(petId, updatedState);
    }
    /**
     * Handle "Feed Pet" button press
     * @param petId ID of the pet
     */
    handleFeedPet(petId) {
        const pet = this.getPet(petId);
        if (!pet)
            return;
        // Let model handle the feeding logic
        const updatedState = pet.interact('feed');
        // Save and notify view
        this.savePetToDatabase(petId);
        this.notifyViewUpdate(petId, updatedState);
    }
    /**
     * Handle "Play with Pet" button press
     * @param petId ID of the pet
     */
    handlePlayWithPet(petId) {
        const pet = this.getPet(petId);
        if (!pet)
            return;
        // Let model handle the play logic
        const updatedState = pet.interact('play');
        // Save and notify view
        this.savePetToDatabase(petId);
        this.notifyViewUpdate(petId, updatedState);
    }
    /**
     * Handle "Groom Pet" button press
     * @param petId ID of the pet
     */
    handleGroomPet(petId) {
        const pet = this.getPet(petId);
        if (!pet)
            return;
        // Let model handle the grooming logic
        const updatedState = pet.interact('groom');
        // Save and notify view
        this.savePetToDatabase(petId);
        this.notifyViewUpdate(petId, updatedState);
    }
    /**
     * Handle pet movement on screen
     * @param petId ID of the pet
     * @param x X coordinate
     * @param y Y coordinate
     */
    handleMovePet(petId, x, y) {
        const pet = this.getPet(petId);
        if (!pet)
            return;
        // Let model update position
        const updatedState = pet.setPosition(x, y);
        // Only update view (no need to save position to database)
        this.notifyViewUpdate(petId, updatedState);
    }
    /**
     * Handle task completion notification
     * @param petId ID of the pet
     */
    handleTaskCompleted(petId) {
        const pet = this.getPet(petId);
        if (!pet)
            return;
        // Let model handle task completion logic
        const updatedState = pet.onTaskComplete();
        // Save and notify view
        this.savePetToDatabase(petId);
        this.notifyViewUpdate(petId, updatedState);
    }
    /**
     * Handle Pomodoro session completion
     * @param petId ID of the pet
     */
    handlePomodoroCompleted(petId) {
        const pet = this.getPet(petId);
        if (!pet)
            return;
        // Let model handle Pomodoro completion logic
        const updatedState = pet.onPomodoroComplete();
        // Save and notify view
        this.savePetToDatabase(petId);
        this.notifyViewUpdate(petId, updatedState);
    }
    /**
     * Get a pet by ID (for view access)
     * @param petId ID of the pet to retrieve
     */
    getPet(petId) {
        return this.pets.get(petId);
    }
    /**
     * Get all pets (for view access)
     */
    getAllPets() {
        return Array.from(this.pets.values());
    }
    /**
     * Load pets from database
     */
    loadPetsFromDatabase() {
        console.log('Loading pets from database...');
        // TODO:: This SHOULD query database
        // For testing, created a mock pet
        if (this.pets.size === 0) {
            this.handleCreatePet('Default Husky', 'husky');
        }
    }
    /**
     * Simulate saving pet to database
     */
    savePetToDatabase(petId) {
        const pet = this.pets.get(petId);
        if (!pet)
            return;
        console.log(`Saving pet ${petId} to database:`, pet.getState());
        // TODO: call database APIs
    }
    /**
     * Notify view of pet updates
     */
    notifyViewUpdate(petId, petState) {
        if (this.viewUpdateCallback) {
            this.viewUpdateCallback(petId, petState);
        }
    }
    /**
     * Start the periodic update loop
     */
    startUpdateLoop() {
        this.updateIntervalId = setInterval(() => {
            const currentTime = Date.now();
            const deltaTime = currentTime - this.lastUpdateTime;
            // Update each pet's stats via the model
            this.pets.forEach((pet, petId) => {
                pet.updateStats(deltaTime);
                this.notifyViewUpdate(petId, pet.getState());
            });
            this.lastUpdateTime = currentTime;
        }, 1000);
    }
}
exports.PetController = PetController;
//# sourceMappingURL=controller.js.map