import {ElectronAPI} from '@electron-toolkit/preload';

declare global {
  interface Window {
    electronAPI?: {
      openPomodoroWindow: () => void;
      openPetWindow: () => void;

      openOrFocusMainHome: () => Promise<void>;

      onNavigateHome: (callback: () => void) => void;
      removeNavigateHomeListener: (callback: () => void) => void;
    };
    electron: ElectronAPI;
  }
}
