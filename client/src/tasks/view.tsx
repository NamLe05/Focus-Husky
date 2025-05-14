import {useState, useEffect, useRef, ChangeEvent, FormEvent} from 'react';

import {TaskController} from './controller';
import {TaskAction, TaskId, TaskState} from './model';

import {isTodo, isComplete} from './helpers';

import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import Spinner from 'react-bootstrap/Spinner';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Modal from 'react-bootstrap/Modal';
import './styles.css';

type TaskCardProps = {
  id: TaskId;
  task: TaskState;
  controller: TaskController;
};

type ConfirmModalProps = {
  visible: boolean;
  title: string;
  description: string;
  confirm_action: () => void;
  cancel_action: () => void;
};

function ConfirmModal({
  visible,
  title,
  description,
  confirm_action,
  cancel_action,
}: ConfirmModalProps) {
  return (
    <Modal
      show={visible}
      onHide={cancel_action}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>{description}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={confirm_action} variant="success">
          Confirm
        </Button>
        <Button onClick={cancel_action} variant="secondary">
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

function TaskCard({id, task, controller}: TaskCardProps) {
  const [completed, setCompleted] = useState<boolean>(isComplete(task.status));
  const onCompleteTask = () => {
    if (task.imported) {
      controller.triggerAction('complete-imported', id);
    } else {
      setCompleted(true);
      setTimeout(() => {
        controller.markComplete(id);
      }, 100);
    }
  };
  const initiateDelete = () => {
    controller.triggerAction('delete', id);
  };
  return (
    <Card className="taskCard">
      <Card.Body className="position-relative">
        <div className="cardMenu position-absolute top-0 end-0 p-3">
          {task.imported ? (
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip>View Assignment</Tooltip>}
            >
              <i className="bi bi-box-arrow-up-right px-3"></i>
            </OverlayTrigger>
          ) : (
            <OverlayTrigger placement="top" overlay={<Tooltip>Edit</Tooltip>}>
              <i className="bi bi-pencil-square px-3"></i>
            </OverlayTrigger>
          )}
          {task.imported ? (
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip>Archive</Tooltip>}
            >
              <i className="bi bi-archive-fill px-3"></i>
            </OverlayTrigger>
          ) : (
            <OverlayTrigger placement="top" overlay={<Tooltip>Delete</Tooltip>}>
              <i className="bi bi-trash-fill px-3" onClick={initiateDelete}></i>
            </OverlayTrigger>
          )}
          <OverlayTrigger placement="top" overlay={<Tooltip>Complete</Tooltip>}>
            {completed ? (
              <i
                className="bi bi-check-circle-fill px-3"
                style={{color: '#4CAF50'}}
              ></i>
            ) : (
              <i
                onClick={onCompleteTask}
                className="bi bi-check-circle px-3"
              ></i>
            )}
          </OverlayTrigger>
        </div>
        <Card.Title className="poppins-dark">{task.title}</Card.Title>
        <Card.Subtitle className="mb-2 text-muted">
          {task.deadline.toLocaleString()}
        </Card.Subtitle>
        <Card.Text>{task.description}</Card.Text>
      </Card.Body>
    </Card>
  );
}

export default function PetView() {
  // Store the active pet and state
  const [tasks, setTasks] = useState<[TaskId, TaskState][] | undefined>(
    undefined,
  );
  const [completedTasks, setCompletedTasks] = useState<
    [TaskId, TaskState][] | undefined
  >(undefined);
  const [token, setToken] = useState<string>('');
  const [tokenValidated, setTokenValidated] = useState<boolean>(false);
  const [syncing, setSyncing] = useState<boolean>(false);

  // Delete modal functionality
  const [deleteConfirm, setDeleteConfirm] = useState<boolean>(false);
  const confirmDelete = () => {
    // Send a confirmation to the controller to delete active task
    controller.current.deleteTask();
    // Close the modal
    setDeleteConfirm(false);
  };
  const cancelDelete = () => {
    // Close the modal
    setDeleteConfirm(false);
  };

  // Complete imported modal functionality
  const [completeImportedConfirm, setCompleteImportedConfirm] =
    useState<boolean>(false);
  const confirmCompleteImported = () => {
    // Send a confirmation to the controller to delete active task
    controller.current.markComplete();
    // Close the modal
    setCompleteImportedConfirm(false);
  };
  const cancelCompleteImported = () => {
    // Close the modal
    setCompleteImportedConfirm(false);
  };

  // Respond to any callback from the controller
  const viewUpdateCallback = (tasks: [TaskId, TaskState][]) => {
    setTasks(tasks.filter(([, task]) => isTodo(task.status)));
    setCompletedTasks(tasks.filter(([, task]) => isComplete(task.status)));
  };

  const actionCallback = (action: TaskAction) => {
    if (action === 'delete') {
      setDeleteConfirm(true);
    } else if (action === 'complete-imported') {
      setCompleteImportedConfirm(true);
    }
  };

  // Create new instance of controller
  const controller = useRef<TaskController>(
    new TaskController(viewUpdateCallback, actionCallback),
  );

  // On mount, add a sample task
  useEffect(() => {
    const dueToday = new Date();
    dueToday.setHours(23);
    dueToday.setMinutes(59);
    dueToday.setSeconds(0);
    dueToday.setMilliseconds(0);
    controller.current.handleCreateTask('Test', 'sample task', 0, dueToday);
  }, []);

  // Event for token field update
  const onTokenFieldUpdate = (e: ChangeEvent<HTMLInputElement>) => {
    setToken(e.target.value);
  };

  const onTokenFieldSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    controller.current.handleTokenUpdate(token);
    setToken('');
    setTokenValidated(true);
  };

  const triggerCanvasSync = async () => {
    setSyncing(true);
    await controller.current.syncCanvas();
    setSyncing(false);
  };

  // If no tasks are loaded, show a loading sign.
  if (tasks === undefined) {
    return <p>Loading tasks...</p>;
  }

  // Otherwise, render the pet...
  return (
    <div id="taskFrame">
      <ConfirmModal
        visible={deleteConfirm}
        title="Are you sure?"
        description="Deleting a task is an irreversible action."
        confirm_action={confirmDelete}
        cancel_action={cancelDelete}
      />
      <ConfirmModal
        visible={completeImportedConfirm}
        title="Are you sure?"
        description="You did not submit the corresponding assignment in Canvas. If you submit it there, it will auto complete when you sync with Canvas."
        confirm_action={confirmCompleteImported}
        cancel_action={cancelCompleteImported}
      />
      <h2>Your Tasks</h2>
      {!tokenValidated ? (
        <>
          <p>
            To sync tasks with Canvas, please enter your personal token (this is
            only for testing):
          </p>
          <Form onSubmit={onTokenFieldSubmit} style={{marginBottom: '20px'}}>
            <Row>
              <Col xs="auto">
                <Form.Control
                  placeholder="Personal token"
                  value={token}
                  onChange={onTokenFieldUpdate}
                  type="password"
                  style={{width: '500px'}}
                />
              </Col>
              <Col xs="auto">
                <Button type="submit">Login</Button>
              </Col>
            </Row>
          </Form>
        </>
      ) : (
        <p>
          <Button onClick={triggerCanvasSync}>
            {syncing ? (
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            ) : (
              'Sync with Canvas'
            )}
          </Button>
        </p>
      )}
      <div id="tasks-tabs">
        <Tabs defaultActiveKey="todo" className="mb-3">
          <Tab eventKey="todo" title="To-do">
            {tasks.length === 0 ? (
              <AllGood />
            ) : (
              tasks.map(([id, task]) => (
                <TaskCard
                  key={id}
                  id={id}
                  task={task}
                  controller={controller.current}
                />
              ))
            )}
          </Tab>
          <Tab eventKey="profile" title="Completed">
            {completedTasks.length === 0 ? (
              <p>No tasks completed this week.</p>
            ) : (
              completedTasks.map(([id, task]) => (
                <TaskCard
                  key={id}
                  id={id}
                  task={task}
                  controller={controller.current}
                />
              ))
            )}
          </Tab>
          <Tab eventKey="activity" title="Activity">
            No recent activity.
          </Tab>
        </Tabs>
      </div>
    </div>
  );
}

function AllGood() {
  return (
    <div className="allgood">
      <i className="bi bi-emoji-smile-fill lg-congratulations"></i>
      <h3>All set!</h3>
      <p>You have no tasks todo this week.</p>
      <Button size="sm" variant="secondary">
        Get ahead on next week
      </Button>
    </div>
  );
}
