/* eslint-disable prettier/prettier */
import { RewardsStore, Pet} from './model';

export class RewardsController {
    private store: RewardsStore;

    constructor(){
        this.store = new RewardsStore();
    }

    getAvailablePets(): Pet[] {
        return this.store.getListOfPets();
    }
    // getUserPoints(): number{
    // }
}
