import {marketPlaceItem, RewardsStore} from './model';
import {Tab} from './view';

export const store = new RewardsStore();

/**
 * Handles clicking on any non-pet item (accessories, timers, sounds, tasks).
 * Calls a generic purchaseItem method on your store.
 */

export function handleItemPurchase(item: marketPlaceItem, category: Tab) {
  return store.purchaseItem(category, item.ID);
}

export function markItemAsOwned(itemId: string, category: Tab) {
  const item = store.marketItems[category].find(i => i.ID === itemId);
  if (item) {
    item.owned = true;
  }
}

export function taskCompletePoints(): void {
  store.addPoints(25);
}