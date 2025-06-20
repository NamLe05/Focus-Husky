# Focus-Husky
Nam Le, Daniel Li, Nitya Addanki, Emily Du, Aradhna Prasad, Tony Punnacherry

## Pomodoro Technique
Our app builds on the Pomodoro Technique by adding playful pet animations to make focus sessions more engaging and fun. The Pomodoro Technique, developed in the late 1980s, is a time management method that breaks work into 25-minute intervals called “Pomodoros,” followed by short 5-minute breaks. After every four intervals, users take a longer break. This structured approach helps reduce mental fatigue, improve focus, and make tasks feel more manageable. By combining this method with cute virtual pet experiences, our app transforms productivity into a more rewarding and enjoyable experience for users.

## Features
Some of the features of our app include a pomodoro timer and a virtual pet which will both serve to help the user focus on completing tasks. The virtual pet and timer can be customized to the users’ satisfaction (pet type, color, accessories, pomodoro timer duration and breaks). Both features will be present on the screen as the user is working, and the virtual pet will be able to move across the screen and can also be clicked on for interaction purposes. The virtual pet will also ensure the user is focusing on tasks during work time and will send reminders if they get distracted. The application can connect with canvas and calendars to merge assignment schedules and also keep track of tasks. Once a task is completed or a study session is successful, the user will be rewarded with points that can be used towards purchasing accessories for their virtual pets. Also, you can add friends in the application and compete with your friends’ pets and share achievements. 

### Operational Use Cases
As of the **final release**, the following use cases are now operational per component:
#### Pet
Completed by Daniel Li
1. Interacting with Virtual Pet
2. Separate Transparent, Dragable Pet Window

#### Pomodoro
Completed by Nam Le
1. Setting Up Pomodoro Timer
2. When a Pomodoro Session is Completed

#### Tasks
Completed by Tony Punnacherry
1. Sync Canvas Todo Tasks With System
2. Task Actions: Create, Edit, Delete, and Complete

#### Rewards
Completed by Nitya Addanki, Emily Du, Aradhna Prasad
1. Buying Accessories for Pet Using Rewards Earned
2. Equipping Accessories for Purchased Pets

## Goals
Develop an app to help college students with focus and productivity when studying and completing assignments. Expand our understanding of desktop app development and gain valuable experience in developing a project from scratch within a team. Deepen our knowledge of frameworks and tools such as Electron, React, and Node.js. As well as strengthen our mastery in languages such as JavaScript/TypeScript, HTML, and CSS. Transform the isolating and tedious experience of academic work into one that is engaging and rewarding.

## Extra Component: Study Gym
The gym is a way for the user to do studying within the app to practice the skills they are learning. The pet will react when you submit answers to the quizzes whether you get the answer correct or incorrect. 

## Technology stack
 - Electron desktop app
 - AI for art generation
 - HTML, CSS, and JS/TS

## Usage
### Running the App
1. First, fork/clone the repository to your local and open it in VS Code.
2. Then, go into the "client" folder using `cd client`.
3. Run `npm install` to ensure all packages are set up correctly.
4. Finally, you can run `npm run start` to open the app in developer mode.

### Testing and Building
1. For running test cases, you can use `npm run test`. 
2. For building the app, you can use `npm run make`. This will create a standalone distributable.

### Rough outline

```text
focuspet/
├── assets/              # Static assets (images, sounds, icons)
├── src/                 # Source code
│   ├── main/            # Electron main process code
│   ├── renderer/        # Frontend code (HTML, CSS, JS/TS)
│   ├── common/          # Shared utilities and types
│   └── integrations/    # Canvas and Calendar integrations
├── docs/                # Documentation
├── tests/               # Test files
├── dist/                # Distribution output
├── package.json         # Project dependencies and scripts
├── tsconfig.json        # TypeScript configuration
└── README.md            # This file
```

## Weekly status report
[Week 2](https://docs.google.com/document/d/1Bsd1egGcnewWG8jHSsGyXPu48Lx69Tji3vfa08LBwyQ/edit?usp=sharing) &nbsp; &nbsp; [Week 3](https://docs.google.com/document/d/1f0t0lijOo-dq4oamzSGP2oimdpmsyRFSfkzo9aAPGZY/edit?usp=sharing) &nbsp; &nbsp; [Week 4](https://docs.google.com/document/d/14QPbUYkdULifSGcIvz_Fw9pSPPHll7nhtE84TPltsZQ/edit?tab=t.0#heading=h.c0dnc6hzcm1e) &nbsp; &nbsp; [Week 5](https://docs.google.com/document/d/1qXviP2-j7Jer0xw6B3kUNgwQ7VelP-4FZ1Bqk4_WMNg/edit?usp=sharing) &nbsp; &nbsp; [Week 6](https://docs.google.com/document/d/1DqK-Gqakm-fTVWwmuK0veOoEQgbjj0Slo6d57RwOTJE/edit?usp=sharing) &nbsp; &nbsp; [Week 7](https://docs.google.com/document/d/1NJu3R_pjpAzxoU4w0Nf8bSkXKvi7Afj5QYnyk8UGOvM/edit?usp=sharing) &nbsp; &nbsp; [Week 8](https://docs.google.com/document/d/1mUfJAB-4ldxFbLMHN0eroOeF7_c4ePZMdQMvF6FcHL8/edit?tab=t.0#heading=h.1a5enlpbdz0) &nbsp; &nbsp; [Week 9](https://docs.google.com/document/d/1K9vU5_thEXHaQ_KgGkcO8aeGHobwym-TDFj-Givg9AU/edit?tab=t.0)


