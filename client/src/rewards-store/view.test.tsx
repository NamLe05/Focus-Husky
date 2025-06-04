import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react';
import MarketView from './view';
import {RewardsStore} from './model';
import * as ControllerModule from './controller';

// describe('MarketView - testing the UI buttons and functionality', () => {

//   it('The user cannot purchase an item they do not have enough points for', () => {});
// render (<MarketView>);
// });

describe('MarketView - testing the UI when user has low points', () => {
  beforeEach(() => {
    const testStore = new RewardsStore();
    testStore.updatePoints(50); // Not enough for items priced at 200

    // Ensure all pets are set to owned: false
    testStore.marketItems.pets.forEach(pet => {
      pet.owned = false;
    });

    // Only show 1 pet to simplify the test
    testStore.marketItems.pets = [testStore.marketItems.pets[0]];

    vi.spyOn(ControllerModule, 'store', 'get').mockReturnValue(testStore);
    vi.spyOn(ControllerModule, 'handleItemPurchase').mockImplementation(
      () => false,
    );
  });

  it('shows "Not enough points" modal when user clicks unaffordable item', () => {
    render(<MarketView />);

    const item = screen.getByText(/Husky/i); // Should be the only pet
    fireEvent.click(item);

    // Modal should show correct message
    expect(screen.getByText(/not enough points/i)).toBeTruthy();
    expect(screen.getByRole('dialog')).toBeTruthy();
  });
});
