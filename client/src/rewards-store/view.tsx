/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable prettier/prettier */
import React, {useEffect, useState} from 'react';
import './styles.css';
import {handleItemPurchase, store, markItemAsEquipped} from './controller';
import { v4 as uuidv4 } from 'uuid';
import StarImage from '../Static/Star.png';
import {RewardsStore, CategoryKey,categoryToEquippedKey, marketPlaceItem} from './model';
import { Modal, Button } from 'react-bootstrap';

// Tab type based on store.marketItems keys
export type Tab = keyof typeof store.marketItems;

export default function MarketView() {

  const [activeTab, setActiveTab] = useState<Tab>('pets');
  const [points, setPoints] = useState(store.getTotalPoints());
  const [popUpMessage, setPopUpMessage] = useState<string | null>(null);
  const [items, setItems] = useState<marketPlaceItem[]>(store.marketItems[activeTab]);

  // Whenever the active tab changes, reload items from the store
  useEffect(() => {
    setItems(store.marketItems[activeTab]);
  }, [activeTab]);

  // Refresh function: fetch latest rewards from main process, update store, then local state
  const refresh = async () => {
    // 1) Fetch the up-to-date rewards state (points + ownedItems) from the database
    const rewards = await window.electronAPI!.getRewards();
    // 2) Update the in-memory store so its marketItems[].owned flags and points match
    store.updatePoints(rewards.points);
    // Mark owned flags for every item
    for (const category of Object.values(store.marketItems)) {
      for (const item of category) {
        item.owned = rewards.ownedItems.includes(item.ID);
      }
    }
    // 3) Update local React state
    setPoints(rewards.points);
    setItems(store.marketItems[activeTab]);
  };

  // Register “points-updated” listener once and clean up
  useEffect(() => {
    if (
      typeof window.electronAPI?.onPointsUpdated === 'function' &&
      typeof window.electronAPI?.removePointsUpdatedListener === 'function'
    ) {
      // When “points-updated” arrives, call refresh()
      const wrappedListener = () => {
        void refresh();
      };
      window.electronAPI.onPointsUpdated(wrappedListener);

      return () => {
        window.electronAPI.removePointsUpdatedListener(wrappedListener);
      };
    }
  }, [activeTab]);

  // Handle item purchase
  const onItemClick = async (item: marketPlaceItem) => {
    const currentPoints = store.getTotalPoints();

  //Clicking on a marketplace item
  const onItemClick = (item: marketPlaceItem) => {
    const points = store?.getTotalPoints?.();

    if (!item) {
      console.error('Item is undefined');
      return;
    }

    if (item.owned) {
      setPopUpMessage(`You already own ${item.name}!`);
      return;
    }
    if (item.price > currentPoints) {
      setPopUpMessage(`Not enough points to purchase ${item.name}`);
      return;
    }

    const success = await handleItemPurchase(item, activeTab);
    if(success){
      // Immediately refresh local state
      await refresh();
      setPopUpMessage(`Congrats! You purchased ${item.name}!`);
    } else {
      setPopUpMessage(`Could not purchase ${item.name}, try again!`);
    }
  };

  //clicking on the equip button
  const [equippedItems, setEquippedItems] = useState(store.equipped[categoryToEquippedKey[activeTab as CategoryKey]]);
  const onEquipClick = (item: marketPlaceItem) => {
    markItemAsEquipped(item, activeTab);
    setEquippedItems(item);
  }


  return (
    <div id="marketplace">
      <div className="marketplace-container">
        <div className="category-nav">
          {(Object.keys(store.marketItems) as Tab[]).map((tab) => (
            <div
              key={tab}
              className={`category-item ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </div>
          ))}
        </div>

        <div className="tab-content">
          <div className="pet-grid">
            {items.map((item) => (
              <div
                key={item.ID}
                className="pet-card"
                onClick={() => onItemClick(item)}
              >
                <div className="pet-image-container">
                  <img src={item.image} alt={item.name} className="pet-image" />
                </div>
                <div className="pet-name">{item.name}</div>
                <div className="pet-stars">
                  <img src={StarImage} alt="Star" className="star-icon" />
                  <span>{item.price}</span>
                </div>
                {item.owned && (
                <div className="owned-section">
                  <div className="owned-badge">Owned</div>
                  <button
                    className="equip-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEquipClick(item);
                    }}
                  >
                    {equippedItems?.ID === item.ID ? 'Equipped' : 'Equip'}
                    </button>
                    </div>
                  )}
              </div>
            ))}
          </div>
        </div>

        <div className="star-counter">
          <img src={StarImage} alt="Star" className="star-icon-large" />
          <div className="total-stars">{points}</div>
        </div>

        <Modal
          show={!!popUpMessage}
          onHide={() => setPopUpMessage(null)}
          centered
          backdrop="static"
          keyboard={false}
        >
          <Modal.Header closeButton>
            <Modal.Title>Notification</Modal.Title>
          </Modal.Header>
          <Modal.Body>{popUpMessage}</Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={() => setPopUpMessage(null)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
}