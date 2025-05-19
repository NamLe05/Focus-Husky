import {useState, useEffect, useRef, useCallback} from 'react';
import petImg from '../Static/pet.png';

import {PetController} from './controller';
import {PetId, PetState} from './model';
import {getPetSpritePath, getAccessorySpritePath} from './helpers';

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

// Type for interaction queue
interface QueuedInteraction {
  type: 'feed' | 'play' | 'groom';
  timestamp: number;
}

// Sound effects
// Currently set to only printing message because audio not recognized
const SOUND_EFFECTS = {
  feed: {play: () => console.log('Feed sound played')},
  play: {play: () => console.log('Play sound played')},
  groom: {play: () => console.log('Groom sound played')},
  error: {play: () => console.log('Error sound played')},
};

export default function PetView() {
  // Store the active pet and state
  const [petId, setPetId] = useState<PetId | undefined>(undefined);
  const [petState, setPetState] = useState<PetState | undefined>(undefined);

  // Track if component has initialized
  const hasInitializedRef = useRef(false);

  // Respond to any callback from the controller
  const viewUpdateCallback = (petId: PetId, state: PetState) => {
    setPetId(petId);
    setPetState({...state});
  };

  // Track interaction cooldowns
  const [interactionCooldowns, setInteractionCooldowns] = useState<{
    [key: string]: number;
  }>({
    feed: 0,
    play: 0,
    groom: 0,
  });

  // Queue for interactions when pet is busy
  const [interactionQueue, setInteractionQueue] = useState<QueuedInteraction[]>(
    [],
  ); // FIXED: Added missing closing bracket

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

  // Process any interactions in the queue
  const processNextQueuedInteraction = useCallback(() => {
    if (interactionQueue.length === 0) return;

    // Get next interaction
    const [nextInteraction, ...remainingQueue] = interactionQueue;
    setInteractionQueue(remainingQueue);

    // Process it
    handleInteraction(nextInteraction.type, true);
  }, [interactionQueue]);

  // Create new instance of controller
  // Done: Controller should have a singleton instance.
  // Use ref to maintain a single controller instance across renders
  const controllerRef = useRef<PetController | null>(null);

  // FIXED: Split the useEffect for initialization and state updates
  // Initialize controller and pet once on component mount
  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    // Create controller with callback for state updates
    const handlePetUpdate = (updatedPetId: PetId, state: PetState) => {
      setPetId(updatedPetId);
      setPetState({...state});

      // Check if pet was previously busy but now idle
      if (isBusyRef.current && state.animation === 'idle') {
        isBusyRef.current = false;

        // Process any queued interactions
        processNextQueuedInteraction();
      }

      // Update busy status based on animation
      if (state.animation !== 'idle') {
        isBusyRef.current = true;
      }
    };

    // Create controller instance if it doesn't exist
    if (!controllerRef.current) {
      controllerRef.current = new PetController(handlePetUpdate);
      // Try to load existing pets
      controllerRef.current.loadPetsFromDatabase();
    }

    // If no pets were loaded, create a default one
    setTimeout(() => {
      if (!petId && controllerRef.current) {
        controllerRef.current.handleCreatePet('Dubs', 'husky');
      }
    }, 500);

    // Clean up controller on unmount
    return () => {
      if (controllerRef.current) {
        controllerRef.current.destroy();
        controllerRef.current = null;
      }
    };
  }, []); // FIXED: Empty dependency array - only run once on mount

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
        case 'f': // Feed
          handleInteraction('feed');
          break;
        case 'p': // Play
          handleInteraction('play');
          break;
        case 'g': // Groom
          handleInteraction('groom');
          break;
        case 'escape': // Close wheel menu
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

    // Automatically take care of pet every 5 minutes
    const autoInterval = setInterval(
      () => {
        if (!petId || !petState) return;

        // Check if pet needs care
        if (petState.happiness < 50) {
          queueInteraction('play');
        }
        if (petState.energy < 50) {
          queueInteraction('feed');
        }
        if (petState.cleanliness < 50) {
          queueInteraction('groom');
        }
      },
      5 * 60 * 1000,
    );

    return () => clearInterval(autoInterval);
  }, [autoCareEnabled, petId, petState]);

  // Queue an interaction when pet is busy
  const queueInteraction = (type: 'feed' | 'play' | 'groom') => {
    const newInteraction = {
      type,
      timestamp: Date.now(),
    };

    setInteractionQueue(prev => [...prev, newInteraction]);
  };

  // Handle pet interactions
  const handleInteraction = (
    type: 'feed' | 'play' | 'groom',
    bypassBusyCheck = false,
  ) => {
    if (!controllerRef.current || !petId || interactionCooldowns[type] > 0) {
      // Play error sound if on cooldown
      try {
        SOUND_EFFECTS.error.play();
      } catch (e) {
        console.warn('Error playing sound:', e);
      }
      return;
    }

    // Check if pet is busy
    if (isBusyRef.current && !bypassBusyCheck) {
      // Queue the interaction for later
      queueInteraction(type);
      setErrorMessage('Pet is busy! Interaction queued for later.');
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

    // Call appropriate controller method
    try {
      switch (type) {
        case 'feed':
          controllerRef.current.handleFeedPet(petId);
          try {
            SOUND_EFFECTS.feed.play();
          } catch (e) {
            console.warn('Error playing feed sound:', e);
          }
          break;
        case 'play':
          controllerRef.current.handlePlayWithPet(petId);
          try {
            SOUND_EFFECTS.play.play();
          } catch (e) {
            console.warn('Error playing play sound:', e);
          }
          break;
        case 'groom':
          controllerRef.current.handleGroomPet(petId);
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

    // Set cooldown
    const cooldownTime = {
      feed: 0.1 * 60 * 1000, // 6 seconds
      play: 0.1 * 60 * 1000, // 6 seconds
      groom: 0.1 * 60 * 1000, // 6 seconds
    }[type];

    setInteractionCooldowns(prev => ({
      ...prev,
      [type]: cooldownTime,
    }));

    // Close wheel menu after interaction
    setShowWheelMenu(false);
  };

  // Handle the pet sprite being clicked (open wheel menu)
  const handlePetClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isDragging) return; // Don't show menu if we were dragging

    // Toggle wheel menu
    setShowWheelMenu(prev => !prev);
  };

  // Handle pet mouse down for dragging
  const handlePetMouseDown = (e: React.MouseEvent) => {
    if (!petElementRef.current || !petState) return;

    // Prevent default broswer behavior (Added to prevent text selection)
    e.preventDefault();

    // Calculate offset from cursor to pet center
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
      if (!isDragging || !controllerRef.current || !petId) return;

      // Prevent default broswer behavior (Added to prevent text selection)
      e.preventDefault();

      // Calculate new position
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;

      // Update pet position
      controllerRef.current.handleMovePet(petId, newX, newY);
    };

    // Handle mouse up to stop dragging
    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);

      // Add global selectstart prevention while dragging
      globalSelectStartHandler = (e: Event) => e.preventDefault();
      document.addEventListener('selectstart', globalSelectStartHandler);

      // Add user-select none to body while dragging
      document.body.style.userSelect = 'none';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, petId]);

  // Simulate completing a Pomodoro session
  const handleCompletePomo = () => {
    if (controllerRef.current && petId) {
      controllerRef.current.handlePomodoroCompleted(petId);
    }
  };

  // Simulate completing a task
  const handleCompleteTask = () => {
    if (controllerRef.current && petId) {
      controllerRef.current.handleTaskCompleted(petId);
    }
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

  // If pet not loaded yet, show loading state
  if (!petState) {
    return <div className="pet-loading">Loading pet...</div>;
  }

  // FIXED: Get sprite path using the imported image map
  let spritePath = petImg; // default fallback
  try {
    // Try to get sprite from our map first
    if (
      spriteMap[petState.species] &&
      spriteMap[petState.species][petState.mood] &&
      spriteMap[petState.species][petState.mood][petState.animation]
    ) {
      spritePath =
        spriteMap[petState.species][petState.mood][petState.animation];
      console.log('Using imported sprite:', spritePath);
    }
    // Fallback to the helper function if sprite not in our map
    else if (typeof getPetSpritePath === 'function') {
      const path = getPetSpritePath(
        petState.species,
        petState.mood,
        petState.animation,
      );
      if (path) spritePath = path;
    }

    // Log debug info
    console.log('Pet state:', {
      species: petState.species,
      mood: petState.mood,
      animation: petState.animation,
    });
  } catch (e) {
    console.warn('Error getting pet sprite:', e);
  }

  // Otherwise, render the pet...
  return (
    <div className="pet-container">
      {/* Pet sprite that can be positioned anywhere */}
      <div
        ref={petElementRef}
        className={`pet-sprite mood-${petState.mood} ${petState.animation} ${isDragging ? 'dragging' : ''}`}
        style={{
          position: 'absolute' /* FIXED: Added absolute positioning */,
          left: `${petState.position.x}px` /* FIXED: Use left/top instead of transform */,
          top: `${petState.position.y}px`,
          backgroundImage: `url(${spritePath})`,
          width: '64px' /* FIXED: Added explicit width and height */,
          height: '64px',
          backgroundSize: 'contain' /* FIXED: Ensure sprite fits */,
          backgroundRepeat: 'no-repeat',
          zIndex: 100 /* FIXED: Ensure sprite is visible above other elements */,
          cursor: 'pointer' /* FIXED: Add pointer cursor for better UX */,
        }}
        onClick={handlePetClick}
        onMouseDown={handlePetMouseDown}
        onMouseEnter={handlePetMouseEnter}
        onMouseLeave={handlePetMouseLeave}
      >
        {/* Render pet accessories if any */}
        {Array.isArray(petState.accessories) &&
          petState.accessories.map(accessoryId => (
            <div
              key={accessoryId}
              className="pet-accessory"
              style={{
                position:
                  'absolute' /* FIXED: Added absolute positioning for accessories */,
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundImage: `url(${
                  typeof getAccessorySpritePath === 'function'
                    ? getAccessorySpritePath(accessoryId)
                    : ''
                })`,
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
              }}
            />
          ))}

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
            <div className="metric">✨ {Math.round(petState.cleanliness)}%</div>
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
                background: interactionCooldowns.feed > 0 ? '#ccc' : '#f5a742',
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
                background: interactionCooldowns.play > 0 ? '#ccc' : '#42aef5',
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
                background: interactionCooldowns.groom > 0 ? '#ccc' : '#42f5a4',
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

      {/* Error message display */}
      {errorMessage && (
        <div
          className="pet-error-message"
          style={{
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(255,0,0,0.7)',
            color: 'white',
            padding: '10px',
            borderRadius: '5px',
            zIndex: 1000,
          }}
        >
          {errorMessage}
        </div>
      )}

      {/* Info panel with pet stats and controls */}
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
        <div className="productivity-actions">
          <h4>Productivity Actions</h4>
          <div className="productivity-buttons">
            <button
              className="action-button primary"
              onClick={handleCompletePomo}
            >
              Complete Pomodoro
            </button>
            <button
              className="action-button primary"
              onClick={handleCompleteTask}
            >
              Complete Task
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
        {interactionQueue.length > 0 && (
          <div className="queued-interactions">
            <h4>Queued Interactions: {interactionQueue.length}</h4>
            <button
              className="action-button"
              onClick={processNextQueuedInteraction}
              disabled={isBusyRef.current}
            >
              Process Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
