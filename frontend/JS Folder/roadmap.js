/* ==========================================
   Hero Search Bar Toaster (Auto-Hide with Timer)
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
  const searchBar = document.getElementById('searchBar');
  const comingSoonPopup = document.getElementById('comingSoonPopup');

  if (searchBar && comingSoonPopup) {
    let hideTimeout;

    searchBar.addEventListener('click', (e) => {
      e.stopPropagation();
      
      // Popup show karein
      comingSoonPopup.style.display = 'block';

      // Pehle se chal raha timer clear karein taaki overlap na ho
      clearTimeout(hideTimeout);

      // 2 seconds (2000ms) ke baad popup automatically hide ho jayega
      hideTimeout = setTimeout(() => {
        comingSoonPopup.style.display = 'none';
      }, 2000); // Yahan aap time change kar sakte hain (jaise 3000 = 3 seconds)
    });

    // Agar user kahin aur click kare toh bhi turant hide ho jaye
    document.addEventListener('click', () => {
      clearTimeout(hideTimeout);
      comingSoonPopup.style.display = 'none';
    });
  }
});


/* ==========================================
   Project Cards Modal / Toaster Logic
   ========================================== */

function openModal() {
  const modal = document.getElementById('comingSoonModal');
  if (modal) {
    modal.style.display = 'flex'; // Modal ko display karega aur blur effect activate hoga
  }
}

function closeModal() {
  const modal = document.getElementById('comingSoonModal');
  if (modal) {
    modal.style.display = 'none'; // Modal ko hide karega
  }
}

// Modal ke baahar dark/blur area (overlay) par click karne par bhi band ho jaye
window.addEventListener('click', (e) => {
  const modal = document.getElementById('comingSoonModal');
  if (e.target === modal) {
    closeModal();
  }
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