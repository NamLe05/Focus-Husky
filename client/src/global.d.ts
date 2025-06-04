import {ElectronAPI} from '@electron-toolkit/preload';

declare global {
  interface Window {
    electronAPI?: {
      openPomodoroWindow: () => void;
      openPetWindow: () => void;
      closePomodoroWindow: () => void;
      isPomodoroWindowOpen: () => Promise<boolean>;

      openOrFocusMainHome: () => Promise<void>;

      onNavigateHome: (callback: () => void) => void;
      removeNavigateHomeListener: (callback: () => void) => void;

      // focus count and listeners
      incrementFocusCount: () => void;
      getFocusCount: () => Promise<number>;
      onFocusSessionEnded: (callback: () => void) => void;
      removeFocusSessionEndedListener: (callback: () => void) => void;
      notifyFocusSessionEnded: () => void;

      // total time
      incrementTotalTime: (seconds: number) => void;
      getTotalTime: () => Promise<number>;

      getRewards: () => Promise<{
        points: number;
        ownedItems: string[];
      }>;

      updateRewards: (payload: { points: number; ownedItems: string[] }) => Promise<void>;

      updatePoints: () => void;
      onPointsUpdated: (callback: () => void) => void;
      removePointsUpdatedListener: (callback: () => void) => void;
      
    };
    electron: ElectronAPI;
  }
}
