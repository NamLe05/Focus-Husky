import {ArithmeticOperator} from './model';

export function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getRandomElement<Type>(array: Type[]): Type {
  if (array.length === 0) {
    return undefined; // Return undefined for an empty array
  }
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}
