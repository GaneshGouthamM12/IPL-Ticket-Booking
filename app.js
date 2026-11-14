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