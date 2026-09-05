// ==========================================
// Mobile menu (same pattern as career-details.js)
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
const emptyState = document.getElementById("emptyState");
const roadmapContent = document.getElementById("roadmapContent");

let currentPhases = [];
let currentCareerId = null;


function hideAllStates() {
    loadingState.style.display = "none";
    errorState.style.display = "none";
    emptyState.style.display = "none";
    roadmapContent.style.display = "none";
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

function showEmpty(careerTitle) {
    hideAllStates();
    const msgEl = document.getElementById("emptyMessage");
    msgEl.textContent = careerTitle
        ? `We are currently preparing a detailed learning roadmap for ${careerTitle}.`
        : "We are currently preparing a detailed learning roadmap for this career.";
    emptyState.style.display = "flex";
}

function showContent() {
    hideAllStates();
    roadmapContent.style.display = "block";
}


// ==========================================
// LocalStorage progress helpers
// Progress is stored per career so one career's
// progress never affects another's.
// ==========================================
function getProgressKey(careerId) {
    return `career_${careerId}_roadmap_progress`;
}

function loadProgress(careerId) {
    try {
        const raw = localStorage.getItem(getProgressKey(careerId));
        return raw ? JSON.parse(raw) : {};
    } catch (error) {
        return {};
    }
}

function saveProgress(careerId, progress) {
    localStorage.setItem(getProgressKey(careerId), JSON.stringify(progress));
}


// ==========================================
// Fetch and boot
// ==========================================
const params = new URLSearchParams(window.location.search);
const careerId = params.get("careerId");
showLoading();

if (!careerId || isNaN(careerId)) {

    showError(
        "Invalid Roadmap Link",
        "This roadmap link is missing a valid career ID."
    );

} else {

    fetch(`http://127.0.0.1:5000/api/careers/${careerId}/roadmap`)

        .then((response) => {

            if (response.status === 404) {
                throw new Error("NOT_FOUND");
            }

            if (!response.ok) {
                throw new Error("SERVER_ERROR");
            }

            return response.json();
        })

        .then((data) => {

            if (!data.phases || data.phases.length === 0) {
                showEmpty(data.career ? data.career.title : "");
                return;
            }

            renderRoadmap(data.career, data.phases, careerId);
            showContent();
        })

        .catch((error) => {

            console.error("Error loading roadmap:", error);

            if (error.message === "NOT_FOUND") {
                showError("Career Not Found", "We couldn't find a career with this ID.");
            } else {
                showError("Something Went Wrong", "We couldn't load this roadmap. Please try again.");
            }
        });
}


// ==========================================
// Render
// ==========================================
function renderRoadmap(career, phases, id) {

    currentPhases = phases;
    currentCareerId = id;

    // Breadcrumb
    const breadcrumbCareer = document.querySelector(".breadcrumb-career");
    breadcrumbCareer.textContent = career.title;
    breadcrumbCareer.href = `career-details.html?id=${id}`;

    // Hero
    document.querySelector(".roadmap-title").textContent = `${career.title} Roadmap`;
    document.querySelector(".roadmap-difficulty").textContent = career.difficulty || "—";
    document.querySelector(".roadmap-phase-count").textContent = phases.length;

    const totalTopics = phases.reduce((sum, phase) => sum + phase.topics.length, 0);
    document.querySelector(".roadmap-topic-count").textContent = totalTopics;

    // CTA back to career details
    document.querySelector(".cta-view-career-btn").href = `career-details.html?id=${id}`;

    renderTimeline(phases);
    renderPhases(phases);
    updateProgressUI(phases, id);
    setupTimelineHighlight(phases);
}


function renderTimeline(phases) {

    const timelineEl = document.getElementById("phaseTimeline");
    timelineEl.innerHTML = "";

    phases.forEach((phase) => {

        const btn = document.createElement("button");
        btn.className = "timeline-item";
        btn.dataset.phaseId = phase.id;

        btn.innerHTML = `
            <span class="timeline-circle">${phase.stepNumber}</span>
            <span class="timeline-label">${phase.title}</span>
        `;

        btn.addEventListener("click", () => {
            const target = document.getElementById(`phase-${phase.id}`);
            if (target) {
                target.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        });

        timelineEl.appendChild(btn);
    });
}


function renderPhases(phases) {

    const phasesContainer = document.getElementById("roadmapPhases");
    phasesContainer.innerHTML = "";

    phases.forEach((phase) => {

        const phaseCard = document.createElement("div");
        phaseCard.className = "phase-card card";
        phaseCard.id = `phase-${phase.id}`;
        phaseCard.dataset.phaseId = phase.id;

        let topicsHtml = "";

        phase.topics.forEach((topic) => {

            let subtopicsHtml = "";

            topic.subtopics.forEach((sub) => {
                subtopicsHtml += `
                    <li class="subtopic-item">
                        <button class="subtopic-toggle" data-subtopic-id="${sub.id}" aria-pressed="false">
                            <i class="ri-checkbox-blank-circle-line subtopic-icon"></i>
                            <span class="subtopic-title">${sub.title}</span>
                        </button>
                    </li>
                `;
            });

            topicsHtml += `
                <div class="topic-item" data-topic-id="${topic.id}">
                    <button class="topic-question" aria-expanded="false">
                        <span class="topic-question-left">${topic.title}</span>
                        <span class="topic-question-right">
                            <span class="topic-progress-count">0/${topic.subtopics.length}</span>
                            <i class="ri-add-line topic-icon"></i>
                        </span>
                    </button>
                    <div class="topic-answer">
                        <ul class="subtopic-list">
                            ${subtopicsHtml}
                        </ul>
                    </div>
                </div>
            `;
        });

        phaseCard.innerHTML = `
            <div class="phase-header">
                <div class="phase-header-left">
                    <span class="phase-number">${phase.stepNumber}</span>
                    <h2 class="phase-title">${phase.title}</h2>
                </div>
                <span class="phase-progress-percent">0%</span>
            </div>
            <div class="phase-progress-bar-track">
                <div class="phase-progress-bar-fill" style="width:0%"></div>
            </div>
            <div class="topic-accordion">
                ${topicsHtml}
            </div>
            <div class="milestone-box">
                <span class="milestone-icon">🎯</span>
                <div>
                    <h4>Phase Milestone</h4>
                    <p>Apply what you've learned in this phase. Build a small project or complete a practical exercise before moving on.</p>
                </div>
            </div>
            <div class="phase-resources-cta">
                <a class="phase-resources-btn" href="resources.html?step=${phase.id}">
                    View Resources
                    <i class="ri-arrow-right-line"></i>
                </a>
            </div>
        `;

        phasesContainer.appendChild(phaseCard);
    });
}


// ==========================================
// Progress calculation + UI update
// Called on load and after every subtopic toggle
// ==========================================
function getAllSubtopicIds(phases) {
    const ids = [];
    phases.forEach((phase) => {
        phase.topics.forEach((topic) => {
            topic.subtopics.forEach((sub) => ids.push(sub.id));
        });
    });
    return ids;
}

function updateProgressUI(phases, id) {

    const progress = loadProgress(id);

    const allIds = getAllSubtopicIds(phases);
    const totalSubtopics = allIds.length;
    const completedCount = allIds.filter((subId) => progress[subId]).length;
    const overallPercent = totalSubtopics
        ? Math.round((completedCount / totalSubtopics) * 100)
        : 0;

    document.querySelector(".progress-percent").textContent = `${overallPercent}%`;
    document.querySelector(".progress-bar-fill").style.width = `${overallPercent}%`;
    document.querySelector(".progress-detail").textContent =
        `${completedCount} of ${totalSubtopics} subtopics completed`;

    phases.forEach((phase) => {

        const phaseCard = document.getElementById(`phase-${phase.id}`);
        if (!phaseCard) return;

        let phaseTotal = 0;
        let phaseCompleted = 0;

        phase.topics.forEach((topic) => {

            const topicTotal = topic.subtopics.length;
            const topicCompleted = topic.subtopics.filter((sub) => progress[sub.id]).length;

            phaseTotal += topicTotal;
            phaseCompleted += topicCompleted;

            const topicItem = phaseCard.querySelector(`.topic-item[data-topic-id="${topic.id}"]`);
            if (!topicItem) return;

            const countEl = topicItem.querySelector(".topic-progress-count");
            if (countEl) countEl.textContent = `${topicCompleted}/${topicTotal}`;

            topic.subtopics.forEach((sub) => {

                const toggle = topicItem.querySelector(`.subtopic-toggle[data-subtopic-id="${sub.id}"]`);
                if (!toggle) return;

                const isDone = !!progress[sub.id];
                toggle.classList.toggle("completed", isDone);
                toggle.setAttribute("aria-pressed", isDone ? "true" : "false");

                const icon = toggle.querySelector(".subtopic-icon");
                if (icon) {
                    icon.className = isDone
                        ? "ri-checkbox-circle-fill subtopic-icon"
                        : "ri-checkbox-blank-circle-line subtopic-icon";
                }
            });
        });

        const phasePercent = phaseTotal ? Math.round((phaseCompleted / phaseTotal) * 100) : 0;
        const percentEl = phaseCard.querySelector(".phase-progress-percent");
        const barEl = phaseCard.querySelector(".phase-progress-bar-fill");
        if (percentEl) percentEl.textContent = `${phasePercent}%`;
        if (barEl) barEl.style.width = `${phasePercent}%`;
    });

    const readyMessageEl = document.querySelector(".career-ready-message");
    if (readyMessageEl) {
        readyMessageEl.textContent = overallPercent === 100
            ? "Congratulations, you have completed this roadmap!"
            : "Continue your learning journey and complete the remaining roadmap topics.";
    }
}


// ==========================================
// Topic accordion + subtopic toggle
// (event delegation, since cards are built dynamically)
// One open topic at a time per phase, same pattern
// as the existing FAQ accordion.
// ==========================================
document.getElementById("roadmapPhases").addEventListener("click", function (e) {

    const topicBtn = e.target.closest(".topic-question");

    if (topicBtn) {

        const topicItem = topicBtn.closest(".topic-item");
        const phaseCard = topicBtn.closest(".phase-card");
        const wasActive = topicItem.classList.contains("active");

        phaseCard.querySelectorAll(".topic-item").forEach((item) => {
            item.classList.remove("active");
            item.querySelector(".topic-question").setAttribute("aria-expanded", "false");
        });

        if (!wasActive) {
            topicItem.classList.add("active");
            topicBtn.setAttribute("aria-expanded", "true");
        }

        return;
    }

    const subtopicBtn = e.target.closest(".subtopic-toggle");

    if (subtopicBtn) {

        const subtopicId = subtopicBtn.dataset.subtopicId;
        const progress = loadProgress(currentCareerId);

        progress[subtopicId] = !progress[subtopicId];

        saveProgress(currentCareerId, progress);
        updateProgressUI(currentPhases, currentCareerId);
    }
});


// ==========================================
// Highlight the current phase in the timeline
// while scrolling
// ==========================================
function setupTimelineHighlight(phases) {

    const observer = new IntersectionObserver((entries) => {

        entries.forEach((entry) => {

            if (entry.isIntersecting) {

                const phaseId = entry.target.dataset.phaseId;

                document.querySelectorAll(".timeline-item").forEach((item) => {
                    item.classList.toggle("active", item.dataset.phaseId === phaseId);
                });
            }
        });

    }, { rootMargin: "-40% 0px -50% 0px" });

    phases.forEach((phase) => {
        const el = document.getElementById(`phase-${phase.id}`);
        if (el) observer.observe(el);
    });
}
