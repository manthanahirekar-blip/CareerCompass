/* =========================================================
   CAREERCOMPASS - COMMON NAVBAR
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

    /* =====================================================
       NAVBAR CONTAINER
    ===================================================== */

    const navbarContainer =
        document.getElementById("navbar");

    if (!navbarContainer) {

        console.error(
            "Navbar container #navbar not found."
        );

        return;
    }


    /* =====================================================
       LOAD NAVBAR HTML
    ===================================================== */

    try {

        const response =
            await fetch("navbar.html");

        if (!response.ok) {

            throw new Error(
                "Unable to load navbar."
            );
        }

        const navbarHTML =
            await response.text();

        navbarContainer.innerHTML =
            navbarHTML;

    } catch (error) {

        console.error(
            "Navbar loading error:",
            error
        );

        return;
    }


    /* =====================================================
       ELEMENTS
    ===================================================== */

    const mobileMenuBtn =
        document.getElementById(
            "ccMobileMenuBtn"
        );

    const mobileMenu =
        document.getElementById(
            "ccMobileMenu"
        );

    const userBtn =
        document.getElementById(
            "ccUserBtn"
        );

    const userDropdown =
        document.getElementById(
            "ccUserDropdown"
        );

    const logoutBtn =
        document.getElementById(
            "ccLogoutBtn"
        );

    const mobileLogoutBtn =
        document.getElementById(
            "ccMobileLogoutBtn"
        );

    const guestActions =
        document.getElementById(
            "ccGuestActions"
        );

    const userArea =
        document.getElementById(
            "ccUserArea"
        );

    const mobileGuestActions =
        document.getElementById(
            "ccMobileGuestActions"
        );

    const mobileUserActions =
        document.getElementById(
            "ccMobileUserActions"
        );


    /* =====================================================
       GET LOGGED-IN USER
    ===================================================== */

    let currentUser = null;

    try {

        const savedUser =
            localStorage.getItem(
                "careerCompassUser"
            );

        if (savedUser) {

            currentUser =
                JSON.parse(savedUser);

        }

    } catch (error) {

        console.error(
            "User data error:",
            error
        );

        localStorage.removeItem(
            "careerCompassUser"
        );

    }


    /* =====================================================
       UPDATE AUTH UI
    ===================================================== */

    if (currentUser) {

        /* -----------------------------------------------
           LOGGED-IN USER
        ------------------------------------------------ */

        if (guestActions) {

            guestActions.style.display =
                "none";

        }

        if (userArea) {

            userArea.classList.add(
                "visible"
            );

        }

        if (mobileGuestActions) {

            mobileGuestActions.style.display =
                "none";

        }

        if (mobileUserActions) {

            mobileUserActions.classList.add(
                "visible"
            );

        }


        /* User information */

        const userName =
            currentUser.name || "User";

        const userEmail =
            currentUser.email || "";


        /* First letter for avatar */

        const firstLetter =
            userName
                .charAt(0)
                .toUpperCase();


        /* -----------------------------------------------
           DESKTOP USER INFORMATION
        ------------------------------------------------ */

        const userNameElement =
            document.getElementById(
                "ccUserName"
            );

        const userAvatarElement =
            document.getElementById(
                "ccUserAvatar"
            );

        const dropdownNameElement =
            document.getElementById(
                "ccDropdownName"
            );

        const dropdownEmailElement =
            document.getElementById(
                "ccDropdownEmail"
            );

        const dropdownAvatarElement =
            document.getElementById(
                "ccDropdownAvatar"
            );


        if (userNameElement) {

            userNameElement.textContent =
                userName;

        }

        if (userAvatarElement) {

            userAvatarElement.textContent =
                firstLetter;

        }

        if (dropdownNameElement) {

            dropdownNameElement.textContent =
                userName;

        }

        if (dropdownEmailElement) {

            dropdownEmailElement.textContent =
                userEmail;

        }

        if (dropdownAvatarElement) {

            dropdownAvatarElement.textContent =
                firstLetter;

        }


        /* -----------------------------------------------
           MOBILE USER INFORMATION
        ------------------------------------------------ */

        const mobileNameElement =
            document.getElementById(
                "ccMobileName"
            );

        const mobileEmailElement =
            document.getElementById(
                "ccMobileEmail"
            );

        const mobileAvatarElement =
            document.getElementById(
                "ccMobileAvatar"
            );


        if (mobileNameElement) {

            mobileNameElement.textContent =
                userName;

        }

        if (mobileEmailElement) {

            mobileEmailElement.textContent =
                userEmail;

        }

        if (mobileAvatarElement) {

            mobileAvatarElement.textContent =
                firstLetter;

        }


    } else {

        /* -----------------------------------------------
           GUEST USER
        ------------------------------------------------ */

        if (guestActions) {

            guestActions.style.display =
                "flex";

        }

        if (userArea) {

            userArea.classList.remove(
                "visible"
            );

        }

        if (mobileGuestActions) {

            mobileGuestActions.style.display =
                "flex";

        }

        if (mobileUserActions) {

            mobileUserActions.classList.remove(
                "visible"
            );

        }

    }


    /* =====================================================
       ACTIVE PAGE
    ===================================================== */

    const currentPage =
        getCurrentPage();


    const allNavLinks =
        document.querySelectorAll(
            "[data-page]"
        );


    allNavLinks.forEach(link => {

        const page =
            link.getAttribute(
                "data-page"
            );

        if (page === currentPage) {

            link.classList.add(
                "active"
            );

        }

    });


    /* =====================================================
       DASHBOARD ACCESS
    ===================================================== */

    /*
     * Dashboard should only be accessible
     * when the user is logged in.
     *
     * This applies to both desktop
     * and mobile dashboard links.
     */

    const dashboardLinks =
        document.querySelectorAll(
            'a[data-page="dashboard"]'
        );


    dashboardLinks.forEach(link => {

        link.addEventListener(
            "click",
            event => {

                if (!currentUser) {

                    event.preventDefault();

                    window.location.href =
                        "login.html";

                }

            }
        );

    });


    /* =====================================================
       MOBILE MENU
    ===================================================== */

    if (
        mobileMenuBtn &&
        mobileMenu
    ) {

        mobileMenuBtn.addEventListener(
            "click",
            () => {

                const isOpen =
                    mobileMenu.classList.toggle(
                        "open"
                    );


                /* Update accessibility */

                mobileMenuBtn.setAttribute(
                    "aria-expanded",
                    isOpen
                        ? "true"
                        : "false"
                );


                /* Change menu symbol */

                const menuIcon =
                    mobileMenuBtn.querySelector(
                        ".cc-menu-icon"
                    );


                if (menuIcon) {

                    menuIcon.textContent =
                        isOpen
                            ? "✕"
                            : "☰";

                }

            }
        );


        /* -----------------------------------------------
           CLOSE MOBILE MENU AFTER LINK CLICK
        ------------------------------------------------ */

        mobileMenu
            .querySelectorAll("a")
            .forEach(link => {

                link.addEventListener(
                    "click",
                    () => {

                        mobileMenu.classList.remove(
                            "open"
                        );

                        mobileMenuBtn.setAttribute(
                            "aria-expanded",
                            "false"
                        );


                        const menuIcon =
                            mobileMenuBtn.querySelector(
                                ".cc-menu-icon"
                            );


                        if (menuIcon) {

                            menuIcon.textContent =
                                "☰";

                        }

                    }
                );

            });

    }


    /* =====================================================
       USER DROPDOWN
    ===================================================== */

    if (
        userBtn &&
        userDropdown
    ) {

        userBtn.addEventListener(
            "click",
            event => {

                event.stopPropagation();


                const isOpen =
                    userDropdown.classList.toggle(
                        "open"
                    );


                userBtn.classList.toggle(
                    "open",
                    isOpen
                );


                userBtn.setAttribute(
                    "aria-expanded",
                    isOpen
                        ? "true"
                        : "false"
                );

            }
        );


        /* -----------------------------------------------
           CLOSE DROPDOWN WHEN CLICKING OUTSIDE
        ------------------------------------------------ */

        document.addEventListener(
            "click",
            event => {

                if (
                    !userDropdown.contains(
                        event.target
                    ) &&
                    !userBtn.contains(
                        event.target
                    )
                ) {

                    userDropdown.classList.remove(
                        "open"
                    );

                    userBtn.classList.remove(
                        "open"
                    );

                    userBtn.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                }

            }
        );

    }


    /* =====================================================
       LOGOUT
    ===================================================== */

    async function logoutUser() {

    try {

        await fetch(
            "http://127.0.0.1:5000/api/auth/logout",
            {
                method: "POST",
                credentials: "include"
            }
        );

    } catch (error) {

        console.error(
            "Logout error:",
            error
        );

    } finally {

        localStorage.removeItem("careerCompassUser");

        window.location.href = "index.html";
    }
}


    /* Desktop logout */

    if (logoutBtn) {

        logoutBtn.addEventListener(
            "click",
            logoutUser
        );

    }


    /* Mobile logout */

    if (mobileLogoutBtn) {

        mobileLogoutBtn.addEventListener(
            "click",
            logoutUser
        );

    }


    /* =====================================================
       HELPER - CURRENT PAGE
    ===================================================== */

    function getCurrentPage() {

        const path =
            window.location.pathname
                .split("/")
                .pop()
                .toLowerCase();


        switch (path) {

            /* Home */

            case "":
            case "index.html":

                return "home";


            /* Careers */

            case "careers.html":
            case "career-details.html":

                return "careers";


            /* Roadmaps */

            case "roadmap.html":

                return "roadmaps";


            /* Resources */

            case "resources.html":

                return "resources";


            /* Dashboard */

            case "dashboard.html":

                return "dashboard";


            /* About */

            case "about.html":

                return "about";


            /* Contact */

            case "contact.html":

                return "contact";


            /* Unknown */

            default:

                return "";

        }

    }

});