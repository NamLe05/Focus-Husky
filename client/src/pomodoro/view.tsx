import React, { useState, useEffect, useRef } from "react";
import './styles.css';
import { PomodoroController } from './controller';
import { PomodoroState } from "./model";

import settingImg from '../Static/settings.png';
import calendarImg from '../Static/calendar.png';
import notesImg from '../Static/notes.png';
import petImg from '../Static/pet.png';



export default function PomodoroView() {
  const [timerState, setTimerState] = useState<boolean>(false);
  const [pomodoroState, setPomodoroState] = useState<PomodoroState>({
    state: 'focus',
    focusTime: 5,
    breakTime: 900,
    remainingTime: 5,
  });

  const controllerRef = useRef<PomodoroController | null>(null);

  useEffect(() => {
    // Only create the controller once
    controllerRef.current = new PomodoroController(5, 900, (state, pomodoroState) => {
      setTimerState(state);
      setPomodoroState({ ...pomodoroState });
    });
  }, []);

  const handleStartStop = () => {
    controllerRef.current?.toggleTimer();
  };
  console.log(pomodoroState.remainingTime)

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  console.log('petImg URL:', petImg);
  return (
    <>
    <div className="pomodoroRoot">
      <div className="petModel" style={{ backgroundImage: `url(${petImg})` }}></div>

      <div className="pomodoroTimerRoot">
        <div className="navBar">
          <button className="settings" style={{ backgroundImage: `url(${settingImg})` }}></button>
          <button className="calendar" style={{ backgroundImage: `url(${calendarImg})` }}></button>
          <button className="notes" style={{ backgroundImage: `url(${notesImg})` }}></button>
        </div>

        <div className="timerBackground">
          <div className="innerBackground" style={{ 
            backgroundColor: pomodoroState.state == 'focus' ? '#8F7A97' : '#8F7A9789'}}>
              
            <div className="timerLabel">{pomodoroState.state == 'focus' ? 'Focus' : 'Break'}</div>
            <div className="timerCountdown">{formatTime(pomodoroState.remainingTime)}</div>
          </div>
        </div>

        <button className="timerButton" onClick={handleStartStop}>
          {timerState ? "◼" : "▶"}
        </button>
      </div>
    </div>
    </>
  );
}
