/* =========================================================
   CAREERCOMPASS - COMMON FOOTER
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {


    /* =====================================================
       FIND FOOTER CONTAINER
    ===================================================== */

    const footerContainer =
        document.getElementById("footer");


    if (!footerContainer) {

        console.error(
            "Footer container #footer not found."
        );

        return;
    }


    /* =====================================================
       LOAD FOOTER HTML
    ===================================================== */

    try {

        const response =
            await fetch("footer.html");


        if (!response.ok) {

            throw new Error(
                "Unable to load footer."
            );

        }


        const footerHTML =
            await response.text();


        footerContainer.innerHTML =
            footerHTML;


    } catch (error) {

        console.error(
            "Footer loading error:",
            error
        );

        return;
    }


    /* =====================================================
       CURRENT YEAR
    ===================================================== */

    const footerYear =
        document.getElementById("ccFooterYear");


    if (footerYear) {

        footerYear.textContent =
            new Date().getFullYear();

    }

});