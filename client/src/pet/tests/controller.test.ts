import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PetController } from '../controller';
import { PetModel, PetId, PetState } from '../model';

describe('PetController', () => {
  let controller: PetController;
  let mockViewUpdateCallback: ReturnType<typeof vi.fn>;
  let createdPetId: PetId;
  
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Create a mock callback function
    mockViewUpdateCallback = vi.fn();
    
    // Create a fresh controller instance
    controller = new PetController(mockViewUpdateCallback);
    
    // Create a test pet
    createdPetId = controller.handleCreatePet('TestPet', 'husky');
    
    // Clear mock calls from setup
    mockViewUpdateCallback.mockClear();
    
    // Mock setTimeout and clearInterval for timer testing
    vi.useFakeTimers();
  });
  
  afterEach(() => {
    // Clean up any intervals
    controller.destroy();
    
    // Restore timer mocks
    vi.restoreAllMocks();
  });
  
  describe('Pet creation and basic operations', () => {
    it('should create a new pet with the correct properties', () => {
      const petId = controller.handleCreatePet('Buddy', 'husky');
      
      // Get the pet that was created
      const pet = controller.getPet(petId);
      
      // Check that pet exists and has correct properties
      expect(pet).toBeDefined();
      expect(pet?.getName()).toBe('Buddy');
      expect(pet?.getSpecies()).toBe('husky');
      
      // Verify view update was called
      expect(mockViewUpdateCallback).toHaveBeenCalledWith(petId, expect.any(Object));
    });
    
    it('should rename a pet correctly', () => {
      // Rename the pet
      controller.handleRenamePet(createdPetId, 'NewName');
      
      // Get the pet and check its name
      const pet = controller.getPet(createdPetId);
      expect(pet?.getName()).toBe('NewName');
      
      // Verify view update was called
      expect(mockViewUpdateCallback).toHaveBeenCalledWith(createdPetId, expect.any(Object));
    });
    
    it('should handle invalid petId gracefully when renaming', () => {
      // Spy on console.error
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Try to rename a non-existent pet
      controller.handleRenamePet('nonexistent-id', 'NewName');
      
      // Verify error was logged
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      // Verify callback was not called
      expect(mockViewUpdateCallback).not.toHaveBeenCalled();
      
      // Restore console.error
      consoleErrorSpy.mockRestore();
    });
    
    it('should retrieve the correct pet by ID', () => {
      // Create a second pet
      const secondPetId = controller.handleCreatePet('SecondPet', 'husky');
      
      // Get both pets
      const firstPet = controller.getPet(createdPetId);
      const secondPet = controller.getPet(secondPetId);
      
      // Verify they have the correct names
      expect(firstPet?.getName()).toBe('TestPet');
      expect(secondPet?.getName()).toBe('SecondPet');
    });
    
    it('should return all created pets', () => {
      // Create more pets
      const secondPetId = controller.handleCreatePet('SecondPet', 'husky');
      const thirdPetId = controller.handleCreatePet('ThirdPet', 'husky');
      
      // Get all pets
      const allPets = controller.getAllPets();
      
      // Verify we have the right number and they have the expected names
      expect(allPets.length).toBe(3);
      expect(allPets.map(p => p.getName())).toContain('TestPet');
      expect(allPets.map(p => p.getName())).toContain('SecondPet');
      expect(allPets.map(p => p.getName())).toContain('ThirdPet');
    });
  });
  
  describe('Pet interactions', () => {
    it('should handle feeding a pet correctly', () => {
      // Feed the pet
      controller.handleFeedPet(createdPetId);
      
      // Get the pet and check its state changes
      const pet = controller.getPet(createdPetId);
      expect(pet?.getAnimation()).toBe('eating');
      
      // Verify view update was called
      expect(mockViewUpdateCallback).toHaveBeenCalledWith(createdPetId, expect.any(Object));
    });
    
    it('should handle playing with a pet correctly', () => {
      // Play with the pet
      controller.handlePlayWithPet(createdPetId);
      
      // Get the pet and check its state changes
      const pet = controller.getPet(createdPetId);
      expect(pet?.getAnimation()).toBe('walking');
      
      // Verify view update was called
      expect(mockViewUpdateCallback).toHaveBeenCalledWith(createdPetId, expect.any(Object));
    });
    
    it('should handle grooming a pet correctly', () => {
      // Groom the pet
      controller.handleGroomPet(createdPetId);
      
      // Get the pet and check its state changes
      const pet = controller.getPet(createdPetId);
      expect(pet?.getAnimation()).toBe('sleeping');
      
      // Verify view update was called
      expect(mockViewUpdateCallback).toHaveBeenCalledWith(createdPetId, expect.any(Object));
    });
    
    it('should handle task completion correctly', () => {
      // Complete a task
      controller.handleTaskCompleted(createdPetId);
      
      // Get the pet and check its state changes
      const pet = controller.getPet(createdPetId);
      expect(pet?.getAnimation()).toBe('celebrating');
      
      // Verify view update was called
      expect(mockViewUpdateCallback).toHaveBeenCalledWith(createdPetId, expect.any(Object));
    });
    
    it('should handle pomodoro completion correctly', () => {
      // Complete a pomodoro
      controller.handlePomodoroCompleted(createdPetId);
      
      // Get the pet and check its state changes
      const pet = controller.getPet(createdPetId);
      expect(pet?.getAnimation()).toBe('celebrating');
      
      // Verify view update was called
      expect(mockViewUpdateCallback).toHaveBeenCalledWith(createdPetId, expect.any(Object));
    });
    
    it('should gracefully handle interactions with non-existent pets', () => {
      // Try to interact with a non-existent pet
      controller.handleFeedPet('nonexistent-id');
      controller.handlePlayWithPet('nonexistent-id');
      controller.handleGroomPet('nonexistent-id');
      controller.handleTaskCompleted('nonexistent-id');
      controller.handlePomodoroCompleted('nonexistent-id');
      
      // Verify callback was not called
      expect(mockViewUpdateCallback).not.toHaveBeenCalled();
    });
  });
  
  describe('Pet movement', () => {
    it('should update pet position correctly', () => {
      // Move the pet
      controller.handleMovePet(createdPetId, 400, 500);
      
      // Get the pet and check its position
      const pet = controller.getPet(createdPetId);
      const position = pet?.getPosition();
      
      expect(position?.x).toBe(400);
      expect(position?.y).toBe(500);
      
      // Verify view update was called
      expect(mockViewUpdateCallback).toHaveBeenCalledWith(createdPetId, expect.any(Object));
    });
    
    it('should gracefully handle moving non-existent pets', () => {
      // Try to move a non-existent pet
      controller.handleMovePet('nonexistent-id', 400, 500);
      
      // Verify callback was not called
      expect(mockViewUpdateCallback).not.toHaveBeenCalled();
    });
  });
  
  describe('Update loop and database operations', () => {
    it('should start an update loop when created', () => {
      // Spy on global setInterval
      const setIntervalSpy = vi.spyOn(global, 'setInterval');
      
      // Create a new controller
      const newController = new PetController(mockViewUpdateCallback);
      
      // Verify setInterval was called
      expect(setIntervalSpy).toHaveBeenCalled();
      
      // Clean up
      newController.destroy();
    });
    
    it('should clean up interval when destroyed', () => {
      // Spy on global clearInterval
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
      
      // Destroy controller
      controller.destroy();
      
      // Verify clearInterval was called
      expect(clearIntervalSpy).toHaveBeenCalled();
    });
    
    it('should update pet stats periodically', () => {
      // Create a new pet for testing
      const newPetId = controller.handleCreatePet('TimerPet', 'husky');
      const initialPet = controller.getPet(newPetId);
      const initialHappiness = initialPet?.getHappiness() || 0;
      
      // Clear callback history
      mockViewUpdateCallback.mockClear();
      
      // Advance timers to trigger several updates
      vi.advanceTimersByTime(10000); // 10 seconds
      
      // Verify the update callback was called
      expect(mockViewUpdateCallback).toHaveBeenCalled();
    });
  });
});