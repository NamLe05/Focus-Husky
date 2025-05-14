import React from 'react';
import { createRoot } from 'react-dom/client';
import PomodoroView from './view'

const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(<PomodoroView />);