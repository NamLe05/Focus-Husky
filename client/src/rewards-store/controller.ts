/* eslint-disable prettier/prettier */
/* eslint-disable eol-last */
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

export function markItemAsEquipped(item: marketPlaceItem, category: Tab){
  return store.setEquipped(item, category)
}

export function taskCompletePoints(): void {
  store.addPoints(25);
}

export async function pomodoroSessionPoints(points: number): Promise<void> {
  await store.addPoints(points);
  // Now DB is up to date. You can still send the updatePoints notification
  window.electronAPI?.updatePoints?.();
}