document.addEventListener("DOMContentLoaded", function () {
    const filterSection = document.querySelector(".filter-section");
    const toast = document.getElementById("comingSoonToast");
    let toastTimeout;

    if (filterSection && toast) {
        filterSection.addEventListener("click", function (e) {
            // Toast popup trigger karein
            toast.classList.add("show");

            // Agar pehle se koi timer chal raha ho toh use clear karein
            clearTimeout(toastTimeout);

            // 3 seconds baad toast automatically hide ho jayega
            toastTimeout = setTimeout(function () {
                toast.classList.remove("show");
            }, 3000);
        });
    }
});

// Browse by category ka js
document.querySelectorAll('.category-header').forEach(header => {
    header.addEventListener('click', () => {
        const currentCard = header.parentElement;
        const isActive = currentCard.classList.contains('active');

        // Sabhi cards se 'active' class hata do (baki sab band ho jayenge)
        document.querySelectorAll('.category-accordion-card').forEach(card => {
            card.classList.remove('active');
        });

        // Agar click kiya hua card pehle se active nahi tha, toh use active kar do
        if (!isActive) {
            currentCard.classList.add('active');
        }
    });
});


// Menu js
const mobileMenu = document.getElementById('mobile-menu');
const navLinks = document.querySelector('.nav-links');
mobileMenu.addEventListener('click', () => {
    mobileMenu.classList.toggle('is-active');
    navLinks.classList.toggle('active');
});
// Optional: Link par click karne par menu apne aap band ho jaye (mobile view mein)
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.remove('is-active');
        navLinks.classList.remove('active');
    });
});