import { v4 as uuidv4 } from 'uuid';
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

export interface marketPlaceItem {
  ID: string;
  name: string;
  price: number;
  owned: boolean;
  image: string;
}

export interface RewardState {
  _id: string;    // always "user-rewards"
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
  private ownedItems: string[];

  constructor() {
    this.marketItems = {
      pets: [
        { ID: 'pet-husky',  name: 'Husky',  price: 200, owned: true,  image: HuskyImage  },
        { ID: 'pet-tiger',  name: 'Tiger',  price: 200, owned: false, image: TigerImage  },
        { ID: 'pet-duck',   name: 'Duck',   price: 200, owned: false, image: DuckImage   },
        { ID: 'pet-frog',   name: 'Frog',   price: 200, owned: false, image: FrogImage   },
      ],
      accessories: [
        { ID: 'acc-hat',    name: 'Hat',    price: 50,  owned: false, image: HatImage    },
        { ID: 'acc-collar', name: 'Collar', price: 75,  owned: false, image: CollarImage },
        { ID: 'acc-leash',  name: 'Leash',  price: 40,  owned: false, image: LeashImage  },
      ],
      timers: [
        { ID: 'timer-classic',  name: 'Classic Timer', price: 30,  owned: false, image: ClassicTimerImage },
        { ID: 'timer-pomodoro', name: 'Pomodoro',      price: 25,  owned: false, image: PomodoroImage      },
        { ID: 'timer-stopwatch',name: 'Stopwatch',     price: 15,  owned: false, image: StopWatchImage    },
      ],
      sounds: [
        { ID: uuidv4(),       name: 'Bell',  price: 30,  owned: false, image: BellImage  },
        { ID: 'sounds-chime',  name: 'Chime', price: 25,  owned: false, image: ChimeImage },
        { ID: 'sounds-alert',  name: 'Alert', price: 15,  owned: false, image: AlertImage },
      ],
      tasks: [
        { ID: 'tasks-checklist', name: 'Checklist', price: 40,  owned: false, image: CheckListImage  },
        { ID: 'tasks-homework',  name: 'Homework',  price: 45,  owned: false, image: HomeworkImage   },
        { ID: 'task-calendar',   name: 'Calendar',  price: 55,  owned: false, image: CalendarImage   },
      ],
    };

    // Initialize with default 200; tests can override via loadStateFromDB or updatePoints.
    this.points = 200;
    this.ownedItems = [];
    void this.loadStateFromDB();
  }

  private async loadStateFromDB(): Promise<void> {
    try {
      const state = await window.electronAPI!.getRewards();
      if (!state || typeof state.points !== 'number') {
        return;
      }
      this.points = state.points;
      this.ownedItems = state.ownedItems.slice();

      for (const category of Object.values(this.marketItems)) {
        for (const item of category) {
          item.owned = state.ownedItems.includes(item.ID);
        }
      }
    } catch {
      // On error, keep defaults (points=200, no ownedItems)
    }
  }

  /** Subtract `amount` from points, syncing with DB first */
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

  /**
   * Purchase an item using the **in-memory** `this.points` (so that
   * after calling `updatePoints(…)`, `this.points` truly reflects the latest).
   */
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
