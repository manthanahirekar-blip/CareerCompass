document.addEventListener("DOMContentLoaded", () => {

    const cards = document.querySelectorAll(
        ".feature-card, .purpose-card, .audience-card, .step"
    );

    const observer = new IntersectionObserver(
        (entries) => {

            entries.forEach((entry) => {

                if (entry.isIntersecting) {

                    entry.target.style.opacity = "1";
                    entry.target.style.transform = "translateY(0)";

                    observer.unobserve(entry.target);
                }

            });

        },
        {
            threshold: 0.1
        }
    );

    cards.forEach((card) => {

        card.style.opacity = "0";
        card.style.transform = "translateY(15px)";
        card.style.transition = "opacity .5s ease, transform .5s ease";

        observer.observe(card);

    });

});