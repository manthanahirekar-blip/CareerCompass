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
const resourcesContent = document.getElementById("resourcesContent");

function hideAllStates() {
    loadingState.style.display = "none";
    errorState.style.display = "none";
    resourcesContent.style.display = "none";
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
    resourcesContent.style.display = "block";
}


// ==========================================
// Toast helper
// ==========================================
function showToast(message) {

    const container = document.getElementById("toastContainer");

    const toast = document.createElement("div");
    toast.className = "cc-toast";
    toast.textContent = message;

    container.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add("show"));

    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}


// ==========================================
// YouTube URL helpers
// Handles youtube.com/watch?v=, youtu.be/, youtube.com/embed/
// and youtube.com/shorts/ URLs. Returns null (not a crash)
// for anything that isn't a recognizable YouTube URL.
// ==========================================
function extractYouTubeId(url) {

    if (!url) return null;

    const patterns = [
        /youtube\.com\/watch\?v=([\w-]{11})/,
        /youtu\.be\/([\w-]{11})/,
        /youtube\.com\/embed\/([\w-]{11})/,
        /youtube\.com\/shorts\/([\w-]{11})/
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }

    return null;
}

function getYouTubeEmbedUrl(url) {
    const id = extractYouTubeId(url);
    return id ? `https://www.youtube.com/embed/${id}` : null;
}


// ==========================================
// Fetch and boot
// ==========================================
const params = new URLSearchParams(window.location.search);
const stepId = params.get("step");

showLoading();

if (!stepId || isNaN(stepId)) {

    showError(
        "Invalid Resource Link",
        "This resources link is missing a valid roadmap step ID."
    );

} else {

    fetch(`https://careercompass-backend.onrender.com/api/roadmap-steps/${stepId}/resources`)

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

            if (!data.step) {
                throw new Error("NOT_FOUND");
            }

            renderResources(data);
            showContent();
        })

        .catch((error) => {

            console.error("Error loading step resources:", error);

            if (error.message === "NOT_FOUND") {
                showError("Step Not Found", "We couldn't find a roadmap step with this ID.");
            } else {
                showError("Something Went Wrong", "We couldn't load these resources. Please try again.");
            }
        });
}


// ==========================================
// Render
// ==========================================
function renderResources(data) {

    const { step, career, videos, notes, documentation } = data;

    renderStepHeader(step, career);
    renderVideos(videos || []);
    renderNotes(notes || []);
    renderDocumentation(documentation || []);
}


function renderStepHeader(step, career) {

    document.querySelector(".step-header-career").textContent = career ? career.title : "";
    document.querySelector(".step-header-number").textContent = step.stepNumber;
    document.querySelector(".step-header-title").textContent = step.title;

    const backBtn = document.querySelector(".back-to-roadmap-btn");
    backBtn.href = career
        ? `roadmap-details.html?careerId=${career.id}`
        : "roadmap.html";
}


// ==========================================
// Video Learning
// ==========================================
function renderVideos(videos) {

    const videoBlock = document.getElementById("videoBlock");

    const playable = videos.map((video) => ({
        ...video,
        embedUrl: getYouTubeEmbedUrl(video.url)
    }));

    const firstPlayable = playable.find((video) => video.embedUrl);

    if (playable.length === 0 || !firstPlayable) {
        videoBlock.innerHTML = `
            <div class="resource-empty-box">
                <i class="ri-video-line"></i>
                <h4>Videos Coming Soon</h4>
                <p>Video lessons for this roadmap step aren't available yet.</p>
            </div>
        `;
        return;
    }

    let playlistHtml = "";

    playable.forEach((video, index) => {

        if (video.embedUrl) {
            playlistHtml += `
                <button class="playlist-item${video.embedUrl === firstPlayable.embedUrl && video.id === firstPlayable.id ? " active" : ""}"
                    data-embed-url="${video.embedUrl}" data-video-id="${video.id}">
                    <span class="playlist-number">${index + 1}</span>
                    <span class="playlist-title">${video.name}</span>
                </button>
            `;
        } else {
            playlistHtml += `
                <div class="playlist-item unavailable">
                    <span class="playlist-number">${index + 1}</span>
                    <span>
                        <span class="playlist-title">${video.name}</span>
                        <span class="playlist-unavailable-tag">Preview unavailable</span>
                    </span>
                </div>
            `;
        }
    });

    videoBlock.innerHTML = `
        <div class="video-layout">
            <div>
                <div class="video-player-wrap">
                    <iframe class="video-player-frame" id="mainVideoFrame"
                        src="${firstPlayable.embedUrl}"
                        title="${firstPlayable.name}"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen></iframe>
                </div>
                <div class="video-active-title" id="activeVideoTitle">${firstPlayable.name}</div>
            </div>
            <div class="video-playlist" id="videoPlaylist">
                ${playlistHtml}
            </div>
        </div>
    `;

    document.getElementById("videoPlaylist").addEventListener("click", (e) => {

        const item = e.target.closest(".playlist-item");
        if (!item || item.classList.contains("unavailable")) return;

        const embedUrl = item.dataset.embedUrl;
        if (!embedUrl) return;

        document.getElementById("mainVideoFrame").src = embedUrl;
        document.getElementById("activeVideoTitle").textContent =
            item.querySelector(".playlist-title").textContent;

        document.querySelectorAll(".playlist-item").forEach((el) => el.classList.remove("active"));
        item.classList.add("active");
    });
}


// ==========================================
// Notes & Study Materials
// (always visible -- shows a placeholder card when empty)
// ==========================================
function renderNotes(notes) {

    const notesList = document.getElementById("notesList");

    if (notes.length === 0) {
        notesList.innerHTML = `
            <div class="note-card">
                <span class="note-icon"><i class="ri-file-text-line"></i></span>
                <div class="note-info">
                    <h4 class="note-name">Notes &amp; Study Materials</h4>
                    <p class="note-meta">Study notes for this roadmap step will be available soon.</p>
                </div>
                <div class="note-actions">
                    <button class="note-btn note-btn-open" data-notes-unavailable>
                        <i class="ri-external-link-line"></i>
                        Open
                    </button>
                    <button class="note-btn note-btn-download" data-notes-unavailable>
                        <i class="ri-download-line"></i>
                        Download
                    </button>
                </div>
            </div>
        `;

        notesList.querySelectorAll("[data-notes-unavailable]").forEach((btn) => {
            btn.addEventListener("click", () => {
                showToast("📚 Notes Coming Soon — Study notes for this roadmap step are not available yet.");
            });
        });

        return;
    }

    let notesHtml = "";

    notes.forEach((note) => {
        notesHtml += `
            <div class="note-card">
                <span class="note-icon"><i class="ri-file-pdf-2-line"></i></span>
                <div class="note-info">
                    <h4 class="note-name">${note.name}</h4>
                    ${note.type ? `<p class="note-meta">${note.type}</p>` : ""}
                </div>
                <div class="note-actions">
                    <a class="note-btn note-btn-open" href="${note.url}" target="_blank" rel="noopener noreferrer">
                        <i class="ri-external-link-line"></i>
                        Open
                    </a>
                    <a class="note-btn note-btn-download" href="${note.url}" download target="_blank" rel="noopener noreferrer">
                        <i class="ri-download-line"></i>
                        Download
                    </a>
                </div>
            </div>
        `;
    });

    notesList.innerHTML = notesHtml;
}


// ==========================================
// Official Documentation
// ==========================================
function renderDocumentation(documentation) {

    const docsBlock = document.getElementById("docsBlock");

    if (documentation.length === 0) {
        docsBlock.innerHTML = `
            <div class="resource-empty-box">
                <i class="ri-book-open-line"></i>
                <h4>No Documentation Yet</h4>
                <p>Official documentation links for this roadmap step will be added soon.</p>
            </div>
        `;
        return;
    }

    let docsHtml = "";

    documentation.forEach((doc) => {
        docsHtml += `
            <div class="doc-card">
                <div class="doc-logo-wrap">
                    ${doc.logo
                        ? `<img src="${doc.logo}" alt="${doc.name}" onerror="this.parentElement.innerHTML='<i class=\\'ri-links-line\\'></i>';">`
                        : `<i class="ri-links-line"></i>`}
                </div>
                <h4 class="doc-name">${doc.name}</h4>
                ${doc.type ? `<p class="doc-type">${doc.type}</p>` : ""}
                <a class="doc-open-link" href="${doc.url}" target="_blank" rel="noopener noreferrer">
                    Open Documentation
                    <i class="ri-arrow-right-line"></i>
                </a>
            </div>
        `;
    });

    docsBlock.innerHTML = `<div class="doc-grid">${docsHtml}</div>`;
}
