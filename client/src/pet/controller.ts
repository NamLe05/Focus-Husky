import { PetModel, PetSpecies, PetId, PetAccessoryId } from './model';

export type PetMood = 'happy' | 'neutral' | 'sad' | 'excited' | 'tired';
export type PetAnimation = 'idle' | 'walking' | 'celebrating' | 'sleeping' | 'eating';

export interface PetState {
  mood: PetMood;
  animation: PetAnimation;
  position: { x: number; y: number };
  accessories: Set<PetAccessoryId>;
  happiness: number; // 0-100
  energy: number; // 0-100
  cleanliness: number; // 0-100
}