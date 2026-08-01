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
const requestOptions = {
    method: "GET",
    redirect: "follow"
};


fetch("data/careers.json", requestOptions)
    .then((response) => response.json())
    .then((data) => {
        careers = data;
        renderCareerCards(data)
    })

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

                            <p class="career-salary">
                                <strong>₹${career.salary.min} - ₹${career.salary.max} LPA</strong>
                                <span>Average Salary</span>
                            </p>

                            <div class="career-skills">
                                Skills :
                                ${career.skills.map(skill => `<span>${skill.name}</span>`).join(" ")}
                            </div>
                        </div>

                        <div class="career-footer">
                            <span>Experience : ${career.experience}</span>
                            <span>Category : ${career.category}</span>
                        </div>

                        <a href="career-details.html?slug=${career.slug}" target="_blank" class="explore-btn">
                            Explore
                            <i class="ri-arrow-right-line"></i>
                        </a>

                    </div>
                    `;

    return card;
}


function renderCareerCards(data) {

    careerGrid.innerHTML = "";

    const noResults = document.querySelector(".no-results");

    if (data.length === 0) {
        noResults.style.display = "block";
        return;
    }

    noResults.style.display = "none";

    let card = "";

    data.forEach(career => {
        card += createCareerCard(career);
    });

    careerGrid.innerHTML = card;
}

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


    // Experience
    // filteredData = filteredData.filter(career =>{
    //     if(filters.experience !== "All"){
    //         if(career.experience === filters.experience){
    //             return true
    //         }
    //         return false
    //     }
    //     return true
    // })

    // filteredData = filteredData.filter(career => {
    //     if (filters.experience === "All") {
    //         return true;
    //     }

    //     return career.experience === filters.experience;
    // });

    filteredData = filteredData.filter(career => {
        return (
            filters.experience === "All Levels" ||
            career.experience === filters.experience
        );
    });

    renderCareerCards(filteredData)
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