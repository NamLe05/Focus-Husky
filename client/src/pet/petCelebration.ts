import { getPetController } from "./controller";

let currentPetId: string | null = null;

export function registerPetId(petId: string) {
  currentPetId = petId;
}

export function celebratePet() {
  if (!currentPetId) {
    console.warn('[petCelebration] No registered petId.');
    return;
  }

  const controller = getPetController();
  controller.handleTaskCompleted(currentPetId);
}
