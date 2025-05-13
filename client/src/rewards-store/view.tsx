/* eslint-disable prettier/prettier */
import React, { useState } from 'react';
import './styles.css';


export default function marketView() {
  return (
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
          <div className="pet-card">
            <div className="pet-image-container">
              <img src="./assets/frog.jpg" alt="Frog" className="pet-image" />
            </div>
            <div className="pet-name">Frog</div>
            <div className="pet-stars">
              <img src="./assets/star.png" alt="Star" className="star-icon" />
              <span>200</span>
            </div>
          </div>
          <div className="pet-card">
            <div className="pet-image-container">
              <img src="./assets/tiger.jpg" alt="Tiger" className="pet-image" />
            </div>
            <div className="pet-name">Tiger</div>
            <div className="pet-stars">
              <img src="./assets/star.png" alt="Star" className="star-icon" />
              <span>200</span>
            </div>
          </div>
          <div className="pet-card">
            <div className="pet-image-container">
              <img src="./assets/duck.jpg" alt="Duck" className="pet-image" />
            </div>
            <div className="pet-name">Duck</div>
            <div className="pet-stars">
              <img src="./assets/star.png" alt="Star" className="star-icon" />
              <span>200</span>
            </div>
          </div>
          <div className="pet-card">
            <div className="pet-image-container">
              <img src="./assets/husky.jpg" alt="Husky" className="pet-image" />
            </div>
            <div className="pet-name">Husky</div>
            <div className="pet-stars">
              <img src="./assets/star.png" alt="Star" className="star-icon" />
              <span>200</span>
            </div>
          </div>
        </div>
      </div>
      <div className="tab-pane" id="accessories-tab">
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
      </div>
    </div>
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
}
    </div>
  );
}
