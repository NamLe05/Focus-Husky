import { useEffect, useRef } from 'react';


import feedSound from '../Static/sounds/feed.mp3';
import playSound from '../Static/sounds/play.mp3';
import groomSound from '../Static/sounds/groom.mp3';
import errorSound from '../Static/sounds/error.mp3';
// Sound helper for loading and playing sound effects
export class SoundPlayer {
  private static instance: SoundPlayer | null = null;
  private audioCache: Map<string, HTMLAudioElement> = new Map();
  private muted: boolean = false;

  // Private constructor for singleton pattern
  private constructor() {}

  // Get singleton instance
  public static getInstance(): SoundPlayer {
    if (!SoundPlayer.instance) {
      SoundPlayer.instance = new SoundPlayer();
    }
    return SoundPlayer.instance;
  }

  // Preload a sound file
  public preloadSound(id: string, filePath: string): void {
    if (!this.audioCache.has(id)) {
      try {
        const audio = new Audio(filePath);
        audio.load();
        this.audioCache.set(id, audio);
        console.log(`Sound ${id} preloaded: ${filePath}`);
      } catch (error) {
        console.error(`Failed to preload sound ${id}:`, error);
      }
    }
  }

  // Play a sound by ID
  public playSound(id: string): void {
    if (this.muted) {
      console.log(`Sound ${id} suppressed (muted)`);
      return;
    }

    const audio = this.audioCache.get(id);
    if (audio) {
      try {
        // Clone the audio to allow overlapping sounds
        const playSound = audio.cloneNode() as HTMLAudioElement;
        playSound.volume = 0.5; // Set default volume
        
        // Add error handling
        playSound.onerror = (e) => {
          console.error(`Error playing sound ${id}:`, e);
        };
        
        // Play the sound
        const playPromise = playSound.play();
        
        // Handle promise to catch any autoplay restrictions
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.warn(`Browser prevented playing sound ${id}:`, error);
          });
        }
        
        console.log(`Sound ${id} played`);
      } catch (error) {
        console.error(`Failed to play sound ${id}:`, error);
      }
    } else {
      console.warn(`Sound ${id} not found in cache`);
    }
  }

  // Toggle mute status
  public toggleMute(): boolean {
    this.muted = !this.muted;
    return this.muted;
  }

  // Set mute status
  public setMute(muted: boolean): void {
    this.muted = muted;
  }

  // Get mute status
  public isMuted(): boolean {
    return this.muted;
  }
}

// React hook for using sound effects
export function useSoundEffects() {
  const soundPlayer = useRef<SoundPlayer>(SoundPlayer.getInstance());
  
  // Load all sound effects on component mount
  useEffect(() => {
    // Get the sound player instance
    const player = soundPlayer.current;
    
    // Preload all pet sound effects
    player.preloadSound('feed', feedSound);
    player.preloadSound('play', playSound);
    player.preloadSound('groom', groomSound);
    player.preloadSound('error', errorSound);
    
    // Return cleanup function
    return () => {
      // Nothing to clean up for audio preloading
    };
  }, []);
  
  return soundPlayer.current;
}

// Updated Sound Effects for PetView
export const createSoundEffects = () => {
  const soundPlayer = SoundPlayer.getInstance();
  
  return {
    feed: {
      play: () => soundPlayer.playSound('feed')
    },
    play: {
      play: () => soundPlayer.playSound('play')
    },
    groom: {
      play: () => soundPlayer.playSound('groom') 
    },
    error: {
      play: () => soundPlayer.playSound('error')
    }
  };
};