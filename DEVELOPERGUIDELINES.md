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

## How To Build A Release of The Software
