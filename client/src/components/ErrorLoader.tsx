/**
 * The following component loads error messages onto the screen using Bootstrap toasts.
 *
 * Create a ref for the component to get access to the "pushError" method from your view.
 */

import {useState, useImperativeHandle, Ref} from 'react';
import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';

export interface ErrorLoaderRef {
  pushError: (msg: string) => void;
}

type ErrorLoaderProps = {
  ref: Ref<ErrorLoaderRef>;
};

export function ErrorLoader({ref}: ErrorLoaderProps) {
  const [activeErrors, setActiveErrors] = useState<string[]>([]);

  useImperativeHandle(ref, () => ({
    pushError(msg: string) {
      // If active errors are full, remove early
      if (activeErrors.length > 3) {
        setActiveErrors((arr: string[]) => arr.slice(1));
      }

      // Add an error message toast to queue
      setActiveErrors((arr: string[]) => [...arr, msg]);

      // Remove the error from queue after 5 seconds (assume it is the first error)
      // The UI will also auto-hide the error if it is not deleted due to a timing bug
      setTimeout(() => {
        setActiveErrors((arr: string[]) => arr.slice(1));
      }, 5000);
    },
  }));

  return (
    <ToastContainer className="position-fixed bottom-0 end-0 p-3 z-3">
      {activeErrors.map(msg => (
        <Toast delay={5000} bg="warning">
          <Toast.Header>
            <strong className="me-auto">Error</strong>
          </Toast.Header>
          <Toast.Body>{msg}</Toast.Body>
        </Toast>
      ))}
    </ToastContainer>
  );
}
