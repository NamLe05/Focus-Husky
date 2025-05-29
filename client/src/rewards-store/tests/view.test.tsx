// MarketView.test.tsx
import React from 'react';
import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import MarketView from '../view'; // ← your component
import {store} from '../controller'; // ← wherever you export your store

describe('MarketView — not enough points', () => {
  // save original so we can restore after
  const originalGetTotalPoints = store.getTotalPoints;
  const originalMarketItems = {...store.marketItems};

  beforeEach(() => {
    // stub out a single pet called “Husky” costing 200 points
    store.marketItems = {
      pets: [
        {ID: '1', name: 'Husky', price: 200, owned: false, image: 'husky.png'},
      ],
      accessories: [],
      timers: [],
      sounds: [],
      tasks: [],
    };
    // simulate the user has 0 points
    store.getTotalPoints = vi.fn().mockReturnValue(0);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    store.getTotalPoints = originalGetTotalPoints;
    store.marketItems = originalMarketItems;
  });

  it('opens a “Not enough points” modal when clicking Husky', () => {
    render(<MarketView />);

    // click the card labeled “Husky”
    fireEvent.click(screen.getByText('Husky'));

    // the Modal from react-bootstrap has role="dialog"
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // and it should contain your exact message
    expect(
      screen.getByText('Not enough points to purchase Husky'),
    ).toBeInTheDocument();
  });
});
