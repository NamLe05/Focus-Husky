export function celebratePet() {
  console.log('[petCelebration] celebratePet called, sending IPC to main process');
  (window.electronAPI as any).celebratePet();
}
