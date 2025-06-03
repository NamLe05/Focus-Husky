import React from 'react';
import {createRoot} from 'react-dom/client';
import PetView from '../pet/view';
import './styles.css';

const PetApp = () => (
  <PetView
    draggable={false}
    showInfoPanel={false}
    lockedPosition={{x: 19, y: 70}}
  />
);

const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(<PetApp />);
