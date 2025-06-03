import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { PetId, PetState } from '../pet/model';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'petAPI',
  {
    onPetStateUpdate: (callback: (petId: PetId, state: PetState) => void) => {
      ipcRenderer.on('pet-state-update', (_event: IpcRendererEvent, petId: PetId, state: PetState) => {
        callback(petId, state);
      });
    },
    feedPet: (petId: PetId) => {
      ipcRenderer.send('feed-pet', petId);
    },
    playWithPet: (petId: PetId) => {
      ipcRenderer.send('play-with-pet', petId);
    },
    groomPet: (petId: PetId) => {
      ipcRenderer.send('groom-pet', petId);
    },
    movePet: (petId: PetId, x: number, y: number) => {
      ipcRenderer.send('move-pet', petId, x, y);
    },
    pomodoroCompleted: (petId: PetId) => {
      ipcRenderer.send('pomodoro-completed', petId);
    },
    taskCompleted: (petId: PetId) => {
      ipcRenderer.send('task-completed', petId);
    },
    getAllPets: () => {
      return ipcRenderer.invoke('get-all-pets');
    },
    loadPets: () => {
      ipcRenderer.send('load-pets');
    }
  }
); 