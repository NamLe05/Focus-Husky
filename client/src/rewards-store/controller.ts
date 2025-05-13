/* eslint-disable prettier/prettier */
import { RewardsStore, Pet} from './model';

export const store = new RewardsStore();

export function handlePetClick(pet: Pet){

  const totalPoints = store.getTotalPoints();

  console.log(`Clicked on ${pet.name}`);
  console.log(`Total points: ${totalPoints}`);

  // if(pet.owned === true){
  //   console.log(`${pet.name} already owned!`);
  //   return;
  // }

  if (totalPoints >= pet.price){
    store.purchasePet(store.getPetID(pet.name));
    console.log(`User can purchase ${pet.name}`);

    console.log(`Remaining Balnce is ${store.getTotalPoints()}`);
  } else {
    console.log(`Not enough points to purchase ${pet.name}`);
  }
}

