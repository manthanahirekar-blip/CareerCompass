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


const track = document.querySelector(".testimonial-track");
const cards = [...document.querySelectorAll(".testimonial-card")];

const prevBtn = document.querySelector(".prev-btn");
const nextBtn = document.querySelector(".next-btn");
const dotsContainer = document.querySelector(".testimonial-dots");

let currentSlide = 0;
let cardsPerView = getCardsPerView();
let totalSlides = Math.ceil(cards.length / cardsPerView);

let autoPlay;

// ---------- Responsive ----------

function getCardsPerView() {

    if (window.innerWidth <= 768) return 1;

    if (window.innerWidth <= 992) return 2;

    return 3;
}

// ---------- Dots ----------

function createDots() {

    dotsContainer.innerHTML = "";

    totalSlides = Math.ceil(cards.length / cardsPerView);

    for (let i = 0; i < totalSlides; i++) {

        const dot = document.createElement("span");

        dot.classList.add("dot");

        if (i === currentSlide) {
            dot.classList.add("active");
        }

        dot.addEventListener("click", () => {

            currentSlide = i;

            updateSlider();

        });

        dotsContainer.appendChild(dot);

    }

}

// ---------- Update Slider ----------

function updateSlider() {

    const cardWidth = cards[0].offsetWidth;

    const gap = parseFloat(getComputedStyle(track).gap);

    const move =
        currentSlide * (cardWidth + gap) * cardsPerView;

    track.style.transform = `translateX(-${move}px)`;

    document.querySelectorAll(".dot").forEach(dot => {
        dot.classList.remove("active");
    });

    document.querySelectorAll(".dot")[currentSlide]
        .classList.add("active");

}

// ---------- Next ----------

function nextSlide() {

    currentSlide++;

    if (currentSlide >= totalSlides) {

        currentSlide = 0;

    }

    updateSlider();

}

// ---------- Previous ----------

function prevSlide() {

    currentSlide--;

    if (currentSlide < 0) {

        currentSlide = totalSlides - 1;

    }

    updateSlider();

}

// ---------- Buttons ----------

nextBtn.addEventListener("click", () => {

    nextSlide();

    restartAutoPlay();

});

prevBtn.addEventListener("click", () => {

    prevSlide();

    restartAutoPlay();

});

// ---------- Auto Play ----------

function startAutoPlay() {

    autoPlay = setInterval(nextSlide, 4500);

}

function stopAutoPlay() {

    clearInterval(autoPlay);

}

function restartAutoPlay() {

    stopAutoPlay();

    startAutoPlay();

}

// ---------- Hover Pause ----------

track.addEventListener("mouseenter", stopAutoPlay);

track.addEventListener("mouseleave", startAutoPlay);

// ---------- Swipe ----------

let startX = 0;
let endX = 0;

track.addEventListener("touchstart", (e) => {

    startX = e.touches[0].clientX;

});

track.addEventListener("touchmove", (e) => {

    endX = e.touches[0].clientX;

});

track.addEventListener("touchend", () => {

    if (startX - endX > 50) {

        nextSlide();

    }

    if (endX - startX > 50) {

        prevSlide();

    }

    restartAutoPlay();

});

// ---------- Keyboard ----------

document.addEventListener("keydown", (e) => {

    if (e.key === "ArrowRight") {

        nextSlide();

    }

    if (e.key === "ArrowLeft") {

        prevSlide();

    }

});

// ---------- Resize ----------

window.addEventListener("resize", () => {

    cardsPerView = getCardsPerView();

    currentSlide = 0;

    createDots();

    updateSlider();

});

// ---------- Init ----------

createDots();

updateSlider();

startAutoPlay();


//  NEWSLETTER SECTION TOASTER

const form = document.getElementById("newsletterForm");
const emailInput = document.getElementById("newsletterEmail");
const message = document.getElementById("newsletterMessage");

form.addEventListener("submit",(e)=>{

    e.preventDefault();

    const email = emailInput.value.trim();

    if(email===""){

        message.textContent="Please enter your email.";

        message.className="error";

        return;

    }

    form.querySelector("button").disabled=true;

    form.querySelector("button").textContent="Subscribing...";

   setTimeout(() => {

    message.textContent = "🎉 Thanks for subscribing!";
    message.className = "success";

    form.reset();

    form.querySelector("button").disabled = false;
    form.querySelector("button").textContent = "Subscribe";

    // 3 seconds baad message hide
    setTimeout(() => {

        message.textContent = "";
        message.className = "";

    }, 3000);

}, 1500);

});