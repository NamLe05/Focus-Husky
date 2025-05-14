/* eslint-disable prettier/prettier */
import React, { useState } from 'react';
import './styles.css';
import { handlePetClick, handleItemPurchase, store } from './controller';
import { v4 as uuidv4 } from 'uuid';
import HuskyImage from '../Static/Husky.png';
import FrogImage from '../Static/Frog.png';
import DuckImage from '../Static/Duck.png';
import TigerImage from '../Static/Tiger.png';
import StarImage from '../Static/Star.png';
import CheckListImage from '../Static/checklist.png';
import HatImage from '../Static/hat.png';
import CollarImage from '../Static/collar.png';
import LeashImage from '../Static/leash.png';
import ClassicTimerImage from '../Static/classic-timer.png';
import PomodoroImage from '../Static/pomodoro.png';
import StopWatchImage from '../Static/stopwatch.png';
import BellImage from '../Static/bell.png';
import ChimeImage from '../Static/chime.png';
import AlertImage from '../Static/alert.png';
import HomeworkImage from '../Static/homework.png';
import CalendarImage from '../Static/calendar.png';
import { Pet } from './model';
import { Modal, Button } from 'react-bootstrap';

// Tab type and item interface
type Tab = 'pets' | 'accessories' | 'timer' | 'sounds' | 'tasks';
interface Item { name: string; price: number; img: string; owned: boolean }

// Data for each tab
const TAB_ITEMS: Record<Tab, Item[]> = {
  pets: [
    { name: 'Frog', price: 200, img: FrogImage, owned: false},
    { name: 'Tiger', price: 200, img: TigerImage, owned: false},
    { name: 'Duck', price: 200, img: DuckImage, owned: false},
    { name: 'Husky', price: 200, img: HuskyImage, owned: true},
  ],
  accessories: [
    { name: 'Collar', price: 50, img: CollarImage, owned: false },
    { name: 'Hat', price: 75, img: HatImage, owned: false },
    { name: 'Leash', price: 40, img: LeashImage, owned: false },
  ],
  timer: [
    { name: 'Classic Timer', price: 30, img: ClassicTimerImage, owned: false },
    { name: 'Pomodoro', price: 25, img: PomodoroImage, owned: false },
    { name: 'Stopwatch', price: 15, img: StopWatchImage, owned: false },
  ],
  sounds: [
    { name: 'Bell', price: 20, img: BellImage, owned: false },
    { name: 'Chime', price: 30, img: ChimeImage, owned: false },
    { name: 'Alert', price: 25, img: AlertImage, owned: false },
  ],
  tasks: [
    { name: 'Checklist', price: 40, img: CheckListImage, owned: false },
    { name: 'Homework', price: 45, img: HomeworkImage, owned: false },
    { name: 'Calendar', price: 50, img: CalendarImage, owned: false },
  ],
};

export default function MarketView() {
  const [activeTab, setActiveTab] = useState<Tab>('pets');
  const [points, setPoints] = useState(store.getTotalPoints());
  const [popUpMessage, setPopUpMessage] = useState<string | null>(null);

  const items = TAB_ITEMS[activeTab];

  const onItemClick = (item: Item) => {
    const totalPoints = store.getTotalPoints();

    if(item.owned === true){
      setPopUpMessage(`You already own ${item.name}!`);
      return;
    }
    if (totalPoints < item.price) {
      setPopUpMessage(`Sorry, you don't have enough points for ${item.name}.`);
      return;
    }

    if (activeTab === 'pets') {
      handlePetClick({
        ID:    uuidv4(),
        name:  item.name,
        price: item.price,
        owned: false,
      } as Pet);
    } else {
      handleItemPurchase(item.name, item.price);
    }

    setPoints(store.getTotalPoints());
    setPopUpMessage(`Congrats! You purchased ${item.name}!`);
  };

  return (
    <div className="app-container">

      <div className="marketplace-wrapper">
        {/* Meta tags (optional) */}
        <meta charSet="UTF-8" />
        <meta
          httpEquiv="Content-Security-Policy"
          content="default-src 'self' https://cdn.jsdelivr.net https://fonts.googleapis.com https://fonts.gstatic.com; style-src 'self' https://cdn.jsdelivr.net https://fonts.googleapis.com; font-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com; img-src 'self' data:"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Marketplace - Desktop Application</title>
        <link
          href="https://fonts.googleapis.com/css2?family=Jersey+10&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="./marketplace.css" />

        <div className="marketplace-container">
          <div className="category-nav">
            {(Object.keys(TAB_ITEMS) as Tab[]).map(tab => (
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
                  key={item.name}
                  className="pet-card"
                  onClick={() => onItemClick(item)}
                >
                  <div className="pet-image-container">
                    <img src={item.img} alt={item.name} className="pet-image" />
                  </div>
                  <div className="pet-name">{item.name}</div>
                  <div className="pet-stars">
                    <img src={StarImage} alt="Star" className="star-icon" />
                    <span>{item.price}</span>
                  </div>
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

          {/* {popUpMessage && (
            <div className="modal-overlay">
              <div className="modal">
                <p>{popUpMessage}</p>
                <button onClick={() => setPopUpMessage(null)}>Close</button>
              </div>
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
}
