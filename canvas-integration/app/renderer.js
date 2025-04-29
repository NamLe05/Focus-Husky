// renderer.js - Fixed with properly defined helper functions

// Define helper functions first so they're available throughout the code
function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    }).format(date);
  }
  
  function formatTime(date) {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date);
  }
  
  function escapeHtml(text) {
    if (typeof text !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  function formatJson(obj) {
    return JSON.stringify(obj, null, 2);
  }
  
  // Wait for DOM to be fully loaded before accessing elements
  document.addEventListener('DOMContentLoaded', () => {
    // Log that the renderer script has started
    console.log('Renderer script started');
    
    if (!window.canvasApi) {
      console.error('canvasApi is not available! Check preload script.');
      document.body.innerHTML = '<h1>Error: Canvas API not available</h1><p>The application could not initialize properly. Please restart the application.</p>';
      return;
    }
    
    // DOM Elements
    const loginSection = document.getElementById('login-section');
    const userSection = document.getElementById('user-section');
    const loadingElement = document.getElementById('loading');
    const assignmentsSection = document.getElementById('assignments-section');
    const assignmentsList = document.getElementById('assignments-list');
    const logoutButton = document.getElementById('logout-button');
    const tokenForm = document.getElementById('token-form');
    const tokenInput = document.getElementById('access-token');
    const domainInput = document.getElementById('canvas-domain');
    const userName = document.getElementById('user-name');
    const canvasUrl = document.getElementById('canvas-url');
    const messageContainer = document.getElementById('message-container');
    const debugOutput = document.getElementById('debug-output');
    
    // Debug buttons
    const checkCoursesButton = document.getElementById('check-courses-button');
    const checkAllAssignmentsButton = document.getElementById('check-all-assignments-button');
    const refreshButton = document.getElementById('refresh-button');
    const directDebugButton = document.getElementById('direct-debug-button');
    
    // Initial check of authentication status
    checkAuthStatus();
    
    // Event listeners
    if (tokenForm) tokenForm.addEventListener('submit', handleTokenSubmit);
    if (logoutButton) logoutButton.addEventListener('click', handleLogout);
    if (checkCoursesButton) checkCoursesButton.addEventListener('click', checkCourses);
    if (checkAllAssignmentsButton) checkAllAssignmentsButton.addEventListener('click', checkAllAssignments);
    if (refreshButton) refreshButton.addEventListener('click', () => loadAssignments(true));
    if (directDebugButton) directDebugButton.addEventListener('click', directDebug);
    
    // Functions
    async function checkAuthStatus() {
      console.log('Checking authentication status...');
      showLoading(true);
      
      try {
        const status = await window.canvasApi.getAuthStatus();
        console.log('Auth status:', status);
        
        if (status.isAuthenticated) {
          // User is authenticated
          showAuthenticatedUI(status);
          loadAssignments();
        } else {
          // User needs to login
          showLoginUI();
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        showMessage('Error checking authentication status: ' + error.message, 'error');
        showLoginUI();
      }
      
      showLoading(false);
    }
    
    async function handleTokenSubmit(event) {
      event.preventDefault();
      console.log('Token form submitted');
      
      // Clear previous messages
      messageContainer.innerHTML = '';
      messageContainer.classList.add('hidden');
      
      const token = tokenInput.value.trim();
      let domain = domainInput.value.trim();
      
      // Validate domain format
      if (!domain.startsWith('http')) {
        domain = 'https://' + domain;
      }
      
      // Remove trailing slash if present
      if (domain.endsWith('/')) {
        domain = domain.slice(0, -1);
      }
      
      console.log('Submitting token for domain:', domain);
      showLoading(true);
      
      try {
        const result = await window.canvasApi.loginWithToken({
          token,
          domain
        });
        
        console.log('Login result:', result);
        
        if (result.success) {
          // Authentication successful
          showMessage('Successfully connected to Canvas!', 'success');
          showAuthenticatedUI({ isAuthenticated: true, domain });
          userName.textContent = `Name: ${result.user.name}`;
          canvasUrl.textContent = `Email: ${result.user.email}`;
          loadAssignments();
        } else {
          // Authentication failed
          showMessage('Authentication failed: ' + (result.error || 'Invalid token or domain'), 'error');
        }
      } catch (error) {
        console.error('Login error:', error);
        showMessage('Error connecting to Canvas: ' + error.message, 'error');
      }
      
      showLoading(false);
    }
    
    async function handleLogout() {
      console.log('Logging out');
      await window.canvasApi.logout();
      showLoginUI();
      assignmentsList.innerHTML = '';
      showMessage('Successfully logged out', 'info');
    }
    
    function showLoginUI() {
      console.log('Showing login UI');
      loginSection.classList.remove('hidden');
      userSection.classList.add('hidden');
      assignmentsSection.classList.add('hidden');
      logoutButton.classList.add('hidden');
      
      // Set default domain if empty
      if (!domainInput.value) {
        domainInput.value = 'https://canvas.uw.edu';
      }
    }
    
    function showAuthenticatedUI(status) {
      console.log('Showing authenticated UI');
      loginSection.classList.add('hidden');
      userSection.classList.remove('hidden');
      logoutButton.classList.remove('hidden');
      canvasUrl.textContent = `Canvas URL: ${status.domain}`;
    }
    
    function showLoading(isLoading) {
      loadingElement.classList.toggle('hidden', !isLoading);
    }
    
    function showMessage(text, type = 'info') {
      console.log(`Message (${type}):`, text);
      messageContainer.innerHTML = text;
      messageContainer.className = `${type}-message`;
      messageContainer.classList.remove('hidden');
    }
    
    function showDebugOutput(text) {
      if (debugOutput) {
        debugOutput.textContent = text;
        debugOutput.classList.remove('hidden');
      }
    }
    
    async function loadAssignments(forceRefresh = false) {
      console.log('Loading assignments, forceRefresh:', forceRefresh);
      showLoading(true);
      assignmentsSection.classList.add('hidden');
      
      if (forceRefresh) {
        showMessage('Refreshing assignments from Canvas...', 'info');
      }
      
      try {
        console.log('Calling getAssignments API...');
        const assignments = await window.canvasApi.getAssignments();
        console.log('Got assignments:', assignments.length);
        
        if (assignments.length === 0) {
          console.log('No assignments found');
          assignmentsList.innerHTML = '<p>No upcoming assignments found.</p>';
          showMessage('No upcoming assignments were found. This could be because you don\'t have any assignments due in the future, or your courses haven\'t published any assignments yet.', 'warning');
        } else {
          console.log('Displaying assignments');
          displayAssignments(assignments);
          messageContainer.classList.add('hidden');
        }
        
        assignmentsSection.classList.remove('hidden');
      } catch (error) {
        console.error('Error loading assignments:', error);
        assignmentsList.innerHTML = `<p>Error loading assignments</p>`;
        showMessage('Error loading assignments: ' + error.message, 'error');
        assignmentsSection.classList.remove('hidden');
      }
      
      showLoading(false);
    }
    
    function displayAssignments(assignments) {
      console.log('Displaying assignments:', assignments.length);
      
      // Clear previous assignments
      assignmentsList.innerHTML = '';
      
      // For direct debugging - show raw data of first assignment
      if (assignments.length > 0) {
        console.log('First assignment:', JSON.stringify(assignments[0], null, 2));
      }
      
      // Group assignments by due date
      const assignmentsByDate = {};
      let assignmentsWithDueDate = 0;
      
      assignments.forEach(assignment => {
        if (!assignment.due_at) {
          console.log('Assignment without due date:', assignment.name);
          return;
        }
        
        assignmentsWithDueDate++;
        const dueDate = new Date(assignment.due_at);
        const dateKey = dueDate.toISOString().split('T')[0];
        
        if (!assignmentsByDate[dateKey]) {
          assignmentsByDate[dateKey] = [];
        }
        
        assignmentsByDate[dateKey].push(assignment);
      });
      
      console.log(`Assignments with due dates: ${assignmentsWithDueDate} out of ${assignments.length}`);
      
      // Sort dates
      const sortedDates = Object.keys(assignmentsByDate).sort();
      
      if (sortedDates.length === 0) {
        // If no assignments have due dates, show all assignments
        assignmentsList.innerHTML = '<p>No assignments with due dates found.</p>';
        
        if (assignments.length > 0) {
          const allAssignmentsContainer = document.createElement('div');
          allAssignmentsContainer.className = 'all-assignments';
          
          const allAssignmentsHeader = document.createElement('h3');
          allAssignmentsHeader.textContent = 'All Assignments (without due dates)';
          allAssignmentsContainer.appendChild(allAssignmentsHeader);
          
          assignments.forEach(assignment => {
            const card = createAssignmentCard(assignment);
            allAssignmentsContainer.appendChild(card);
          });
          
          assignmentsList.appendChild(allAssignmentsContainer);
        } else {
          showMessage('No assignments found in your Canvas courses.', 'warning');
        }
        return;
      }
      
      // Display assignments grouped by date
      sortedDates.forEach(dateKey => {
        const dateAssignments = assignmentsByDate[dateKey];
        const dateObj = new Date(dateKey);
        
        // Add date header
        const dateHeader = document.createElement('div');
        dateHeader.className = 'date-header';
        dateHeader.textContent = formatDate(dateObj);
        assignmentsList.appendChild(dateHeader);
        
        // Add assignments for this date
        dateAssignments.forEach(assignment => {
          const card = createAssignmentCard(assignment);
          assignmentsList.appendChild(card);
        });
      });
    }
    
    function createAssignmentCard(assignment) {
      const card = document.createElement('div');
      card.className = 'assignment-card';
      
      // Due date handling
      let dueTime = 'No due date';
      let daysUntilDue = null;
      
      if (assignment.due_at) {
        const dueDate = new Date(assignment.due_at);
        dueTime = formatTime(dueDate);
        daysUntilDue = Math.floor((dueDate - new Date()) / (1000 * 60 * 60 * 24));
        
        // Add urgency classes
        if (daysUntilDue <= 1) {
          card.classList.add('urgent');
        } else if (daysUntilDue <= 3) {
          card.classList.add('upcoming');
        }
      }
      
      // Create the card components
      const title = document.createElement('h3');
      title.className = 'assignment-title';
      title.textContent = assignment.name || 'Unnamed Assignment';
      
      const courseName = document.createElement('div');
      courseName.className = 'course-name';
      courseName.textContent = assignment.course_name || 'Unknown Course';
      
      const details = document.createElement('div');
      details.className = 'assignment-details';
      
      // Due date detail
      const dueDetail = document.createElement('div');
      dueDetail.className = 'detail';
      dueDetail.innerHTML = `<div class="detail-label">Due Date</div><div>${dueTime}</div>`;
      details.appendChild(dueDetail);
      
      // Points detail
      const pointsDetail = document.createElement('div');
      pointsDetail.className = 'detail';
      pointsDetail.innerHTML = `<div class="detail-label">Points</div><div>${assignment.points_possible || 'N/A'}</div>`;
      details.appendChild(pointsDetail);
      
      // Status detail (only if due date exists)
      if (daysUntilDue !== null) {
        const statusDetail = document.createElement('div');
        statusDetail.className = 'detail';
        let statusText = '';
        
        if (daysUntilDue === 0) statusText = 'Due today!';
        else if (daysUntilDue === 1) statusText = 'Due tomorrow!';
        else if (daysUntilDue > 0) statusText = `Due in ${daysUntilDue} days`;
        else statusText = `Overdue by ${Math.abs(daysUntilDue)} days`;
        
        statusDetail.innerHTML = `<div class="detail-label">Status</div><div>${statusText}</div>`;
        details.appendChild(statusDetail);
      }
      
      // View button
      const viewLink = document.createElement('a');
      viewLink.href = assignment.html_url || '#';
      viewLink.target = '_blank';
      viewLink.className = 'button';
      viewLink.textContent = 'View in Canvas';
      
      // Assemble the card
      card.appendChild(title);
      card.appendChild(courseName);
      card.appendChild(details);
      card.appendChild(viewLink);
      
      return card;
    }
    
    // Debug functions
    async function checkCourses() {
      console.log('Checking courses');
      showDebugOutput('Checking your Canvas courses...');
      
      try {
        // Get auth status to get the correct domain
        const status = await window.canvasApi.getAuthStatus();
        if (!status.isAuthenticated) {
          showDebugOutput('You need to log in first to check your courses.');
          return;
        }
        
        showDebugOutput('Fetching courses directly from Canvas API...');
        
        // Use the direct debug endpoint
        const result = await window.canvasApi.debugCourses();
        
        if (!result || !result.success) {
          showDebugOutput(`Error: ${result?.error || 'Unknown error'}\n\nResponse: ${JSON.stringify(result?.response || {}, null, 2)}`);
          return;
        }
        
        const courses = result.courses;
        
        if (!Array.isArray(courses) || courses.length === 0) {
          showDebugOutput('No active courses found. You might not be enrolled in any current courses, or your courses might not be published yet.');
          return;
        }
        
        let courseOutput = `Found ${courses.length} active courses:\n\n`;
        courses.forEach((course, index) => {
          courseOutput += `${index + 1}. ${course.name}\n`;
          courseOutput += `   ID: ${course.id}\n`;
          courseOutput += `   Code: ${course.course_code || 'N/A'}\n`;
          courseOutput += `   Term: ${course.term ? course.term.name : 'N/A'}\n`;
          courseOutput += `   Workflow State: ${course.workflow_state}\n`;
          courseOutput += `   Access Restricted: ${course.access_restricted_by_date ? 'Yes' : 'No'}\n\n`;
        });
        
        showDebugOutput(courseOutput);
      } catch (error) {
        console.error('Error checking courses:', error);
        showDebugOutput('Error checking courses: ' + error.message);
      }
    }
    
    async function checkAllAssignments() {
      console.log('Checking all assignments');
      showDebugOutput('Checking all assignments (including past and future)...');
      
      try {
        const assignments = await window.canvasApi.getAssignments();
        showDebugOutput(`Retrieved ${assignments.length} total assignments\n\n${formatJson(assignments)}`);
      } catch (error) {
        console.error('Error checking all assignments:', error);
        showDebugOutput('Error checking all assignments: ' + error.message);
      }
    }
    
    async function directDebug() {
      console.log('Direct debug requested');
      showDebugOutput('Running direct API debug...');
      
      try {
        // Check authentication status
        const authStatus = await window.canvasApi.getAuthStatus();
        showDebugOutput('Authentication Status:\n' + formatJson(authStatus));
      } catch (error) {
        console.error('Direct debug error:', error);
        showDebugOutput('Error during direct debug: ' + error.message);
      }
    }
    
    // Log completion of renderer script initialization
    console.log('Renderer script fully initialized');
  });