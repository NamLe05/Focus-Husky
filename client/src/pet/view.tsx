import {useState, useEffect, useRef, useCallback} from 'react';
import petImg from '../Static/pet.png';

import {PetController} from './controller';
import {PetId, PetState} from './model';
import { getPetSpritePath, getAccessorySpritePath} from './helpers';

// Type for interaction queue
interface QueuedInteraction {
type: 'feed' | 'play' | 'groom';
timestamp: number;
}

// Sound effects
const SOUND_EFFECTS = {
  feed: new Audio('../static/sounds/feed.mp3'),
  play: new Audio('../static/sounds/play.mp3'),
  groom: new Audio('../static/sounds/groom.mp3'),
  error: new Audio('../static/sounds/error.mp3')
};

export default function PetView() {
  // Store the active pet and state
  const [petId, setPetId] = useState<PetId | undefined>(undefined);
  const [petState, setPetState] = useState<PetState | undefined>(undefined);
  

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
    groom: 0
  });

  // Queue for interactions when pet is busy
  const [interactionQueue, setInteractionQueue] = useState<QueuedInteraction[]>([]);
  
  // State for pet position dragging
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

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

  // Create new instance of controller
  // Done: Controller should have a singleton instance.
  // Use ref to maintain a single controller instance across renders
  const controllerRef = useRef<PetController | null>(null);

  // Process any interactions in the queue
  const processNextQueuedInteraction = useCallback(() => {
      if (interactionQueue.length === 0) return;
      
      // Get next interaction
      const [nextInteraction, ...remainingQueue] = interactionQueue;
      setInteractionQueue(remainingQueue);
      
      // Process it
      handleInteraction(nextInteraction.type, true);
    }, [interactionQueue]);
    
  // For now, we will manually create a pet every time, but this should be loaded automatically.
  useEffect(() => { 
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
  }, [petId]);

  // Update cooldowns
    useEffect(() => {
      const interval = setInterval(() => {
        setInteractionCooldowns(prev => {
          const newCooldowns = { ...prev };
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
    
    // Automatically take care of pet every 30 minutes
    const autoInterval = setInterval(() => {
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
    }, 30 * 60 * 1000);
    
    return () => clearInterval(autoInterval);
  }, [autoCareEnabled, petId, petState]);
  
  // Queue an interaction when pet is busy
  const queueInteraction = (type: 'feed' | 'play' | 'groom') => {
    const newInteraction = {
      type,
      timestamp: Date.now()
    };
    
    setInteractionQueue(prev => [...prev, newInteraction]);
  };
  
  // Handle pet interactions
  const handleInteraction = (type: 'feed' | 'play' | 'groom', bypassBusyCheck = false) => {
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
      setErrorMessage("Pet is busy! Interaction queued for later.");
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }
    
    // Call appropriate controller method
    try {
      switch (type) {
        case 'feed':
          controllerRef.current.handleFeedPet(petId);
          try { SOUND_EFFECTS.feed.play(); } catch (e) {}
          break;
        case 'play':
          controllerRef.current.handlePlayWithPet(petId);
          try { SOUND_EFFECTS.play.play(); } catch (e) {}
          break;
        case 'groom':
          controllerRef.current.handleGroomPet(petId);
          try { SOUND_EFFECTS.groom.play(); } catch (e) {}
          break;
      }
    } catch (e) {
      console.error('Error performing interaction:', e);
      setErrorMessage("Error performing interaction!");
      setTimeout(() => setErrorMessage(null), 3000);
      try { SOUND_EFFECTS.error.play(); } catch (e) {}
      return;
    }
    
    // Set cooldown
    const cooldownTime = {
      feed: 30 * 60 * 1000, // 30 minutes
      play: 10 * 60 * 1000, // 10 minutes
      groom: 60 * 60 * 1000  // 1 hour
    }[type];
    
    setInteractionCooldowns(prev => ({
      ...prev,
      [type]: cooldownTime
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
      
      // Calculate offset from cursor to pet center
      const rect = petElementRef.current.getBoundingClientRect();
      const offsetX = e.clientX - (petState.position.x + rect.width / 2);
      const offsetY = e.clientY - (petState.position.y + rect.height / 2);
      
      setDragOffset({ x: offsetX, y: offsetY });
      setIsDragging(true);
    };
    
    // Handle mouse move for dragging
    useEffect(() => {
      const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging || !controllerRef.current || !petId) return;
        
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
    
    // Get sprite path (or use default image if not available)
    let spritePath = petImg;
    try {
      if (typeof getPetSpritePath === 'function') {
        const path = getPetSpritePath(petState.species, petState.mood, petState.animation);
        if (path) spritePath = path;
      }
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
              position: 'absolute', /* FIXED: Added absolute positioning */
              left: `${petState.position.x}px`, /* FIXED: Use left/top instead of transform */
              top: `${petState.position.y}px`,
              backgroundImage: `url(${spritePath})`,
              width: '64px', /* FIXED: Added explicit width and height */
              height: '64px',
              backgroundSize: 'contain', /* FIXED: Ensure sprite fits */
              backgroundRepeat: 'no-repeat',
              zIndex: 100, /* FIXED: Ensure sprite is visible above other elements */
              cursor: 'pointer' /* FIXED: Add pointer cursor for better UX */
            }}
            onClick={handlePetClick}
            onMouseDown={handlePetMouseDown}
            onMouseEnter={handlePetMouseEnter}
            onMouseLeave={handlePetMouseLeave}
          >
            {/* Render pet accessories if any */}
            {Array.isArray(petState.accessories) && petState.accessories.map(accessoryId => (
              <div
                key={accessoryId}
                className="pet-accessory"
                style={{
                  backgroundImage: `url(${
                    typeof getAccessorySpritePath === 'function' 
                      ? getAccessorySpritePath(accessoryId) 
                      : ''
                  })`
                }}
              />
            ))}
            
            {/* Hover metrics display */}
            {isHovering && (
              <div className="pet-hover-metrics">
                <div className="metric">💖 {Math.round(petState.happiness)}%</div>
                <div className="metric">⚡ {Math.round(petState.energy)}%</div>
                <div className="metric">✨ {Math.round(petState.cleanliness)}%</div>
              </div>
            )}
            
            {/* Wheel menu for interactions */}
            {showWheelMenu && (
              <div className="pet-wheel-menu">
                <button 
                  className={`wheel-option wheel-feed ${interactionCooldowns.feed > 0 ? 'disabled' : ''}`}
                  onClick={() => handleInteraction('feed')}
                  disabled={interactionCooldowns.feed > 0}
                >
                  <span className="wheel-icon">🍔</span>
                  <span className="wheel-label">Feed</span>
                </button>
                <button 
                  className={`wheel-option wheel-play ${interactionCooldowns.play > 0 ? 'disabled' : ''}`}
                  onClick={() => handleInteraction('play')}
                  disabled={interactionCooldowns.play > 0}
                >
                  <span className="wheel-icon">🎮</span>
                  <span className="wheel-label">Play</span>
                </button>
                <button 
                  className={`wheel-option wheel-groom ${interactionCooldowns.groom > 0 ? 'disabled' : ''}`}
                  onClick={() => handleInteraction('groom')}
                  disabled={interactionCooldowns.groom > 0}
                >
                  <span className="wheel-icon">🧼</span>
                  <span className="wheel-label">Groom</span>
                </button>
              </div>
            )}
          </div>
    
          {/* Error message display */}
          {errorMessage && (
            <div className="pet-error-message">
              {errorMessage}
            </div>
          )}
    
          {/* Info panel with pet stats and controls */}
          <div className="pet-info-panel">
            <h3>{petState.name}</h3>
            <div className="pet-mood">
              <span>Mood: </span>
              <span className={`mood-indicator mood-${petState.mood}`}>{petState.mood}</span>
            </div>
            
            <div className="pet-stats">
              <div className="stat-row">
                <span className="stat-label">Happiness:</span>
                <div className="stat-bar">
                  <div 
                    className="stat-fill happiness" 
                    style={{ width: `${petState.happiness}%` }}
                  />
                </div>
                <span className="stat-value">{Math.round(petState.happiness)}%</span>
              </div>
              
              <div className="stat-row">
                <span className="stat-label">Energy:</span>
                <div className="stat-bar">
                  <div 
                    className="stat-fill energy" 
                    style={{ width: `${petState.energy}%` }}
                  />
                </div>
                <span className="stat-value">{Math.round(petState.energy)}%</span>
              </div>
              
              <div className="stat-row">
                <span className="stat-label">Cleanliness:</span>
                <div className="stat-bar">
                  <div 
                    className="stat-fill cleanliness" 
                    style={{ width: `${petState.cleanliness}%` }}
                  />
                </div>
                <span className="stat-value">{Math.round(petState.cleanliness)}%</span>
              </div>
            </div>
            
            <div className="pet-status">
              <div>Last interaction: {new Date(petState.lastInteraction).toLocaleTimeString()}</div>
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
