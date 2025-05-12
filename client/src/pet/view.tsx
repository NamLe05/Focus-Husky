import {useState, useEffect, useRef } from 'react';
import petImg from '../Static/pet.png';

import {PetController} from './controller';
import {PetId, PetState} from './model';

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

  // Create new instance of controller
  // Done: Controller should have a singleton instance.
  // Use ref to maintain a single controller instance across renders
  const controllerRef = useRef<PetController | null>(null);

  // For now, we will manually create a pet every time, but this should be loaded automatically.
  useEffect(() => { 
    // Create controller with callback for state updates
    const handlePetUpdate = (updatedPetId: PetId, state: PetState) => {
      setPetId(updatedPetId);
      setPetState({...state});
    };
    
    // Create controller instance if it doesn't exist
    if (!controllerRef.current) {
      controllerRef.current = new PetController(handlePetUpdate);
    }
    
    // Try to load existing pets
    controllerRef.current.loadPetsFromDatabase();
    
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
  }, []);


  // Handle pet interactions
  const handleInteraction = (type: 'feed' | 'play' | 'groom') => {
    if (!controllerRef.current || !petId || interactionCooldowns[type] > 0) return;
    
    // Call appropriate controller method
    switch (type) {
      case 'feed':
        controllerRef.current.handleFeedPet(petId);
        break;
      case 'play':
        controllerRef.current.handlePlayWithPet(petId);
        break;
      case 'groom':
        controllerRef.current.handleGroomPet(petId);
        break;
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
  };

  // If no pet is loaded, show a loading sign.
  if (petId === undefined && petState === undefined) {
    return <p>Loading pet...</p>;
  }

  // Otherwise, render the pet...
  return (
    <div id="petFrame">
      <img src={petImg} width="360" />
      <p>
        <b>{petState.name}</b>
      </p>
      <p>Cleanliness: {Math.round(petState.cleanliness)}</p>
      <p>Energy: {Math.round(petState.energy)}</p>
      <p>Happiness: {Math.round(petState.happiness)}</p>
    </div>
  );
}
