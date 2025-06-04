/* eslint-disable prettier/prettier */
/* eslint-disable no-trailing-spaces */
/* eslint-disable prettier/prettier */
import {v4 as uuidv4} from 'uuid';
import HuskyImage from '../Static/Husky.png';
import FrogImage from '../Static/Frog.png';
import DuckImage from '../Static/Duck.png';
import TigerImage from '../Static/Tiger.png';

import RedHat from '../Static/red-hat.png';
import ExplorerHat from '../Static/explorer-hat.png';
import MidnightHat from '../Static/midnight-hat.png';

import ClassicTimerImage from '../Static/coming-soon.png';
import PomodoroImage from '../Static/coming-soon.png';
import StopWatchImage from '../Static/coming-soon.png';

import BellImage from '../Static/coming-soon.png';
import ChimeImage from '../Static/coming-soon.png';
import AlertImage from '../Static/coming-soon.png';

import CheckListImage from '../Static/coming-soon.png';
import HomeworkImage from '../Static/coming-soon.png';
import CalendarImage from '../Static/coming-soon.png';

// export interface Pet {
//   ID: string;
//   name: string;
//   price: number;
//   owned: boolean;
// }

export interface marketPlaceItem {
  ID: string;
  name: string;
  price: number;
  owned: boolean;
  image: string;
}

export interface equippedItems {
    pet: marketPlaceItem | null,
    accessory: marketPlaceItem | null,
    timer: marketPlaceItem | null,
    sound: marketPlaceItem | null,
    task: marketPlaceItem | null
}

export const categoryToEquippedKey = {
        pets: 'pet',
        accessories: 'accessory',
        timers: 'timer',
        sounds: 'sound',
        tasks: 'task',
    } as const;

    export type CategoryKey = keyof typeof categoryToEquippedKey;

export interface RewardState {
  _id: string;    // always "user-rewards"
  points: number;
  ownedItems: string[];
}

export class RewardsStore {


    marketItems:{
        pets: marketPlaceItem[];
        accessories: marketPlaceItem[];
        timers: marketPlaceItem[];
        sounds: marketPlaceItem[];
        tasks: marketPlaceItem[];
    };
    private points: number;
    private ownedItems: string[];
    public equipped: equippedItems;

  constructor() {
    this.marketItems = {
      pets: [
        { ID: 'pet-husky',  name: 'Husky',  price: 200, owned: true,  image: HuskyImage  },
        { ID: 'pet-tiger',  name: 'Tiger',  price: 200, owned: false, image: TigerImage  },
        { ID: 'pet-duck',   name: 'Duck',   price: 200, owned: false, image: DuckImage   },
        { ID: 'pet-frog',   name: 'Frog',   price: 200, owned: false, image: FrogImage   },
      ],
      accessories: [
        { ID: 'acc-hat', 
          name: 'Red Hat', 
          price: 50, 
          owned: false, 
          image: RedHat},
        {
          ID: 'acc-collar',
          name: 'Explorer Hat',
          price: 75,
          owned: false,
          image: ExplorerHat,
        },
        {
          ID: 'acc-leash',
          name: 'Midnight Hat',
          price: 40,
          owned: false,
          image: MidnightHat,
        },
      ],
      timers: [
        {
          ID: 'timer-classic',
          name: 'Classic Timer',
          price: 0,
          owned: false,
          image: ClassicTimerImage,
        },
        {
          ID: 'timer-pomodoro',
          name: 'Pomodoro',
          price: 0,
          owned: false,
          image: PomodoroImage,
        },
        {
          ID: 'timer-stopwatch',
          name: 'Stopwatch',
          price: 0,
          owned: false,
          image: StopWatchImage,
        },
      ],
      sounds: [
        {ID: uuidv4(), name: 'Bell', price: 0, owned: false, image: BellImage},
        {
          ID: 'sounds-chime',
          name: 'Chime',
          price: 0,
          owned: false,
          image: ChimeImage,
        },
        {
          ID: 'sounds-alert',
          name: 'Alert',
          price: 0,
          owned: false,
          image: AlertImage,
        },
      ],
      tasks: [
        {
          ID: 'tasks-checklist',
          name: 'Checklist',
          price: 0,
          owned: false,
          image: CheckListImage,
        },
        {
          ID: 'tasks-homework',
          name: 'Homework',
          price: 0,
          owned: false,
          image: HomeworkImage,
        },
        {
          ID: 'task-calendar',
          name: 'Calendar',
          price: 0,
          owned: false,
          image: CalendarImage,
        },
      ],
    };
    this.points = 200;

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.loadStateFromDB();
  }

  private async loadStateFromDB(): Promise<void> {
    try {
      const state = await window.electronAPI!.getRewards();
      if (!state || typeof state.points !== 'number') {
        return;
      }
      this.points = state.points;
      this.ownedItems = state.ownedItems.slice();

     this.equipped = {
            pet: {ID: uuidv4(), name: 'Husky', price: 200, owned: true, image: HuskyImage},
            accessory: null,
            timer: null,
            sound: null,
            task: null,
        };

    for (const category of Object.values(this.marketItems)) {
        for (const item of category) {
          item.owned = state.ownedItems.includes(item.ID);
        }
      }
    } catch {
      // On error, keep defaults (points=200, no ownedItems)
    }
  }

  // public addPoints(amount: number) {
  //   this.points += amount;
  // }

  public async deductPoints(amount: number): Promise<void> {
    try {
      const state = await window.electronAPI!.getRewards();
      this.points = state?.points ?? this.points;
      this.ownedItems = state?.ownedItems.slice() ?? this.ownedItems;

      this.points = Math.max(0, this.points - amount);
      await this.updateRewards(this.points, this.ownedItems);
    } catch {
      // ignore
    }
  }

  /** Add `amount` to points, syncing with DB first */
  public async addPoints(amount: number): Promise<void> {
    try {
      const state = await window.electronAPI!.getRewards();
      this.points = state?.points ?? this.points;
      this.ownedItems = state?.ownedItems.slice() ?? this.ownedItems;

      this.points += amount;
      await this.updateRewards(this.points, this.ownedItems);
    } catch {
      // ignore
    }
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
    const item = items.find((i) => i.ID === itemId);
    if (!item) {
      return false;
    }
    // Allow purchase if price == points; reject only if price > points
    if (item.owned || item.price > this.points) {
      return false;
    }

    // Deduct in-memory first, then persist
    this.points -= item.price;
    item.owned = true;
    this.ownedItems.push(item.ID);
    await this.updateRewards(this.points, this.ownedItems);
    return true;
  }

  public setEquipped(item: marketPlaceItem, category: keyof typeof this.marketItems): void {
        const equippedKey = categoryToEquippedKey[category];
        if (equippedKey) {
            this.equipped[equippedKey] = item;
        } else {
            console.warn(`Unknown category: ${category}`);
        }

        console.log('Currently equipped: ', this.equipped);
    }

  /** Write out the given `points` + `ownedItems` to the DB */
  public async updateRewards(points: number, ownedItems: string[]): Promise<void> {
    try {
      await window.electronAPI!.updateRewards({ points, ownedItems });
    } catch {
      // ignore failures
    }
  }

  public getTotalPoints(): number {
    return this.points;
  }

  /** Set `this.points` locally, then persist to DB. */
  public async updatePoints(newPoints: number): Promise<void> {
    this.points = newPoints;
    await this.updateRewards(this.points, this.ownedItems);
  }

  public getOwnedItems(): marketPlaceItem[] {
    const ownedList: marketPlaceItem[] = [];
    for (const category of Object.values(this.marketItems)) {
      for (const item of category) {
        if (item.owned) {
          ownedList.push(item);
        }
      }
    }
    return ownedList;
  }

  public getItem(id: string): marketPlaceItem {
    for (const category of Object.values(this.marketItems)) {
      const found = category.find((item) => item.ID === id);
      if (found) {
        return found;
      }
    }
    throw new Error(`Item with ID ${id} not found`);
  }

  public canAfford(item: marketPlaceItem): boolean {
    return item.price <= this.points;
  }
}
