import React, { useEffect, useState } from 'react';
import './styles.css';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

const handleOpenPomodoro = () => {
  window.electronAPI?.openPomodoroWindow();
};

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

// DateCard
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

// PomodoroTimer
const PomodoroTimer: React.FC = () => (
  <Col>
    <div className="pomodoroTimer">
      <div className="pomodoroTxt">
        <h1>Start Pomodoro Timer</h1>
      </div>
      <button className="pomodoroTimerButton" onClick={handleOpenPomodoro}>
        <i className="bi bi-play-fill"></i>
      </button>
    </div>
  </Col>
);

// StatsCard
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


// View
const View: React.FC = () => {
  const [currentTime, setCurrentTime] = useState<TimeInfo>(formatDateTime(new Date()));

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(formatDateTime(new Date()));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Container fluid className="root">
      <Row className="noPadding">
        <DateCard time={currentTime} />
        <PomodoroTimer />
      </Row>

      <Row className="noPadding">
        <StatsCard title="Weekly Activity" value="25%" icon="bi-lightning-charge-fill" />
        <StatsCard title="Worked This Week" value="40:00:05" icon="bi-clock" />
        <StatsCard title="Tasks Completed" value="12" icon="bi-check2-circle" />
      </Row>

      <Row>
        <Col>
          <div className="activeCard">
            <h1>Friends</h1>
          </div>
        </Col>
        <Col>
          <div className="activeCard">
            <h1>To Do</h1>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default View;
