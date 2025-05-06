"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PetModel = void 0;
const uuid_1 = require("uuid");
class PetModel {
    /**
     * Create a new pet instance with no accessories
     * @param id unique pet identifier
     * @param name name of the pet
     * @param species species
     */
    constructor(name, species) {
        // Generate a UUID identified for the pet
        this.id = (0, uuid_1.v4)();
        this.state = {
            name,
            species,
            accessories: new Set(),
            mood: 'neutral',
            animation: 'idle',
            position: { x: 0, y: 0 },
            happiness: 70,
            energy: 100,
            cleanliness: 100,
            lastInteraction: new Date(),
        };
    }
    /**
     * Get the pet's ID
     * @returns {PetId} the unique, numerical identifier for the pet
     */
    getId() {
        return this.id;
    }
    /**
     * Get the pet's name
     * @returns {string} the name of the pet
     */
    getName() {
        return this.state.name;
    }
    /**
     * Get the pet's species
     * @returns {PetSpecies} the species of the pet
     */
    getSpecies() {
        return this.state.species;
    }
    /**
     * Get the pet's accessories
     * @returns {Set<PetAccessoryId>} the set of accessories that the pet owns
     */
    getAccessories() {
        // Returns a copy.
        return new Set(this.state.accessories);
    }
    /**
     * Renames the pet
     * @param {string} name the new name for the pet
     */
    rename(name) {
        this.state.name = name;
        return this.getState();
    }
    /**
     * Adds a new accessory to the pet
     * @param {PetAccessory} accessory the unique accessory identifier
     */
    addAccessory(accessory) {
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
    removeAccessory(accessory) {
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
    getMood() {
        return this.state.mood;
    }
    /**
     * Get the pet's current animation state
     * @returns {PetAnimation} the current animation
     */
    getAnimation() {
        return this.state.animation;
    }
    /**
     * Get the pet's position on screen
     * @returns {object} x and y coordinates
     */
    getPosition() {
        return Object.assign({}, this.state.position);
    }
    /**
     * Get the pet's happiness value
     * @returns {number} happiness level (0-100)
     */
    getHappiness() {
        return this.state.happiness;
    }
    /**
     * Get the pet's energy value
     * @returns {number} energy level (0-100)
     */
    getEnergy() {
        return this.state.energy;
    }
    /**
     * Get the pet's cleanliness value
     * @returns {number} cleanliness level (0-100)
     */
    getCleanliness() {
        return this.state.cleanliness;
    }
    /**
     * Get the pet's last interaction time
     * @returns {Date} timestamp of last interaction
     */
    getLastInteraction() {
        return new Date(this.state.lastInteraction);
    }
    /**
     * Get a complete snapshot of the pet's state
     * @returns {PetState} all pet state data
     */
    getState() {
        return this.state;
    }
    /**
     * General interaction handler
     * @param interactionType Type of interaction
     * @returns Updated pet state
     */
    interact(interactionType) {
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
    feed() {
        this.setEnergy(this.state.energy + 30);
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
    play() {
        this.setHappiness(this.state.happiness + 15);
        this.setEnergy(this.state.energy - 10);
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
    groom() {
        this.setCleanliness(100);
        this.setHappiness(this.state.happiness + 5);
        this.updateLastInteraction();
        this.updateMood();
        // Return current state for view updates
        return this.getState();
    }
    /**
     * Update the pet's position
     * @param {number} x X coordinate
     * @param {number} y Y coordinate
     * @returns {PetState} updated pet state
     */
    setPosition(x, y) {
        this.state.position = { x, y };
        return this.getState();
    }
    /**
     * Update the last interaction timestamp
     */
    updateLastInteraction() {
        this.state.lastInteraction = new Date();
    }
    /**
     * Update pet mood based on overall stats
     */
    updateMood() {
        const average = (this.state.happiness + this.state.energy + this.state.cleanliness) / 3;
        if (average >= 80) {
            this.state.mood = 'excited';
        }
        else if (average >= 60) {
            this.state.mood = 'happy';
        }
        else if (average >= 40) {
            this.state.mood = 'neutral';
        }
        else if (average >= 20) {
            this.state.mood = 'tired';
        }
        else {
            this.state.mood = 'sad';
        }
    }
    /**
     * Set animation state
     * @param animation New animation state
     */
    setAnimation(animation) {
        this.state.animation = animation;
    }
    /**
     * Update the pet's happiness (clamped between 0-100)
     * @param {number} value new happiness value
     */
    setHappiness(value) {
        this.state.happiness = Math.max(0, Math.min(100, value));
    }
    /**
     * Update the pet's energy (clamped between 0-100)
     * @param {number} value new energy value
     */
    setEnergy(value) {
        this.state.energy = Math.max(0, Math.min(100, value));
    }
    /**
     * Update the pet's cleanliness (clamped between 0-100)
     * @param {number} value new cleanliness value
     */
    setCleanliness(value) {
        this.state.cleanliness = Math.max(0, Math.min(100, value));
    }
    /**
     * Handle task completion event
     * @returns Updated pet state information
     */
    onTaskComplete() {
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
    onPomodoroComplete() {
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
     * @returns Updated pet state if changes occurred
     */
    updateStats(deltaTime) {
        // Skip tiny updates
        if (deltaTime < 100)
            return null;
        // Convert to minutes for easier calculation
        const minutes = deltaTime / (1000 * 60);
        // Store initial mood for comparison
        const initialMood = this.state.mood;
        const initialAnimation = this.state.animation;
        // Decrease stats over time
        this.setHappiness(this.state.happiness - 0.5 * minutes);
        this.setEnergy(this.state.energy - 0.3 * minutes);
        this.setCleanliness(this.state.cleanliness - 0.2 * minutes);
        // Update mood based on new stats
        this.updateMood();
        // Only return state if visible changes occurred
        if (this.state.mood !== initialMood ||
            this.state.animation !== initialAnimation) {
            return this.getState();
        }
        return null;
    }
}
exports.PetModel = PetModel;
//# sourceMappingURL=model.js.map