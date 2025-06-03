import { PetModel, PetId, PetState, PetAccessoryId } from './model';

export class GlobalPetController {
    private static instance: GlobalPetController;
    private pets: Map<PetId, PetModel>;
    private localControllers: Set<(petId: PetId, state: PetState) => void>;
    private updateIntervalId: NodeJS.Timeout | null = null;
    private lastUpdateTime: number;

    private constructor() {
        this.pets = new Map();
        this.localControllers = new Set();
        this.lastUpdateTime = Date.now();
        this.startUpdateLoop();
    }

    public static getInstance(): GlobalPetController {
        if (!GlobalPetController.instance) {
            GlobalPetController.instance = new GlobalPetController();
        }
        return GlobalPetController.instance;
    }

    public registerLocalController(callback: (petId: PetId, state: PetState) => void): void {
        this.localControllers.add(callback);
        // Notify the new controller about all existing pets
        this.pets.forEach((pet, petId) => {
            callback(petId, pet.getState());
        });
    }

    public unregisterLocalController(callback: (petId: PetId, state: PetState) => void): void {
        this.localControllers.delete(callback);
    }

    public handleCreatePet(name: string, species: string): PetId {
        const pet = new PetModel(name, species as 'husky');
        const petId = pet.getId();
        this.pets.set(petId, pet);
        this.notifyAllControllers(petId, pet.getState());
        return petId;
    }

    public handleFeedPet(petId: PetId): void {
        const pet = this.getPet(petId);
        if (!pet) return;

        const updatedState = pet.interact('feed');
        this.savePetToDatabase(petId);
        this.notifyAllControllers(petId, updatedState);
    }

    public handlePlayWithPet(petId: PetId): void {
        const pet = this.getPet(petId);
        if (!pet) return;

        const updatedState = pet.play();
        this.savePetToDatabase(petId);
        this.notifyAllControllers(petId, updatedState);
    }

    public handleGroomPet(petId: PetId): void {
        const pet = this.getPet(petId);
        if (!pet) return;

        const updatedState = pet.interact('groom');
        this.savePetToDatabase(petId);
        this.notifyAllControllers(petId, updatedState);
    }

    public handleMovePet(petId: PetId, x: number, y: number): void {
        const pet = this.getPet(petId);
        if (!pet) return;

        const updatedState = pet.setPosition(x, y);
        this.notifyAllControllers(petId, updatedState);
    }

    public handlePomodoroCompleted(petId: PetId): void {
        const pet = this.getPet(petId);
        if (!pet) return;

        const updatedState = pet.onPomodoroComplete();
        this.savePetToDatabase(petId);
        this.notifyAllControllers(petId, updatedState);
    }

    public handleTaskCompleted(petId: PetId): void {
        const pet = this.getPet(petId);
        if (!pet) return;

        const updatedState = pet.onTaskComplete();
        this.savePetToDatabase(petId);
        this.notifyAllControllers(petId, updatedState);
    }

    public getAllPets(): PetModel[] {
        return Array.from(this.pets.values());
    }

    private getPet(petId: PetId): PetModel | undefined {
        return this.pets.get(petId);
    }

    private notifyAllControllers(petId: PetId, state: PetState): void {
        this.localControllers.forEach(callback => {
            callback(petId, state);
        });
    }

    private startUpdateLoop(): void {
        this.updateIntervalId = setInterval(() => {
            const currentTime = Date.now();
            const deltaTime = currentTime - this.lastUpdateTime;

            this.pets.forEach((pet, petId) => {
                pet.updateStats(deltaTime);
                this.notifyAllControllers(petId, pet.getState());
            });

            this.lastUpdateTime = currentTime;
        }, 1000);
    }

    private savePetToDatabase(petId: PetId): void {
        const pet = this.getPet(petId);
        if (!pet) return;

        // TODO: Implement database saving logic
        // This should be implemented when database functionality is added
    }

    public loadPetsFromDatabase(): void {
        // TODO: Implement database loading logic
        // This should be implemented when database functionality is added
        // For now, create a default pet if none exists
        if (this.pets.size === 0) {
            this.handleCreatePet('Dubs', 'husky');
        }
    }
} 