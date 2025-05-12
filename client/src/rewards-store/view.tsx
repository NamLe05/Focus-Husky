/* eslint-disable prettier/prettier */
import React, { useState } from 'react';
import './styles.css';

type Tab = 'pets' | 'accessories' | 'timer' | 'sounds' | 'tasks';
interface Item { name: string; price: number; img: string; }

// 1) Data for each tab
const TAB_ITEMS: Record<Tab, Item[]> = {
  pets: [
    { name: 'Frog', price: 200, img: './assets/frog.jpg' },
    { name: 'Tiger', price: 200, img: './assets/tiger.jpg' },
    { name: 'Duck', price: 200, img: './assets/duck.jpg' },
    { name: 'Husky', price: 200, img: './assets/husky.jpg' },
  ],
  accessories: [
    { name: 'Collar', price: 50, img: './assets/collar.jpg' },
    { name: 'Hat', price: 75, img: './assets/hat.jpg' },
    { name: 'Leash', price: 40, img: './assets/leash.jpg' },
  ],
  timer: [
    { name: 'Classic Timer', price: 0, img: './assets/classic-timer.jpg' },
    { name: 'Pomodoro', price: 0, img: './assets/pomodoro.jpg' },
    { name: 'Stopwatch', price: 0, img: './assets/stopwatch.jpg' },
  ],
  sounds: [
    { name: 'Bell', price: 20, img: './assets/bell.jpg' },
    { name: 'Chime', price: 30, img: './assets/chime.jpg' },
    { name: 'Alert', price: 25, img: './assets/alert.jpg' },
  ],
  tasks: [
    { name: 'Checklist', price: 0, img: './assets/checklist.jpg' },
    { name: 'Homework', price: 0, img: './assets/homework.jpg' },
    { name: 'Calendar', price: 0, img: './assets/calendar.jpg' },
  ],
};

export default function MarketView() {
  // 2) State to track active tab
  const [activeTab, setActiveTab] = useState<Tab>('pets');

  // 3) Items to display for the current tab
  const items = TAB_ITEMS[activeTab];

  return (
    <div className="your-class">
      <>
        {/* Meta tags and stylesheets (unchanged) */}
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
          {/* Tab headers */}
          <div className="category-nav">
            {(Object.keys(TAB_ITEMS) as Tab[]).map(tabKey => (
              <div
                key={tabKey}
                className={`category-item ${activeTab === tabKey ? 'active' : ''}`}
                onClick={() => setActiveTab(tabKey)}
              >
                {tabKey.charAt(0).toUpperCase() + tabKey.slice(1)}
              </div>
            ))}
          </div>

          {/* Single cards pane, data-driven */}
          <div className="tab-content">
            <div className="tab-pane active">
              <div className="pet-grid">
                {items.map(item => (
                  <div className="pet-card" key={item.name}>
                    <div className="pet-image-container">
                      <img
                        src={item.img}
                        alt={item.name}
                        className="pet-image"
                      />
                    </div>
                    <div className="pet-name">{item.name}</div>
                    <div className="pet-stars">
                      <img
                        src="./assets/star.png"
                        alt="Star"
                        className="star-icon"
                      />
                      <span>{item.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Star counter (unchanged) */}
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
              src="./assets/star-large.png"
              alt="Star"
              className="star-icon-large"
            />
            <div className="total-stars">200</div>
          </div>
        </div>
      </>
    </div>
  );
}
