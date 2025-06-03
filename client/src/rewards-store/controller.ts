/* eslint-disable prettier/prettier */
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

export function addPointsFromTimer(points: number) {
  console.log('addPointsFromTimer called with:', points);
  console.log('Points before adding:', store.getTotalPoints());
  store.onTimerComplete(points);
  console.log('Points after adding:', store.getTotalPoints());
}

export function getCurrentPoints() {
  return store.getTotalPoints();
}

// Debug function to check store state
export function debugStoreState() {
  console.log('=== STORE DEBUG INFO ===');
  console.log('Current points:', store.getTotalPoints());
  console.log('Store instance ID:', store.constructor.name);
  console.log('Listeners count:', (store as any).listeners?.length || 'undefined');
  console.log('========================');
}