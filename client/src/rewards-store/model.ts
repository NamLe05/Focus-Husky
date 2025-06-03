import {v4 as uuidv4} from 'uuid';
import HuskyImage from '../Static/Husky.png';
import FrogImage from '../Static/Frog.png';
import DuckImage from '../Static/Duck.png';
import TigerImage from '../Static/Tiger.png';

import HatImage from '../Static/hat.png';
import CollarImage from '../Static/collar.png';
import LeashImage from '../Static/leash.png';

import ClassicTimerImage from '../Static/classic-timer.png';
import PomodoroImage from '../Static/pomodoro.png';
import StopWatchImage from '../Static/stopwatch.png';

import BellImage from '../Static/bell.png';
import ChimeImage from '../Static/chime.png';
import AlertImage from '../Static/alert.png';

import CheckListImage from '../Static/checklist.png';
import HomeworkImage from '../Static/homework.png';
import CalendarImage from '../Static/calendar.png';

export interface Pet {
  ID: string;
  name: string;
  price: number;
  owned: boolean;
}

export interface marketPlaceItem {
  ID: string;
  name: string;
  price: number;
  owned: boolean;
  image: string;
}

export interface equippedItems {
  pet: marketPlaceItem;
  accessory: marketPlaceItem;
  timer: marketPlaceItem;
  sound: marketPlaceItem;
  image: marketPlaceItem;
}

export interface RewardState {
  _id: string; // e.g., 'user-rewards'
  points: number;
  ownedItems: string[]; 
}

export class RewardsStore {
  marketItems: {
    pets: marketPlaceItem[];
    accessories: marketPlaceItem[];
    timers: marketPlaceItem[];
    sounds: marketPlaceItem[];
    tasks: marketPlaceItem[];
  };
  private points: number;
  private equipped: equippedItems;

  constructor() {
    this.marketItems = {
      pets: [
        {
          ID: 'pet-husky',
          name: 'Husky',
          price: 200,
          owned: true,
          image: HuskyImage,
        },
        {
          ID: 'pet-tiger',
          name: 'Tiger',
          price: 200,
          owned: false,
          image: TigerImage,
        },
        {
          ID: 'pet-duck',
          name: 'Duck',
          price: 200,
          owned: false,
          image: DuckImage,
        },
        {
          ID: 'pet-frog',
          name: 'Frog',
          price: 200,
          owned: false,
          image: FrogImage,
        },
      ],
      accessories: [
        { ID: 'acc-hat', 
          name: 'Hat', 
          price: 50, 
          owned: false, 
          image: HatImage},
        {
          ID: 'acc-collar',
          name: 'Collar',
          price: 75,
          owned: false,
          image: CollarImage,
        },
        {
          ID: 'acc-leash',
          name: 'Leash',
          price: 40,
          owned: false,
          image: LeashImage,
        },
      ],
      timers: [
        {
          ID: 'timer-classic',
          name: 'Classic Timer',
          price: 30,
          owned: false,
          image: ClassicTimerImage,
        },
        {
          ID: 'timer-pomodoro',
          name: 'Pomodoro',
          price: 25,
          owned: false,
          image: PomodoroImage,
        },
        {
          ID: 'timer-stopwatch',
          name: 'Stopwatch',
          price: 15,
          owned: false,
          image: StopWatchImage,
        },
      ],
      sounds: [
        {ID: uuidv4(), name: 'Bell', price: 30, owned: false, image: BellImage},
        {
          ID: 'sounds-chime',
          name: 'Chime',
          price: 25,
          owned: false,
          image: ChimeImage,
        },
        {
          ID: 'sounds-alert',
          name: 'Alert',
          price: 15,
          owned: false,
          image: AlertImage,
        },
      ],
      tasks: [
        {
          ID: 'tasks-checklist',
          name: 'Checklist',
          price: 40,
          owned: false,
          image: CheckListImage,
        },
        {
          ID: 'tasks-homework',
          name: 'Homework',
          price: 45,
          owned: false,
          image: HomeworkImage,
        },
        {
          ID: 'task-calendar',
          name: 'Calendar',
          price: 55,
          owned: false,
          image: CalendarImage,
        },
      ],
    };
    this.points = 200;

    this.loadStateFromDB();
  }
  
  
  async loadStateFromDB() {
    const state = await window.electronAPI?.getRewards?.();
    if (!state || typeof state.points !== 'number') {
      console.warn('No reward state loaded — skipping initialization.');
      return;
    }

    this.points = state.points;

    for (const category of Object.values(this.marketItems)) {
      for (const item of category) {
        if (state.ownedItems.includes(item.ID)) {
          item.owned = true;
        }
      }
    }
  } 

  public deductPoints(amount: number) {
    this.points = this.points - amount;
  }

  public addPoints(amount: number) {
    this.points += amount;
  }

  //Get item ID number through name
  public getItemID(name: string): string {
    for (const category in this.marketItems) {
      const items = this.marketItems[category as keyof typeof this.marketItems];
      for (const item of items) {
        if (item.name === name) {
          return item.ID;
        }
      }
    }

    throw new Error('Invalid pet ID');
  }

  public async purchaseItem(
    category: keyof typeof this.marketItems,
    itemId: string
  ): Promise<boolean> {
    const items = this.marketItems[category];
    const item = items.find(i => i.ID === itemId);
    if (!item) {
      console.log(`Item with ID ${itemId} not found in category ${category}`);
      return false;
    }
    if (item.owned) {
      console.log(`User already owns ${item.name}`);
      return false;
    }
    if (item.price > this.points) {
      console.log(`Not enough points to purchase ${item.name}`);
      return false;
    }
    
    // Deduct points
    this.deductPoints(item.price);
    
    // Mark item as owned
    item.owned = true;

    // Prepare updated owned items list: gather all owned item IDs from all categories
    const ownedItems = Object.values(this.marketItems)
      .flat()
      .filter(i => i.owned)
      .map(i => i.ID);

    // Call updateRewards with new points and ownedItems array
    await this.updateRewards(this.points, ownedItems);

    return true;
  }

  async updateRewards(points: number, ownedItems: string[]): Promise<void> {
    try {
      // Assuming you expose this via your preload API as electronAPI.updateRewards
      await window.electronAPI.updateRewards({ points, ownedItems });
      console.log('Rewards updated successfully');
    } catch (error) {
      console.error('Failed to update rewards:', error);
    }
  }

  

  // gets the specific item based on item ID
  // returns exception if pet with give name is not in list of available pets
  public getItem(id: string): marketPlaceItem {
    for (const category in this.marketItems) {
      const items = this.marketItems[category as keyof typeof this.marketItems];
      for (const item of items) {
        if (item.ID === id) {
          return item;
        }
      }
    }
    throw new Error(`Pet with name ${id} not found`);
  }

  // returns users' current list of points available to spend
  public getTotalPoints() {
    return this.points;
  }

  // checks if user has enough points to spend on an item
  public canAfford(item: marketPlaceItem): boolean {
    if (item.price > this.points) {
      return false;
    } else {
      return true;
    }
  }

  //updates the users new points
  public updatePoints(newPoints: number): void {
    this.points = newPoints;
  }

  //return a list of all the owned items
  public getOwnedItems() {
    const owned_items: marketPlaceItem[] = [];

    for (const category in this.marketItems) {
      const items = this.marketItems[category as keyof typeof this.marketItems];
      for (const item of items) {
        if (item.owned === true) {
          owned_items.push(item);
        }
      }
    }
    return owned_items;
  }
}
