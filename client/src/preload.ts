// preload.js
const { ipcRenderer, contextBridge } = require('electron');

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
});
