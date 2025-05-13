import React from 'react';
import { Link } from 'react-router-dom';
// import starImg from '../Static/star.png';

const Sidebar: React.FC = () => {
  return (
    <div className="sidebar">
      <nav>
        <ul>
          <li>
            <Link to="/view">Dashboard</Link>
          </li>
          <li>
            <Link to="/marketView">
            {/* <img src="starImg" alt="Marketplace" /> */}
            Marketplace
            </Link>
          </li>
          <li>
            <Link to="/pomodoroView">Pomodoro Timer</Link>
          </li>
          <li>
            <Link to="/taskView">Schedule</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default Sidebar;