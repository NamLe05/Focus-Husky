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

    // Mock electronAPI before constructing the store
    (window as any).electronAPI = {
      getRewards: vi.fn().mockResolvedValue(mockInitialState),
      updateRewards: vi.fn().mockResolvedValue(undefined)
    };

    store = new RewardsStore();
  });

  it('loadStateFromDB correctly updates internal state from API', async () => {
    // Wait one tick so constructor's loadStateFromDB() finishes
    await Promise.resolve();

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
      ownedItems,
      equipped: expect.any(Object)
    });
  });

  it('purchaseItem updates ownership and points if item can be afforded', async () => {
    // Wait for initial load
    await Promise.resolve();

    const itemId = 'acc-collar'; // price 75 < 300
    const result = await store.purchaseItem('accessories', itemId);

    expect(result).toBe(true);

    const updatedItem = store.getItem(itemId);
    expect(updatedItem.owned).toBe(true);
    expect(store.getTotalPoints()).toBe(300 - updatedItem.price);
    expect(window.electronAPI.updateRewards).toHaveBeenCalled();
  });

  it('purchaseItem returns false and does nothing if item is already owned', async () => {
    await Promise.resolve();

    const result = await store.purchaseItem('pets', 'pet-husky');
    expect(result).toBe(false);
    expect(window.electronAPI.updateRewards).not.toHaveBeenCalled();
  });

  it('purchaseItem returns false if not enough points', async () => {
    await Promise.resolve();

    // Simulate insufficient funds
    await store.updatePoints(10);
    // Clear the call made by updatePoints
    (window as any).electronAPI.updateRewards.mockClear();

    const result = await store.purchaseItem('accessories', 'acc-collar'); // price 75
    expect(result).toBe(false);
    expect(window.electronAPI.updateRewards).not.toHaveBeenCalled();
  });

  it('purchaseItem returns false if item ID not found', async () => {
    await Promise.resolve();

    const result = await store.purchaseItem('pets', 'nonexistent-id');
    expect(result).toBe(false);
    expect(window.electronAPI.updateRewards).not.toHaveBeenCalled();
  });

  it('loadStateFromDB does nothing if electronAPI returns undefined', async () => {
    // Make getRewards return undefined
    (window as any).electronAPI.getRewards = vi.fn().mockResolvedValue(undefined);

    // Re-create store so constructor sees undefined
    store = new RewardsStore();
    await Promise.resolve();

    // Points should stay default (200), and only the default owned item remains
    expect(store.getTotalPoints()).toBe(200);
    const ownedItems = store.getOwnedItems().map(i => i.ID);
    expect(ownedItems).toContain('pet-husky');
    expect(ownedItems.length).toBe(1);
  });
});
