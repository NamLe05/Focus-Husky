import React from 'react';
/* eslint-disable prettier/prettier */
import {createRoot} from 'react-dom/client';
import {HashRouter, Routes, Route, Link, NavLink} from 'react-router';
import {useLocation} from 'react-router-dom';
import HomeView from './home-page/view';
import PetView from './pet/view';
import PomodoroView from './pomodoro/view';
import MarketView from './rewards-store/view';
import TaskView from './tasks/view';
// eslint-disable-next-line n/no-extraneous-import
import 'bootstrap-icons/font/bootstrap-icons.css';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';

// Bootstrap
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

const root = createRoot(document.body);

type Route = {
  component: React.FC;
  title: string;
  navText?: string;
  navIcon?: string;
};

const routes: {[path: string]: Route} = {
  '/': {
    component: HomeView,
    title: 'Dashboard',
    navText: 'Dashboard',
    navIcon: 'house-heart-fill',
  },
  '/pet': {
    component: PetView,
    title: 'My Pet',
    navText: 'My Pet',
    navIcon: 'arrow-through-heart-fill',
  },
  '/tasks': {
    component: TaskView,
    title: 'My Tasks',
    navText: 'My Tasks',
    navIcon: 'card-checklist',
  },
  '/marketView': {
    component: MarketView,
    title: 'Market Place',
    navText: 'Market Place',
    navIcon: 'bi bi-star-fill',
  },
};

function App() {
  const location = useLocation();
  if (routes[location.pathname] === undefined) {
    return (
      <p>
        Page not found <Link to="/">Return home</Link>
      </p>
    );
  }
  return (
    <>
      <header>
        <Navbar expand="lg">
          <Container>
            <Navbar.Toggle />
            <Navbar.Collapse
              className="justify-content-left"
              style={{width: '150px'}}
            >
              <Navbar.Brand className="poppins-dark">Focus Husky</Navbar.Brand>
            </Navbar.Collapse>
            <Navbar.Collapse className="justify-content-center">
              <Form>
                <Row>
                  <Col xs="auto">
                    <Form.Control
                      type="text"
                      placeholder="Search"
                      className=" mr-sm-2"
                    />
                  </Col>
                  <Col xs="auto">
                    <Button type="submit">
                      <i className="bi bi-search"></i>
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Navbar.Collapse>
            <Navbar.Collapse className="justify-content-end">
              <Nav className="ml-auto">
                <Nav.Link>
                  <i className="bi bi-bell-fill"></i>
                </Nav.Link>
                <NavDropdown title="Username">
                  <NavDropdown.Item href="#action/3.1">
                    Settings
                  </NavDropdown.Item>
                  <NavDropdown.Item href="#action/3.2">
                    Profile
                  </NavDropdown.Item>
                  <NavDropdown.Item href="#action/3.3">
                    Log Out
                  </NavDropdown.Item>
                </NavDropdown>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
      </header>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/pet">My Pet</Link>
        <Link to="/pomodoro">Pomodoro Sessions</Link>
        <Link to="/tasks">My Tasks</Link>
        <Link to="/market">Marketplace</Link>
      </nav>
      <div
        id="sidebar"
        className="d-flex flex-column flex-shrink-0 p-3 bg-light"
      >
        <ul className="nav nav-pills flex-column mb-auto">
          {Object.entries(routes)
            .filter(
              ([_, route]) =>
                route.navText !== undefined && route.navIcon !== undefined,
            )
            .map(([path, route]) => (
              <li className="nav-item">
                <NavLink
                  to={path}
                  className={({isActive}) =>
                    isActive ? 'active nav-link' : 'nav-link'
                  }
                >
                  <i className={`bi bi-${route.navIcon} me-2`}></i>
                  {route.navText}
                </NavLink>
              </li>
            ))}
        </ul>
      </div>
      <main>
        <Routes>
          <Route path="/" element={<HomeView />} />
          <Route path="/pet" element={<PetView />} />
          <Route path="/pomodoro" element={<PomodoroView />} />
          <Route path="/tasks" element={<TaskView />} />
          <Route path="/marketView" element={<MarketView />} />
        </Routes>
      </main>
    </>
  );
}
root.render(
  <HashRouter>
    <App />
  </HashRouter>,
);
