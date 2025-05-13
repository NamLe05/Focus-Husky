/* eslint-disable prettier/prettier */
import { v4 as uuidv4 } from 'uuid';
//PET PAGE:


//all the pets:



export interface Pet {
    ID: string,
    name: string,
    price: number,
    owned: boolean,
}

export interface equippedItems {
    pet: Pet,
}

export class RewardsStore {

    private pets: Pet[] = [];
    private points: number;
    private equipped: equippedItems;


    constructor() {
        this.pets = [
            {ID: uuidv4(), name: 'Husky', price: 200, owned: true},
            {ID: uuidv4(), name: 'Tiger', price: 200, owned: false},
            {ID: uuidv4(), name: 'Duck', price: 200, owned: false},
            {ID: uuidv4(), name: 'Frog', price: 200, owned: false}
        ]

        this.points = 200;

        const id: string = this.getPetID('Husky');
        this.equipped = {
            pet: this.getPet(id)
        }

    }

    public getPetID(name: string): string {
        for (const pet of this.pets){
            if (pet.name === name){
                return pet.ID;
            }
        }

        throw new Error ('Invalid pet ID');
    }

    // returns users' current list of points available to spend
    public getTotalPoints() {
        return this.points;
    }

    public getOwnedPets() {
        return this.pets.filter(pet => pet.owned);
    }

    // checks if user has enough points to spend on an item
    public canAfford(amount: number): boolean {
        if (amount > this.points){
            return false;
        } else {
            return true;
        }
    }

    // get method returns list of all pets in the store
    public getListOfPets(): Pet[] {
        return this.pets;
    }

    // checking to see if a pet purchase is successful or not
    public purchasePet(name: string): void {

        const wantedPet = this.getPet(name);

        if(wantedPet && wantedPet.owned === false){
            if (this.canAfford(wantedPet.price)){
                wantedPet.owned = true;
                this.points -= wantedPet.price;
                //return true;
            }
        }
        //return false;
    }


    // gets the specific pet based on pet name
    // returns exception if pet with give name is not in list of available pets
    public getPet(petID: string): Pet {

        for (let i = 0; i < this.pets.length; i++){

            if(this.pets[i].ID === petID){
                return this.pets[i];
            }
        }

        throw new Error(`Pet with name ${petID} not found`);
    }

    // equipping pet:
    public equipPet(petID: string): boolean {

        const pet = this.getPet(petID);

        if(pet && pet.owned){
            this.equipped.pet = pet;
            return true;
        }
        return false;
    }
    //updates the users new points
    public updatePoints(newPoints: number): void {
        this.points = newPoints;
    }
}



const store = new RewardsStore();
//get all the pets:
store.getListOfPets();



//get the available pets for purchase:

store.getListOfPets();

//get the users' points
store.getTotalPoints();


//check if the pet can be purchased eg. if they have
//enough points to purchase
// const pet = store.getPet('Tiger');
//     if (store.canAfford(pet.price)) {
//         console.log('You can afford this pet');
//     } else {
//         console.log('Not enough points');
//     }


//purchase pet



//update the points



//get owned pets.
store.getOwnedPets();


