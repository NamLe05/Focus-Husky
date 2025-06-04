import {useState, useEffect, useRef, ChangeEvent, FormEvent} from 'react';

import taskControllerInstance, {TaskController, TaskError} from './controller';
import {TaskAction, TaskId, TaskModel, TaskState} from './model';

import {
  isTodo,
  isComplete,
  htmlInputStringToDate,
  getTodayMidnight,
  CustomDate,
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
import {celebratePet} from '../pet/petCelebration';

type TaskCardProps = {
  id: TaskId;
  task: TaskState;
  controller: TaskController;
  newItem?: boolean;
  newItemClose?: () => void;
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
  getter: string | number | CustomDate | boolean;
  setter: (value: string | number | Date | boolean) => void;
  required?: boolean;
};

function TaskEditable({
  editing,
  placeholder,
  type,
  getter,
  setter,
  required,
}: TaskEditableProps) {
  if (required === undefined) {
    required = false;
  }
  if (type === 'string' && typeof getter === 'string') {
    return editing ? (
      <div style={{marginRight: '300px'}}>
        <Form.Control
          data-testid="task-editable"
          type="text"
          size="sm"
          placeholder={placeholder}
          value={getter}
          required
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            setter(value);
          }}
        />
        <Form.Control.Feedback
          type="invalid"
          style={{fontSize: '10px', fontWeight: 'bold'}}
        >
          Please enter a value
        </Form.Control.Feedback>
      </div>
    ) : (
      <span>{getter}</span>
    );
  } else if (type === 'date' && typeof getter === 'object') {
    return editing ? (
      <div style={{marginRight: '300px'}}>
        <Form.Control
          data-testid="task-editable"
          size="sm"
          type="datetime-local"
          placeholder={placeholder}
          value={getter.dateToHtmlInputString()}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            setter(e.target.value);
          }}
          required
        />
        <Form.Control.Feedback
          type="invalid"
          style={{fontSize: '10px', fontWeight: 'bold'}}
        >
          Please enter a date
        </Form.Control.Feedback>
      </div>
    ) : (
      <span>{getter.toLocaleString()}</span>
    );
  } else if (type === 'paragraph' && typeof getter === 'string') {
    return editing ? (
      <>
        <Form.Control
          data-testid="task-editable"
          type="text"
          size="sm"
          as="textarea"
          placeholder={placeholder}
          value={getter}
          required
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            setter(e.target.value);
          }}
        />
        <Form.Control.Feedback
          type="invalid"
          style={{fontSize: '10px', fontWeight: 'bold'}}
        >
          Please enter a value
        </Form.Control.Feedback>
      </>
    ) : (
      <span>{getter}</span>
    );
  }
  return <span>ERROR</span>;
}

function TaskCard({
  id,
  task,
  controller,
  newItem,
  newItemClose,
}: TaskCardProps) {
  const [editing, setEditing] = useState<boolean>(false);
  const [tempTask, setTempTask] = useState<TaskState>({...task});
  const [completed, setCompleted] = useState<boolean>(isComplete(task.status));
  const [validated, setValidated] = useState<boolean>(false);
  // If the task is update, cancel edits (todo: refine this logic)
  useEffect(() => {
    setEditing(false);
    setTempTask({...task});
  }, [task]);
  const onCompleteTask = () => {
    if (task.imported) {
      controller.triggerAction('complete-imported', id);
    } else {
      celebratePet();
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
    setTempTask({...tempTask, title: newTitle});
  };
  const updateTaskDescription = (newDesc: string) => {
    setTempTask({...tempTask, description: newDesc});
  };
  const updateTaskDeadline = (newDate: string) => {
    setTempTask((prevTask: TaskState) => ({
      ...prevTask,
      deadline: htmlInputStringToDate(newDate),
    }));
  };
  const saveChanges = async () => {
    if (newItem !== undefined) {
      const result = await controller.handleCreateTask(
        tempTask.title,
        tempTask.description,
        tempTask.course,
        tempTask.deadline,
      );
      if (result !== undefined) {
        newItemClose();
        setValidated(false);
      } else {
        setValidated(true);
      }
    } else {
      controller.handleTaskUpdate(id, tempTask);
    }
  };
  const cancelChanges = () => {
    if (newItem !== undefined) {
      newItemClose();
    }
    setEditing(false);
    setTempTask({...task});
    setValidated(false);
  };
  return (
    <Card
      className="taskCard"
      data-testid={newItem === undefined ? 'task-card' : 'new-task-card'}
      style={{display: newItem !== undefined && !newItem ? 'none' : 'block'}}
    >
      <Card.Body
        className={`position-relative${newItem !== undefined ? ' create-shadow' : ''}`}
      >
        {newItem !== undefined && <h4>Create new task:</h4>}
        <div className="position-absolute top-0 end-0 p-3">
          {editing || newItem !== undefined ? (
            <>
              <Button
                data-testid="save-task-btn"
                size="sm"
                onClick={saveChanges}
                className="mx-1"
              >
                <i className="bi bi-floppy-fill"></i> Save
              </Button>
              <Button
                data-testid="cancel-task-btn"
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
                    data-testid="task-edit-btn"
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
                  <i
                    data-testid="task-archive-btn"
                    className="bi bi-archive-fill px-3"
                  ></i>
                </OverlayTrigger>
              ) : (
                <OverlayTrigger
                  placement="top"
                  overlay={<Tooltip>Delete</Tooltip>}
                >
                  <i
                    data-testid="task-delete-btn"
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
                    data-testid="task-complete-btn"
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
        <Form noValidate validated={validated}>
          <Card.Title className="poppins-dark" data-testid="task-card-title">
            <TaskEditable
              placeholder="Enter title"
              editing={editing || newItem !== undefined}
              type="string"
              getter={tempTask.title}
              setter={updateTaskTitle}
            />
          </Card.Title>
          <Card.Subtitle
            className="mb-2 text-muted"
            data-testid="task-card-deadline"
          >
            <TaskEditable
              placeholder="Enter deadline"
              editing={editing || newItem !== undefined}
              type="date"
              getter={tempTask.deadline}
              setter={updateTaskDeadline}
            />
          </Card.Subtitle>
          <Card.Text data-testid="task-card-desc">
            <TaskEditable
              placeholder="Enter description"
              editing={editing || newItem !== undefined}
              type="paragraph"
              getter={tempTask.description}
              setter={updateTaskDescription}
            />
          </Card.Text>
        </Form>
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
  const controller = useRef<TaskController>(taskControllerInstance);
  // On mount, configure the callbacks
  useEffect(() => {
    controller.current.setCallbacks(
      viewUpdateCallback,
      actionCallback,
      errorCallback,
    );
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

  const [newTaskActive, setNewTaskActive] = useState<boolean>(false);
  const onCreateNewTask = () => {
    setNewTaskActive(true);
  };
  const endNewTaskCreation = () => {
    setNewTaskActive(false);
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
            {!newTaskActive && (
              <div className="d-grid gap-2 mb-3">
                <Button
                  variant="outline-success"
                  onClick={onCreateNewTask}
                  data-testid="open-new-task-button"
                >
                  <i className="bi bi-plus-circle-fill"></i> Create new task
                </Button>
              </div>
            )}
            <TaskCard
              id="newTask"
              task={new TaskModel(
                '',
                '',
                0,
                getTodayMidnight(),
                undefined,
              ).getState()}
              controller={controller.current}
              newItem={newTaskActive}
              newItemClose={endNewTaskCreation}
            />
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
    <div className="allgood" data-testid="no-tasks-msg">
      <i className="bi bi-emoji-smile-fill lg-congratulations"></i>
      <h3>All set!</h3>
      <p>You have no tasks todo this week.</p>
      <Button size="sm" variant="secondary">
        Get ahead on next week
      </Button>
    </div>
  );
}
