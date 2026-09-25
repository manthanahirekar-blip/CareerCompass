document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("contactForm");
    const message = document.getElementById("formMessage");

    if (!form) return;

    form.addEventListener("submit", (event) => {

        event.preventDefault();

        const name =
            document.getElementById("contactName").value.trim();

        const email =
            document.getElementById("contactEmail").value.trim();

        const subject =
            document.getElementById("contactSubject").value;

        const userMessage =
            document.getElementById("contactMessage").value.trim();

        if (!name || !email || !subject || !userMessage) {
            return;
        }

        message.textContent =
            "Thank you for contacting CareerCompass. Your message has been noted.";

        message.style.display = "block";

        form.reset();

        setTimeout(() => {
            message.style.display = "none";
        }, 5000);

    });

});