import React, {useState, useEffect, useRef} from 'react';
import './styles.css';
import {PomodoroController} from './controller';
import {PomodoroState} from './model';
import PetView from '../pet/view';

import settingImg from '../Static/settings.png';
import calendarImg from '../Static/calendar.png';
import notesImg from '../Static/notes.png';
import petImg from '../Static/pet.png';

export default function PomodoroView() {
  const [timerState, setTimerState] = useState<boolean>(false);
  const [pomodoroState, setPomodoroState] = useState<PomodoroState>({
    state: 'focus',
    focusTime: 1500,
    breakTime: 900,
    remainingTime: 1500,
  });

  const controllerRef = useRef<PomodoroController | null>(null);

  useEffect(() => {
    // Only create the controller once
    controllerRef.current = new PomodoroController(
      1500,
      900,
      (state, pomodoroState) => {
        setTimerState(state);
        setPomodoroState({...pomodoroState});
      },
    );
  }, []);

  const handleStartStop = () => {
    controllerRef.current?.toggleTimer();
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleIncreaseTime = () => {
    controllerRef.current?.adjustRemainingTime(60); // +1 minute
  };

  const handleDecreaseTime = () => {
    controllerRef.current?.adjustRemainingTime(-60); // -1 minute
  };



  return (
    <>
      <div className="pomodoroRoot">
        <PetView
          showInfoPanel={false}
          draggable={false}
          lockedPosition={{x: 30, y: 50}}
          dragLayer={false}
        />
        <div className="pomodoroTimerRoot">
          <div className="navBar">
            <button
              className="settings"
              style={{backgroundImage: `url(${settingImg})`}}
            ></button>
            <button
              className="calendar"
              style={{backgroundImage: `url(${calendarImg})`}}
            ></button>
            <button
              className="notes"
              style={{backgroundImage: `url(${notesImg})`}}
            ></button>
          </div>

          <div className="timerBackground">
            <div
              className="innerBackground"
              style={{
                backgroundColor:
                  pomodoroState.state === 'focus' ? '#8F7A97' : '#8F7A9789',
              }}
            >
              <div className="timerLabel">
                {pomodoroState.state === 'focus' ? 'Focus' : 'Break'}
              </div>
              <div className="timerCountdown">
                {formatTime(pomodoroState.remainingTime)}
              </div>
            </div>
          </div>
          <button className="increaseTimeButton" onClick={handleIncreaseTime}>+</button>
          <button className="timerButton" onClick={handleStartStop}>
            {timerState ? '◼' : '▶'}
          </button>
          <button className="decreaseTimeButton" onClick={handleDecreaseTime}>−</button>
        </div>
      </div>
    </>
  );
}
