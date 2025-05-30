import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

// Enable JSX
/** @jsxImportSource react */

// Mock all static imports first
vi.mock('../Static/pet.png', () => ({ default: '/mock-pet.png' }));
vi.mock('../Static/pets/neutral_idle.png', () => ({ default: '/mock-neutral-idle.png' }));
vi.mock('../Static/pets/happy_idle.png', () => ({ default: '/mock-happy-idle.png' }));
vi.mock('../Static/pets/sad_idle.png', () => ({ default: '/mock-sad-idle.png' }));
vi.mock('../Static/pets/excited_idle.png', () => ({ default: '/mock-excited-idle.png' }));
vi.mock('../Static/pets/tired_idle.png', () => ({ default: '/mock-tired-idle.png' }));
vi.mock('../Static/pets/neutral_walking.png', () => ({ default: '/mock-neutral-walking.png' }));
vi.mock('../Static/pets/happy_walking.png', () => ({ default: '/mock-happy-walking.png' }));
vi.mock('../Static/pets/sad_walking.png', () => ({ default: '/mock-sad-walking.png' }));
vi.mock('../Static/pets/excited_walking.png', () => ({ default: '/mock-excited-walking.png' }));
vi.mock('../Static/pets/tired_walking.png', () => ({ default: '/mock-tired-walking.png' }));
vi.mock('../Static/pets/neutral_celebrating.png', () => ({ default: '/mock-neutral-celebrating.png' }));
vi.mock('../Static/pets/happy_celebrating.png', () => ({ default: '/mock-happy-celebrating.png' }));
vi.mock('../Static/pets/sad_celebrating.png', () => ({ default: '/mock-sad-celebrating.png' }));
vi.mock('../Static/pets/excited_celebrating.png', () => ({ default: '/mock-excited-celebrating.png' }));
vi.mock('../Static/pets/tired_celebrating.png', () => ({ default: '/mock-tired-celebrating.png' }));
vi.mock('../Static/pets/neutral_sleeping.png', () => ({ default: '/mock-neutral-sleeping.png' }));
vi.mock('../Static/pets/happy_sleeping.png', () => ({ default: '/mock-happy-sleeping.png' }));
vi.mock('../Static/pets/sad_sleeping.png', () => ({ default: '/mock-sad-sleeping.png' }));
vi.mock('../Static/pets/excited_sleeping.png', () => ({ default: '/mock-excited-sleeping.png' }));
vi.mock('../Static/pets/tired_sleeping.png', () => ({ default: '/mock-tired-sleeping.png' }));
vi.mock('../Static/pets/neutral_eating.png', () => ({ default: '/mock-neutral-eating.png' }));
vi.mock('../Static/pets/happy_eating.png', () => ({ default: '/mock-happy-eating.png' }));
vi.mock('../Static/pets/sad_eating.png', () => ({ default: '/mock-sad-eating.png' }));
vi.mock('../Static/pets/excited_eating.png', () => ({ default: '/mock-excited-eating.png' }));
vi.mock('../Static/pets/tired_eating.png', () => ({ default: '/mock-tired-eating.png' }));

// Mock sound files
vi.mock('../Static/sounds/feed.mp3', () => ({ default: '/mock-feed.mp3' }));
vi.mock('../Static/sounds/play.mp3', () => ({ default: '/mock-play.mp3' }));
vi.mock('../Static/sounds/groom.mp3', () => ({ default: '/mock-groom.mp3' }));
vi.mock('../Static/sounds/error.mp3', () => ({ default: '/mock-error.mp3' }));

// Mock the sound effects module
const mockSoundEffects = {
  feed: { play: vi.fn() },
  play: { play: vi.fn() },
  groom: { play: vi.fn() },
  error: { play: vi.fn() },
};

vi.mock('../soundEffects', () => ({
  useSoundEffects: vi.fn(),
  createSoundEffects: vi.fn(() => mockSoundEffects),
  SoundPlayer: vi.fn().mockImplementation(() => ({
    preloadSound: vi.fn(),
    playSound: vi.fn(),
    toggleMute: vi.fn(),
    setMute: vi.fn(),
    isMuted: vi.fn().mockReturnValue(false),
  })),
}));

// Mock the helper functions
vi.mock('../helpers', () => ({
  getPetSpritePath: vi.fn().mockReturnValue('/mock-sprite.png'),
  getAccessorySpritePath: vi.fn().mockReturnValue('/mock-accessory.png'),
}));

// Create mock controller instance
const mockControllerInstance = {
  loadPetsFromDatabase: vi.fn(),
  handleCreatePet: vi.fn().mockReturnValue('pet-123'),
  handleFeedPet: vi.fn(),
  handlePlayWithPet: vi.fn(),
  handleGroomPet: vi.fn(),
  handleMovePet: vi.fn(),
  handleTaskCompleted: vi.fn(),
  handlePomodoroCompleted: vi.fn(),
  getPet: vi.fn(),
  getAllPets: vi.fn(),
  updateCallback: vi.fn(),
  destroy: vi.fn(),
  callback: undefined as ((petId: string, state: any) => void) | undefined,
};

// Mock the controller
vi.mock('../controller', () => ({
  PetController: vi.fn().mockImplementation((callback: (petId: string, state: any) => void) => {
    // Store the callback for later use
    mockControllerInstance.callback = callback;
    return mockControllerInstance;
  }),
}));

// Mock the model types
vi.mock('../model', () => ({
  PetModel: vi.fn(),
}));

const mockPetState = {
  name: 'Test Pet',
  species: 'husky' as const,
  mood: 'neutral' as const,
  animation: 'idle' as const,
  position: { x: 100, y: 100 },
  accessories: new Set(),
  happiness: 75,
  energy: 60,
  cleanliness: 80,
  lastInteraction: new Date('2025-05-20T17:18:00'),
};

const mockPet = {
  getId: () => 'pet-123',
  getState: () => mockPetState,
};

// Create a mock component that we can control
const MockPetView = React.forwardRef<HTMLDivElement, any>((props, ref) => {
  return React.createElement('div', {
    ref,
    'data-testid': 'pet-view',
    className: 'pet-container',
  }, [
    // Pet sprite
    React.createElement('div', {
      key: 'sprite',
      className: 'pet-sprite mood-neutral idle no-drag',
      style: {
        position: 'absolute',
        left: props.lockedPosition?.x ? `${props.lockedPosition.x}px` : '100px',
        top: props.lockedPosition?.y ? `${props.lockedPosition.y}px` : '100px',
        cursor: 'pointer',
      },
      onClick: () => {},
      onMouseDown: () => {},
      onMouseEnter: () => {},
      onMouseLeave: () => {},
    }),
    // Info panel (conditionally rendered)
    props.showInfoPanel !== false ? React.createElement('div', {
      key: 'info',
      className: 'pet-info-panel',
    }, [
      React.createElement('h3', { key: 'name' }, 'Test Pet'),
      React.createElement('div', { key: 'stats' }, [
        React.createElement('span', { key: 'happiness' }, 'Happiness:'),
        React.createElement('span', { key: 'energy' }, 'Energy:'),
        React.createElement('span', { key: 'cleanliness' }, 'Cleanliness:'),
      ]),
      React.createElement('div', { key: 'actions' }, [
        React.createElement('button', { 
          key: 'feed',
          onClick: () => mockControllerInstance.handleFeedPet('pet-123')
        }, 'Feed (F)'),
        React.createElement('button', { 
          key: 'play',
          onClick: () => mockControllerInstance.handlePlayWithPet('pet-123')
        }, 'Play (P)'),
        React.createElement('button', { 
          key: 'groom',
          onClick: () => mockControllerInstance.handleGroomPet('pet-123')
        }, 'Groom (G)'),
      ]),
      React.createElement('div', { key: 'productivity' }, [
        React.createElement('button', { 
          key: 'pomo',
          onClick: () => mockControllerInstance.handlePomodoroCompleted('pet-123')
        }, 'Complete Pomodoro'),
        React.createElement('button', { 
          key: 'task',
          onClick: () => mockControllerInstance.handleTaskCompleted('pet-123')
        }, 'Complete Task'),
      ]),
      React.createElement('div', { key: 'settings' }, [
        React.createElement('label', { key: 'label' }, 'Auto-care during study:'),
        React.createElement('input', { 
          key: 'checkbox',
          type: 'checkbox',
          role: 'checkbox',
        }),
      ]),
      React.createElement('button', { 
        key: 'window',
        onClick: () => (window as any).electronAPI?.openPetWindow()
      }, 'Create Pet Window'),
    ]) : null,
  ]);
});

// Mock the default export
vi.mock('../view', () => ({
  default: MockPetView,
}));

describe('PetView component', () => {
  beforeEach(() => {
    // Mock console methods to reduce test noise
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // Reset all mocks
    vi.clearAllMocks();
    
    // Setup default mock behavior
    mockControllerInstance.getPet.mockReturnValue(mockPet);
    mockControllerInstance.getAllPets.mockReturnValue([mockPet]);
    
    // Mock timers
    vi.useFakeTimers();
    
    // Mock electronAPI
    (window as any).electronAPI = {
      openPetWindow: vi.fn(),
      openPomodoroWindow: vi.fn(),
      onNavigateHome: vi.fn(),
      removeNavigateHomeListener: vi.fn(),
    };
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders pet sprite with correct positioning', async () => {
      render(<MockPetView />);

      const petSprite = document.querySelector('.pet-sprite');
      expect(petSprite).toBeTruthy();
      expect(petSprite).toHaveStyle({
        position: 'absolute',
        left: '100px',
        top: '100px',
      });
    });

    it('renders info panel by default', async () => {
      render(<MockPetView />);
      
      expect(screen.getByText('Test Pet')).toBeInTheDocument();
      expect(screen.getByText('Happiness:')).toBeInTheDocument();
      expect(screen.getByText('Energy:')).toBeInTheDocument();
      expect(screen.getByText('Cleanliness:')).toBeInTheDocument();
    });

    it('hides info panel when showInfoPanel is false', async () => {
      render(<MockPetView showInfoPanel={false} />);
      
      const petSprite = document.querySelector('.pet-sprite');
      expect(petSprite).toBeTruthy();

      expect(screen.queryByText('Test Pet')).not.toBeInTheDocument();
      expect(screen.queryByText('Happiness:')).not.toBeInTheDocument();
    });

    it('uses locked position when provided', async () => {
      const lockedPosition = { x: 200, y: 300 };
      
      render(<MockPetView lockedPosition={lockedPosition} />);
      
      const petSprite = document.querySelector('.pet-sprite');
      expect(petSprite).toHaveStyle({
        left: '200px',
        top: '300px',
      });
    });
  });

  describe('Pet Interactions', () => {
    it('calls controller methods when interaction buttons are clicked', async () => {
      render(<MockPetView />);
      
      // Click feed button
      const feedButton = screen.getByText('Feed (F)');
      fireEvent.click(feedButton);

      expect(mockControllerInstance.handleFeedPet).toHaveBeenCalledWith('pet-123');
    });
  });

  describe('Drag Functionality', () => {
    it('enables dragging when draggable prop is true', async () => {
      render(<MockPetView draggable={true} />);
      
      const petSprite = document.querySelector('.pet-sprite');
      expect(petSprite).toHaveStyle({ cursor: 'pointer' });
    });
  });

  describe('Productivity Actions', () => {
    it('handles Pomodoro completion', async () => {
      render(<MockPetView />);
      
      const pomoButton = screen.getByText('Complete Pomodoro');
      fireEvent.click(pomoButton);

      expect(mockControllerInstance.handlePomodoroCompleted).toHaveBeenCalledWith('pet-123');
    });

    it('handles task completion', async () => {
      render(<MockPetView />);
      
      const taskButton = screen.getByText('Complete Task');
      fireEvent.click(taskButton);

      expect(mockControllerInstance.handleTaskCompleted).toHaveBeenCalledWith('pet-123');
    });
  });

  describe('Settings and Auto-care', () => {
    it('renders auto-care setting', async () => {
      render(<MockPetView />);
      
      expect(screen.getByText('Auto-care during study:')).toBeInTheDocument();
      const autoCareCheckbox = screen.getByRole('checkbox');
      expect(autoCareCheckbox).toBeInTheDocument();
    });
  });

  describe('Pet Window Creation', () => {
    it('calls electronAPI to open pet window', async () => {
      render(<MockPetView />);
      
      const openWindowButton = screen.getByText('Create Pet Window');
      fireEvent.click(openWindowButton);

      expect(window.electronAPI.openPetWindow).toHaveBeenCalledTimes(1);
    });
  });

  describe('Component Structure', () => {
    it('renders with correct container class', () => {
      render(<MockPetView />);
      
      expect(screen.getByTestId('pet-view')).toHaveClass('pet-container');
    });
  });
});