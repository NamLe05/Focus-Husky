import {ElectronAPI} from '@electron-toolkit/preload';

declare global {
  interface Window {
    electronAPI?: {
      openPomodoroWindow: () => void;
      openPetWindow: () => void;
    };
    electron: ElectronAPI;
  }
}
