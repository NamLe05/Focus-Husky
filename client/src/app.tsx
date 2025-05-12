import {createRoot} from 'react-dom/client';
import {BrowserRouter, Routes, Route, Link} from 'react-router';
import PetView from './pet/view';
import PomodoroView from './pomodoro/view';
import TaskView from './tasks/view';

const root = createRoot(document.body);
root.render(
  <BrowserRouter>
    <nav>
      <Link to="/view">View</Link>
      <Link to="/petView">Pet View</Link>
      <Link to="/pomodoroView">Pomodoro View</Link>
      <Link to="/taskView">Task View</Link>
      <Link to="/marketView">Market View</Link>
    </nav>
    <Routes>
      <Route path="/petView" element={<PetView />} />
      <Route path="/pomodoroView" element={<PomodoroView />} />
      <Route path="/taskView" element={<TaskView />} />
      {/* <Route path="/marketView" element={<MarketView />} /> */}
    </Routes>
  </BrowserRouter>,
);
