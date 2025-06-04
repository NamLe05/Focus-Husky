/* eslint-disable prettier/prettier */
/* eslint-disable prefer-const */

import {useState, useEffect, useRef, useCallback} from 'react';
import petImg from '../Static/pet.png';

import {PetController} from './controller';
import {PetId, PetState} from './model';
import {getPetSpritePath, getAccessorySpritePath} from './helpers';
import {useSoundEffects, createSoundEffects} from './soundEffects';

// FIXED: Import all the sprite images directly
import huskyNeutralIdle from '../Static/pets/neutral_idle.png';
import huskyHappyIdle from '../Static/pets/happy_idle.png';
import huskySadIdle from '../Static/pets/sad_idle.png';
import huskyExcitedIdle from '../Static/pets/excited_idle.png';
import huskyTiredIdle from '../Static/pets/tired_idle.png';

import huskyNeutralWalking from '../Static/pets/neutral_walking.png';
import huskyHappyWalking from '../Static/pets/happy_walking.png';
import huskySadWalking from '../Static/pets/sad_walking.png';
import huskyExcitedWalking from '../Static/pets/excited_walking.png';
import huskyTiredWalking from '../Static/pets/tired_walking.png';

import huskyNeutralCelebrating from '../Static/pets/neutral_celebrating.png';
import huskyHappyCelebrating from '../Static/pets/happy_celebrating.png';
import huskySadCelebrating from '../Static/pets/sad_celebrating.png';
import huskyExcitedCelebrating from '../Static/pets/excited_celebrating.png';
import huskyTiredCelebrating from '../Static/pets/tired_celebrating.png';

import huskyNeutralSleeping from '../Static/pets/neutral_sleeping.png';
import huskyHappySleeping from '../Static/pets/happy_sleeping.png';
import huskySadSleeping from '../Static/pets/sad_sleeping.png';
import huskyExcitedSleeping from '../Static/pets/excited_sleeping.png';
import huskyTiredSleeping from '../Static/pets/tired_sleeping.png';

import huskyNeutralEating from '../Static/pets/neutral_eating.png';
import huskyHappyEating from '../Static/pets/happy_eating.png';
import huskySadEating from '../Static/pets/sad_eating.png';
import huskyExcitedEating from '../Static/pets/excited_eating.png';
import huskyTiredEating from '../Static/pets/tired_eating.png';

import {store} from '../rewards-store/controller';
import {RewardsStore} from '../rewards-store/model';

// FIXED: Create a sprite map for easy lookup
const spriteMap = {
  husky: {
    neutral: {
      idle: huskyNeutralIdle,
      walking: huskyNeutralWalking,
      celebrating: huskyNeutralCelebrating,
      sleeping: huskyNeutralSleeping,
      eating: huskyNeutralEating,
    },
    happy: {
      idle: huskyHappyIdle,
      walking: huskyHappyWalking,
      celebrating: huskyHappyCelebrating,
      sleeping: huskyHappySleeping,
      eating: huskyHappyEating,
    },
    sad: {
      idle: huskySadIdle,
      walking: huskySadWalking,
      celebrating: huskySadCelebrating,
      sleeping: huskySadSleeping,
      eating: huskySadEating,
    },
    excited: {
      idle: huskyExcitedIdle,
      walking: huskyExcitedWalking,
      celebrating: huskyExcitedCelebrating,
      sleeping: huskyExcitedSleeping,
      eating: huskyExcitedEating,
    },
    tired: {
      idle: huskyTiredIdle,
      walking: huskyTiredWalking,
      celebrating: huskyTiredCelebrating,
      sleeping: huskyTiredSleeping,
      eating: huskyTiredEating,
    },
  },
};

// Create a singleton instance of the controller
// This will persist even when components unmount and remount
let controllerInstance: PetController | null = null;
let isInitialized = false;

// Keep a cached copy of the last known pet state to prevent loading flicker
let cachedPetId: PetId | null = null;
let cachedPetState: PetState | null = null;

// Function to get or create the controller instance
const getControllerInstance = (
  callback: (petId: PetId, state: PetState) => void,
): PetController => {
  if (!controllerInstance) {
    console.log('Creating new PetController instance (singleton)');
    controllerInstance = new PetController(callback);
  } else {
    console.log('Reusing existing PetController instance');
    // Update the callback in the existing controller
    controllerInstance.updateCallback(callback);

    // If we have cached state, immediately apply it
    if (cachedPetId && cachedPetState) {
      // Use setTimeout to ensure this happens after state initialization
      setTimeout(() => {
        callback(cachedPetId as PetId, cachedPetState as PetState);
      }, 0);
    }
  }
  return controllerInstance;
};

// Local force update hook
function useForceUpdate() {
  const [, setTick] = useState(0);
  return () => setTick(tick => tick + 1);
}

export default function PetView({
  showInfoPanel = true,
  draggable = true,
  lockedPosition,
  dragLayer = true,
  hideSprite = false,
}: {
  showInfoPanel?: boolean;
  draggable?: boolean;
  lockedPosition?: {x: number; y: number};
  dragLayer?: boolean;
  hideSprite?: boolean;
}) {
  // Store the active pet and state
  const [petId, setPetId] = useState<string | undefined>(undefined);
  const [petState, setPetState] = useState<any>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize sound effects
  useSoundEffects(); // Preload all sounds
  const SOUND_EFFECTS = useRef(createSoundEffects()).current;

  // Track interaction cooldowns
  const [interactionCooldowns, setInteractionCooldowns] = useState<{
    [key: string]: number;
  }>({
    feed: 0,
    play: 0,
    groom: 0,
  });

  // State for pet position dragging
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({x: 0, y: 0});

  // State for wheel menu
  const [showWheelMenu, setShowWheelMenu] = useState(false);

  // State for hover metrics
  const [isHovering, setIsHovering] = useState(false);

  // State for automatic care
  const [autoCareEnabled, setAutoCareEnabled] = useState(false);

  // State for error display
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Pet element ref for position calculations
  const petElementRef = useRef<HTMLDivElement>(null);

  // Busy status ref to track if pet is in middle of animation
  const isBusyRef = useRef(false);

  // Real-time equipped accessory sync
  const forceUpdate = useForceUpdate();
  useEffect(() => {
    const handler = async () => {
      await store.reloadEquippedFromDB();
      forceUpdate();
    };
    (window.electronAPI as any)?.onEquippedUpdated?.(handler);
    return () => {
      (window.electronAPI as any)?.removeEquippedUpdatedListener?.(handler);
    };
  }, []);

  // Fetch pet state and subscribe to updates
  useEffect(() => {
    setIsLoading(true);
    (window.electronAPI as any).getPetState().then((pets: any[]) => {
      if (pets.length > 0) {
        setPetId(pets[0].id);
        setPetState({...pets[0]});
        setIsLoading(false);
        console.log('[Renderer] Initial petId:', pets[0].id, 'petState:', pets[0]);
      }
    });
    const updateHandler = (pets: any[]) => {
      if (pets.length > 0) {
        handlePetUpdate(pets[0].id, pets[0]);
      }
    };
    (window.electronAPI as any).onPetStateUpdate(updateHandler);
    return () => {
      (window.electronAPI as any).removePetStateUpdateListener(updateHandler);
    };
  }, []);

  // Create a state update handler that also caches the state
  const handlePetUpdate = useCallback(
    (updatedPetId: string, state: any) => {
      setPetId(updatedPetId);
      setPetState({...state});
      setIsLoading(false);
      // No cache needed, all state is from main process
      if (state.animation !== 'idle') {
        isBusyRef.current = true;
      } else {
        isBusyRef.current = false;
      }
    },
    []
  );

  // Update cooldowns
  useEffect(() => {
    const interval = setInterval(() => {
      setInteractionCooldowns(prev => {
        const newCooldowns = {...prev};
        Object.keys(newCooldowns).forEach(key => {
          if (newCooldowns[key] > 0) {
            newCooldowns[key] = Math.max(0, newCooldowns[key] - 1000);
          }
        });
        return newCooldowns;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Set up keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!petId) return;
      switch (e.key.toLowerCase()) {
        case 'f':
          handleInteraction('feed');
          break;
        case 'p':
          handleInteraction('play');
          break;
        case 'g':
          handleInteraction('groom');
          break;
        case 'escape':
          setShowWheelMenu(false);
          break;
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [petId]);

  // Auto-care timer
  useEffect(() => {
    if (!autoCareEnabled) return;
    const autoInterval = setInterval(
      () => {
        if (!petId || !petState) return;
        if (petState.happiness < 50) {
          handleInteraction('play');
        }
        if (petState.energy < 50) {
          handleInteraction('feed');
        }
        if (petState.cleanliness < 50) {
          handleInteraction('groom');
        }
      },
      5 * 60 * 1000,
    );
    return () => clearInterval(autoInterval);
  }, [autoCareEnabled, petId, petState]);

  // Handle pet interactions
  const handleInteraction = (
    type: 'feed' | 'play' | 'groom',
    bypassBusyCheck = false,
  ) => {
    console.log('[Renderer] Interaction:', type, 'petId:', petId);
    if (!petId || interactionCooldowns[type] > 0) {
      try {
        SOUND_EFFECTS.error.play();
      } catch (e) {
        console.warn('Error playing sound:', e);
      }
      return;
    }
    if (isBusyRef.current && !bypassBusyCheck) {
      setErrorMessage('Pet is busy! Try again later.');
      setTimeout(() => setErrorMessage(null), 2000);
      return;
    }
    try {
      switch (type) {
        case 'feed':
          (window.electronAPI as any).feedPet(petId);
          try {
            SOUND_EFFECTS.feed.play();
          } catch (e) {
            console.warn('Error playing feed sound:', e);
          }
          break;
        case 'play':
          (window.electronAPI as any).playPet(petId);
          try {
            SOUND_EFFECTS.play.play();
          } catch (e) {
            console.warn('Error playing play sound:', e);
          }
          break;
        case 'groom':
          (window.electronAPI as any).groomPet(petId);
          try {
            SOUND_EFFECTS.groom.play();
          } catch (e) {
            console.warn('Error playing groom sound:', e);
          }
          break;
      }
    } catch (e) {
      console.error('Error performing interaction:', e);
      setErrorMessage('Error performing interaction!');
      setTimeout(() => setErrorMessage(null), 3000);
      try {
        SOUND_EFFECTS.error.play();
      } catch (e) {
        console.warn('Error playing play sound:', e);
      }
      return;
    }
    const cooldownTime = {
      feed: 0.1 * 60 * 1000,
      play: 0.1 * 60 * 1000,
      groom: 0.1 * 60 * 1000,
    }[type];
    setInteractionCooldowns(prev => ({
      ...prev,
      [type]: cooldownTime,
    }));
    setShowWheelMenu(false);
  };

  // Handle the pet sprite being clicked (open wheel menu)
  const handlePetClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isDragging) return;
    setShowWheelMenu(prev => !prev);
  };

  // Handle pet mouse down for dragging
  const handlePetMouseDown = (e: React.MouseEvent) => {
    if (!draggable || !petElementRef.current || !petState) return;
    e.preventDefault();
    const rect = petElementRef.current.getBoundingClientRect();
    const offsetX = e.clientX - (petState.position.x + rect.width / 2);
    const offsetY = e.clientY - (petState.position.y + rect.height / 2);
    setDragOffset({x: offsetX, y: offsetY});
    setIsDragging(true);
  };

  // Handle mouse move for dragging
  useEffect(() => {
    let globalSelectStartHandler: ((e: Event) => void) | null = null;
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !petId) return;
      e.preventDefault();
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      (window.electronAPI as any).movePet(petId, newX, newY);
    };
    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };
    if (isDragging && draggable) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      globalSelectStartHandler = (e: Event) => e.preventDefault();
      document.addEventListener('selectstart', globalSelectStartHandler);
      document.body.style.userSelect = 'none';
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, petId]);

  // Simulate completing a Pomodoro session
  const handleCompletePomo = () => {
    // TODO: Implement if needed
  };

  // Simulate completing a task
  const handleCompleteTask = () => {
    // TODO: Implement if needed
  };

  // Handle hover state for showing metrics
  const handlePetMouseEnter = () => {
    setIsHovering(true);
  };

  const handlePetMouseLeave = () => {
    setIsHovering(false);
  };

  // Toggle auto-care
  const toggleAutoCare = () => {
    setAutoCareEnabled(prev => !prev);
  };

  if (isLoading || !petState) {
    return <div className="pet-loading">Loading pet...</div>;
  }

  // FIXED: Get sprite path using the imported image map
  let spritePath = petImg; // default fallback
  try {
    // Try to get sprite from our map first
    const species = (petState as any).species;
    const mood = (petState as any).mood;
    const animation = (petState as any).animation;
    const spriteMapAny = spriteMap as any;
    if (
      spriteMapAny[species] &&
      spriteMapAny[species][mood] &&
      spriteMapAny[species][mood][animation]
    ) {
      spritePath = spriteMapAny[species][mood][animation];
      console.log('Using imported sprite:', spritePath);
    } else if (typeof getPetSpritePath === 'function') {
      const path = getPetSpritePath(species, mood, animation);
      if (path) spritePath = path;
    }
    console.log('Pet state:', {
      species,
      mood,
      animation,
    });
  } catch (e) {
    console.warn('Error getting pet sprite:', e);
  }

  const handleOpenPet = () => {
    (window.electronAPI as any).openPetWindow();
  };

  // Otherwise, render the pet...
  return (
    <div className="pet-container">
      {/* Pet sprite that can be positioned anywhere */}
      {/* This div creates the drag for the window of the pet interaction*/}
      <>
        {!hideSprite && (
          <div
            ref={petElementRef}
            className={`pet-sprite mood-${petState.mood} ${petState.animation} no-drag ${isDragging && draggable ? 'dragging' : ''}`}
            style={{
              position: 'absolute',
              left: `${lockedPosition?.x ?? petState.position.x}px`,
              top: `${lockedPosition?.y ?? petState.position.y}px`,
              backgroundImage: `url(${spritePath})`,
              width: '64px',
              height: '64px',
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              zIndex: 100,
              cursor: 'pointer',
            }}
            onClick={handlePetClick}
            onMouseDown={handlePetMouseDown}
            onMouseEnter={handlePetMouseEnter}
            onMouseLeave={handlePetMouseLeave}
          >
            {/* Render pet accessories if any */}
            {store.equipped.accessory?.image && (
              <img
                src={store.equipped.accessory.image}
                alt="Accessory"
                style={{
                  position: 'absolute',
                  top: '-10px',
                  left: '10px',
                  width: '40px',
                  height: '40px',
                  objectFit: 'contain',
                  zIndex: 2,
                  pointerEvents: 'none',
                }}
              />
            )}
            {/* Hover metrics display */}
            {isHovering && (
              <div
                className="pet-hover-metrics"
                style={{
                  position: 'absolute',
                  top: '-60px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'rgba(0,0,0,0.7)',
                  color: 'white',
                  padding: '5px',
                  borderRadius: '5px',
                  width: 'auto',
                  whiteSpace: 'nowrap',
                }}
              >
                <div className="metric">💖 {Math.round(petState.happiness)}%</div>
                <div className="metric">⚡ {Math.round(petState.energy)}%</div>
                <div className="metric">
                  ✨ {Math.round(petState.cleanliness)}%
                </div>
              </div>
            )}
            {/* Wheel menu for interactions */}
            {showWheelMenu && (
              <div
                className="pet-wheel-menu"
                style={{
                  position: 'absolute',
                  top: '70px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '5px',
                  zIndex: 1001,
                }}
              >
                <button
                  className={`wheel-option wheel-feed ${interactionCooldowns.feed > 0 ? 'disabled' : ''}`}
                  onClick={() => handleInteraction('feed')}
                  disabled={interactionCooldowns.feed > 0}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '5px 10px',
                    background:
                      interactionCooldowns.feed > 0 ? '#ccc' : '#f5a742',
                    border: 'none',
                    borderRadius: '15px',
                    cursor:
                      interactionCooldowns.feed > 0 ? 'not-allowed' : 'pointer',
                  }}
                >
                  <span className="wheel-icon">🍔</span>
                  <span className="wheel-label">Feed</span>
                </button>
                <button
                  className={`wheel-option wheel-play ${interactionCooldowns.play > 0 ? 'disabled' : ''}`}
                  onClick={() => handleInteraction('play')}
                  disabled={interactionCooldowns.play > 0}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '5px 10px',
                    background:
                      interactionCooldowns.play > 0 ? '#ccc' : '#42aef5',
                    border: 'none',
                    borderRadius: '15px',
                    cursor:
                      interactionCooldowns.play > 0 ? 'not-allowed' : 'pointer',
                  }}
                >
                  <span className="wheel-icon">🎮</span>
                  <span className="wheel-label">Play</span>
                </button>
                <button
                  className={`wheel-option wheel-groom ${interactionCooldowns.groom > 0 ? 'disabled' : ''}`}
                  onClick={() => handleInteraction('groom')}
                  disabled={interactionCooldowns.groom > 0}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '5px 10px',
                    background:
                      interactionCooldowns.groom > 0 ? '#ccc' : '#42f5a4',
                    border: 'none',
                    borderRadius: '15px',
                    cursor:
                      interactionCooldowns.groom > 0 ? 'not-allowed' : 'pointer',
                  }}
                >
                  <span className="wheel-icon">🧼</span>
                  <span className="wheel-label">Groom</span>
                </button>
              </div>
            )}
          </div>
        )}
      </>

      {/* Error message display */}
      {errorMessage && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            pointerEvents: 'none',
            zIndex: 1000,
          }}
        >
          <div
            className="pet-error-message"
            style={{
              marginBottom: '24px',
              background: 'rgba(255, 140, 0, 0.85)',
              color: 'white',
              padding: '2px 10px',
              borderRadius: '12px',
              fontSize: '12px',
              display: 'inline-block',
              lineHeight: 1.2,
              textAlign: 'center',
              pointerEvents: 'none',
              boxShadow: '0 1px 4px rgba(0,0,0,0.10)',
            }}
          >
            {errorMessage}
          </div>
        </div>
      )}

      {/* Info panel with pet stats and controls */}
      {showInfoPanel && (
        <div className="pet-info-panel">
          <h3>{petState.name}</h3>
          <div className="pet-mood">
            <span>Mood: </span>
            <span className={`mood-indicator mood-${petState.mood}`}>
              {petState.mood}
            </span>
          </div>
          <div className="pet-stats">
            <div className="stat-row">
              <span className="stat-label">Happiness:</span>
              <div className="stat-bar">
                <div
                  className="stat-fill happiness"
                  style={{width: `${petState.happiness}%`}}
                />
              </div>
              <span className="stat-value">
                {Math.round(petState.happiness)}%
              </span>
            </div>

            <div className="stat-row">
              <span className="stat-label">Energy:</span>
              <div className="stat-bar">
                <div
                  className="stat-fill energy"
                  style={{width: `${petState.energy}%`}}
                />
              </div>
              <span className="stat-value">{Math.round(petState.energy)}%</span>
            </div>

            <div className="stat-row">
              <span className="stat-label">Cleanliness:</span>
              <div className="stat-bar">
                <div
                  className="stat-fill cleanliness"
                  style={{width: `${petState.cleanliness}%`}}
                />
              </div>
              <span className="stat-value">
                {Math.round(petState.cleanliness)}%
              </span>
            </div>
          </div>{' '}
          {/* FIXED: Added missing closing bracket for pet-stats div */}
          <div className="pet-status">
            <div>
              Last interaction:{' '}
              {new Date(petState.lastInteraction).toLocaleTimeString()}
            </div>
          </div>
          <div className="pet-actions">
            <h4>Interactions</h4>
            <div className="action-row">
              <button
                className="action-button"
                onClick={() => handleInteraction('feed')}
                disabled={interactionCooldowns.feed > 0}
              >
                {interactionCooldowns.feed > 0
                  ? `Feed (${Math.ceil(interactionCooldowns.feed / 60000)}m)`
                  : 'Feed (F)'}
              </button>
              <button
                className="action-button"
                onClick={() => handleInteraction('play')}
                disabled={interactionCooldowns.play > 0}
              >
                {interactionCooldowns.play > 0
                  ? `Play (${Math.ceil(interactionCooldowns.play / 60000)}m)`
                  : 'Play (P)'}
              </button>
              <button
                className="action-button"
                onClick={() => handleInteraction('groom')}
                disabled={interactionCooldowns.groom > 0}
              >
                {interactionCooldowns.groom > 0
                  ? `Groom (${Math.ceil(interactionCooldowns.groom / 60000)}m)`
                  : 'Groom (G)'}
              </button>
            </div>
          </div>
          <div className="pet-settings">
            <h4>Settings</h4>
            <div className="setting-row">
              <label htmlFor="auto-care" className="setting-label">
                Auto-care during study:
              </label>
              <input
                id="auto-care"
                type="checkbox"
                checked={autoCareEnabled}
                onChange={toggleAutoCare}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
