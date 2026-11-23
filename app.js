const bookingSection = document.getElementById("booking");

const toast = document.createElement("div");
toast.className = "toast";
toast.setAttribute("role", "status");
document.body.appendChild(toast);

let toastTimer;

function showToast(message) {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("visible");

    toastTimer = setTimeout(() => {
        toast.classList.remove("visible");
        toast.textContent = "";
    }, 3000);
}

document.querySelectorAll("[data-book]").forEach((link) => {
    link.addEventListener("click", (event) => {
        event.preventDefault();
        bookingSection.scrollIntoView({ behavior: "smooth" });
        showToast("Booking form opened. Enter your details to continue.");
    });
});

const match = document.getElementById("match");
const stand = document.getElementById("stand");
const tickets = document.querySelector("#tickets");

// Prices per ticket from the Match Schedule.
const prices = {
    "RCB vs CSK": { General: 800, Premium: 2000, VIP: 5000 },
    "MI vs KKR": { General: 1000, Premium: 2500, VIP: 6000 },
    "SRH vs RR": { General: 700, Premium: 1800, VIP: 4500 }
};

function formatPrice(amount) {
    return "₹" + amount.toLocaleString("en-IN");
}

function updateSummary() {
    const price = prices[match.value]?.[stand.value] || 0;
    const quantity = tickets.validity.valid ? tickets.valueAsNumber : 0;

    document.getElementById("summary-match").textContent = match.value || "Not Selected";
    document.getElementById("summary-stand").textContent = stand.value || "Not Selected";
    document.getElementById("summary-price").textContent = formatPrice(price);
    document.getElementById("summary-quantity").textContent = quantity;
    document.getElementById("summary-total").textContent = formatPrice(price * quantity);
}

function confirmUpdate() {
    updateSummary();
    showToast("Booking summary updated.");
}

for (const control of [match, stand, tickets]) {
    control.addEventListener("change", confirmUpdate);
}
tickets.addEventListener("input", updateSummary);
tickets.form.addEventListener("reset", () => setTimeout(confirmUpdate, 0));
updateSummary();
