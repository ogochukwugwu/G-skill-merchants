let requestInProgress = {};

// Function to handle the generate code button click
async function handleGenerateCode(personNumber) {
  const email = document.getElementById(`client-email-Person${personNumber}`).value.trim();
  const name = document.getElementById(`client-name-Person${personNumber}`).value.trim();
  const button = document.querySelector(`#Person${personNumber}-card .booking button:nth-of-type(1)`);

  if (!email || !name) return alert('Please enter name and email');

  if (requestInProgress[email]) return; // Prevent multiple requests
  requestInProgress[email] = true;

  button.disabled = true;
  button.textContent = 'Sending...';

  try {
    const res = await fetch('http://localhost:3001/api/send-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, personNumber })
    });

    const data = await res.json();
    if (data.success) {
      alert(`✅ Code sent to ${email}`);
    } else {
      alert(`❌ ${data.error || 'Failed to send code'}`);
    }
  } catch (err) {
    console.error(err);
    alert('❌ Network error');
  } finally {
    requestInProgress[email] = false;
    button.disabled = false;
    button.textContent = 'Generate Code';
  }
}

// Function to handle the sign in button click
async function verifyCode(personNumber) {
  const email = document.getElementById(`client-email-Person${personNumber}`).value.trim();
  const code = document.getElementById(`client-code-Person${personNumber}`).value.trim();
  const button = document.querySelector(`#Person${personNumber}-card .booking button:nth-of-type(2)`);

  if (!email || !code) return alert('Please enter email and code');

  if (requestInProgress[email]) return; // Prevent multiple requests
  requestInProgress[email] = true;

  button.disabled = true;
  button.textContent = 'Signing in...';

  try {
    const res = await fetch('http://localhost:3001/api/verify-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, personNumber })
    });

    const data = await res.json();
    if (data.success) {
      alert('✅ Verification successful!');
      addBookingLog(personNumber, email);
    } else {
      alert(`❌ ${data.error || 'Verification failed'}`);
    }
  } catch (err) {
    console.error(err);
    alert('❌ Network error');
  } finally {
    requestInProgress[email] = false;
    button.disabled = false;
    button.textContent = 'Sign In';
  }
}

// Function to add a booking log entry
function addBookingLog(personNumber, email) {
  const date = document.getElementById(`date-Person${personNumber}`).value;
  const time = document.getElementById(`time-Person${personNumber}`).value;
  const logList = document.getElementById('logg-list');

  if (!date || !time) return alert('Please set a date and time for the booking');

  const newRow = document.createElement('tr');
  newRow.innerHTML = `
    <td>Person${personNumber}</td>
    <td>${date} ${time}</td>
    <td><a href="https://zoom.us/j/${generateZoomLink()}">Join Zoom</a></td>
  `;
  logList.appendChild(newRow);
}

// Function to generate a random Zoom link (for demonstration purposes)
function generateZoomLink() {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}

// Initialize all event listeners
function setupEventListeners() {
  // For each person (1-4)
  for (let i = 1; i <= 4; i++) {
    // Generate Code button with debounce
    const generateCodeButton = document.querySelector(`#Person${i}-card .booking button:nth-of-type(1)`);
    if (!generateCodeButton.hasListener) {
      generateCodeButton.addEventListener('click', debounce(() => handleGenerateCode(i), 300));
      generateCodeButton.hasListener = true; // Mark the button as having a listener
    }

    // Sign In button
    const signInButton = document.querySelector(`#Person${i}-card .booking button:nth-of-type(2)`);
    if (!signInButton.hasListener) {
      signInButton.addEventListener('click', debounce(() => verifyCode(i), 300));
      signInButton.hasListener = true; // Mark the button as having a listener
    }
  }
}

// Debounce function to limit the rate of function execution
function debounce(func, delay) {
  let timeoutId;
  return function(...args) {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', setupEventListeners);