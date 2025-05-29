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
});
