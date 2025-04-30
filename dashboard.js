/**
 * Dashboard functionality
 * Handles tab switching and dashboard interactions
 */

document.addEventListener("DOMContentLoaded", () => {
  // Display logged-in username
  const userNameElement = document.querySelector(".user-name");
  const loggedInUser = localStorage.getItem("loggedInUser");

  if (userNameElement && loggedInUser) {
    userNameElement.textContent = loggedInUser;
  }

  // Tab switching functionality
  const tabButtons = document.querySelectorAll(".tab-button");
  const tabPanes = document.querySelectorAll(".tab-pane");

  // Add click event to each tab button
  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Get the tab to activate
      const tabToActivate = button.getAttribute("data-tab");

      // Remove active class from all buttons and panes
      tabButtons.forEach((btn) => btn.classList.remove("active"));
      tabPanes.forEach((pane) => pane.classList.remove("active"));

      // Add active class to clicked button and corresponding pane
      button.classList.add("active");
      document.getElementById(`${tabToActivate}-tab`).classList.add("active");
    });
  });

  // Search functionality
  const searchInput = document.querySelector(".search-input");
  const searchButton = document.querySelector(".search-button");
  const searchResults = document.querySelector(".search-results");
  const noResults = document.querySelector(".no-results");

  // Mock search function
  const performSearch = (query) => {
    // Clear previous results
    while (searchResults.firstChild) {
      if (searchResults.firstChild !== noResults) {
        searchResults.removeChild(searchResults.firstChild);
      }
    }

    if (!query.trim()) {
      noResults.textContent = "Enter a search term to find resources";
      noResults.style.display = "block";
      return;
    }

    // Mock data - in a real app, this would come from a database or API
    const mockResults = [
      {
        name: "Button Component",
        type: "Components",
        description: "A reusable button component with various styles",
      },
      {
        name: "Form Validation",
        type: "Documentation",
        description: "Guide on implementing form validation",
      },
      {
        name: "Dashboard Template",
        type: "Templates",
        description: "Ready-to-use dashboard layout template",
      },
      {
        name: "Animation Library",
        type: "Libraries",
        description: "Library for adding smooth animations to your UI",
      },
    ];

    // Filter results based on query
    const filteredResults = mockResults.filter(
      (result) =>
        result.name.toLowerCase().includes(query.toLowerCase()) ||
        result.description.toLowerCase().includes(query.toLowerCase()),
    );

    // Display results
    if (filteredResults.length === 0) {
      noResults.textContent = "No results found for your search";
      noResults.style.display = "block";
    } else {
      noResults.style.display = "none";

      filteredResults.forEach((result) => {
        const resultItem = document.createElement("div");
        resultItem.className = "result-item";

        const resultName = document.createElement("h3");
        resultName.textContent = result.name;

        const resultType = document.createElement("span");
        resultType.className = "result-type";
        resultType.textContent = result.type;

        const resultDesc = document.createElement("p");
        resultDesc.textContent = result.description;

        resultItem.appendChild(resultName);
        resultItem.appendChild(resultType);
        resultItem.appendChild(resultDesc);

        searchResults.appendChild(resultItem);
      });
    }
  };

  // Add event listeners for search
  searchButton.addEventListener("click", () => {
    performSearch(searchInput.value);
  });

  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      performSearch(searchInput.value);
    }
  });

  // Logout functionality
  const logoutButton = document.querySelector(".logout-button");

  logoutButton.addEventListener("click", () => {
    // In a real app, this would handle proper logout
    window.location.href = "index.html";
  });

  // Tool buttons functionality
  const toolButtons = document.querySelectorAll(".tool-button");

  toolButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // In a real app, this would open the corresponding tool
      alert(`Opening ${button.textContent}... This feature is coming soon!`);
    });
  });
});
