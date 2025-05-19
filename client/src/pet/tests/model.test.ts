import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { PetModel, PetSpecies, PetState } from '../model';

describe('PetModel', () => {
  let pet: PetModel;
  
  beforeEach(() => {
    // Create a fresh pet for each test
    pet = new PetModel('Dubs', 'husky');
    
    // Mock the setTimeout function
    vi.useFakeTimers();
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });
  
  describe('Constructor and getters', () => {
    it('should create a pet with the correct initial state', () => {
      // Check basic properties
      expect(pet.getName()).toBe('Dubs');
      expect(pet.getSpecies()).toBe('husky');
      expect(pet.getMood()).toBe('neutral');
      expect(pet.getAnimation()).toBe('idle');
      
      // Check initial stats
      expect(pet.getHappiness()).toBe(10);
      expect(pet.getEnergy()).toBe(60);
      expect(pet.getCleanliness()).toBe(50);
      
      // Check ID creation
      expect(pet.getId()).toBeDefined();
      expect(typeof pet.getId()).toBe('string');
      
      // Check initial position
      const position = pet.getPosition();
      expect(position.x).toBe(300);
      expect(position.y).toBe(300);
      
      // Check accessories
      expect(pet.getAccessories().size).toBe(0);
      
      // Check that lastInteraction is recent
      const lastInteraction = pet.getLastInteraction();
      const now = new Date();
      expect(lastInteraction.getTime()).toBeCloseTo(now.getTime(), -2); // Within 100ms
    });
  });
  
  describe('Pet state management', () => {
    it('should rename the pet', () => {
      const newState = pet.rename('Fluffy');
      
      expect(pet.getName()).toBe('Fluffy');
      expect(newState.name).toBe('Fluffy');
    });
    
    it('should add accessories correctly', () => {
      const accessoryId = 'hat123';
      const newState = pet.addAccessory(accessoryId);
      
      expect(pet.getAccessories().has(accessoryId)).toBe(true);
      expect(newState.accessories.has(accessoryId)).toBe(true);
    });
    
    it('should throw an error when adding a duplicate accessory', () => {
      const accessoryId = 'hat123';
      pet.addAccessory(accessoryId);
      
      expect(() => pet.addAccessory(accessoryId)).toThrow('Accessory is already added to pet');
    });
    
    it('should remove accessories correctly', () => {
      const accessoryId = 'hat123';
      pet.addAccessory(accessoryId);
      
      const newState = pet.removeAccessory(accessoryId);
      
      expect(pet.getAccessories().has(accessoryId)).toBe(false);
      expect(newState.accessories.has(accessoryId)).toBe(false);
    });
    
    it('should throw an error when removing a non-existent accessory', () => {
      expect(() => pet.removeAccessory('nonexistent')).toThrow('Pet does not have accessory');
    });
    
    it('should get a complete state snapshot', () => {
      const state = pet.getState();
      
      expect(state).toEqual({
        name: 'Dubs',
        species: 'husky',
        mood: 'neutral',
        animation: 'idle',
        position: { x: 300, y: 300 },
        accessories: new Set(),
        happiness: 10,
        energy: 60,
        cleanliness: 50,
        lastInteraction: expect.any(Date)
      });
    });
    
    it('should return a new Set for accessories to prevent direct modification', () => {
      const accessories = pet.getAccessories();
      accessories.add('should-not-be-added');
      
      expect(pet.getAccessories().has('should-not-be-added')).toBe(false);
    });
    
    it('should return a new object for position to prevent direct modification', () => {
      const position = pet.getPosition();
      position.x = 999;
      position.y = 999;
      
      const currentPosition = pet.getPosition();
      expect(currentPosition.x).toBe(300);
      expect(currentPosition.y).toBe(300);
    });
  });
  
  describe('Interactions', () => {
    it('should feed the pet correctly', () => {
      const initialEnergy = pet.getEnergy();
      const newState = pet.feed();
      
      expect(pet.getEnergy()).toBe(Math.min(100, initialEnergy + 80));
      expect(pet.getAnimation()).toBe('eating');
      
      // Check that lastInteraction is updated
      const lastInteraction = pet.getLastInteraction();
      const now = new Date();
      expect(lastInteraction.getTime()).toBeCloseTo(now.getTime(), -2);
    });
    
    it('should play with the pet correctly', () => {
      const initialHappiness = pet.getHappiness();
      const initialEnergy = pet.getEnergy();
      const newState = pet.play();
      
      expect(pet.getHappiness()).toBe(Math.min(100, initialHappiness + 25));
      expect(pet.getEnergy()).toBe(Math.max(0, initialEnergy - 10));
      expect(pet.getAnimation()).toBe('walking');
    });
    
    it('should groom the pet correctly', () => {
      const initialCleanliness = pet.getCleanliness();
      const initialHappiness = pet.getHappiness();
      const newState = pet.groom();
      
      expect(pet.getCleanliness()).toBe(Math.min(100, initialCleanliness + 10));
      expect(pet.getHappiness()).toBe(Math.min(100, initialHappiness + 10));
      expect(pet.getAnimation()).toBe('sleeping');
    });
    
    it('should handle task completion correctly', () => {
      const initialHappiness = pet.getHappiness();
      const newState = pet.onTaskComplete();
      
      expect(pet.getHappiness()).toBe(Math.min(100, initialHappiness + 10));
      expect(pet.getAnimation()).toBe('celebrating');
    });
    
    it('should handle pomodoro completion correctly', () => {
      const initialHappiness = pet.getHappiness();
      const initialEnergy = pet.getEnergy();
      const newState = pet.onPomodoroComplete();
      
      expect(pet.getHappiness()).toBe(Math.min(100, initialHappiness + 20));
      expect(pet.getEnergy()).toBe(Math.max(0, initialEnergy - 10));
      expect(pet.getAnimation()).toBe('celebrating');
    });
    
    it('should reset animation after interactions', () => {
      pet.feed(); // Sets animation to 'eating'
      expect(pet.getAnimation()).toBe('eating');
      
      // Fast forward time
      vi.advanceTimersByTime(7000);
      
      // Animation should reset to idle after timeout
      expect(pet.getAnimation()).toBe('idle');
    });
    
    it('should use the generic interact method correctly', () => {
      // Test the three types of interactions
      const spyFeed = vi.spyOn(pet, 'feed');
      const spyPlay = vi.spyOn(pet, 'play');
      const spyGroom = vi.spyOn(pet, 'groom');
      
      pet.interact('feed');
      expect(spyFeed).toHaveBeenCalledTimes(1);
      
      pet.interact('play');
      expect(spyPlay).toHaveBeenCalledTimes(1);
      
      pet.interact('groom');
      expect(spyGroom).toHaveBeenCalledTimes(1);
    });
  });
  
  describe('Position updates', () => {
    it('should update position correctly', () => {
      const newState = pet.setPosition(500, 600);
      
      const position = pet.getPosition();
      expect(position.x).toBe(500);
      expect(position.y).toBe(600);
      expect(newState.position.x).toBe(500);
      expect(newState.position.y).toBe(600);
    });
  });
  
  describe('Stats and mood management', () => {
    it('should clamp stat values between 0 and 100', () => {
      // Test happiness bounds
      pet.rename('Test'); // Just to access the resulting state
      
      // Set to 0 by going way negative
      const state1 = pet.feed(); // To access private setHappiness via state
      expect(state1.happiness).toBeGreaterThan(0);
      expect(state1.happiness).toBeLessThanOrEqual(100);
      
      // Set energy to 0
      for (let i = 0; i < 20; i++) {
        pet.play(); // Decrease energy through multiple plays
      }
      expect(pet.getEnergy()).toBe(0);
      
      // Set energy to max
      for (let i = 0; i < 20; i++) {
        pet.feed(); // Increase energy through multiple feeds
      }
      expect(pet.getEnergy()).toBe(100);
      
      // Set cleanliness to max
      for (let i = 0; i < 20; i++) {
        pet.groom(); // Increase cleanliness through multiple grooms
      }
      expect(pet.getCleanliness()).toBe(100);
    });
    
    it('should update mood based on stats', () => {
      const oldStats = {
        happiness: pet.getHappiness(),
        energy: pet.getEnergy(),
        cleanliness: pet.getCleanliness(),
      };
      
      // Boost all stats to get an 'excited' mood
      for (let i = 0; i < 10; i++) {
        pet.feed(); // Increase energy
        pet.play(); // Increase happiness
        pet.groom(); // Increase cleanliness
      }
      
      // Should result in 'excited' mood
      expect(pet.getMood()).toBe('excited');
      
      // Reset and lower stats for a 'sad' mood
      const newPet = new PetModel('SadPet', 'husky');
      
      // Update stats to make pet sad (requires bypassing private methods)
      // We'll use updateStats to gradually decrease stats
      for (let i = 0; i < 20; i++) {
        newPet.updateStats(1000 * 60 * 5); // 5 minutes each time
      }
      
      expect(newPet.getMood()).toBe('sad');
    });
    
    it('should update stats over time', () => {
      const initialState = {
        happiness: pet.getHappiness(),
        energy: pet.getEnergy(),
        cleanliness: pet.getCleanliness(),
      };
      
      // Simulate 60 minutes passing
      const updatedState = pet.updateStats(60 * 60 * 1000);
      
      // Stats should decrease
      expect(pet.getHappiness()).toBeLessThan(initialState.happiness);
      expect(pet.getEnergy()).toBeLessThan(initialState.energy);
      expect(pet.getCleanliness()).toBeLessThan(initialState.cleanliness);
    });
    
    it('should return null for tiny time updates', () => {
      const result = pet.updateStats(50); // Less than 100ms
      expect(result).toBeNull();
    });
    
    it('should return state only when visible changes occur', () => {
      // Force a change that doesn't affect mood
      const smallUpdate = pet.updateStats(100); // Just enough to get past the threshold
      
      // If no visible changes occurred, should return null
      if (pet.getMood() === 'neutral' && pet.getAnimation() === 'idle') {
        expect(smallUpdate).toBeNull();
      }
      
      // Force a large update that causes visible changes
      const largeUpdate = pet.updateStats(60 * 60 * 1000); // 1 hour
      
      // Should return state if mood changed
      if (pet.getMood() !== 'neutral' || pet.getAnimation() !== 'idle') {
        expect(largeUpdate).not.toBeNull();
      }
    });
  });
});