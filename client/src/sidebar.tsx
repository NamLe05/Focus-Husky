import React from 'react';
import { Link } from 'react-router-dom';
import starImg from './Static/star.png';
import timerImg from './Static/Time-schedule.png';
import calendarImg from './Static/Calendar.png';
import homeImg from './Static/Home.png';

const Sidebar: React.FC = () => {
  return (
    <div className="sidebar">
      <nav>
        <ul>
          <li>
            <Link to="/view">
            <img src={homeImg} width="40" />
            Dashboard
            </Link>
          </li>
          <li>
            <Link to="/marketView">
            <img src={starImg} width="50" />
            Marketplace
            </Link>
          </li>
          <li>
            <Link to="/pomodoroView">
            <img src={timerImg} width="40" />
            Pomodoro Timer
            </Link>
          </li>
          <li>
            <Link to="/taskView">
            <img src={calendarImg} width="35" />
            Schedule
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default Sidebar;