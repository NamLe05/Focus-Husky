import { PetModel, PetSpecies, PetMood, PetAnimation } from './model';

/**
 * Helper functions for pet engine
 */

/**
 * Get the sprite path for a pet based on species, mood, and animation
 * @param species The pet species
 * @param mood The current mood
 * @param animation The current animation
 * @returns Path to the sprite file
 */
export function getPetSpritePath(
  species: PetSpecies,
  mood: PetMood,
  animation: PetAnimation
): string {
  return `../Static/pets/${species}/${mood}_${animation}.png`;
}

/**
 * Get the sprite path for an accessory
 * @param accessoryId The accessory identifier
 * @returns Path to the accessory sprite
 */
export function getAccessorySpritePath(accessoryId: string): string {
    return `../Static/accessories/${accessoryId}.png`;
}


/**
 * Get position constraints based on screen size
 * @param screenWidth Current screen width
 * @param screenHeight Current screen height
 * @returns Object containing min/max x/y coordinates
 */
export function getPositionConstraints(screenWidth: number, screenHeight: number) {
    return {
      minX: 50,
      maxX: screenWidth - 100,
      minY: 50,
      maxY: screenHeight - 100
    };
}
  



