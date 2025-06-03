import React from 'react';
import {createRoot} from 'react-dom/client';
import PetView from '../pet/view';
import './styles.css';

const PetApp = () => (
  <PetView
    draggable={true}
    showInfoPanel={false}
  />
);

const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(<PetApp />);
