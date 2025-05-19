# Developer Guidelines

## How To Obtain The Source Code

All source code are located under the directory: client/src/
Each component (e.g. home-page, pet, pomodoro) is organized into its own subfolder. Located within each subfolder, are the 
the source code for the view, model, and controller files.

## Directory Structure

```text
Focuspet/
├── README.md                     # Documentation
├── client/
     ├── src/                     # Source code
         ├── app.tsx            
         ├── Static/              # Assets      
         ├── home-page/           # home-page view
         ├── pet/                 # Pet view, model, controller, and tests
         ├── pomodoro/            # Pomodoro view, model, controller, and tests
         ├── rewards-store/       # Rewards Store view, model, controller, and tests
         └── tasks/               # Tasks view, model, controller, and tests
     ├── forge.config.ts
     ├── vitest.config.ts
     ├── package.json
     ├── tsconfig.json
     ├── webpack.main.config.ts
     └── webpack.renderer.config.ts
```
     
## How To Build The Software

## How To Test The software

## How To Add New Tests
### Test Structure:

Tests are located in each feature's `tests/` directory. Each major component (model, controller) has its own test file.

Example:
- `pet/tests/model.test.ts`: Tests for the pet model
- `pet/tests/controller.test.ts`: Tests for the pet controller

## How to Add New Tests

When adding new tests, follow these guidelines:

1. Create tests in the appropriate feature's `tests/` directory
2. Follow the naming convention: `{component-name}.test.ts`
3. Group related tests using Vitest's `describe` blocks
4. Write descriptive test names using `it` blocks
5. Use mocks and spies for external dependencies

### Testing Guidelines:

- Test one concept per test case
- Use `beforeEach`/`afterEach` for setup and teardown
- Mock external dependencies using `vi.mock`/`vi.fn`

### Example Test Structure:

```typescript
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { PetModel } from '../model';

describe('PetModel', () => {
  let pet: PetModel;
  
  beforeEach(() => {
    // Setup code
    pet = new PetModel('TestPet', 'husky');
  });
  
  afterEach(() => {
    // Cleanup code
    vi.restoreAllMocks();
  });
  
  describe('Interactions', () => {
    it('should increase happiness when playing', () => {
      const initialHappiness = pet.getHappiness();
      pet.play();
      expect(pet.getHappiness()).toBeGreaterThan(initialHappiness);
    });
    
    // More tests...
  });
});
```

## How To Build A Release of The Software

To build a distributable release of FocusHusky:

```bash
# Navigate to the client directory
cd client

# Create distributable packages
npm run make
```
