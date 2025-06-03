import {PetModel, PetId, PetAccessoryId, PetState} from './model';
import {GlobalPetController} from './globalController';

export class PetController {
  // View update callback
  private viewUpdateCallback: (petId: PetId, state: PetState) => void;
  private globalController: GlobalPetController;

  /**
   * Create a new pet controller instance
   * @param viewUpdateCallback Callback to notify view of updates
   */
  constructor(viewUpdateCallback: (petId: PetId, state: PetState) => void) {
    this.viewUpdateCallback = viewUpdateCallback;
    this.globalController = GlobalPetController.getInstance();
    this.globalController.registerLocalController(this.viewUpdateCallback);
  }

  /**
   * Handle "Create Pet" button press
   * @param name Name of the pet
   * @param species Species of the pet
   */
  public handleCreatePet(name: string, species: string): PetId {
    return this.globalController.handleCreatePet(name, species);
  }

  /**
   * Handle "Feed Pet" button press
   * @param petId ID of the pet
   */
  public handleFeedPet(petId: PetId): void {
    this.globalController.handleFeedPet(petId);
  }

  /**
   * Handle "Play with Pet" button press
   * @param petId ID of the pet
   */
  public handlePlayWithPet(petId: PetId): void {
    this.globalController.handlePlayWithPet(petId);
  }

  /**
   * Handle "Groom Pet" button press
   * @param petId ID of the pet
   */
  public handleGroomPet(petId: PetId): void {
    this.globalController.handleGroomPet(petId);
  }

  /**
   * Handle pet movement on screen
   * @param petId ID of the pet
   * @param x X coordinate
   * @param y Y coordinate
   */
  public handleMovePet(petId: PetId, x: number, y: number): void {
    this.globalController.handleMovePet(petId, x, y);
  }

  /**
   * Handle Pomodoro session completion
   * @param petId ID of the pet
   */
  public handlePomodoroCompleted(petId: PetId): void {
    this.globalController.handlePomodoroCompleted(petId);
  }

  /**
   * Handle task completion
   * @param petId ID of the pet
   */
  public handleTaskCompleted(petId: PetId): void {
    this.globalController.handleTaskCompleted(petId);
  }

  /**
   * Get all pets managed by this controller
   */
  public getAllPets(): PetModel[] {
    return this.globalController.getAllPets();
  }

  /**
   * Load pets from database
   */
  public loadPetsFromDatabase(): void {
    this.globalController.loadPetsFromDatabase();
  }

  /**
   * Update the view callback function
   * This allows reusing the controller instance with a new view component
   * @param viewUpdateCallback New callback function
   */
  public updateCallback(
    viewUpdateCallback: (petId: PetId, state: PetState) => void,
  ): void {
    this.globalController.unregisterLocalController(this.viewUpdateCallback);
    this.viewUpdateCallback = viewUpdateCallback;
    this.globalController.registerLocalController(this.viewUpdateCallback);
  }

  public setViewUpdateCallback(callback: (petId: PetId, state: PetState) => void) {
    this.globalController.unregisterLocalController(this.viewUpdateCallback);
    this.viewUpdateCallback = callback;
    this.globalController.registerLocalController(this.viewUpdateCallback);
  }
}

let controllerInstance: PetController | null = null;

export const getPetController = (
  callback?: (petId: PetId, state: PetState) => void,
): PetController => {
  if (!controllerInstance) {
    console.log('[controller.ts] Creating PetController');
    controllerInstance = new PetController(callback ?? (() => {}));
  } else if (callback) {
    console.log('[controller.ts] Updating PetController callback');
    controllerInstance.updateCallback(callback);
  }
  return controllerInstance;
};
