import {useState, useEffect, useRef, ChangeEvent, FormEvent} from 'react';

import {TaskController, TaskError} from './controller';
import {TaskAction, TaskId, TaskState} from './model';

import {
  isTodo,
  isComplete,
  dateToHtmlInputString,
  htmlInputStringToDate,
} from './helpers';

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
import {ErrorLoader, ErrorLoaderRef} from '../components/ErrorLoader';

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

type TaskEditableProps = {
  editing: boolean;
  placeholder: string;
  // Could support more types if needed
  type: 'string' | 'date' | 'number' | 'paragraph';
  getter: string | number | Date | boolean;
  setter: (value: string | number | Date | boolean) => void;
};

function TaskEditable({
  editing,
  placeholder,
  type,
  getter,
  setter,
}: TaskEditableProps) {
  if (type === 'string' && typeof getter === 'string') {
    return editing ? (
      <div style={{marginRight: '300px'}}>
        <Form.Control
          size="sm"
          placeholder={placeholder}
          value={getter}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            setter(e.target.value);
          }}
          required
        />
      </div>
    ) : (
      <span>{getter}</span>
    );
  } else if (type === 'date' && typeof getter === 'object') {
    return editing ? (
      <div style={{marginRight: '300px'}}>
        <Form.Control
          size="sm"
          type="datetime-local"
          placeholder={placeholder}
          value={dateToHtmlInputString(getter)}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            setter(e.target.value);
          }}
          required
        />
      </div>
    ) : (
      <span>{getter.toLocaleString()}</span>
    );
  } else if (type === 'paragraph' && typeof getter === 'string') {
    return editing ? (
      <Form.Control
        size="sm"
        as="textarea"
        placeholder={placeholder}
        value={getter}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          setter(e.target.value);
        }}
        required
      />
    ) : (
      <span>{getter.toLocaleString()}</span>
    );
  }
  return <span>ERROR</span>;
}

function TaskCard({id, task, controller}: TaskCardProps) {
  const [editing, setEditing] = useState<boolean>(false);
  const [tempTask, setTempTask] = useState<TaskState>({...task});
  const [completed, setCompleted] = useState<boolean>(isComplete(task.status));
  // If the task is update, cancel edits (todo: refine this logic)
  useEffect(() => {
    setEditing(false);
    setTempTask({...task});
  }, [task]);
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
  const onEditTask = () => {
    setEditing(true);
  };
  const initiateDelete = () => {
    controller.triggerAction('delete', id);
  };
  const updateTaskTitle = (newTitle: string) => {
    setTempTask((prevTask: TaskState) => ({...prevTask, title: newTitle}));
  };
  const updateTaskDescription = (newDesc: string) => {
    setTempTask((prevTask: TaskState) => ({...prevTask, description: newDesc}));
  };
  const updateTaskDeadline = (newDate: string) => {
    setTempTask((prevTask: TaskState) => ({
      ...prevTask,
      deadline: htmlInputStringToDate(newDate),
    }));
  };
  const saveChanges = () => {
    controller.handleTaskUpdate(id, tempTask);
  };
  const cancelChanges = () => {
    setEditing(false);
    setTempTask({...task});
  };
  return (
    <Card className="taskCard">
      <Card.Body className="position-relative">
        <div className="position-absolute top-0 end-0 p-3">
          {editing ? (
            <>
              <Button size="sm" onClick={saveChanges} className="mx-1">
                <i className="bi bi-floppy-fill"></i> Save
              </Button>
              <Button
                size="sm"
                variant="danger"
                className="mx-1"
                onClick={cancelChanges}
              >
                <i className="bi bi-x-circle-fill"></i> Cancel
              </Button>
            </>
          ) : (
            <div className="cardMenu">
              {task.imported ? (
                <OverlayTrigger
                  placement="top"
                  overlay={<Tooltip>View Assignment</Tooltip>}
                >
                  <i className="bi bi-box-arrow-up-right px-3"></i>
                </OverlayTrigger>
              ) : (
                <OverlayTrigger
                  placement="top"
                  overlay={<Tooltip>Edit</Tooltip>}
                >
                  <i
                    onClick={onEditTask}
                    className="bi bi-pencil-square px-3"
                  ></i>
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
                <OverlayTrigger
                  placement="top"
                  overlay={<Tooltip>Delete</Tooltip>}
                >
                  <i
                    className="bi bi-trash-fill px-3"
                    onClick={initiateDelete}
                  ></i>
                </OverlayTrigger>
              )}
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip>Complete</Tooltip>}
              >
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
          )}
        </div>
        <Card.Title className="poppins-dark">
          <TaskEditable
            placeholder="Enter title"
            editing={editing}
            type="string"
            getter={tempTask.title}
            setter={updateTaskTitle}
          />
        </Card.Title>
        <Card.Subtitle className="mb-2 text-muted">
          <TaskEditable
            placeholder="Enter deadline"
            editing={editing}
            type="date"
            getter={tempTask.deadline}
            setter={updateTaskDeadline}
          />
        </Card.Subtitle>
        <Card.Text>
          <TaskEditable
            placeholder="Enter description"
            editing={editing}
            type="paragraph"
            getter={tempTask.description}
            setter={updateTaskDescription}
          />
        </Card.Text>
      </Card.Body>
    </Card>
  );
}

export default function TaskView() {
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

  const errorRef = useRef<ErrorLoaderRef>(undefined);
  const [tokenError, setTokenError] = useState<boolean>(false);

  const errorCallback = (error: TaskError, msg: string) => {
    // Handle errors first (no error handling yet)
    if (error === 'syncError') {
      setTokenValidated(false);
      setTokenError(true);
    }

    // Push notification
    if (errorRef !== undefined) {
      errorRef.current.pushError(msg);
    }
  };

  // Create new instance of controller
  const controller = useRef<TaskController>(
    new TaskController(viewUpdateCallback, actionCallback, errorCallback),
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

  const [canvasInstructionsVisible, setCanvasInstructionsVisible] =
    useState<boolean>(false);
  const openCanvasInstructions = () => {
    setCanvasInstructionsVisible(true);
  };
  const closeCanvasInstructions = () => {
    setCanvasInstructionsVisible(false);
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
          <p>
            <a
              className="link-underline-primary"
              role="button"
              onClick={openCanvasInstructions}
            >
              Click here for instructions{' '}
              <i className="bi bi-question-circle-fill"></i>
            </a>
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
          {tokenError && (
            <p
              style={{
                color: '#f44436',
                fontSize: '12px',
                marginTop: 0,
                marginBottom: '30px',
              }}
            >
              <strong>Error:</strong> Failed to sign in to Canvas. Please check
              your token, or try again later.
            </p>
          )}
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
      <ErrorLoader ref={errorRef} />
      <Modal
        show={canvasInstructionsVisible}
        onHide={closeCanvasInstructions}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Instructions for Canvas Sync</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Without UW IT approval, we cannot use the Canvas API through direct
            authentication. For testing, you can sync your tasks with Canvas
            using a personal token.
          </p>
          <p>
            To generate a personal token, navigate to{' '}
            <a
              href="https://canvas.uw.edu/profile/settings#access_tokens_holder"
              target="_blank"
            >
              Canvas settings
            </a>
            .
          </p>
          <p>
            Scroll down to the &quot;<b>Approved Integrations:</b>&quot;
            section.
          </p>
          <p>
            Click on the new &quot;<b>+ New Access Token</b>&quot; button to
            generate your token.
          </p>
          <p>Copy the token and use it to log in to our service!</p>
          <p style={{color: '#f44436'}}>
            <b>
              Please note that we do not save your personal tokens for security
              reasons. You must re-enter the token every time you launch the
              app. Please save your token!
            </b>
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={closeCanvasInstructions}>Got it!</Button>
        </Modal.Footer>
      </Modal>
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
