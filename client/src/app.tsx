import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route, Link } from "react-router-dom";
//import Home from './home-page/view';
import PetView from './pet/view';
import PomodoroView from './pomodoro/view';
//import MarketView from './rewards-store/view';
import Layout from './layout';
import './layout.css';

const root = createRoot(document.getElementById('root'));
root.render(
<HashRouter>
  <Routes>
    <Route path="/" element={<Layout/>}>
      {/* <Route path="/view" element={<Home />} /> */}
      <Route path="/pomodoroView" element={<PomodoroView />} />
      <Route path="/petView" element={<PetView />} />
      {/* <Route path="/marketView" element={<MarketView />} /> */}
    </Route>
  </Routes>

</HashRouter>
);
