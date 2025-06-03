import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RewardsStore } from '../model';

describe('RewardsStore API methods', () => {
  let store: RewardsStore;

  const mockInitialState = {
    points: 300,
    ownedItems: ['pet-husky', 'acc-hat']
  };

  beforeEach(() => {
    vi.resetModules();

    // Mock the electronAPI methods
    (window as any).electronAPI = {
      getRewards: vi.fn().mockResolvedValue(mockInitialState),
      updateRewards: vi.fn().mockResolvedValue(undefined)
    };

    store = new RewardsStore();
  });

  it('loadStateFromDB correctly updates internal state from API', async () => {
    await store.loadStateFromDB();

    expect(store.getTotalPoints()).toBe(300);
    const ownedItems = store.getOwnedItems().map(i => i.ID);
    expect(ownedItems).toContain('pet-husky');
    expect(ownedItems).toContain('acc-hat');
  });

  it('updateRewards calls electronAPI with correct parameters', async () => {
    const newPoints = 123;
    const ownedItems = ['pet-husky', 'acc-hat', 'timer-pomodoro'];

    await store.updateRewards(newPoints, ownedItems);

    expect(window.electronAPI.updateRewards).toHaveBeenCalledWith({
      points: newPoints,
      ownedItems
    });
  });

  it('purchaseItem updates ownership and points if item can be afforded', async () => {
    // Ensure enough points to buy
    await store.loadStateFromDB();
    const itemId = 'acc-collar'; // Price 75 < 300

    const result = await store.purchaseItem('accessories', itemId);

    expect(result).toBe(true);

    const updatedItem = store.getItem(itemId);
    expect(updatedItem.owned).toBe(true);
    expect(store.getTotalPoints()).toBe(300 - updatedItem.price);
    expect(window.electronAPI.updateRewards).toHaveBeenCalled();
  });

  it('purchaseItem returns false and does nothing if item is already owned', async () => {
    await store.loadStateFromDB();

    const result = await store.purchaseItem('pets', 'pet-husky');
    expect(result).toBe(false);
    expect(window.electronAPI.updateRewards).not.toHaveBeenCalled();
  });

  it('purchaseItem returns false if not enough points', async () => {
    await store.loadStateFromDB();

    // Reduce points manually to simulate insufficient funds
    store.updatePoints(10);

    const result = await store.purchaseItem('accessories', 'acc-collar'); // price 75
    expect(result).toBe(false);
    expect(window.electronAPI.updateRewards).not.toHaveBeenCalled();
  });

  it('purchaseItem returns false if item ID not found', async () => {
    await store.loadStateFromDB();

    const result = await store.purchaseItem('pets', 'nonexistent-id');
    expect(result).toBe(false);
    expect(window.electronAPI.updateRewards).not.toHaveBeenCalled();
  });
});
