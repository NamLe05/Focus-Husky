# Electron Login Application

A simple desktop login application built with Electron.

## Features

- Clean, modern login interface
- Form validation
- Responsive design for different screen sizes
- Ready for integration with authentication systems

## Screenshots

![Login Screen](./screenshots/login-screen.png)

## Getting Started

### Prerequisites

- Node.js (v14 or later recommended)
- npm (v6 or later recommended)

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/yourusername/electron-login-app.git
   cd electron-login-app
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Start the application:
   ```
   npm start
   ```

## Project Structure

- `main.js` - Main Electron process
- `preload.js` - Preload script for secure renderer process
- `index.html` - Main application HTML
- `styles.css` - Application styles
- `renderer.js` - Renderer process logic
- `assets/` - Application assets (images, etc.)

## Form Validation

The login form includes client-side validation:

- Username must be at least 3 characters
- Password must be at least 6 characters
- Real-time validation feedback
- Visual indicators for valid/invalid inputs

## Authentication Flow

1. User enters credentials in the login form
2. Client-side validation checks the input format
3. If valid, the renderer process sends credentials to the main process via IPC
4. The main process would typically:
   - Verify credentials against a database or API
   - Return success/failure to the renderer
   - On success, open the main application window
   - On failure, display an error message

## Customization

### Changing the Theme

To modify the color scheme, edit the color values in `styles.css`:

```css
.login-container {
  background-color: #b4a4bf; /* Main background color */
}

.login-card {
  background-color: #ded2e5; /* Card background color */
}

.login-button {
  background-color: #9881a1; /* Button color */
}
```

### Adding Additional Fields

To add more input fields to the form:

1. Add the HTML for the new field in `index.html`
2. Add corresponding styles in `styles.css`
3. Add validation logic in `renderer.js`

## Security Considerations

- Passwords are never logged or stored in plain text
- IPC communication is used for secure main/renderer process communication
- Content Security Policy is implemented to prevent XSS attacks

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Electron team for the framework
- Builder.io for code generation assistance
