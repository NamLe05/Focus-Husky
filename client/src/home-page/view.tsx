/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-floating-promises */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles.css';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import {store} from '../rewards-store/controller';
import {RewardsStore} from '../rewards-store/model';
import taskControllerInstance from '../tasks/controller'; // Adjust path if needed
import { TaskId, TaskState, TaskAction } from '../tasks/model'; // Adjust path if needed
import {unequipAccessory} from '../rewards-store/controller';

type TimeInfo = {
  dayString: string;
  dateString: string;
};

const formatDateTime = (date: Date): TimeInfo => {
  const dayString = date.toLocaleDateString('en-US', { weekday: 'long' });
  const dateString =
    date.toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
    }) +
    ' | ' +
    date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  return { dayString, dateString };
};

const formatSeconds = (totalSeconds: number): string => {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  const hh = hrs.toString().padStart(2, '0');
  const mm = mins.toString().padStart(2, '0');
  const ss = secs.toString().padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
};

const DateCard: React.FC<{ time: TimeInfo }> = ({ time }) => (
  <Col className="dateCard">
    <div className="todayTxt">
      <h1>{time.dayString}</h1>
    </div>
    <div className="dateTxt">
      <h1>{time.dateString}</h1>
    </div>
  </Col>
);

const PomodoroTimer: React.FC<{
  isRunning: boolean;
  onToggle: () => void;
}> = ({ isRunning, onToggle }) => (
  <Col>
    <div className="pomodoroTimer">
      <div className="pomodoroTxt">
        <h1>{isRunning ? 'Close Pomodoro Timer' : 'Start Pomodoro Timer'}</h1>
      </div>
      <button className="pomodoroTimerButton" onClick={onToggle}>
        <i className={`bi ${isRunning ? 'bi-x' : 'bi-play-fill'}`}></i>
      </button>
    </div>
  </Col>
);

const StatsCard: React.FC<{ title: string; value: string; icon: string }> = ({
  title,
  value,
  icon,
}) => (
  <Col>
    <div className="statsCard">
      <h1>{title} :</h1>
      <div className="statsCardContent">
        <h2>{value}</h2>
        <i className={`bi ${icon}`}></i>
      </div>
    </div>
  </Col>
);

const View: React.FC = () => {
  const navigate = useNavigate();

  const [currentTime, setCurrentTime] = useState<TimeInfo>(formatDateTime(new Date()));
  const [focusCount, setFocusCount] = useState<number>(0);
  const [totalSecondsFocused, setTotalSecondsFocused] = useState<number>(0);
  const [tasksCompleted, setTasksCompleted] = useState<number>(0);
  const [todoTasks, setTodoTasks] = useState<[TaskId, TaskState][]>([]);
  const [isPomodoroOpen, setIsPomodoroOpen] = useState(false);

  const handleTogglePomodoro = () => {
    if (isPomodoroOpen) {
      window.electronAPI?.closePomodoroWindow?.();
      setIsPomodoroOpen(false);
    } else {
      window.electronAPI?.openPomodoroWindow?.();
      setIsPomodoroOpen(true);
    }
  };

  useEffect(() => {
    async function checkPomodoroWindow() {
      if (window.electronAPI?.isPomodoroWindowOpen) {
        const isOpen = await window.electronAPI.isPomodoroWindowOpen();
        setIsPomodoroOpen(isOpen);
      }
    }
    checkPomodoroWindow();
  }, []);

  useEffect(() => {
    async function fetchStats() {
      if (window.electronAPI?.getFocusCount) {
        const count = await window.electronAPI.getFocusCount();
        setFocusCount(count);
      }
      if (window.electronAPI?.getTotalTime) {
        const total = await window.electronAPI.getTotalTime();
        setTotalSecondsFocused(total);
      }
    }
    fetchStats();
  }, []);

  useEffect(() => {
    const handleSessionEnded = async () => {
      if (window.electronAPI?.getFocusCount) {
        const updatedCount = await window.electronAPI.getFocusCount();
        setFocusCount(updatedCount);
      }
      if (window.electronAPI?.getTotalTime) {
        const newTotal = await window.electronAPI.getTotalTime();
        setTotalSecondsFocused(newTotal);
      }
    };

    window.electronAPI?.onFocusSessionEnded?.(handleSessionEnded);

    return () => {
      window.electronAPI?.removeFocusSessionEndedListener?.(handleSessionEnded);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      setCurrentTime(formatDateTime(new Date()));
      if (window.electronAPI?.getTotalTime) {
        const updatedTotal = await window.electronAPI.getTotalTime();
        setTotalSecondsFocused(updatedTotal);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = () => navigate('/');
    window.electronAPI?.onNavigateHome?.(handler);
    return () => {
      window.electronAPI?.removeNavigateHomeListener?.(handler);
    };
  }, [navigate]);

  useEffect(() => {
    taskControllerInstance.setCallbacks(
      (tasks: [TaskId, TaskState][]) => {
        const completed = tasks.filter(([, task]) => task.status === 'completed').length;
        setTasksCompleted(completed);

        const incomplete = tasks.filter(([, task]) => task.status !== 'completed');
        setTodoTasks(incomplete);
      },
      (_action: TaskAction) => {
        // Optional: handle task action
      },
      (errorType: 'deleteError' | 'completeError' | 'syncError', msg: string) => {
        console.error(`[${errorType}] ${msg}`);
      }
    );
  }, []);

  return (
    <Container fluid className="root">
      <Row className="noPadding">
        <DateCard time={currentTime} />
        <PomodoroTimer isRunning={isPomodoroOpen} onToggle={handleTogglePomodoro} />
      </Row>

      <Row className="noPadding">
        <StatsCard
          title="Sessions Completed"
          value={focusCount.toString()}
          icon="bi-lightning-charge-fill"
        />
        <StatsCard
          title="Total Time Focused"
          value={formatSeconds(totalSecondsFocused)}
          icon="bi-clock"
        />
        <StatsCard
          title="Tasks Completed"
          value={tasksCompleted.toString()}
          icon="bi-check2-circle"
        />
      </Row>

      <Row>
        <Col>
          <div className="activeCard">
            <h1>Your Pet</h1>
              {/* Wrapper to constrain image size and allow layering */}
              <div
                style={{
                  position: 'relative',
                  width: '300px',
                  height: '220px',
                  marginLeft: '20px',
                  marginBottom: '50px',
                  //background: 'blue'
                }}
              >{store.equipped && store.equipped.pet?.image &&(
              <img
                src={store.equipped.pet.image}
                alt= {store.equipped.pet.name}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  zIndex: 1,
                  //background: 'red'
                }}
              />
            )}{store.equipped && store.equipped.accessory?.image && (
            <img
              src={store.equipped.accessory.image}
              alt="Accessory"
              style={{
                position: 'absolute',
                top: '5px', // 👈 this moves it up
                left: '25%',
                width: '50%',
                height: '50%',
                objectFit: 'contain',
                zIndex: 2,
                pointerEvents: 'none',
              }}
            />
          )}</div>
            <div
            ></div>
            {/* Pet image */}
          </div>
        </Col>
        <Col>
          <div className="activeCard">
            <h1>To Do</h1>
            <ul className="taskList">
              {todoTasks.length === 0 && <li className="noTasks">All Tasks Complete! 🎉</li>}
              {todoTasks.map(([id, task]) => (
                <li key={id} className="taskListItem">
                  <span className="bullet">&#x2022;</span>
                  <div className="taskContent">
                    <div className="taskTitle">{task.title}</div>
                    <div className="taskDeadline">
                      Due: {new Date(task.deadline).toLocaleDateString('en-US')}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default View;
