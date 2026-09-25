// =====================================================
// MENU JS
// =====================================================

const mobileMenu = document.getElementById("mobile-menu");
const navLinks = document.querySelector(".nav-links");

if (mobileMenu && navLinks) {

    mobileMenu.addEventListener("click", () => {
        mobileMenu.classList.toggle("is-active");
        navLinks.classList.toggle("active");
    });

}

document.querySelectorAll(".nav-links a").forEach(link => {

    link.addEventListener("click", () => {

        if (mobileMenu && navLinks) {
            mobileMenu.classList.remove("is-active");
            navLinks.classList.remove("active");
        }

    });

});


// =====================================================
// CAREER DATA
// =====================================================

const careerGrid = document.querySelector(".career-grid");

let careers = [];

let selectedCareerId = null;

// =====================================================
// SHOW MORE / SHOW LESS
// =====================================================

const INITIAL_VISIBLE = 8;
const VISIBLE_STEP = 8;

let visibleLimit = INITIAL_VISIBLE;
let currentFilteredData = [];


// =====================================================
// FILTER STATE
// =====================================================

const filters = {

    search: "",

    category: "All",

    salary: "All",

    difficulty: "All",

    demand: "All"

};


// =====================================================
// NORMALIZE TEXT
// =====================================================

function normalizeText(value) {

    return String(value ?? "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");

}


// =====================================================
// NORMALIZE CATEGORY
// =====================================================

function normalizeCategory(value) {

    return normalizeText(value)
        .replace(/&/g, "and");

}


// =====================================================
// NORMALIZE DIFFICULTY
// =====================================================

function normalizeDifficulty(value) {

    const difficulty = normalizeText(value);

    if (difficulty === "beginner") {
        return "beginner";
    }

    if (difficulty === "intermediate") {
        return "intermediate";
    }

    if (difficulty === "advanced") {
        return "advanced";
    }

    return difficulty;

}


// =====================================================
// NORMALIZE DEMAND
// =====================================================

function normalizeDemand(value) {

    const demand = normalizeText(value);

    if (demand === "very high") {
        return "very high";
    }

    if (demand === "high") {
        return "high";
    }

    if (demand === "medium") {
        return "medium";
    }

    if (demand === "low") {
        return "low";
    }

    return demand;

}


// =====================================================
// GET SALARY RANGE
// =====================================================

function getCareerSalary(career) {

    let min = Number(career.salary?.min);
    let max = Number(career.salary?.max);

    /*
        Safety fallback in case salary data is returned
        directly instead of inside career.salary.
    */

    if (!Number.isFinite(min)) {
        min = Number(career.salary_min);
    }

    if (!Number.isFinite(max)) {
        max = Number(career.salary_max);
    }

    if (!Number.isFinite(min)) {
        min = 0;
    }

    if (!Number.isFinite(max)) {
        max = min;
    }

    return {
        min,
        max
    };

}


// =====================================================
// CHECK SALARY FILTER
// =====================================================

function matchesSalary(career) {

    // No salary filter
    if (filters.salary === "All") {
        return true;
    }


    const salary = getCareerSalary(career);

    const careerMin = salary.min;
    const careerMax = salary.max;


    // Invalid salary data
    if (
        !Number.isFinite(careerMin) ||
        !Number.isFinite(careerMax)
    ) {
        return false;
    }


    // ==========================================
    // ₹20+ LPA
    // ==========================================

    if (filters.salary === "20+") {

        return careerMax >= 20;

    }


    // ==========================================
    // SELECTED SALARY RANGE
    // ==========================================

    const [selectedMin, selectedMax] =
        filters.salary
            .split("-")
            .map(Number);


    if (
        !Number.isFinite(selectedMin) ||
        !Number.isFinite(selectedMax)
    ) {
        return true;
    }


    // ==========================================
    // RANGE OVERLAP LOGIC
    // ==========================================

    return (
        careerMin <= selectedMax &&
        careerMax >= selectedMin
    );

}


// =====================================================
// FETCH CAREERS
// =====================================================

fetch("http://127.0.0.1:5000/api/careers")

    .then(response => {

        if (!response.ok) {
            throw new Error("Failed to fetch careers");
        }

        return response.json();

    })

    .then(async data => {

    careers = Array.isArray(data)
        ? data
        : [];

    visibleLimit = INITIAL_VISIBLE;

    currentFilteredData = [...careers];

    await loadSelectedCareer();

    renderVisibleCareers();

})

    .catch(error => {

        console.error("Error fetching careers:", error);

    });

// =====================================================
// LOAD SELECTED CAREER
// =====================================================

async function loadSelectedCareer() {

    try {

        const response = await fetch(
            "http://127.0.0.1:5000/api/auth/career",
            {
                method: "GET",
                credentials: "include"
            }
        );


        if (!response.ok) {

            selectedCareerId = null;

            return;
        }


        const data =
            await response.json();


        if (
            data.success &&
            data.career
        ) {

            selectedCareerId =
                Number(data.career.id);

        } else {

            selectedCareerId = null;

        }


    } catch (error) {

        console.error(
            "Error loading selected career:",
            error
        );

        selectedCareerId = null;

    }

}
// =====================================================
// CREATE CAREER CARD
// =====================================================

function createCareerCard(career) {

    return `

        <div class="career-card">

            <div class="career-header">

                <i class="${career.icon || ""}"></i>

                <span>${career.demand || ""}</span>

            </div>

            <div class="career-body">

                <h3>${career.title || ""}</h3>

                <p>${career.shortDescription || ""}</p>

            </div>

            <div class="career-actions">

                <a
                    href="career-details.html?id=${career.id}"
                    target="_blank"
                    class="explore-btn"
                >
                    Explore Career
                    <i class="ri-arrow-right-line"></i>
                </a>

                <a
                    href="roadmap-details.html?careerId=${career.id}"
                    target="_blank"
                    class="roadmap-btn"
                >
                    View Roadmap
                    <i class="ri-road-map-line"></i>
                </a>

                <button
    type="button"
    class="select-career-btn ${Number(selectedCareerId) === Number(career.id) ? "selected" : ""}"
    data-career-id="${career.id}"
>
    ${Number(selectedCareerId) === Number(career.id)
            ? "Selected ✓"
            : "Select Career"}
</button>

            </div>

        </div>

    `;

}


// =====================================================
// RENDER CAREER CARDS
// =====================================================

function renderCareerCards(data) {

    let cards = "";

    data.forEach(career => {

        cards += createCareerCard(career);

    });

    careerGrid.innerHTML = cards;

}


// =====================================================
// RENDER VISIBLE CAREERS
// =====================================================

function renderVisibleCareers() {

    const noResults =
        document.querySelector(".no-results");

    const showMoreBtn =
        document.querySelector(".show-more-btn");

    const showLessBtn =
        document.querySelector(".show-less-btn");


    const total =
        currentFilteredData.length;


    if (total === 0) {

        careerGrid.innerHTML = "";

        if (noResults) {
            noResults.style.display = "block";
        }

        if (showMoreBtn) {
            showMoreBtn.style.display = "none";
        }

        if (showLessBtn) {
            showLessBtn.style.display = "none";
        }

        return;

    }


    if (noResults) {
        noResults.style.display = "none";
    }


    const visibleData =
        currentFilteredData.slice(
            0,
            visibleLimit
        );


    renderCareerCards(visibleData);


    if (showMoreBtn) {

        showMoreBtn.style.display =
            visibleLimit < total
                ? "inline-flex"
                : "none";

    }


    if (showLessBtn) {

        showLessBtn.style.display =
            visibleLimit >= total &&
                total > INITIAL_VISIBLE
                ? "inline-flex"
                : "none";

    }

}


// =====================================================
// SHOW MORE
// =====================================================

const showMoreBtn =
    document.querySelector(".show-more-btn");

if (showMoreBtn) {

    showMoreBtn.addEventListener("click", () => {

        visibleLimit =
            Math.min(
                visibleLimit + VISIBLE_STEP,
                currentFilteredData.length
            );

        renderVisibleCareers();

    });

}


// =====================================================
// SHOW LESS
// =====================================================

const showLessBtn =
    document.querySelector(".show-less-btn");

if (showLessBtn) {

    showLessBtn.addEventListener("click", () => {

        visibleLimit = INITIAL_VISIBLE;

        renderVisibleCareers();

    });

}


// =====================================================
// APPLY ALL FILTERS
// =====================================================

function applyFilters() {

    let filteredData = [...careers];


    // =================================================
    // SEARCH
    // =================================================

    if (filters.search !== "") {

        const searchTerm =
            normalizeText(filters.search);


        filteredData =
            filteredData.filter(career => {

                const title =
                    normalizeText(career.title);

                const category =
                    normalizeText(career.category);

                const description =
                    normalizeText(career.shortDescription);

                const fullDescription =
                    normalizeText(career.fullDescription);


                let skills = "";

                if (Array.isArray(career.skills)) {

                    skills =
                        career.skills
                            .map(skill =>
                                normalizeText(skill.name)
                            )
                            .join(" ");

                }


                return (

                    title.includes(searchTerm) ||

                    category.includes(searchTerm) ||

                    description.includes(searchTerm) ||

                    fullDescription.includes(searchTerm) ||

                    skills.includes(searchTerm)

                );

            });

    }


    // =================================================
    // CATEGORY
    // =================================================

    if (filters.category !== "All") {

        const selectedCategory =
            normalizeCategory(filters.category);


        filteredData =
            filteredData.filter(career => {

                return (
                    normalizeCategory(career.category)
                    ===
                    selectedCategory
                );

            });

    }


    // =================================================
    // SALARY
    // =================================================

    filteredData =
        filteredData.filter(career => {

            return matchesSalary(career);

        });


    // =================================================
    // DIFFICULTY
    // =================================================

    if (filters.difficulty !== "All") {

        const selectedDifficulty =
            normalizeDifficulty(filters.difficulty);


        filteredData =
            filteredData.filter(career => {

                return (
                    normalizeDifficulty(career.difficulty)
                    ===
                    selectedDifficulty
                );

            });

    }


    // =================================================
    // JOB DEMAND
    // =================================================

    if (filters.demand !== "All") {

        const selectedDemand =
            normalizeDemand(filters.demand);


        filteredData =
            filteredData.filter(career => {

                return (
                    normalizeDemand(career.demand)
                    ===
                    selectedDemand
                );

            });

    }


    // =================================================
    // UPDATE RESULT
    // =================================================

    currentFilteredData = filteredData;

    visibleLimit = INITIAL_VISIBLE;

    renderVisibleCareers();

}


// =====================================================
// SEARCH
// =====================================================

const searchInput =
    document.querySelector(".search-box input");

if (searchInput) {

    searchInput.addEventListener("input", event => {

        filters.search =
            event.target.value;

        applyFilters();

    });

}


// =====================================================
// CATEGORY
// =====================================================

const categoryBtns =
    document.querySelectorAll(".category-btn");

categoryBtns.forEach(button => {

    button.addEventListener("click", function () {

        categoryBtns.forEach(btn => {

            btn.classList.remove("active");

        });


        this.classList.add("active");


        filters.category =
            this.textContent.trim();


        applyFilters();

    });

});


// =====================================================
// SALARY
// =====================================================

const salarySelect =
    document.querySelector("#salary");

if (salarySelect) {

    salarySelect.addEventListener("change", event => {

        filters.salary =
            event.target.value;


        applyFilters();

    });

}


// =====================================================
// DIFFICULTY
// =====================================================

const difficultySelect =
    document.querySelector("#difficulty");

if (difficultySelect) {

    difficultySelect.addEventListener("change", event => {

        filters.difficulty =
            event.target.value;


        applyFilters();

    });

}


// =====================================================
// DEMAND
// =====================================================

const demandSelect =
    document.querySelector("#demand");

if (demandSelect) {

    demandSelect.addEventListener("change", event => {

        filters.demand =
            event.target.value;


        applyFilters();

    });

}


// =====================================================
// CLEAR ALL FILTERS
// =====================================================

const clearFilterBtn =
    document.querySelector(".clear-filter");

if (clearFilterBtn) {

    clearFilterBtn.addEventListener("click", function () {


        // -----------------------------------------
        // Reset filter state
        // -----------------------------------------

        filters.search = "";

        filters.category = "All";

        filters.salary = "All";

        filters.difficulty = "All";

        filters.demand = "All";


        // -----------------------------------------
        // Reset search
        // -----------------------------------------

        if (searchInput) {

            searchInput.value = "";

        }


        // -----------------------------------------
        // Reset salary
        // -----------------------------------------

        if (salarySelect) {

            salarySelect.value = "All";

        }


        // -----------------------------------------
        // Reset difficulty
        // -----------------------------------------

        if (difficultySelect) {

            difficultySelect.value = "All";

        }


        // -----------------------------------------
        // Reset demand
        // -----------------------------------------

        if (demandSelect) {

            demandSelect.value = "All";

        }


        // -----------------------------------------
        // Reset category
        // -----------------------------------------

        categoryBtns.forEach(btn => {

            btn.classList.remove("active");

        });


        if (categoryBtns.length > 0) {

            categoryBtns[0].classList.add("active");

        }


        // -----------------------------------------
        // Reset results
        // -----------------------------------------

        currentFilteredData =
            [...careers];

        visibleLimit =
            INITIAL_VISIBLE;

        renderVisibleCareers();


        // -----------------------------------------
        // Animation
        // -----------------------------------------

        this.classList.add("clicked");


        setTimeout(() => {

            this.classList.remove("clicked");

        }, 600);

    });

}

// =====================================================
// SELECT / DESELECT CAREER
// =====================================================

document.addEventListener("click", async (event) => {

    const button =
        event.target.closest(".select-career-btn");

    if (!button) {
        return;
    }


    const careerId =
        Number(button.dataset.careerId);


    if (!careerId) {
        return;
    }


    // =========================================
    // CHECK LOGIN
    // =========================================

    try {

        const authResponse =
            await fetch(
                "http://127.0.0.1:5000/api/auth/me",
                {
                    method: "GET",
                    credentials: "include"
                }
            );


        const authData =
            await authResponse.json();


        if (
            !authResponse.ok ||
            !authData.success
        ) {

            alert("Please login first.");

            window.location.href =
                "login.html";

            return;
        }


        // =========================================
        // DETERMINE SELECT / DESELECT
        // =========================================

        const isCurrentlySelected =
            Number(selectedCareerId) === careerId;


        button.disabled = true;

        button.textContent =
            isCurrentlySelected
                ? "Deselecting..."
                : "Selecting...";


        // =========================================
        // SELECTED CAREER
        // =========================================

        const response =
            await fetch(
                "http://127.0.0.1:5000/api/auth/career",
                {
                    method: "POST",

                    credentials: "include",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        career_id:
                            isCurrentlySelected
                                ? null
                                : careerId
                    })
                }
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Unable to update career selection."
            );

        }


        // =========================================
        // UPDATE FRONTEND STATE
        // =========================================

        if (isCurrentlySelected) {

            selectedCareerId = null;

            alert(
                "Career deselected successfully!"
            );

        } else {

            selectedCareerId = careerId;

            alert(
                "Career selected successfully!"
            );

        }


        // =========================================
        // RE-RENDER CARDS
        // =========================================

        renderVisibleCareers();


    } catch (error) {

        console.error(
            "Career selection error:",
            error
        );


        alert(
            error.message ||
            "Unable to update career selection."
        );


        // Restore button state

        renderVisibleCareers();

    }

});