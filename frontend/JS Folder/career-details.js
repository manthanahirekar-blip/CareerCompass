// ==========================================
// Mobile menu (same pattern as every other page)
// ==========================================
const mobileMenu = document.getElementById('mobile-menu');
const navLinks = document.querySelector('.nav-links');
mobileMenu.addEventListener('click', () => {
    mobileMenu.classList.toggle('is-active');
    navLinks.classList.toggle('active');
});
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.remove('is-active');
        navLinks.classList.remove('active');
    });
});


// ==========================================
// State containers
// ==========================================
const loadingState = document.getElementById("loadingState");
const errorState = document.getElementById("errorState");
const careerContent = document.getElementById("careerContent");

function hideAllStates() {
    loadingState.style.display = "none";
    errorState.style.display = "none";
    careerContent.style.display = "none";
}

function showLoading() {
    hideAllStates();
    loadingState.style.display = "flex";
}

function showError(title, message) {
    hideAllStates();
    document.getElementById("errorTitle").textContent = title;
    document.getElementById("errorMessage").textContent = message;
    errorState.style.display = "flex";
}

function showContent() {
    hideAllStates();
    careerContent.style.display = "block";
}


// ==========================================
// Fetch and boot
// ==========================================
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

showLoading();

if (!id || isNaN(id)) {

    showError(
        "Invalid Career Link",
        "This career link is missing a valid career ID."
    );

} else {

    fetch(`https://careercompass-backend.onrender.com/api/careers/${id}`)

        .then((response) => {

            if (response.status === 404) {
                throw new Error("NOT_FOUND");
            }

            if (!response.ok) {
                throw new Error("SERVER_ERROR");
            }

            return response.json();
        })

        .then((career) => {

            renderHero(career);
            renderAbout(career);
            renderResponsibilities(career);
            renderSkills(career);
            renderRoadmap(career);
            renderResources(career);
            renderRelatedCareers(career);
            renderProjects(career);
            renderFAQs(career.faqs || []);

            showContent();
        })

        .catch((error) => {

            console.error("Error fetching career:", error);

            if (error.message === "NOT_FOUND") {
                showError("Career Not Found", "We couldn't find a career with this ID.");
            } else {
                showError("Something Went Wrong", "We couldn't load this career. Please try again.");
            }
        });
}


// ==========================================
// HERO
// ==========================================
function renderHero(career) {

    document.querySelector(".career-icon").className = `career-icon ${career.icon || "ri-briefcase-line"}`;
    document.querySelector(".career-category").textContent = career.category;
    document.querySelector(".career-title").textContent = career.title;
    document.querySelector(".career-short-description").textContent = career.shortDescription;

    document.querySelector(".demand").textContent = career.demand || "—";

    const salaryEl = document.querySelector(".salary");
    salaryEl.textContent = (career.salary && career.salary.min != null && career.salary.max != null)
        ? `₹${career.salary.min} - ₹${career.salary.max} LPA`
        : "—";

    document.querySelector(".start-learning-btn").href = `roadmap-details.html?careerId=${career.id}`;
}


// ==========================================
// ABOUT THIS CAREER
// ==========================================
function renderAbout(career) {
    document.querySelector(".about-description").textContent = career.fullDescription || career.shortDescription || "";
}


// ==========================================
// KEY RESPONSIBILITIES
// ==========================================
function renderResponsibilities(career) {

    const list = document.querySelector(".responsibility-list");
    list.innerHTML = "";

    (career.responsibilities || []).forEach(item => {
        const li = document.createElement("li");
        li.innerHTML = `
            <i class="ri-checkbox-circle-line"></i>
            <span>${item}</span>
        `;
        list.appendChild(li);
    });
}


// ==========================================
// REQUIRED SKILLS
// Groups dynamically by skill.category:
//   core                  -> Core Skills
//   framework / library   -> Frameworks / Libraries
//   tool                  -> Tools
//   anything else         -> Other Skills
// A group's <section> stays hidden if it ends up empty.
// ==========================================
function renderSkills(career) {

    const groups = {
        core: [],
        framework: [],
        tool: [],
        other: []
    };

    (career.skills || []).forEach(skill => {

        const category = (skill.category || "").toLowerCase();

        if (category === "core") {
            groups.core.push(skill);
        } else if (category === "framework" || category === "library") {
            groups.framework.push(skill);
        } else if (category === "tool") {
            groups.tool.push(skill);
        } else {
            groups.other.push(skill);
        }
    });

    fillSkillGroup("coreSkillsGroup", "coreSkillsWrapper", groups.core);
    fillSkillGroup("frameworkSkillsGroup", "frameworkSkillsWrapper", groups.framework);
    fillSkillGroup("toolSkillsGroup", "toolSkillsWrapper", groups.tool);
    fillSkillGroup("otherSkillsGroup", "otherSkillsWrapper", groups.other);
}

function fillSkillGroup(groupId, wrapperId, skills) {

    const group = document.getElementById(groupId);
    const wrapper = document.getElementById(wrapperId);

    if (skills.length === 0) {
        group.style.display = "none";
        wrapper.innerHTML = "";
        return;
    }

    group.style.display = "block";

    wrapper.innerHTML = skills.map(skill => `
        <div class="skill-chip">
            <a href="${skill.url}" target="_blank"><img src="${skill.logo}" alt="${skill.name}"></a>
            <a href="${skill.url}" target="_blank"><span>${skill.name}</span></a>
        </div>
    `).join("");
}


// ==========================================
// CAREER ROADMAP (high-level steps only)
// ==========================================
function renderRoadmap(career) {

    const roadmap = document.querySelector(".roadmap-wrapper");
    roadmap.innerHTML = "";

    const steps = career.roadmap || [];

    steps.forEach((step, index) => {

        const roadmapStep = document.createElement("div");
        roadmapStep.classList.add("roadmap-step");
        roadmapStep.innerHTML = `
            <div class="step-circle">${step.step}</div>
            <p>${step.title}</p>
        `;
        roadmap.appendChild(roadmapStep);

        if (index < steps.length - 1) {
            const arrow = document.createElement("i");
            arrow.className = "ri-arrow-right-line roadmap-arrow";
            roadmap.appendChild(arrow);
        }
    });

    document.querySelector(".complete-roadmap-btn").href = `roadmap-details.html?careerId=${career.id}`;

    document.getElementById("roadmapSection").style.display = steps.length > 0 ? "block" : "none";
}


// ==========================================
// OFFICIAL LEARNING RESOURCES
// ==========================================
function renderResources(career) {

    const resourceGrid = document.querySelector(".resource-grid");
    resourceGrid.innerHTML = "";

    const resources = career.resources || [];

    resources.forEach(resource => {

        const resourceCard = document.createElement("div");
        resourceCard.classList.add("resource-card");

        resourceCard.innerHTML = `
            <div class="content">
                <img src="${resource.logo}" alt="${resource.name}">
                <div class="content-text">
                    <h3>${resource.name}</h3>
                    <p>${resource.type || ""}</p>
                </div>
            </div>
            <a href="${resource.url}" target="_blank" rel="noopener noreferrer" class="visit-btn">
                Visit
                <i class="ri-arrow-right-line"></i>
            </a>
        `;

        resourceGrid.appendChild(resourceCard);
    });

    document.getElementById("resourcesSection").style.display = resources.length > 0 ? "block" : "none";
}


// ==========================================
// RELATED CAREERS
// ==========================================
function renderRelatedCareers(career) {

    const relatedGrid = document.querySelector(".related-grid");
    relatedGrid.innerHTML = "";

    const related = career.relatedCareers || [];

    related.forEach(item => {

        const card = document.createElement("a");
        card.classList.add("related-card");
        card.href = `career-details.html?id=${item.id}`;

        card.innerHTML = `
            <div class="related-card-icon"><i class="${item.icon || "ri-briefcase-line"}"></i></div>
            <div class="related-card-body">
                <h4>${item.name}</h4>
                ${item.shortDescription ? `<p>${item.shortDescription}</p>` : ""}
            </div>
            <i class="ri-arrow-right-line related-card-arrow"></i>
        `;

        relatedGrid.appendChild(card);
    });

    document.getElementById("relatedSection").style.display = related.length > 0 ? "block" : "none";
}


// ==========================================
// PROJECTS TO BUILD
// Section is fully hidden when there are zero projects.
// ==========================================
function renderProjects(career) {

    const projectGrid = document.querySelector(".project-grid");
    projectGrid.innerHTML = "";

    const projects = career.projects || [];

    if (projects.length === 0) {
        document.getElementById("projectsSection").style.display = "none";
        return;
    }

    document.getElementById("projectsSection").style.display = "block";

    projects.forEach(project => {

        const card = document.createElement("div");
        card.classList.add("project-card");

        card.innerHTML = `
            ${project.image ? `<img class="project-image" src="${project.image}" alt="${project.title}">` : ""}
            <div class="project-card-body">
                <div class="project-meta">
                    ${project.difficulty ? `<span class="project-tag">${project.difficulty}</span>` : ""}
                    ${project.type ? `<span class="project-tag">${project.type}</span>` : ""}
                </div>
                <h4>${project.title}</h4>
                ${project.shortDescription ? `<p>${project.shortDescription}</p>` : ""}
                <a href="${project.url}" target="_blank" rel="noopener noreferrer" class="visit-btn">
                    View Project
                    <i class="ri-arrow-right-line"></i>
                </a>
            </div>
        `;

        projectGrid.appendChild(card);
    });
}


// ==========================================
// FAQs (unchanged accordion behaviour)
// ==========================================
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
