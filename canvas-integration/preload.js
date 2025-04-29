// preload.js - Enhanced with debugging support

const { contextBridge, ipcRenderer } = require('electron');

console.log('Preload script starting');

// Safely expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('canvasApi', {
  getAuthStatus: () => {
    console.log('Renderer called: getAuthStatus');
    return ipcRenderer.invoke('get-auth-status');
  },
  loginWithToken: (credentials) => {
    console.log('Renderer called: loginWithToken');
    return ipcRenderer.invoke('login-with-token', credentials);
  },
  logout: () => {
    console.log('Renderer called: logout');
    return ipcRenderer.invoke('logout');
  },
  getAssignments: () => {
    console.log('Renderer called: getAssignments');
    return ipcRenderer.invoke('get-assignments');
  },
  debugCourses: () => {
    console.log('Renderer called: debugCourses');
    return ipcRenderer.invoke('debug-courses');
  }
});

// Add a direct console logger that works in both main and renderer processes
contextBridge.exposeInMainWorld('logger', {
  log: (...args) => {
    console.log('RENDERER LOG:', ...args);
  },
  error: (...args) => {
    console.error('RENDERER ERROR:', ...args);
  }
});

console.log('Preload script completed successfully');