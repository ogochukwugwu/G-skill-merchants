import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

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
const db = getFirestore(app);
const auth = getAuth(app);

// Login professional and load availability
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    alert("Login successful! You can now set availability.");
    // Check user role and enable buttons if professional
    checkUserRole().then(isProfessional => {
      if (isProfessional) {
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
        if (userDoc.exists() && userDoc.data().role === "professional") {
          resolve(true);
        } else {
          resolve(false);
        }
      } else {
        resolve(false);
      }
    });
  });
}