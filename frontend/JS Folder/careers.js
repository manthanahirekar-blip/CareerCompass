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

let careerGrid = document.querySelector(".career-grid");
let careers = [];
const filters = {
    search: "",
    category: "All",
    salary: "All",
    experience: "All Levels",
    sort: "Highest Demand"
};

// Show More / Show Less state.
// currentFilteredData always holds the CURRENT search+filter result
// (before the visible-card limit is applied), so Show Less can return
// to the first 4 of it without losing the active search/filter.
const INITIAL_VISIBLE = 8;
const VISIBLE_STEP = 8;
let visibleLimit = INITIAL_VISIBLE;
let currentFilteredData = [];
fetch("https://careercompass-1yfu.onrender.com/api/careers")

    .then((response) => {

        if (!response.ok) {
            throw new Error("Failed to fetch careers");
        }

        return response.json();
    })

    .then((data) => {

        careers = data;

        visibleLimit = INITIAL_VISIBLE;
        currentFilteredData = careers;

        renderVisibleCareers();

    })

    .catch((error) => {

        console.error("Error fetching careers:", error);

    });

function createCareerCard(career) {
    let card = `
                    <div class="career-card">

                        <div class="career-header">
                            <i class="${career.icon}"></i>
                            <span>${career.demand}</span>
                        </div>

                        <div class="career-body">
                            <h3>${career.title}</h3>

                            <p>${career.shortDescription}</p>
                        </div>

                        <div class="career-actions">
                            <a href="career-details.html?id=${career.id}" target="_blank" class="explore-btn">
                                Explore Career
                                <i class="ri-arrow-right-line"></i>
                            </a>

                            <a href="roadmap-details.html?careerId=${career.id}" target="_blank" class="roadmap-btn">
                                View Roadmap
                                <i class="ri-road-map-line"></i>
                            </a>
                        </div>

                    </div>
                    `;

    return card;
}


function renderCareerCards(data) {

    let card = "";

    data.forEach(career => {
        card += createCareerCard(career);
    });

    careerGrid.innerHTML = card;
}


// ==========================================
// Show More / Show Less
// Renders only `visibleLimit` cards out of the CURRENT
// search+filter result (currentFilteredData), and shows/hides
// the Show More / Show Less buttons based on that same result.
// ==========================================
function renderVisibleCareers() {

    const noResults = document.querySelector(".no-results");
    const showMoreBtn = document.querySelector(".show-more-btn");
    const showLessBtn = document.querySelector(".show-less-btn");

    const total = currentFilteredData.length;

    if (total === 0) {
        careerGrid.innerHTML = "";
        noResults.style.display = "block";
        showMoreBtn.style.display = "none";
        showLessBtn.style.display = "none";
        return;
    }

    noResults.style.display = "none";

    const visibleData = currentFilteredData.slice(0, visibleLimit);
    renderCareerCards(visibleData);

    showMoreBtn.style.display = visibleLimit < total ? "inline-flex" : "none";
    showLessBtn.style.display = (visibleLimit >= total && total > INITIAL_VISIBLE) ? "inline-flex" : "none";
}


const showMoreBtn = document.querySelector(".show-more-btn");
showMoreBtn.addEventListener("click", function () {
    visibleLimit = Math.min(visibleLimit + VISIBLE_STEP, currentFilteredData.length);
    renderVisibleCareers();
});

const showLessBtn = document.querySelector(".show-less-btn");
showLessBtn.addEventListener("click", function () {
    visibleLimit = INITIAL_VISIBLE;
    renderVisibleCareers();
});

function applyFilters() {
    let filteredData = careers

    // search
    if (filters.search !== "") {
        filteredData = filteredData.filter(career => {
            return (
                career.title.toLowerCase().includes(filters.search) ||
                career.category.toLowerCase().includes(filters.search) ||
                career.shortDescription.toLowerCase().includes(filters.search) ||
                career.skills.some(skill =>
                    skill.name.toLowerCase().includes(filters.search)
                )
            );

        })
    }

    // category
    if (filters.category !== "All") {

        filteredData = filteredData.filter(career => {
            return (
                career.category.trim().toLowerCase() ===
                filters.category.trim().toLowerCase()
            );
        });

    }

    // salary
    filteredData = filteredData.filter(career => {
        if (filters.salary !== "All") {
            if (filters.salary === "20+") {
                let selectSalary = parseInt(filters.salary)
                if (career.salary.max >= selectSalary) {
                    return true
                }
                return false
            }
            else {
                let selectSalary = filters.salary.split("-");
                let selectMin = Number(selectSalary[0])
                let selectMax = Number(selectSalary[1])

                if (career.salary.min <= selectMax && career.salary.max >= selectMin) {
                    return true
                }
                return false
            }

        }
        return true
    })

    filteredData = filteredData.filter(career => {
        return (
            filters.experience === "All Levels" ||
            career.experience === filters.experience
        );
    });

    visibleLimit = INITIAL_VISIBLE;
    currentFilteredData = filteredData;

    renderVisibleCareers();
}


const searchInput = document.querySelector(".search-box input")
searchInput.addEventListener("input", function (e) {
    filters.search = e.target.value.toLowerCase();
    applyFilters()
})


const categoryBtns = document.querySelectorAll(".category-btn")
categoryBtns.forEach(button => {
    button.addEventListener("click", function (e) {
        categoryBtns.forEach(btn => {
            btn.classList.remove('active')
        })
        e.target.classList.add('active');
        filters.category = e.target.textContent.trim();
        applyFilters();
    })
});

const salarySelect = document.querySelector("#salary");
salarySelect.addEventListener("change", function (e) {

    let salary = e.target.value.split("-")
    filters.salary = e.target.value;
    // console.log(filters.salary);

    applyFilters();
})

const experienceLevel = document.querySelector("#level")
experienceLevel.addEventListener("change", function (e) {
    filters.experience = e.target.value;
    // console.log(experience);
    applyFilters()
})

// CLEAR FILTER BUTTON

const clearFilterBtn = document.querySelector(".clear-filter");

clearFilterBtn.addEventListener("click", function () {

    // Reset filter object
    filters.search = "";
    filters.category = "All";
    filters.salary = "All";
    filters.experience = "All Levels";

    // Reset Search Input
    searchInput.value = "";

    // Reset Salary Dropdown
    salarySelect.value = "All";

    // Reset Experience Dropdown
    experienceLevel.value = "All Levels";

    // Reset Category Buttons
    categoryBtns.forEach(btn => {
        btn.classList.remove("active");
    });

    categoryBtns[0].classList.add("active");

    // Show All Cards
    applyFilters();

});

clearFilterBtn.addEventListener("click", function () {

    this.classList.add("clicked");

    setTimeout(() => {

        this.classList.remove("clicked");

    }, 600);

});