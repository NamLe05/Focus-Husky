/**
 * Marketplace functionality
 * Handles marketplace interactions and navigation
 */

document.addEventListener("DOMContentLoaded", () => {
  // Handle category tab navigation
  const categoryItems = document.querySelectorAll(".category-item");
  const tabPanes = document.querySelectorAll(".tab-pane");

  categoryItems.forEach((item) => {
    item.addEventListener("click", () => {
      // Get the tab to activate
      const tabToActivate = item.getAttribute("data-tab");

      // Remove active class from all items and panes
      categoryItems.forEach((cat) => cat.classList.remove("active"));
      tabPanes.forEach((pane) => pane.classList.remove("active"));

      // Add active class to clicked item and corresponding pane
      item.classList.add("active");
      document.getElementById(`${tabToActivate}-tab`).classList.add("active");

      console.log(`Navigated to ${tabToActivate} tab`);
    });
  });

  // Handle pet card clicks
  const petCards = document.querySelectorAll(".pet-card");

  petCards.forEach((card) => {
    card.addEventListener("click", () => {
      // In a real app, this would show pet details or add to collection
      const petName = card.querySelector(".pet-name").textContent;
      console.log(`Selected pet: ${petName}`);
      alert(`${petName} selected! This feature is coming soon.`);
    });
  });

  // Handle star counter click
  const starCounter = document.querySelector(".star-counter");

  if (starCounter) {
    starCounter.addEventListener("click", () => {
      // In a real app, this would show star details or rewards
      alert("Star rewards and details coming soon!");
    });
  }

  // Back navigation
  const handleBackNavigation = () => {
    window.location.href = "app-home.html";
  };

  // Add keyboard event listener for back navigation (Escape key)
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      handleBackNavigation();
    }
  });
});
