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


const careerImage = document.querySelector(".career-image");
const careerCategory = document.querySelector(".career-category");
const careerTitle = document.querySelector(".career-title");
const careerShortDescription = document.querySelector(".career-short-description");

const salary = document.querySelector(".salary");
const experience = document.querySelector(".experience");
const demand = document.querySelector(".demand");
const category = document.querySelector(".category");



const requestOptions = {
    method: "Get",
    redirect: "follow"
};

const params = new URLSearchParams(window.location.search)
const slug = params.get("slug")
console.log(slug);


fetch("data/careers.json", requestOptions)
    .then((response) => response.json())
    .then((data) => {
        let career = data.find(item => {
            return item.slug === slug;
        })
        console.log(career);
        renderHero(career)
        renderAbout(career)
        renderResponsibilities(career)
        renderSkills(career)
        renderRoadmap(career)
        renderResources(career)
        renderSnapshot(career)
        renderCompanies(career)
        renderQuickInfo(career)
        renderRelatedCareer(career)
        renderFAQs(career.faqs)
    })

function renderHero(career) {
    careerTitle.textContent = career.title;
    careerCategory.textContent = career.category;
    careerShortDescription.textContent = career.shortDescription;
    salary.textContent = `₹${career.salary.min} - ${career.salary.max} LPA`
    experience.textContent = career.experience
    demand.textContent = career.demand
    category.textContent = career.category
}

const about = document.querySelector("#about");
const aboutDescription = document.querySelector(".about-description");
function renderAbout(career) {
    about.textContent = career.title;
    aboutDescription.textContent = career.fullDescription
}

const responsibilities = document.querySelector(".responsibility-list")
function renderResponsibilities(career) {
    career.responsibilities.forEach(item => {
        const li = document.createElement("li");
        li.innerHTML = `
        <i class="ri-chat-check-line"></i>
        <span>${item}</span>
    `;
        responsibilities.appendChild(li);
    });
}

const skills = document.querySelector(".skills-wrapper")
function renderSkills(career) {
    career.skills.forEach(skill => {
        const skillChip = document.createElement("div");
        skillChip.classList.add("skill-chip");
        skillChip.innerHTML = `<a href ="${skill.url}" target="_blank"><img src = "${skill.logo}"></i></a>
                                <a href = "${skill.url}" target="_blank"><span>${skill.name}</span></a>`;
        skills.appendChild(skillChip);
    })
}

const roadmap = document.querySelector(".roadmap-wrapper");
function renderRoadmap(career) {
    roadmap.innerHTML = ""
    career.roadmap.forEach(steps => {
        const roadmapStep = document.createElement("div")
        roadmapStep.classList.add("roadmap-step")
        const stepCircle = document.createElement("div")
        stepCircle.classList.add("step-circle")
        stepCircle.textContent = steps.step

        const p = document.createElement("p")
        p.textContent = steps.title

        roadmapStep.appendChild(stepCircle)
        roadmapStep.appendChild(p)

        roadmap.appendChild(roadmapStep)
    })
}

const content = document.querySelector(".content");
const contentText = document.querySelector(".content-text");
const visitBtn = document.querySelector(".visit-btn");

const resourceGrid = document.querySelector(".resource-grid");

function renderResources(career){

    resourceGrid.innerHTML = "";

    career.resources.forEach(resource=>{

        const resourceCard = document.createElement("div");

        resourceCard.classList.add("resource-card");

        resourceCard.innerHTML = `
            <div class="content">

                <img src="${resource.logo}" alt="${resource.name}">

                <div class="content-text">
                    <h3>${resource.name}</h3>
                    <p>${resource.type}</p>
                </div>

            </div>

            <a href="${resource.url}"
               target="_blank"
               class="visit-btn">

                Visit
                <i class="ri-arrow-right-line"></i>

            </a>
        `;

        resourceGrid.appendChild(resourceCard);

    });



}

const workMode = document.querySelector(".work-mode")
const employmentType = document.querySelector(".employment-type")
const education = document.querySelector(".education")
const jobOpenings = document.querySelector(".job-openings")
const futureScope = document.querySelector(".future-scope")
const industry = document.querySelector(".industry")
function renderSnapshot(career) {
    const snapshot = career.snapshot
    for (let item in snapshot) {
        workMode.textContent = snapshot.workMode;
        employmentType.textContent = snapshot.employmentType;
        education.textContent = snapshot.education
        jobOpenings.textContent = snapshot.jobOpenings;
        futureScope.textContent = snapshot.futureScope;
        industry.textContent = snapshot.industry
    }
}

const companiesGrid = document.querySelector(".companies-grid");
function renderCompanies(career) {
    companiesGrid.innerHTML = "";
    career.companies.forEach(company => {
        const companyCard = document.createElement("div")
        companyCard.classList.add("company-card")
        // companyCard.innerHTML = `<img src="${company.logo}" alt="${company.name}">`
        companyCard.innerHTML = `<a href = "${company.url}"><img src="${company.logo}" alt="${company.name}"></a>`

        companiesGrid.appendChild(companyCard)
    });
}

const quickInfoList = document.querySelector(".quick-info-list");

function renderQuickInfo(career) {

    quickInfoList.innerHTML = "";

    career.quickInfo.forEach(info => {

        const quickItem = document.createElement("div");
        quickItem.classList.add("quick-item");

        const quickLabel = document.createElement("div");
        quickLabel.classList.add("quick-label");

        quickLabel.innerHTML = `
            <i class="${info.icon}"></i>
            <span>${info.label}</span>
        `;

        const value = document.createElement("strong");
        value.textContent = info.value;

        quickItem.appendChild(quickLabel);
        quickItem.appendChild(value);

        quickInfoList.appendChild(quickItem);

    });

}

const relatedList = document.querySelector(".related-list")
function renderRelatedCareer(career) {
    relatedList.innerHTML = ""
    career.relatedCareers.forEach(item => {
        const li = document.createElement("li");
        li.innerHTML = `<a href = "career-details.html?slug=${item.slug}">${item.name}
                        <i class="ri-arrow-right-line"></i></a>`;
        relatedList.appendChild(li)
    })
}

function renderFAQs(faqs) {

    const faqContainer = document.getElementById("faqContainer");

    let html = "";

    faqs.forEach((faq, index) => {

        html += `

            <div class="faq-item ${index === 0 ? "active" : ""}">

                <button class="faq-question">

                    <span>${faq.question}</span>

                    <i class="ri-add-line faq-icon"></i>

                </button>

                <div class="faq-answer">

                    <p>${faq.answer}</p>

                </div>

            </div>

        `;

    });

    faqContainer.innerHTML = html;

    initializeFAQs();

}

function initializeFAQs() {

    const faqItems = document.querySelectorAll(".faq-item");

    faqItems.forEach(item => {

        const question = item.querySelector(".faq-question");

        question.addEventListener("click", () => {

            const isActive = item.classList.contains("active");

            faqItems.forEach(faq => {

                faq.classList.remove("active");

            });

            if (!isActive) {

                item.classList.add("active");

            }

        });

    });

}