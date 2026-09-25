const API_BASE_URL = "http://127.0.0.1:5000";

document.addEventListener("DOMContentLoaded", async () => {

    // =====================================================
    // LOGOUT
    // =====================================================

    const logoutBtn =
        document.getElementById("logoutBtn");

    if (logoutBtn) {

        logoutBtn.addEventListener(
            "click",
            async () => {

                try {

                    const response =
                        await fetch(
                            `${API_BASE_URL}/api/auth/logout`,
                            {
                                method: "POST",
                                credentials: "include"
                            }
                        );

                    const data =
                        await response.json();

                    if (
                        response.ok &&
                        data.success
                    ) {

                        localStorage.removeItem(
                            "careerCompassUser"
                        );

                        window.location.href =
                            "login.html";

                    } else {

                        console.error(
                            "Logout failed:",
                            data.message
                        );

                    }

                } catch (error) {

                    console.error(
                        "Logout error:",
                        error
                    );

                }

            }
        );

    }


    try {

        // =====================================================
        // AUTHENTICATION
        // =====================================================

        const authResponse = await fetch(
            `${API_BASE_URL}/api/auth/me`,
            {
                method: "GET",
                credentials: "include"
            }
        );

        const authData = await authResponse.json();

        if (!authResponse.ok || !authData.success) {

            localStorage.removeItem("careerCompassUser");

            window.location.href = "login.html";

            return;
        }

        const user = authData.user;

        localStorage.setItem(
            "careerCompassUser",
            JSON.stringify(user)
        );


        // =====================================================
        // USER INFORMATION
        // =====================================================

        const userName =
            document.getElementById("dashboardUserName");

        const userEmail =
            document.getElementById("dashboardUserEmail");

        if (userName) {
            userName.textContent = user.name;
        }

        if (userEmail) {
            userEmail.textContent = user.email;
        }


        // =====================================================
        // SELECTED CAREER
        // =====================================================

        const careerResponse = await fetch(
            `${API_BASE_URL}/api/auth/career`,
            {
                method: "GET",
                credentials: "include"
            }
        );

        const careerData =
            await careerResponse.json();

        if (
            !careerResponse.ok ||
            !careerData.success
        ) {

            console.error(
                "Unable to fetch selected career:",
                careerData.message
            );

            return;
        }


        // =====================================================
        // ELEMENTS
        // =====================================================

        const currentCareer =
            document.getElementById("currentCareer");

        const completedSteps =
            document.getElementById("completedSteps");

        const totalStepsElement =
            document.getElementById("totalSteps");

        const overallProgress =
            document.getElementById("overallProgress");

        const careerDifficulty =
            document.getElementById("careerDifficulty");

        const progressPercentage =
            document.getElementById("progressPercentage");

        const progressCircle =
            document.getElementById("progressCircle");

        const progressCircleValue =
            document.getElementById("progressCircleValue");

        const progressCompleted =
            document.getElementById("progressCompleted");

        const progressRemaining =
            document.getElementById("progressRemaining");

        const journeyTitle =
            document.getElementById("journeyTitle");

        const journeyProgressText =
            document.getElementById("journeyProgressText");

        const journeyCompleted =
            document.getElementById("journeyCompleted");

        const journeyTotal =
            document.getElementById("journeyTotal");

        const journeyProgressFill =
            document.getElementById("journeyProgressFill");

        const journeyDescription =
            document.getElementById("journeyDescription");

        const journeyButton =
            document.getElementById("journeyButton");

        const viewRoadmapLink =
            document.getElementById("viewRoadmapLink");

        const continueRoadmapCard =
            document.getElementById("continueRoadmapCard");

        const continueRoadmapText =
            document.getElementById("continueRoadmapText");

        const careerDetailsCard =
            document.getElementById("careerDetailsCard");

        const careerDetailsText =
            document.getElementById("careerDetailsText");


        // =====================================================
        // NO CAREER SELECTED
        // =====================================================

        if (!careerData.career) {

            if (currentCareer) {
                currentCareer.textContent =
                    "Not Selected";
            }

            if (completedSteps) {
                completedSteps.textContent = "0";
            }

            if (totalStepsElement) {
                totalStepsElement.textContent = "0";
            }

            if (overallProgress) {
                overallProgress.textContent = "0";
            }

            if (careerDifficulty) {
                careerDifficulty.textContent = "—";
            }

            if (progressPercentage) {
                progressPercentage.textContent = "0%";
            }

            if (progressCircleValue) {
                progressCircleValue.textContent = "0%";
            }

            if (progressCircle) {

                progressCircle.style.setProperty(
                    "--progress-angle",
                    "0deg"
                );
            }

            if (progressCompleted) {
                progressCompleted.textContent = "0";
            }

            if (progressRemaining) {
                progressRemaining.textContent = "0";
            }

            if (journeyTitle) {
                journeyTitle.textContent =
                    "Choose Your Career";
            }

            if (journeyProgressText) {
                journeyProgressText.textContent =
                    "Ready to begin";
            }

            if (journeyCompleted) {
                journeyCompleted.textContent = "0";
            }

            if (journeyTotal) {
                journeyTotal.textContent = "0";
            }

            if (journeyProgressFill) {
                journeyProgressFill.style.width = "0%";
            }

            if (journeyDescription) {

                journeyDescription.textContent =
                    "Select a career to unlock its structured roadmap and start tracking your learning progress.";
            }

            if (journeyButton) {

                journeyButton.href =
                    "careers.html";

                journeyButton.innerHTML = `
                    <i class="ri-compass-3-line"></i>
                    Explore Careers
                `;
            }

            if (viewRoadmapLink) {

                viewRoadmapLink.href =
                    "careers.html";

                viewRoadmapLink.innerHTML = `
                    Explore Careers
                    <i class="ri-arrow-right-line"></i>
                `;
            }

            if (continueRoadmapCard) {
                continueRoadmapCard.href =
                    "careers.html";
            }

            if (continueRoadmapText) {

                continueRoadmapText.textContent =
                    "Select a career first, then follow its structured roadmap step by step.";
            }

            if (careerDetailsCard) {

                careerDetailsCard.href =
                    "careers.html";
            }

            if (careerDetailsText) {

                careerDetailsText.textContent =
                    "Select a career to view its details, skills and career information.";
            }

            return;
        }


        // =====================================================
        // CAREER DATA
        // =====================================================

        const career =
            careerData.career;

        if (currentCareer) {

            currentCareer.textContent =
                career.title;
        }

        if (careerDifficulty) {

            careerDifficulty.textContent =
                career.difficulty || "—";
        }


        const roadmapURL =
            `roadmap-details.html?careerId=${career.id}`;

        const careerDetailsURL =
            `career-details.html?id=${career.id}`;


        if (viewRoadmapLink) {
            viewRoadmapLink.href =
                roadmapURL;
        }

        if (continueRoadmapCard) {
            continueRoadmapCard.href =
                roadmapURL;
        }

        if (careerDetailsCard) {

            careerDetailsCard.href =
                careerDetailsURL;
        }

        if (careerDetailsText) {

            careerDetailsText.textContent =
                `View the skills, responsibilities, salary information and other details for ${career.title}.`;
        }


        // =====================================================
        // ROADMAP DATA
        // =====================================================

        const roadmapResponse = await fetch(
            `${API_BASE_URL}/api/careers/${career.id}/roadmap`
        );

        if (!roadmapResponse.ok) {

            console.error(
                "Unable to fetch roadmap data."
            );

            return;
        }

        const roadmapData =
            await roadmapResponse.json();

        const phases =
            Array.isArray(roadmapData.phases)
                ? roadmapData.phases
                : [];


        // =====================================================
        // COUNT TOTAL SUBTOPICS
        // =====================================================

        let totalSteps = 0;

        phases.forEach((phase) => {

            if (!Array.isArray(phase.topics)) {
                return;
            }

            phase.topics.forEach((topic) => {

                if (
                    Array.isArray(
                        topic.subtopics
                    )
                ) {

                    totalSteps +=
                        topic.subtopics.length;
                }

            });

        });


        // =====================================================
        // LOAD SAVED PROGRESS
        // =====================================================

        let savedProgress = {};

        try {

            const progressResponse =
                await fetch(
                    `${API_BASE_URL}/api/auth/progress?career_id=${career.id}`,
                    {
                        method: "GET",
                        credentials: "include"
                    }
                );

            const progressData =
                await progressResponse.json();

            if (
                progressResponse.ok &&
                progressData.success
            ) {

                savedProgress =
                    progressData.progress || {};
            }

        } catch (error) {

            console.error(
                "Unable to load roadmap progress:",
                error
            );

            savedProgress = {};
        }


        // =====================================================
        // CALCULATE PROGRESS
        // =====================================================

        let completedCount = 0;

        Object.values(savedProgress).forEach(
            (value) => {

                if (
                    value === true ||
                    value === 1
                ) {

                    completedCount++;
                }

            }
        );


        completedCount =
            Math.min(
                completedCount,
                totalSteps
            );


        const remainingCount =
            Math.max(
                totalSteps - completedCount,
                0
            );


        let progress = 0;

        if (totalSteps > 0) {

            progress =
                Math.round(
                    (completedCount / totalSteps) *
                    100
                );
        }


        // =====================================================
        // TOP STATS
        // =====================================================

        if (completedSteps) {

            completedSteps.textContent =
                completedCount;
        }

        if (totalStepsElement) {

            totalStepsElement.textContent =
                totalSteps;
        }

        if (overallProgress) {

            overallProgress.textContent =
                progress;
        }


        // =====================================================
        // PROGRESS CARD
        // =====================================================

        if (progressPercentage) {

            progressPercentage.textContent =
                `${progress}%`;
        }

        if (progressCircleValue) {

            progressCircleValue.textContent =
                `${progress}%`;
        }

        if (progressCompleted) {

            progressCompleted.textContent =
                completedCount;
        }

        if (progressRemaining) {

            progressRemaining.textContent =
                remainingCount;
        }


        // =====================================================
        // COLORED PROGRESS CIRCLE
        // =====================================================

        if (progressCircle) {

            const angle =
                (progress / 100) * 360;

            progressCircle.style.setProperty(
                "--progress-angle",
                `${angle}deg`
            );
        }


        // =====================================================
        // JOURNEY CARD
        // =====================================================

        if (journeyTitle) {

            journeyTitle.textContent =
                `${career.title} Roadmap`;
        }

        if (journeyProgressText) {

            journeyProgressText.textContent =
                `${progress}% Complete`;
        }

        if (journeyCompleted) {

            journeyCompleted.textContent =
                completedCount;
        }

        if (journeyTotal) {

            journeyTotal.textContent =
                totalSteps;
        }

        if (journeyProgressFill) {

            journeyProgressFill.style.width =
                `${progress}%`;
        }


        // =====================================================
        // ROADMAP COMPLETED
        // =====================================================

        if (
            progress === 100 &&
            totalSteps > 0
        ) {

            if (journeyDescription) {

                journeyDescription.textContent =
                    `You have completed all ${totalSteps} roadmap steps for ${career.title}. You can revisit the roadmap anytime to review the topics.`;
            }

            if (journeyButton) {

                journeyButton.href =
                    roadmapURL;

                journeyButton.innerHTML = `
                    <i class="ri-checkbox-circle-line"></i>
                    Review Roadmap
                `;
            }

            if (continueRoadmapText) {

                continueRoadmapText.textContent =
                    "Your roadmap is complete. Revisit it anytime to review what you learned.";
            }

        }


        // =====================================================
        // PARTIALLY COMPLETED
        // =====================================================

        else if (
            completedCount > 0
        ) {

            if (journeyDescription) {

                journeyDescription.textContent =
                    `You have completed ${completedCount} of ${totalSteps} roadmap steps. Continue where you left off and keep building your skills.`;
            }

            if (journeyButton) {

                journeyButton.href =
                    roadmapURL;

                journeyButton.innerHTML = `
                    <i class="ri-play-circle-line"></i>
                    Continue Learning
                `;
            }

            if (continueRoadmapText) {

                continueRoadmapText.textContent =
                    `Continue your ${career.title} roadmap from where you left off.`;
            }

        }


        // =====================================================
        // NOT STARTED
        // =====================================================

        else {

            if (journeyDescription) {

                journeyDescription.textContent =
                    `Start the ${career.title} roadmap and work through ${totalSteps} structured learning steps.`;
            }

            if (journeyButton) {

                journeyButton.href =
                    roadmapURL;

                journeyButton.innerHTML = `
                    <i class="ri-play-circle-line"></i>
                    Start Learning
                `;
            }

            if (continueRoadmapText) {

                continueRoadmapText.textContent =
                    `Start the ${career.title} roadmap and build your skills step by step.`;
            }
        }


        // =====================================================
        // DEBUG INFORMATION
        // =====================================================

        console.log(
            "Dashboard loaded:",
            {
                career: career.title,
                totalSteps,
                completedCount,
                remainingCount,
                progress
            }
        );


    } catch (error) {

        console.error(
            "Dashboard error:",
            error
        );

    }

});