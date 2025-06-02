/* eslint-disable prettier/prettier */
import React, {useEffect, useState} from 'react';
import './styles.css';
import {handleItemPurchase, store, markItemAsEquipped} from './controller';
import { v4 as uuidv4 } from 'uuid';
import StarImage from '../Static/Star.png';

import {RewardsStore, CategoryKey, marketPlaceItem, categoryToEquippedKey} from './model';
import { Modal, Button } from 'react-bootstrap';

// Tab type and item interface

export type Tab = keyof typeof store.marketItems;

export default function MarketView() {

  const [activeTab, setActiveTab] = useState<Tab>('pets');
  const [points, setPoints] = useState(store.getTotalPoints());
  const [popUpMessage, setPopUpMessage] = useState<string | null>(null);

  const [items, setItems] = useState(store.marketItems[activeTab]);

  useEffect(() => {
    setItems(store.marketItems[activeTab]);
  }, [activeTab]);


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

    if (item.price > points) {
      setPopUpMessage(`Not enough points to purchase ${item.name}`);
      return false;
    }

    const success = handleItemPurchase(item, activeTab);

    if(success){
      setPoints(store.getTotalPoints());
      setItems(store.marketItems[activeTab]);
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
          {(Object.keys(store.marketItems) as Tab[]).map(tab => (
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
            {items.map(item => (
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
          <div className="star-background">{/* SVG omitted for brevity */}</div>
          <img src={StarImage} alt="Star" className="star-icon-large" />
          <div className="total-stars">{points}</div>
        </div>
        {/*POP UP MESSAGE*/}
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
