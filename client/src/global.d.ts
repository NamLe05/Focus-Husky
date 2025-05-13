export {};

declare global {
  interface Window {
    electronAPI?: {
      openPomodoroWindow: () => void;
    };
  }
}