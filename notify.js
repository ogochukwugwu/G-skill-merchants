


let availability = {}; // Stores professionals' availability

    const zoomLinks = {
        "DrSmith": "https://zoom.us/j/1111111111",
        "DrJones": "https://zoom.us/j/2222222222",
        "TherapistAnne": "https://zoom.us/j/3333333333",
        "CoachMark": "https://zoom.us/j/4444444444",
        "ConsultantKate": "https://zoom.us/j/5555555555",
        "TrainerMike": "https://zoom.us/j/6666666666",
        "LegalAdvisorJane": "https://zoom.us/j/7777777777",
        "FinancialCoachPaul": "https://zoom.us/j/8888888888"
    };

    function setAvailability(professional) {
        let date = document.getElementById(`date-${professional}`).value;
        let time = document.getElementById(`time-${professional}`).value;
        
        if (!date || !time) {
            alert("Please select a date and time.");
            return;
        }

        let dateTime = `${date} at ${time}`;
        if (!availability[professional]) {
            availability[professional] = [];
        }

        if (!availability[professional].includes(dateTime)) {
            availability[professional].push(dateTime);
        }

        loadAvailability(professional);
        alert("Availability updated!");
    }

    function loadAvailability(professional) {
        let availableSlots = availability[professional] || [];
        let options = availableSlots.map(slot => `<option value="${slot}">${slot}</option>`).join("");
        document.getElementById(`available-dates-${professional}`).innerHTML = options || "<option>No slots available</option>";
    }

    function bookAppointment(professional) {
        let clientName = document.getElementById(`client-name-${professional}`).value.trim();
        let clientEmail = document.getElementById(`client-email-${professional}`).value.trim();
        let bookedDateTime = document.getElementById(`available-dates-${professional}`).value;

        if (!clientName || !clientEmail || bookedDateTime === "No slots available") {
            alert("Please enter all details and select a valid slot.");
            return;
        }

        let zoomLink = zoomLinks[professional] || "https://zoom.us";

        let logEntry = `<li><strong>${clientName}</strong> booked with <strong>${professional}</strong> on <strong>${bookedDateTime}</strong> - <a href="${zoomLink}" target="_blank">Join Zoom</a></li>`;
        document.getElementById("booking-log-list").innerHTML += logEntry;
        alert("Appointment booked successfully!");
    }


    let clientRecords = {}; // Store client real details for admin use

function generateClientCode() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "Client-";
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

function bookAppointment(professional) {
    let clientName = document.getElementById(`client-name-${professional}`).value.trim();
    let clientEmail = document.getElementById(`client-email-${professional}`).value.trim();
    let bookedDateTime = document.getElementById(`available-dates-${professional}`).value;

    if (!clientName || !clientEmail || bookedDateTime === "No slots available") {
        alert("Please enter all details and select a valid slot.");
        return;
    }

    let clientCode = generateClientCode();  // Generate a unique code name
    let zoomLink = zoomLinks[professional] || "https://zoom.us";

    // Save real client details (only admin can see this)
    clientRecords[clientCode] = { name: clientName, email: clientEmail };

    let logEntry = `<li><strong>${clientCode}</strong> booked with <strong>${professional}</strong> on <strong>${bookedDateTime}</strong> - <a href="${zoomLink}" target="_blank">Join Zoom</a></li>`;

    document.getElementById("booking-log-list").innerHTML += logEntry;
    alert("Appointment booked successfully!");
}

// Function for admin to see real client details
function viewClientRecords() {
    let password = prompt("Enter admin password:");
    if (password === "admin123") {
        let logDetails = "<h3>Admin View: Client Records</h3><ul>";
        for (let code in clientRecords) {
            logDetails += `<li><strong>${code}</strong> - ${clientRecords[code].name} (${clientRecords[code].email})</li>`;
        }
        logDetails += "</ul>";
        document.getElementById("admin-log").innerHTML = logDetails;
    } else {
        alert("Access Denied!");
    }
}

function generateClientCode() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "Client-";
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}


function sendEmail(clientCode, clientName, clientEmail, professional, bookedDateTime) {
    let adminEmail = "ogochukwugwu@gmail.com"; // Change this to your email
    let subject = "New Appointment Booked";
    let message = `Client Code: ${clientCode}\nName: ${clientName}\nEmail: ${clientEmail}\nBooked With: ${professional}\nDate & Time: ${bookedDateTime}`;
    
    let mailtoLink = `mailto:${adminEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    window.location.href = mailtoLink;
}

function bookAppointment(professional) {
    let clientName = document.getElementById(`client-name-${professional}`).value.trim();
    let clientEmail = document.getElementById(`client-email-${professional}`).value.trim();
    let bookedDateTime = document.getElementById(`available-dates-${professional}`).value;

    if (!clientName || !clientEmail || bookedDateTime === "No slots available") {
        alert("Please enter all details and select a valid slot.");
        return;
    }

    let clientCode = generateClientCode(); // Generate a unique code name

    // Send email with client details
    sendEmail(clientCode, clientName, clientEmail, professional, bookedDateTime);

    let zoomLink = zoomLinks[professional] || "https://zoom.us";
    let logEntry = `<li><strong>${clientCode}</strong> booked with <strong>${professional}</strong> on <strong>${bookedDateTime}</strong> - <a href="${zoomLink}" target="_blank">Join Zoom</a></li>`;

    document.getElementById("booking-log-list").innerHTML += logEntry;
    alert("Appointment booked successfully!");
}

/* Pay before appointement */


/*Payment Options*/

function payWithFlutterwave(professional, amount) {
    let clientName = document.getElementById(`client-name-${professional}`).value.trim();
    let clientEmail = document.getElementById(`client-email-${professional}`).value.trim();
    let bookedDateTime = document.getElementById(`available-dates-${professional}`).value;

    if (!clientName || !clientEmail || bookedDateTime === "No slots available") {
        alert("Please enter all details and select a valid slot.");
        return;
    }

    FlutterwaveCheckout({
        public_key: "YOUR_FLUTTERWAVE_PUBLIC_KEY",
        tx_ref: "TX" + Math.floor(Math.random() * 1000000), // Unique transaction ID
        amount: amount,
        currency: "USD",
        payment_options: "card, banktransfer, ussd, mobilemoney",
        customer: {
            email: clientEmail,
            name: clientName
        },
        callback: function(response) {
            if (response.status === "successful") {
                confirmBooking(professional, clientName, clientEmail, bookedDateTime, amount, "Flutterwave");
            } else {
                alert("Payment failed. Please try again.");
            }
        },
        onclose: function() {
            alert("Payment window closed.");
        }
    });
}

function manualBankTransfer(professional, amount) {
    alert(`Please transfer $${amount} to:\nBank Name: XYZ Bank\nAccount Number: 1234567890`);

    // Show file upload section
    document.getElementById(`bank-transfer-upload-${professional}`).style.display = "block";
}

function confirmBankTransfer(professional, amount) {
    let proofFile = document.getElementById(`proof-${professional}`).files[0];

    if (!proofFile) {
        alert("Please upload proof of bank transfer.");
        return;
    }

    alert("Proof uploaded. Your booking will be confirmed after verification.");

    // Simulating admin verification
    setTimeout(() => {
        let clientName = document.getElementById(`client-name-${professional}`).value.trim();
        let clientEmail = document.getElementById(`client-email-${professional}`).value.trim();
        let bookedDateTime = document.getElementById(`available-dates-${professional}`).value;

        confirmBooking(professional, clientName, clientEmail, bookedDateTime, amount, "Bank Transfer");
    }, 5000); // Simulating admin verification delay
}

function confirmBooking(professional, clientName, clientEmail, bookedDateTime, amount, paymentMethod) {
    let clientCode = generateClientCode();
    let zoomLink = zoomLinks[professional] || "https://zoom.us";

    let logEntry = `<li><strong>${clientCode}</strong> booked with <strong>${professional}</strong> on <strong>${bookedDateTime}</strong> for <strong>$${amount}</strong> via <strong>${paymentMethod}</strong> - <a href="${zoomLink}" target="_blank">Join Zoom</a></li>`;
    
    document.getElementById("booking-log-list").innerHTML += logEntry;
    alert("Appointment booked successfully!");
}




document.addEventListener("DOMContentLoaded", function() {
    let availabilityChecked = {}; // Track if availability is set per expert
    let privacyWarned = {}; // Track if privacy warning has been shown per expert

    function showPrivacyWarning(expert) {
        if (!privacyWarned[expert]) {
            alert(`Privacy Notice: Your data for ${expert} will be protected and not shared. A unique name will be generated for you on the booking log`);
            privacyWarned[expert] = true; // Prevent multiple pop-ups
        }
    }

    function showAvailabilityConfirmation(expert) {
        alert(`${expert}'s availability has been successfully set.`);
    }

    window.setAvailability = function(expert) {
        let date = document.getElementById(`date-${expert}`).value;
        let time = document.getElementById(`time-${expert}`).value;
        if (date && time) {
            let availabilitySelect = document.getElementById(`available-date-${expert}`) || document.getElementById(`available-dates-${expert}`);
            let option = document.createElement("option");
            option.value = `${date} ${time}`;
            option.textContent = `${date} ${time}`;
            availabilitySelect.appendChild(option);
            availabilityChecked[expert] = true;
            showAvailabilityConfirmation(expert);
        } else {
            alert("Please select a valid date and time.");
        }
    };

    document.querySelectorAll(".booking").forEach(bookingSection => {
        let expert = bookingSection.closest(".card").querySelector("h3").textContent.trim();
        let nameInput = bookingSection.querySelector("input[type='text']");
        let emailInput = bookingSection.querySelector("input[type='email']");

        function triggerPrivacyWarning() {
            showPrivacyWarning(expert);
        }

        nameInput.addEventListener("focus", triggerPrivacyWarning);
        emailInput.addEventListener("focus", triggerPrivacyWarning);
    });

    window.payWithFlutterwave = function(expert, price) {
        if (!availabilityChecked[expert]) {
            alert(`Please select a date and time for ${expert} before proceeding with payment.`);
        } else {
            alert(`Redirecting to Flutterwave payment for ${expert}, amount: ₦${price}`);
        }
    };

    window.manualBankTransfer = function(expert, price) {
        if (!availabilityChecked[expert]) {
            alert(`Please select a date and time for ${expert} before proceeding.`);
        } else {
            document.getElementById(`bank-transfer-upload-${expert}`).style.display = "block";
        }
    };

    window.confirmBankTransfer = function(expert, price) {
        alert(`Proof of payment submitted for ${expert}, amount: ₦${price}`);
    };

    window.bookAppointment = function(expert) {
        alert(`Appointment booked successfully with ${expert}!`);
    };
});



