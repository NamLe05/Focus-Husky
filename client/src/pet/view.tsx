import {useState, useEffect} from 'react';
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

  // Create new instance of controller
  // TODO: Controller should have a singleton instance.
  const controller = new PetController(viewUpdateCallback);

  // For now, we will manually create a pet every time, but this should be loaded automatically.
  useEffect(() => {
    controller.handleCreatePet('Dubs', 'husky');
  }, []);

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
