// See the Electron documentation for details on how to use preload scripts:

// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const {ipcRenderer, contextBridge} = require('electron');

contextBridge.exposeInMainWorld('electron', {
  api: {
    async invoke(api: string, arg: string) {
      const res = await ipcRenderer.invoke(api, arg);
      return res;
    },
  },
  async dbInsert(config: {filename: string; document: unknown}, id?: string) {
    return await ipcRenderer.invoke('insertDoc', config, id);
  },
  async dbGetAll(filename: string) {
    return await ipcRenderer.invoke('getAllDocs', filename);
  },
  dbUpdate(filename: string, id: string, newState: unknown) {
    ipcRenderer.send('updateDoc', {
      filename,
      query: {_id: id},
      update: {$set: newState},
    });
  },
  dbRemove(filename: string, id: string) {
    ipcRenderer.send('deleteDoc', {filename, query: {_id: id}});
  },
});

contextBridge.exposeInMainWorld('electronAPI', {
  openPomodoroWindow: () => ipcRenderer.send('open-pomodoro-window'),
  closePomodoroWindow: () => ipcRenderer.send('close-pomodoro-window'),
  openPetWindow: () => ipcRenderer.send('open-pet-window'),
  isPomodoroWindowOpen: () => ipcRenderer.invoke('is-pomodoro-window-open'),

  // Expose the openOrFocusMainHome method (ipc invoke)
  openOrFocusMainHome: () => ipcRenderer.invoke('open-or-focus-main-home'),

  // Event listener to receive 'navigate-home' from main
  onNavigateHome: (callback: () => void) => {
    ipcRenderer.on('navigate-home', callback);
  },

  removeNavigateHomeListener: (callback: () => void) => {
    ipcRenderer.removeListener('navigate-home', callback);
  },

  // --- Pet IPC API ---
  getPetState: (): Promise<any> => ipcRenderer.invoke('pet:getState'),
  feedPet: (petId: string) => ipcRenderer.send('pet:feed', petId),
  playPet: (petId: string) => ipcRenderer.send('pet:play', petId),
  groomPet: (petId: string) => ipcRenderer.send('pet:groom', petId),
  movePet: (petId: string, x: number, y: number) =>
    ipcRenderer.send('pet:move', petId, x, y),
  onPetStateUpdate: (callback: (state: any) => void) =>
    ipcRenderer.on('pet:stateUpdate', (_event: any, state: any) =>
      callback(state),
    ),
  removePetStateUpdateListener: (callback: (...args: any[]) => void) =>
    ipcRenderer.removeListener('pet:stateUpdate', callback),
  celebratePet: () => ipcRenderer.send('pet:celebrate'),

  // focus count
  incrementFocusCount: () => {
    ipcRenderer.send('increment-focus-count');
    ipcRenderer.send('log-focus-complete'); // also send a log event
  },

  getFocusCount: async () => {
    return await ipcRenderer.invoke('get-focus-count');
  },

  // main window listener
  onFocusSessionEnded: (callback: () => void) => {
    ipcRenderer.on('focus-session-ended', callback);
  },

  removeFocusSessionEndedListener: (callback: () => void) => {
    ipcRenderer.removeListener('focus-session-ended', callback);
  },
  notifyFocusSessionEnded: () => {
    ipcRenderer.send('focus-session-ended');
  },

  // total time
  incrementTotalTime: (seconds: number) => {
    ipcRenderer.send('increment-total-time', seconds);
  },
  getTotalTime: async () => {
    return await ipcRenderer.invoke('get-total-time');
  },

  getRewards: async () => {
    return await ipcRenderer.invoke('get-rewards-state');
  },

  updateRewards: async ({
    points,
    ownedItems,
  }: {
    points: number;
    ownedItems: string[];
  }) => {
    return await ipcRenderer.invoke('update-rewards-state', {
      points,
      ownedItems,
    });
  },
    
  updatePoints: () => {
    ipcRenderer.send('points-updated');
  },

  // 2) MarketView (renderer) will call this to register a listener
  onPointsUpdated: (callback: () => void) => {
    // Wrap it so we can remove exactly this listener later
    const wrapped = () => {
      callback();
    };
    ipcRenderer.on('points-updated', wrapped);
    return wrapped; 
  },

  // 3) MarketView (renderer) will call this to remove that same listener
  removePointsUpdatedListener: (wrappedListener: any) => {
    ipcRenderer.removeListener('points-updated', wrappedListener);
  },
});
