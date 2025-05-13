import {createRoot} from 'react-dom/client';
import {HashRouter, Routes, Route, Link} from "react-router";
import PetView from './pet/view';
import PomodoroView from './pomodoro/view';

const root = createRoot(document.body);
root.render(
<HashRouter>
  <nav>
    <Link to="/view">View</Link>
    <Link to="/petView">Pet View</Link>
    <Link to="/pomodoroView">Pomodoro View</Link>
    <Link to="/marketView">Market View</Link>
  </nav>
  <Routes>
      <Route path="/petView" element={<PetView />} />
      <Route path="/pomodoroView" element={<PomodoroView />} />
      {/* <Route path="/marketView" element={<MarketView />} /> */}
  </Routes>
</HashRouter>);
