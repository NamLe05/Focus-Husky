import {useState, useEffect, useRef, ChangeEvent, FormEvent} from 'react';

import {TaskController} from './controller';
import {TaskId, TaskState} from './model';

type TaskCardProps = {
  id: TaskId;
  task: TaskState;
};

function TaskCard({id, task}: TaskCardProps) {
  return (
    <div className="taskCard">
      <h2>{task.title}</h2>
      <p>{task.description}</p>
      <p>{task.deadline.toLocaleString()}</p>
    </div>
  );
}

export default function PetView() {
  // Store the active pet and state
  const [tasks, setTasks] = useState<[TaskId, TaskState][] | undefined>(
    undefined,
  );
  const [token, setToken] = useState<string>('');
  const [tokenValidated, setTokenValidated] = useState<boolean>(false);

  // Respond to any callback from the controller
  const viewUpdateCallback = (tasks: [TaskId, TaskState][]) => {
    setTasks(tasks);
  };

  // Create new instance of controller
  const controller = useRef<TaskController>(
    new TaskController(viewUpdateCallback),
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
    await controller.current.syncCanvas();
  };

  // If no tasks are loaded, show a loading sign.
  if (tasks === undefined) {
    return <p>Loading tasks...</p>;
  }

  // Otherwise, render the pet...
  return (
    <div id="taskFrame">
      <h1>Your Tasks</h1>
      {!tokenValidated ? (
        <>
          <p>
            To sync tasks with Canvas, please enter your personal token (this is
            only for testing):
          </p>
          <form onSubmit={onTokenFieldSubmit}>
            <input
              placeholder="Personal token"
              value={token}
              onChange={onTokenFieldUpdate}
            />
            <button type="submit">Submit</button>
          </form>
        </>
      ) : (
        <p>
          <button onClick={triggerCanvasSync}>Sync with Canvas</button>
        </p>
      )}
      {tasks.map(([id, task]) => (
        <TaskCard key={id} id={id} task={task} />
      ))}
    </div>
  );
}
