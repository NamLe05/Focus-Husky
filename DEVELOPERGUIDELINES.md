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

To build a distributable app for FocusHusky:

```bash
# Navigate to the client directory
cd client

# Create distributable packages
npm run make
```

## How To Test The software
To run tests for FocusHusky:

```bash
# Navigate to the client directory
cd client

# Run the tests
npm run test
```

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
- Utilize clear box and black box testing heuristics

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

First, build a .exe distributable for the software. See the "build" section for details.

Then, go into GitHub and create a new "release/tag" for the build.

Enter in the following details:
1. A descriptive title for the release (e.g. "Beta Release" or "Final Release")
2. A tag for the release (follow versioning format listed in the instructions, such as v.1.0.0-beta or v.0.1.0)
3. A clear markdown description of the release (features, operational use cases, major changes, etc.)
4. Upload a single asset: the distributable build .exe file for Focus Husky.

GitHub will automatically publish the asset under this release tag, and also add a .zip/.tar of the open source code.
