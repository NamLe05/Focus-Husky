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

  // --- Pet IPC API ---
  getPetState: (): Promise<any> => ipcRenderer.invoke('pet:getState'),
  feedPet: (petId: string) => ipcRenderer.send('pet:feed', petId),
  playPet: (petId: string) => ipcRenderer.send('pet:play', petId),
  groomPet: (petId: string) => ipcRenderer.send('pet:groom', petId),
  movePet: (petId: string, x: number, y: number) => ipcRenderer.send('pet:move', petId, x, y),
  onPetStateUpdate: (callback: (state: any) => void) => ipcRenderer.on('pet:stateUpdate', (_event: any, state: any) => callback(state)),
  removePetStateUpdateListener: (callback: (...args: any[]) => void) => ipcRenderer.removeListener('pet:stateUpdate', callback),
  celebratePet: () => ipcRenderer.send('pet:celebrate'),
});
