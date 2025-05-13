/*import { createRoot } from 'react-dom/client';
import PetView from './pet/view';

const App = () => {
  const handleOpenPomodoro = () => {
    window.electronAPI?.openPomodoroWindow();
  };

  return (
    <div>
      <PetView />
      <button onClick={handleOpenPomodoro}>Open Pomodoro</button>
    </div>
  );
};

const root = createRoot(document.body);
root.render(<App />);*/



/*import {createRoot} from 'react-dom/client';

import PetView from './pet/view';
import PomodoroView from './pomodoro/view'
const root = createRoot(document.body);
root.render(<PomodoroView />);*/







import {createRoot} from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link } from "react-router";
import PetView from './pet/view';
import PomodoroView from './pomodoro/view';
import './index.css';

const handleOpenPomodoro = () => {
    window.electronAPI?.openPomodoroWindow();
};

const root = createRoot(document.body);
root.render(
<BrowserRouter>
  <nav className='nav'>
    <Link to="/view">View</Link>
    <Link to="/petView">Pet View</Link>
    <Link to="/petView" onClick={handleOpenPomodoro}>Pomodoro Timer</Link>
    <Link to="/marketView">Market View</Link>
  </nav>
  <Routes>
      <Route path="/petView" element={<PetView />} />
      <Route path="/pomodoroView" element={<PomodoroView />} />
  </Routes>
</BrowserRouter>);

