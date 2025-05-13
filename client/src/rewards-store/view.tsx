/* eslint-disable prettier/prettier */
import React, { useState } from 'react';
import './styles.css';
import { handlePetClick, store } from './controller';
import { v4 as uuidv4 } from 'uuid';
import HuskyImage from '../Static/Husky.png';
import FrogImage from '../Static/Frog.png';
import DuckImage from '../Static/Duck.png';
import TigerImage from '../Static/Tiger.png';
import StarImage from '../Static/Star.png';
import CheckListImage from '../Static/checklist.png'
import HatImage from '../Static/hat.png'
import CollarImage from '../Static/collar.png'
import LeashImage from '../Static/leash.png'
import ClassicTimerImage from '../Static/classic-timer.png'
import PomodoroImage from '../Static/pomodoro.png'
import StopWatchImage from '../Static/stopwatch.png'
import BellImage from '../Static/bell.png'
import ChimeImage from '../Static/chime.png'
import AlertImage from '../Static/alert.png'
import HomeworkImage from '../Static/homework.png'
import CalendarImage from '../Static/calendar.png'
import { Pet } from './model';

// Tab type and item interface
type Tab = 'pets' | 'accessories' | 'timer' | 'sounds' | 'tasks';
interface Item { name: string; price: number; img: string; }

// Sidebar Component
const Sidebar: React.FC = () => (
  <aside className="sidebar">
    <ul className="sidebar-nav">
      <li className="sidebar-item active">Dashboard</li>
      <li className="sidebar-item">Marketplace</li>
      <li className="sidebar-item">Schedules</li>
      <li className="sidebar-item">Pomodoro Timer</li>
      <li className="sidebar-item">Settings</li>
    </ul>
  </aside>
);

// Data for each tab
const TAB_ITEMS: Record<Tab, Item[]> = {
  pets: [
    { name: 'Frog', price: 200, img: FrogImage },
    { name: 'Tiger', price: 200, img: TigerImage },
    { name: 'Duck', price: 200, img: DuckImage },
    { name: 'Husky', price: 200, img: HuskyImage },
  ],
  accessories: [
    { name: 'Collar', price: 50, img: CollarImage },
    { name: 'Hat', price: 75, img: HatImage },
    { name: 'Leash', price: 40, img: LeashImage },
  ],
  timer: [
    { name: 'Classic Timer', price: 30, img: ClassicTimerImage },
    { name: 'Pomodoro', price: 25, img: PomodoroImage },
    { name: 'Stopwatch', price: 15, img: StopWatchImage },
  ],
  sounds: [
    { name: 'Bell', price: 20, img: BellImage },
    { name: 'Chime', price: 30, img: ChimeImage },
    { name: 'Alert', price: 25, img: AlertImage },
  ],
  tasks: [
    { name: 'Checklist', price: 40, img: CheckListImage },
    { name: 'Homework', price: 45, img: HomeworkImage },
    { name: 'Calendar', price: 50, img: CalendarImage },
  ],
};

export default function MarketView() {

  //State to track active tab
  const [activeTab, setActiveTab] = useState<Tab>('pets');
  const [points, setPoints] = useState(store.getTotalPoints());
  const [popUpMessage, setPopUpMessage] = useState<string | null>(null);

  const items = TAB_ITEMS[activeTab];

  // Handler for purchasing pets
  const onPetClick = (pet: Pet) => {
    const currentPoints = store.getTotalPoints();
    if (pet.owned) {
      setPopUpMessage(`${pet.name} is already owned!`);
      return;
    }
    if (currentPoints < pet.price) {
      setPopUpMessage(`Sorry, you don't have enough points for ${pet.name}.`);
      return;
    }
    handlePetClick(pet);
    setPoints(store.getTotalPoints());
    setPopUpMessage(`Congrats! You successfully purchased ${pet.name}!`);
  };

  return (
    <div className="app-container">
      <Sidebar />

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
            {(['pets', 'accessories', 'timer', 'sounds', 'tasks'] as Tab[]).map(tab => (
              <div
                key={tab}
                className={`category-item ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </div>
            ))}
          </div>

          {/* ←– Updated tab-content: */}
          <div className="tab-content">
            <div className="pet-grid">
              {items.map(item => (
                <div
                  key={item.name}
                  className="pet-card"
                  onClick={() => {
                    if (activeTab === 'pets') {
                      onPetClick({
                        ID: uuidv4(),
                        name:  item.name,
                        price: item.price,
                        owned: false,
                      });
                    }
                  }}
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
          {/* –→ End updated section */}

          <div className="star-counter">
            <div className="star-background">{/* SVG omitted for brevity */}</div>
            <img src={StarImage} alt="Star" className="star-icon-large" />
            <div className="total-stars">{points}</div>
          </div>

          {popUpMessage && (
            <div className="modal-overlay">
              <div className="modal">
                <p>{popUpMessage}</p>
                <button onClick={() => setPopUpMessage(null)}>Close</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
