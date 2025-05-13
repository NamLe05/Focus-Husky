import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Home from './home-page/view';
import PetView from './pet/view';
import PomodoroView from './pomodoro/view';
import Layout from './layout';
import './layout.css';
import React from 'react';

const root = createRoot(document.getElementById('root'));
root.render(
<React.StrictMode>
<BrowserRouter>
  <nav>
    <Link to="/view">View</Link>
    <Link to="/petView">Pet View</Link>
    <Link to="/pomodoroView">Pomodoro View</Link>
    <Link to="/marketView">Market View</Link>
  </nav>

  <Routes>
    <Route path="/" element={<Layout/>}>
      <Route path="/view" element={<Home />} />
      <Route path="/pomodoroView" element={<PomodoroView />} />
      <Route path="/petView" element={<PetView />} />
    </Route>
  </Routes>

</BrowserRouter>
</React.StrictMode>
);
