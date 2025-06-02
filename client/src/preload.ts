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
  dbInsert(config: {filename: string; document: unknown}) {
    ipcRenderer.send('insertDoc', config);
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
  openPetWindow: () => ipcRenderer.send('open-pet-window'),

  // Expose the openOrFocusMainHome method (ipc invoke)
  openOrFocusMainHome: () => ipcRenderer.invoke('open-or-focus-main-home'),

  // Event listener to receive 'navigate-home' from main
  onNavigateHome: (callback: () => void) => {
    ipcRenderer.on('navigate-home', callback);
  },

  removeNavigateHomeListener: (callback: () => void) => {
    ipcRenderer.removeListener('navigate-home', callback);
  },

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
});
