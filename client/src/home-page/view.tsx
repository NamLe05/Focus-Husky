import React from 'react';
import './styles.css';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
const handleOpenPomodoro = () => {
  window.electronAPI?.openPomodoroWindow();
};

const View = () => {
  return <>
    <Container fluid className='root'>
      <Row className='noPadding'>
        <Col className='dateCard'>
          <div className='todayTxt'><h1>Tuesday</h1></div>
          <div className='dateTxt'><h1>5/13/2025 | 10:00 AM</h1></div>
        </Col>
        
        <Col>
          <div className='pomodoroTimer'>
            <div className='pomodoroTxt'><h1>Start Pomodoro Timer</h1></div>
            <button className='pomodoroTimerButton' onClick={handleOpenPomodoro}><i className="bi bi-play-fill"></i></button>
          </div>
        </Col>
      </Row>

      <Row className='noPadding'>
        <Col>
          <div className='statsCard'>
            <h1>Weekly Activity :</h1>
            <div className='statsCardContent'>
              <h2>25%</h2>
              <i className="bi bi-lightning-charge-fill"></i>
            </div>
            <div className="dateTxt">
              <h1>THU 4, 24, 2025 | 10:00 AM</h1>
            </div>
          </Col>

          <Col>
            <div className="pomodoroTimer">
              <div className="pomodoroTxt">
                <h1>Start Pomodoro Timer</h1>
              </div>
              <button
                className="pomodoroTimerButton"
                onClick={handleOpenPomodoro}
              >
                <i className="bi bi-play-fill"></i>
              </button>
            </div>
          </Col>
        </Row>

        <Row className="noPadding">
          <Col>
            <div className="statsCard">
              <h1>Weekly Activity :</h1>
              <div className="statsCardContent">
                <h2>25%</h2>
                <i className="bi bi-lightning-charge-fill"></i>
              </div>
            </div>
          </Col>
          <Col>
            <div className="statsCard">
              <h1>Worked This Week :</h1>
              <div className="statsCardContent">
                <h2>40:00:05</h2>
                <i className="bi bi-clock"></i>
              </div>
            </div>
          </Col>
          <Col>
            <div className="statsCard">
              <h1>Tasks Completed :</h1>
              <div className="statsCardContent">
                <h2>12</h2>
                <i className="bi bi-check2-circle"></i>
              </div>
            </div>
          </Col>
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
    </>
  );
};

export default View;
