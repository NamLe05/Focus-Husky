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
  const [activeTab, setActiveTab] = useState<Tab>('pets');
<<<<<<< HEAD

  // const handleTabClick = (Tab) => {
  //   setActiveTab(Tab);
  // }

  //Items to display for the current tab
=======
  const [points, setPoints] = useState(store.getTotalPoints());
  const [popUpMessage, setPopUpMessage] = useState<string | null>(null);

>>>>>>> 507f6111dc6f68a5a5f7debf5188de8d8c096e04
  const items = TAB_ITEMS[activeTab];

  const onItemClick = (item: Item) => {
    const totalPoints = store.getTotalPoints();
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
<<<<<<< HEAD
    <div className="your-class">
      {<>
  <meta charSet="UTF-8" />
  {/* https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP */}
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
    {/*TAB HEADERS*/}
    <div className="category-nav">

      <div className="category-item active" data-tab="pets">
        Pets
      </div>
      <div className="category-item" data-tab="accessories">
        Accessories
      </div>
      <div className="category-item" data-tab="timer">
        Timer
      </div>
      <div className="category-item" data-tab="sounds">
        Sounds
      </div>
      <div className="category-item" data-tab="tasks">
        Tasks
      </div>
    </div>
    <div className="tab-content">
      <div className="tab-pane active" id="pets-tab">
        <div className="pet-grid">

          {/*FROG PET CARD*/}
          <div className="pet-card"
            onClick={() => onPetClick({ID: uuidv4(), name: 'Frog', price: 200, owned: false})}
            >
            <div className="pet-image-container">
              <img src = {FrogImage} alt="Frog" className="pet-image" />
            </div>
            <div className="pet-name">Frog</div>
            <div className="pet-stars">
              <img src= {StarImage} alt="Star" className="star-icon" />
              <span>200</span>
            </div>
          </div>

          {/*TIGER PET CARD*/}
          <div className="pet-card"
          onClick={() => onPetClick({ID: uuidv4(), name: 'Tiger', price: 200, owned: false})}
            >
            <div className="pet-image-container">
              <img src= {TigerImage} alt="Tiger" className="pet-image" />
            </div>
            <div className="pet-name">Tiger</div>
            <div className="pet-stars">
              <img src= {StarImage} alt="Star" className="star-icon" />
              <span>200</span>
            </div>
          </div>

          {/*DUCK PET CARD*/}
          <div className="pet-card"
          onClick={() => onPetClick({ID: uuidv4(), name: 'Duck', price: 200, owned: false})}
            >
            <div className="pet-image-container">
              <img src= {DuckImage} alt="Duck" className="pet-image" />
            </div>
            <div className="pet-name">Duck</div>
            <div className="pet-stars">
              <img src= {StarImage} alt="Star" className="star-icon" />
              <span>200</span>
            </div>
          </div>

          {/*hUSKY PET CARD*/}
          <div className="pet-card"
          onClick={() => onPetClick({ID: uuidv4(), name: 'Husky', price: 200, owned: true})}
            >
            <div className="pet-image-container">
              <img src= {HuskyImage} alt="Husky" className="pet-image" />
            </div>
            <div className="pet-name">Husky</div>
            <div className="pet-stars">
              <img src= {StarImage} alt="Star" className="star-icon" />
              <span>200</span>
            </div>
          </div>
        </div>
=======
    <div className="app-container">
      <Sidebar />
>>>>>>> 507f6111dc6f68a5a5f7debf5188de8d8c096e04

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
<<<<<<< HEAD
        )}
      </div>
      {/* <div className="tab-pane" id="accessories-tab">
        <div className="coming-soon">
          <h2>Accessories Coming Soon</h2>
          <p>This section will be available in a future update.</p>
        </div>
      </div>
      <div className="tab-pane" id="timer-tab">
        <div className="coming-soon">
          <h2>Timer Coming Soon</h2>
          <p>This section will be available in a future update.</p>
        </div>
      </div>
      <div className="tab-pane" id="sounds-tab">
        <div className="coming-soon">
          <h2>Sounds Coming Soon</h2>
          <p>This section will be available in a future update.</p>
        </div>
      </div>
      <div className="tab-pane" id="tasks-tab">
        <div className="coming-soon">
          <h2>Tasks Coming Soon</h2>
          <p>This section will be available in a future update.</p>
        </div>
      </div> */}
    </div>

    {/*STAR COUNTER*/}
    <div className="star-counter">
      <div className="star-background">
        <svg
          width={176}
          height={170}
          viewBox="0 0 176 170"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g filter="url(#filter0_d_53_21)">
            <ellipse cx={88} cy={81} rx={84} ry={81} fill="#A593B2" />
            <path
              d="M88 0.5C134.133 0.5 171.5 36.5581 171.5 81C171.5 125.442 134.133 161.5 88 161.5C41.8669 161.5 4.5 125.442 4.5 81C4.5 36.5581 41.8669 0.5 88 0.5Z"
              stroke="#705E86"
            />
          </g>
          <defs>
            <filter
              id="filter0_d_53_21"
              x={0}
              y={0}
              width={176}
              height={170}
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feFlood floodOpacity={0} result="BackgroundImageFix" />
              <feColorMatrix
                in="SourceAlpha"
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                result="hardAlpha"
              />
              <feOffset dy={4} />
              <feGaussianBlur stdDeviation={2} />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
              />
              <feBlend
                mode="normal"
                in2="BackgroundImageFix"
                result="effect1_dropShadow_53_21"
              />
              <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="effect1_dropShadow_53_21"
                result="shape"
              />
            </filter>
          </defs>
        </svg>
      </div>
      <img
        src= {StarImage}
        alt="Star"
        className="star-icon-large"
      />
      <div className="total-stars">{points}</div>
    </div>
  </div>
</>
}
=======

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
>>>>>>> 507f6111dc6f68a5a5f7debf5188de8d8c096e04
    </div>
  );
}
