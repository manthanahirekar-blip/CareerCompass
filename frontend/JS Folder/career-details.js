// ==========================================
// Career Details - API Configuration
// ==========================================

const API_BASE_URL = "http://127.0.0.1:5000";



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

    fetch(`${API_BASE_URL}/api/careers/${id}`)

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

            console.log("Career details loaded:", career);

            renderHero(career);
            renderAbout(career);
            renderResponsibilities(career);
            renderSkills(career);
            renderRoadmap(career);
            renderResources(career);
            renderRelatedCareers(career);
            renderFAQs(career.faqs || []);

            showContent();
        })

        .catch((error) => {

            console.error("Error fetching career:", error);

            if (error.message === "NOT_FOUND") {

                showError(
                    "Career Not Found",
                    "We couldn't find a career with this ID."
                );

            } else {

                showError(
                    "Something Went Wrong",
                    "We couldn't load this career. Please try again."
                );
            }
        });
}



// ==========================================
// HERO
// ==========================================

function renderHero(career) {

    document.querySelector(".career-icon").className =
        `career-icon ${career.icon || "ri-briefcase-line"}`;

    document.querySelector(".career-category").textContent =
        career.category || "";

    document.querySelector(".career-title").textContent =
        career.title || "";

    document.querySelector(".career-short-description").textContent =
        career.shortDescription || "";

    document.querySelector(".demand").textContent =
        career.demand || "—";


    const salaryEl =
        document.querySelector(".salary");

    salaryEl.textContent =
        (
            career.salary &&
            career.salary.min != null &&
            career.salary.max != null
        )
            ? `₹${career.salary.min} - ₹${career.salary.max} LPA`
            : "—";


    document.querySelector(".start-learning-btn").href =
        `roadmap-details.html?careerId=${career.id}`;
}



// ==========================================
// ABOUT THIS CAREER
// ==========================================

function renderAbout(career) {

    document.querySelector(".about-description").textContent =
        career.fullDescription ||
        career.shortDescription ||
        "";
}



// ==========================================
// KEY RESPONSIBILITIES
// ==========================================

function renderResponsibilities(career) {

    const list =
        document.querySelector(".responsibility-list");

    list.innerHTML = "";


    (career.responsibilities || []).forEach(item => {

        const li =
            document.createElement("li");


        li.innerHTML = `
            <i class="ri-checkbox-circle-line"></i>
            <span>${item}</span>
        `;


        list.appendChild(li);
    });
}



// ==========================================
// REQUIRED SKILLS
//
// Groups dynamically by skill.category:
//
// core                  -> Core Skills
// framework / library   -> Frameworks / Libraries
// tool                  -> Tools
// anything else         -> Other Skills
//
// A group's section stays hidden if empty.
// ==========================================

function renderSkills(career) {

    const groups = {
        core: [],
        framework: [],
        tool: [],
        other: []
    };


    (career.skills || []).forEach(skill => {

        const category =
            (skill.category || "").toLowerCase();


        if (category === "core") {

            groups.core.push(skill);

        } else if (
            category === "framework" ||
            category === "library"
        ) {

            groups.framework.push(skill);

        } else if (category === "tool") {

            groups.tool.push(skill);

        } else {

            groups.other.push(skill);
        }
    });


    fillSkillGroup(
        "coreSkillsGroup",
        "coreSkillsWrapper",
        groups.core
    );


    fillSkillGroup(
        "frameworkSkillsGroup",
        "frameworkSkillsWrapper",
        groups.framework
    );


    fillSkillGroup(
        "toolSkillsGroup",
        "toolSkillsWrapper",
        groups.tool
    );


    fillSkillGroup(
        "otherSkillsGroup",
        "otherSkillsWrapper",
        groups.other
    );
}


function fillSkillGroup(
    groupId,
    wrapperId,
    skills
) {

    const group =
        document.getElementById(groupId);

    const wrapper =
        document.getElementById(wrapperId);


    if (!group || !wrapper) {
        return;
    }


    if (skills.length === 0) {

        group.style.display = "none";
        wrapper.innerHTML = "";

        return;
    }


    group.style.display = "block";


    wrapper.innerHTML =
        skills.map(skill => {

            const skillUrl =
                skill.url || "#";

            const skillLogo =
                skill.logo || "";

            return `
                <div class="skill-chip">

                    <a
                        href="${skillUrl}"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <img
                            src="${skillLogo}"
                            alt="${skill.name || ""}"
                        >
                    </a>

                    <a
                        href="${skillUrl}"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <span>
                            ${skill.name || ""}
                        </span>
                    </a>

                </div>
            `;

        }).join("");
}



// ==========================================
// CAREER ROADMAP
// High-level steps only
// ==========================================

function renderRoadmap(career) {

    const roadmap =
        document.querySelector(".roadmap-wrapper");

    roadmap.innerHTML = "";


    const steps =
        career.roadmap || [];


    steps.forEach((step, index) => {

        const roadmapStep =
            document.createElement("div");


        roadmapStep.classList.add(
            "roadmap-step"
        );


        roadmapStep.innerHTML = `
            <div class="step-circle">
                ${step.step}
            </div>

            <p>
                ${step.title}
            </p>
        `;


        roadmap.appendChild(
            roadmapStep
        );


        if (index < steps.length - 1) {

            const arrow =
                document.createElement("i");


            arrow.className =
                "ri-arrow-right-line roadmap-arrow";


            roadmap.appendChild(
                arrow
            );
        }
    });


    document.querySelector(
        ".complete-roadmap-btn"
    ).href =
        `roadmap-details.html?careerId=${career.id}`;


    document.getElementById(
        "roadmapSection"
    ).style.display =
        steps.length > 0
            ? "block"
            : "none";
}



// ==========================================
// OFFICIAL LEARNING RESOURCES
// ==========================================

function renderResources(career) {

    const resourceGrid =
        document.querySelector(".resource-grid");

    resourceGrid.innerHTML = "";


    const resources =
        career.resources || [];


    resources.forEach(resource => {

        const resourceCard =
            document.createElement("div");


        resourceCard.classList.add(
            "resource-card"
        );


        resourceCard.innerHTML = `
            <div class="content">

                <img
                    src="${resource.logo || ""}"
                    alt="${resource.name || ""}"
                >

                <div class="content-text">

                    <h3>
                        ${resource.name || ""}
                    </h3>

                    <p>
                        ${resource.type || ""}
                    </p>

                </div>

            </div>

            <a
                href="${resource.url || "#"}"
                target="_blank"
                rel="noopener noreferrer"
                class="visit-btn"
            >

                Visit

                <i class="ri-arrow-right-line"></i>

            </a>
        `;


        resourceGrid.appendChild(
            resourceCard
        );
    });


    document.getElementById(
        "resourcesSection"
    ).style.display =
        resources.length > 0
            ? "block"
            : "none";
}



// ==========================================
// RELATED CAREERS
// ==========================================
//
// Backend relatedCareers contains:
//
// {
//     name,
//     slug
// }
//
// It may not contain the career ID.
// We resolve the slug from /api/careers.
// ==========================================

async function renderRelatedCareers(career) {

    const relatedGrid =
        document.querySelector(".related-grid");

    relatedGrid.innerHTML = "";


    const related =
        career.relatedCareers || [];


    if (related.length === 0) {

        document.getElementById(
            "relatedSection"
        ).style.display = "none";

        return;
    }


    let allCareers = [];


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/careers`
            );


        if (response.ok) {
            allCareers = await response.json();
        }

    } catch (error) {

        console.error(
            "Error loading careers for related section:",
            error
        );
    }


    related.forEach(item => {

        const matchingCareer =
            allCareers.find(
                careerItem =>
                    careerItem.slug === item.slug
            );


        const careerId =
            item.id ||
            (matchingCareer
                ? matchingCareer.id
                : null);


        const card =
            document.createElement("a");


        card.classList.add(
            "related-card"
        );


        card.href =
            careerId
                ? `career-details.html?id=${careerId}`
                : "careers.html";


        card.innerHTML = `
            <div class="related-card-icon">

                <i class="${
                    item.icon ||
                    "ri-briefcase-line"
                }"></i>

            </div>

            <div class="related-card-body">

                <h4>
                    ${item.name || ""}
                </h4>

                ${
                    item.shortDescription
                        ? `
                            <p>
                                ${item.shortDescription}
                            </p>
                        `
                        : ""
                }

            </div>

            <i class="ri-arrow-right-line related-card-arrow"></i>
        `;


        relatedGrid.appendChild(card);
    });


    document.getElementById(
        "relatedSection"
    ).style.display =
        related.length > 0
            ? "block"
            : "none";
}





// ==========================================
// FAQs
// ==========================================

function renderFAQs(faqs) {

    const faqContainer =
        document.getElementById(
            "faqContainer"
        );


    let html = "";


    faqs.forEach((faq, index) => {

        html += `
            <div class="faq-item ${
                index === 0
                    ? "active"
                    : ""
            }">

                <button
                    class="faq-question"
                    type="button"
                >

                    <span>
                        ${faq.question}
                    </span>

                    <i class="ri-add-line faq-icon"></i>

                </button>

                <div class="faq-answer">

                    <p>
                        ${faq.answer}
                    </p>

                </div>

            </div>
        `;
    });


    faqContainer.innerHTML =
        html;


    initializeFAQs();
}


function initializeFAQs() {

    const faqItems =
        document.querySelectorAll(
            ".faq-item"
        );


    faqItems.forEach(item => {

        const question =
            item.querySelector(
                ".faq-question"
            );


        question.addEventListener(
            "click",
            () => {

                const isActive =
                    item.classList.contains(
                        "active"
                    );


                faqItems.forEach(faq => {

                    faq.classList.remove(
                        "active"
                    );

                });


                if (!isActive) {

                    item.classList.add(
                        "active"
                    );
                }
            }
        );
    });
}