/**
 * Login page renderer script
 * Handles form validation and login submission
 */

// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
  // Get form elements
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const loginButton = document.getElementById("login-button");
  const usernameValidation = document.getElementById("username-validation");
  const passwordValidation = document.getElementById("password-validation");
  const loginForm = document.getElementById("login-form");

  /**
   * Validates the username field
   * @returns {boolean} Whether the username is valid
   */
  const validateUsername = () => {
    const value = usernameInput.value.trim();

    if (!value) {
      showError(usernameInput, usernameValidation, "Username is required");
      return false;
    }

    if (value.length < 3) {
      showError(
        usernameInput,
        usernameValidation,
        "Username must be at least 3 characters",
      );
      return false;
    }

    // Username is valid
    showSuccess(usernameInput);
    usernameValidation.classList.remove("visible");
    return true;
  };

  /**
   * Validates the password field
   * @returns {boolean} Whether the password is valid
   */
  const validatePassword = () => {
    const value = passwordInput.value.trim();

    if (!value) {
      showError(passwordInput, passwordValidation, "Password is required");
      return false;
    }

    if (value.length < 6) {
      showError(
        passwordInput,
        passwordValidation,
        "Password must be at least 6 characters",
      );
      return false;
    }

    // Password is valid
    showSuccess(passwordInput);
    passwordValidation.classList.remove("visible");
    return true;
  };

  /**
   * Shows an error message for an input field
   * @param {HTMLElement} input - The input element
   * @param {HTMLElement} validationElement - The validation message element
   * @param {string} message - The error message to display
   */
  const showError = (input, validationElement, message) => {
    input.classList.add("error");
    input.classList.remove("success");
    validationElement.textContent = message;
    validationElement.classList.add("visible");
  };

  /**
   * Shows success styling for an input field
   * @param {HTMLElement} input - The input element
   */
  const showSuccess = (input) => {
    input.classList.remove("error");
    input.classList.add("success");
  };

  // Add input event listeners for real-time validation
  usernameInput.addEventListener("input", () => {
    if (usernameInput.value.trim()) {
      validateUsername();
    }
  });

  passwordInput.addEventListener("input", () => {
    if (passwordInput.value.trim()) {
      validatePassword();
    }
  });

  // Add blur event listeners for validation when focus leaves the field
  usernameInput.addEventListener("blur", validateUsername);
  passwordInput.addEventListener("blur", validatePassword);

  // Add submit event listener to the form
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // Validate all fields
    const isUsernameValid = validateUsername();
    const isPasswordValid = validatePassword();

    // If all fields are valid, proceed with login
    if (isUsernameValid && isPasswordValid) {
      // Show loading state
      loginButton.textContent = "Logging in...";
      loginButton.disabled = true;

      // In a real application, you would handle authentication here
      // For now, simulate a network request
      setTimeout(() => {
        console.log("Login attempt:", {
          username: usernameInput.value,
          password: "********", // Don't log actual passwords
        });

        // Store username in localStorage for dashboard to use
        localStorage.setItem("loggedInUser", usernameInput.value);

        // Redirect to app-home.html after successful login
        window.location.href = "app-home.html";
      }, 1500);
    }
  });

  // Add focus to username field on load
  usernameInput.focus();

  // Handle mobile viewport adjustments
  const adjustViewportForMobile = () => {
    // Fix for iOS viewport height issues
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`);
  };

  window.addEventListener("resize", adjustViewportForMobile);
  adjustViewportForMobile();
});
