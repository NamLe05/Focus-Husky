// main.js - With CSP security disabled for development

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const axios = require('axios');
const fs = require('fs');

// Try to load dotenv
try {
  require('dotenv').config();
} catch (err) {
  console.log('Could not load .env file');
}

// Canvas API configuration
const CANVAS_DOMAIN = process.env.CANVAS_DOMAIN || 'https://canvas.uw.edu';

let mainWindow;
let userToken = null;
let userDomain = null;

// Try to read token from storage if exists
try {
  const userData = fs.readFileSync(path.join(app.getPath('userData'), 'user-auth.json'), 'utf8');
  const data = JSON.parse(userData);
  userToken = data.token;
  userDomain = data.domain;
  console.log(`Loaded saved credentials for domain: ${userDomain}`);
} catch (err) {
  console.log('No stored credentials found');
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      worldSafeExecuteJavaScript: true,
      webSecurity: false, // Disable web security for development
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Disable Content-Security-Policy completely for development
  mainWindow.webContents.session.webRequest.onHeadersReceived(
    (details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': ['']
        }
      });
    }
  );

  // Load the index.html file
  mainWindow.loadFile('index.html');
  
  // Open DevTools in development
  mainWindow.webContents.openDevTools();
  
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();
});

// Save token and domain
async function saveUserCredentials(token, domain) {
  try {
    console.log(`Testing credentials for domain: ${domain}`);
    userToken = token;
    userDomain = domain;
    
    // Test the token with a simple API call
    const response = await axios.get(`${domain}/api/v1/users/self`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Token validation successful, user:', response.data.name);
    
    // Save to file system
    const userData = {
      token,
      domain
    };
    
    fs.writeFileSync(
      path.join(app.getPath('userData'), 'user-auth.json'),
      JSON.stringify(userData)
    );
    
    return {
      success: true,
      user: response.data
    };
  } catch (error) {
    console.error('Error validating credentials:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data));
    }
    
    // Clear saved values on error
    userToken = null;
    userDomain = null;
    
    try {
      fs.unlinkSync(path.join(app.getPath('userData'), 'user-auth.json'));
    } catch (err) {
      // Ignore errors when removing file
    }
    
    return {
      success: false,
      error: error.response?.data?.errors?.message || error.message
    };
  }
}

// IPC handlers
ipcMain.handle('get-auth-status', () => {
  return {
    isAuthenticated: !!userToken,
    domain: userDomain
  };
});

ipcMain.handle('login-with-token', async (event, { token, domain }) => {
  return await saveUserCredentials(token, domain);
});

ipcMain.handle('logout', () => {
  userToken = null;
  userDomain = null;
  
  try {
    fs.unlinkSync(path.join(app.getPath('userData'), 'user-auth.json'));
  } catch (err) {
    console.log('Error removing auth file:', err);
  }
  
  return true;
});

ipcMain.handle('get-assignments', async () => {
  if (!userToken || !userDomain) {
    throw new Error('Not authenticated');
  }
  
  try {
    console.log('Fetching courses from Canvas...');
    console.log(`Using domain: ${userDomain}`);
    console.log(`Token available: ${!!userToken}`);
    
    // Get courses
    const coursesResponse = await axios.get(`${userDomain}/api/v1/courses`, {
      headers: { Authorization: `Bearer ${userToken}` },
      params: { enrollment_state: 'active', include: ['term'] }
    });
    
    console.log(`Retrieved ${coursesResponse.data.length} courses`);
    console.log('Courses:', JSON.stringify(coursesResponse.data.map(c => ({ id: c.id, name: c.name }))));
    
    // Check if we have any courses
    if (coursesResponse.data.length === 0) {
      console.log('No active courses found');
      return [];
    }
    
    // Get assignments for each course
    console.log('Fetching assignments for each course...');
    const coursePromises = coursesResponse.data
      .filter(course => !course.access_restricted_by_date)
      .map(course => {
        console.log(`Fetching assignments for course: ${course.name} (ID: ${course.id})`);
        return axios.get(`${userDomain}/api/v1/courses/${course.id}/assignments`, {
          headers: { Authorization: `Bearer ${userToken}` },
          params: { order_by: 'due_at', include: ['submission'] }
        })
        .then(response => {
          console.log(`Retrieved ${response.data.length} assignments for course ${course.id}`);
          return response.data.map(assignment => ({
            ...assignment,
            course_name: course.name,
            course_id: course.id
          }));
        })
        .catch(error => {
          console.error(`Error fetching assignments for course ${course.id}:`, error.message);
          if (error.response) {
            console.error(`Status: ${error.response.status}, Data:`, JSON.stringify(error.response.data));
          }
          return []; // Return empty array if we can't get assignments for a course
        });
      });
    
    console.log('Waiting for all assignment requests to complete...');
    // Wait for all requests to complete
    const assignmentsArrays = await Promise.all(coursePromises);
    
    // Combine all assignments
    let allAssignments = [].concat(...assignmentsArrays);
    console.log(`Combined ${allAssignments.length} total assignments`);
    
    // For debugging, show all assignments regardless of due date
    console.log('All assignments (first 5):', JSON.stringify(allAssignments.slice(0, 5)));
    
    // Check if there are any assignments with due dates
    const assignmentsWithDueDates = allAssignments.filter(a => a.due_at);
    console.log(`Assignments with due dates: ${assignmentsWithDueDates.length}`);
    
    // Filter to show only upcoming assignments
    const now = new Date();
    console.log('Current date for filtering:', now.toISOString());
    
    // First, let's just return ALL assignments with due dates for testing
    if (assignmentsWithDueDates.length === 0) {
      console.log('No assignments with due dates found, returning all assignments');
      return allAssignments; // Return all assignments if none have due dates
    }
    
    // If we have assignments with due dates, filter for upcoming ones
    const upcomingAssignments = assignmentsWithDueDates
      .filter(assignment => {
        const dueDate = new Date(assignment.due_at);
        const isUpcoming = dueDate > now;
        return isUpcoming;
      })
      .sort((a, b) => new Date(a.due_at) - new Date(b.due_at));
    
    console.log(`Filtered to ${upcomingAssignments.length} upcoming assignments`);
    
    // If no upcoming assignments, return all assignments with due dates
    if (upcomingAssignments.length === 0) {
      console.log('No upcoming assignments found, returning all assignments with due dates');
      return assignmentsWithDueDates;
    }
    
    return upcomingAssignments;
  } catch (error) {
    console.error('Error fetching data from Canvas:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data));
    }
    throw new Error(`Failed to fetch assignments: ${error.message}`);
  }
});

// Add a debug endpoint to check courses directly
ipcMain.handle('debug-courses', async () => {
  if (!userToken || !userDomain) {
    return { error: 'Not authenticated' };
  }
  
  try {
    const response = await axios.get(`${userDomain}/api/v1/courses`, {
      headers: { Authorization: `Bearer ${userToken}` },
      params: { enrollment_state: 'active' }
    });
    
    return {
      success: true,
      courses: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      response: error.response ? {
        status: error.response.status,
        data: error.response.data
      } : null
    };
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});