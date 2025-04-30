/**
 * Dashboard functionality for the app home page
 * Handles user display, date/time updates, and interactive elements
 */

document.addEventListener("DOMContentLoaded", () => {
  // Display logged-in username
  const userNameElement = document.querySelector(".user-name-header");
  const loggedInUser = localStorage.getItem("loggedInUser");

  if (userNameElement && loggedInUser) {
    userNameElement.textContent = loggedInUser;
  }

  // Handle sidebar navigation
  const sidebarItems = document.querySelectorAll(".sidebar-item");

  sidebarItems.forEach((item) => {
    item.addEventListener("click", () => {
      // Remove active class from all items
      sidebarItems.forEach((btn) => btn.classList.remove("active"));

      // Add active class to clicked item
      item.classList.add("active");

      // Get the item text (excluding any child element text)
      const itemText =
        item.childNodes[item.childNodes.length - 1].textContent?.trim() ||
        item.textContent.trim();

      // Handle navigation based on the clicked item
      switch (itemText) {
        case "Dashboard":
          // Already on dashboard, do nothing
          break;
        case "MarketPlace":
          window.location.href = "marketplace.html";
          break;
        case "Settings":
        case "Schedules":
        case "Pomodoro Timer":
          // For demonstration purposes, show an alert for non-implemented items
          alert(`${itemText} functionality coming soon!`);
          break;
      }
    });
  });

  // Handle Pomodoro Timer card click
  const pomodoroCard = document.querySelector(".pomodoro-card");
  if (pomodoroCard) {
    pomodoroCard.addEventListener("click", () => {
      alert("Starting Pomodoro Timer... This feature is coming soon!");
    });
  }

  // Handle Edit button click in Todo section
  const editButton = document.querySelector(".edit-button");
  if (editButton) {
    editButton.addEventListener("click", () => {
      alert("Edit Todo functionality coming soon!");
    });
  }

  // Update current time periodically
  const updateCurrentTime = () => {
    const dateDisplay = document.querySelector(".date-display");
    if (dateDisplay) {
      const now = new Date();

      // Format: DAY M,DD, YYYY | HH:MM AM/PM
      const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
      const day = days[now.getDay()];
      const month = now.getMonth() + 1;
      const date = now.getDate();
      const year = now.getFullYear();

      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";

      hours = hours % 12;
      hours = hours ? hours : 12; // Convert 0 to 12

      const timeString = `${day} ${month},${date}, ${year} | ${hours}:${minutes} ${ampm}`;
      dateDisplay.textContent = timeString;
    }
  };

  // Update time immediately and then every minute
  updateCurrentTime();
  setInterval(updateCurrentTime, 60000);

  // Handle time filter clicks
  const timeFilters = document.querySelectorAll(".time-filter");
  timeFilters.forEach((filter) => {
    filter.addEventListener("click", () => {
      timeFilters.forEach((f) => f.classList.remove("active"));
      filter.classList.add("active");
      // In a real app, this would filter the time data
    });
  });

  // Handle mobile viewport adjustments
  const adjustViewportForMobile = () => {
    // Fix for iOS viewport height issues
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`);
  };

  window.addEventListener("resize", adjustViewportForMobile);
  adjustViewportForMobile();
});
