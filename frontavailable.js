import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyALXT0Vc-DzTKA6KBNcLqISS47mo8V3EvI",
  authDomain: "skillmerchants.firebaseapp.com",
  projectId: "skillmerchants",
  storageBucket: "skillmerchants.firebasestorage.app",
  messagingSenderId: "304068000040",
  appId: "1:304068000040:web:4ee6dc66628f3873e8381d",
  measurementId: "G-1F62XBQ9PG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

// Login professional and load availability
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('Email').value;
  const password = document.getElementById('password').value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    alert("Login successful! You can now set availability.");
    // Check user role and enable buttons if professional
    checkUserRole().then(userRole => {
      if (userRole === "professional" && email === "drsmith@example.com") {
        document.getElementById('set-availability-DrSmith').disabled = false;
        document.getElementById('delete-availability-DrSmith').disabled = false;
        loadAvailability('DrSmith');
      } else {
        alert("You do not have permission to set availability.");
      }
    });
  } catch (error) {
    console.error("Error logging in: ", error);
    alert("Error logging in: " + error.message);
  }
});

// Check user role
export async function checkUserRole() {
  return new Promise((resolve, reject) => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists() && userDoc.data().role) {
          resolve(userDoc.data().role);
        } else {
          resolve(null);
        }
      } else {
        resolve(null);
      }
    });
  });
}


import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { checkUserRole } from './auth.js';



const db = getFirestore();

async function setAvailability(professional) {
  const hasAccess = await checkUserRole();
  if (!hasAccess) {
    alert("You do not have permission to set availability.");
    return;
  }

  let date = document.getElementById(`date-${professional}`).value;
  let time = document.getElementById(`time-${professional}`).value;

  if (!date || !time) {
    alert("Please select a date and time.");
    return;
  }

  let dateTime = `${date} at ${time}`;
  let availabilityRef = doc(db, "availability", professional);
  let availabilityData = (await getDoc(availabilityRef)).data() || { slots: [] };

  if (!availabilityData.slots.includes(dateTime)) {
    availabilityData.slots.push(dateTime);
    await setDoc(availabilityRef, availabilityData);
    alert("Availability updated!");
  } else {
    alert("This slot is already taken.");
  }

  loadAvailability(professional);
}

async function deleteAvailability(professional) {
  const hasAccess = await checkUserRole();
  if (!hasAccess) {
    alert("You do not have permission to delete availability.");
    return;
  }

  let dateTime = document.getElementById(`available-dates-${professional}`).value;
  if (dateTime) {
    let availabilityRef = doc(db, "availability", professional);
    let availabilityData = (await getDoc(availabilityRef)).data() || { slots: [] };

    let index = availabilityData.slots.indexOf(dateTime);
    if (index > -1) {
      availabilityData.slots.splice(index, 1);
      await setDoc(availabilityRef, availabilityData);
      alert("Availability deleted!");
    } else {
      alert("Slot not found.");
    }

    loadAvailability(professional);
  } else {
    alert("Please select a valid slot to delete.");
  }
}

async function loadAvailability(professional) {
  let availabilityRef = doc(db, "availability", professional);
  let availabilityData = (await getDoc(availabilityRef)).data() || { slots: [] };

  let availableSlots = availabilityData.slots;
  let options = availableSlots.map(slot => `<option value="${slot}">${slot}</option>`).join("");
  document.getElementById(`available-dates-${professional}`).innerHTML = options || "<option>No slots available</option>";
}

function toggleBookingLog() {
  const log = document.getElementById('booking-log-list');
  if (log.style.display === 'none') {
    log.style.display = 'block';
  } else {
    log.style.display = 'none';
  }
}

function payWithPaystack(professional, amount) {
  if (!checkInputs(professional)) {
    return;
  }
  window.open('https://paystack.com/pay', '_blank');
}

function payWithFlutterwave(professional, amount) {
  if (!checkInputs(professional)) {
    return;
  }
  window.open('https://flutterwave.com/pay', '_blank');
}

function manualBankTransfer(professional, amount) {
  if (!checkInputs(professional)) {
    return;
  }

  alert(`Please transfer ₦${amount} to:\nBank Name: XYZ Bank\nAccount Number: 1234567890`);
  document.getElementById(`bank-transfer-upload-${professional}`).style.display = "block";
}

function confirmBankTransfer(professional, amount) {
  let proofFile = document.getElementById(`proof-${professional}`).files[0];
  if (!proofFile) {
    alert("Please upload proof of bank transfer.");
    return;
  }

  alert("Proof uploaded. Your booking will be confirmed after verification.");
  setTimeout(() => {
    let clientName = document.getElementById(`client-name-${professional}`).value.trim();
    let clientEmail = document.getElementById(`client-email-${professional}`).value.trim();
    let bookedDateTime = document.getElementById(`available-dates-${professional}`).value;
    confirmBooking(professional, clientName, clientEmail, bookedDateTime, amount, "Bank Transfer");
  }, 5000);
}

function confirmBooking(professional, clientName, clientEmail, bookedDateTime, amount, paymentMethod) {
  let clientCode = generateClientCode();
  let zoomLink = zoomLinks[professional] || "https://zoom.us";
  let logEntry = `<li><strong>${clientCode}</strong> booked with <strong>${professional}</strong> on <strong>${bookedDateTime}</strong> for <strong>₦${amount}</strong> via <strong>${paymentMethod}</strong> - <a href="${zoomLink}" target="_blank">Join Zoom</a></li>`;
  document.getElementById("booking-log-list").innerHTML += logEntry;
  alert("Appointment booked successfully!");
}

function generateClientCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "Client-";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function checkInputs(professional) {
  let name = document.getElementById(`client-name-${professional}`).value.trim();
  let email = document.getElementById(`client-email-${professional}`).value.trim();
  let availableDates = document.getElementById(`available-dates-${professional}`).value;

  if (!name) {
    alert("Please enter your name before proceeding to payment.");
    return false;
  }

  if (!email) {
    alert("Please enter your email before proceeding to payment.");
    return false;
  }

  if (!availableDates || availableDates === "No slots available") {
    alert("Please select a valid slot.");
    return false;
  }

  return true;
}

const zoomLinks = {
  "DrSmith": "https://zoom.us/j/1111111111",
  "DrSam": "https://zoom.us/j/2222222222",
  "DrJones": "https://zoom.us/j/3333333333",
  "Anne": "https://zoom.us/j/4444444444",
  "CoachMark": "https://zoom.us/j/5555555555",
  "DrJohn": "https://zoom.us/j/6666666666",
  "DrAdams": "https://zoom.us/j/7777777777",
  "Williams": "https://zoom.us/j/8888888888"
};