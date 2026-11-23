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
        match.value = link.closest(".match-card").querySelector("h3").textContent;
        updateSummary();
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

// Activity 8 controls appear on the home page.
const teamFilter = document.getElementById("team-filter");
if (teamFilter) {
    const cards = document.getElementById("match-cards");
    const viewButton = document.getElementById("view-toggle");
    const menuButton = document.getElementById("menu-toggle");
    const navigation = document.getElementById("main-nav");

    teamFilter.addEventListener("change", () => {
        for (const card of cards.children) {
            const teams = card.dataset.teams.split(" ");
            card.hidden = Boolean(teamFilter.value) && !teams.includes(teamFilter.value);
        }
    });

    viewButton.addEventListener("click", () => {
        const listView = cards.classList.toggle("list-view");
        viewButton.textContent = listView ? "Grid view" : "List view";
    });

    function setMenu(open) {
        navigation.classList.toggle("is-open", open);
        menuButton.setAttribute("aria-expanded", String(open));
    }

    menuButton.addEventListener("click", () => setMenu(!navigation.classList.contains("is-open")));
    navigation.addEventListener("click", () => setMenu(false));
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && navigation.classList.contains("is-open")) {
            setMenu(false);
            menuButton.focus();
        }
    });
    window.matchMedia("(max-width: 1024px)").addEventListener("change", () => setMenu(false));
}
