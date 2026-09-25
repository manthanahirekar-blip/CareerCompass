/* =========================================================
   CAREERCOMPASS - AUTHENTICATION JAVASCRIPT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ELEMENTS
    ===================================================== */

    const registerForm = document.getElementById("registerForm");

    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const confirmPasswordInput =
        document.getElementById("confirmPassword");

    const termsInput = document.getElementById("terms");

    const registerBtn = document.getElementById("registerBtn");

    const formMessage = document.getElementById("formMessage");

    const strengthText = document.getElementById("strengthText");
    const strengthBars =
        document.querySelectorAll(".strength-bars span");


    /* =====================================================
       PASSWORD SHOW / HIDE
    ===================================================== */

    const passwordToggles =
        document.querySelectorAll(".password-toggle");

    passwordToggles.forEach(toggle => {

        toggle.addEventListener("click", () => {

            const targetId = toggle.dataset.target;
            const targetInput = document.getElementById(targetId);

            if (!targetInput) return;

            const icon = toggle.querySelector("i");

            if (targetInput.type === "password") {

                targetInput.type = "text";

                icon.classList.remove("ri-eye-line");
                icon.classList.add("ri-eye-off-line");

                toggle.setAttribute(
                    "aria-label",
                    "Hide password"
                );

            } else {

                targetInput.type = "password";

                icon.classList.remove("ri-eye-off-line");
                icon.classList.add("ri-eye-line");

                toggle.setAttribute(
                    "aria-label",
                    "Show password"
                );
            }

        });

    });

    /* =====================================================
       LOGIN
    ===================================================== */

    const loginForm = document.getElementById("loginForm");
    const loginEmail = document.getElementById("loginEmail");
    const loginPassword = document.getElementById("loginPassword");
    const loginBtn = document.getElementById("loginBtn");
    const loginMessage = document.getElementById("loginMessage");


    if (loginForm) {

        loginForm.addEventListener("submit", async (event) => {

            event.preventDefault();

            loginMessage.className = "form-message";
            loginMessage.textContent = "";

            const email = loginEmail.value.trim();
            const password = loginPassword.value;

            if (!email || !password) {

                loginMessage.textContent =
                    "Please enter your email and password.";

                loginMessage.classList.add("error");

                return;
            }


            loginBtn.disabled = true;

            loginBtn.querySelector("span").textContent =
                "Logging in...";


            try {

                const response = await fetch("http://127.0.0.1:5000/api/auth/login", {
                    method: "POST",

                    credentials: "include",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email,
                        password
                    })
                });


                const data = await response.json();


                if (response.ok && data.success) {

                    loginMessage.textContent =
                        "Login successful!";

                    loginMessage.classList.add("success");


                    /*
                     * Store logged-in user information
                     * for the dashboard.
                     */

                    localStorage.setItem(
                        "careerCompassUser",
                        JSON.stringify(data.user)
                    );


                    /*
                     * Redirect to dashboard
                     */

                    setTimeout(() => {

                        window.location.href =
                            "dashboard.html";

                    }, 700);


                } else {

                    loginMessage.textContent =
                        data.message || "Login failed.";

                    loginMessage.classList.add("error");

                }

            } catch (error) {

                console.error("Login error:", error);

                loginMessage.textContent =
                    "Unable to connect to the server.";

                loginMessage.classList.add("error");

            } finally {

                loginBtn.disabled = false;

                loginBtn.querySelector("span").textContent =
                    "Login";
            }

        });

    }


    /*
     * Stop here on login page.
     *
     * The remaining code is only for
     * the registration page.
     */

    if (!registerForm) {
        return;
    }


    /* =====================================================
       PASSWORD STRENGTH
    ===================================================== */

    function checkPasswordStrength(password) {

        let score = 0;

        if (password.length >= 8) {
            score++;
        }

        if (/[A-Z]/.test(password)) {
            score++;
        }

        if (/[0-9]/.test(password)) {
            score++;
        }

        if (/[^A-Za-z0-9]/.test(password)) {
            score++;
        }

        return score;
    }


    function updatePasswordStrength() {

        const password = passwordInput.value;

        const score = checkPasswordStrength(password);

        strengthBars.forEach(bar => {
            bar.style.background = "#e2e8f0";
        });

        if (!password) {

            strengthText.textContent = "Password strength";
            strengthText.style.color = "#94a3b8";

            return;
        }


        if (score === 1) {

            strengthBars[0].style.background = "#ef4444";

            strengthText.textContent = "Weak";
            strengthText.style.color = "#dc2626";

        } else if (score === 2) {

            strengthBars[0].style.background = "#f59e0b";
            strengthBars[1].style.background = "#f59e0b";

            strengthText.textContent = "Fair";
            strengthText.style.color = "#d97706";

        } else if (score === 3) {

            strengthBars[0].style.background = "#eab308";
            strengthBars[1].style.background = "#eab308";
            strengthBars[2].style.background = "#eab308";

            strengthText.textContent = "Good";
            strengthText.style.color = "#ca8a04";

        } else {

            strengthBars[0].style.background = "#22c55e";
            strengthBars[1].style.background = "#22c55e";
            strengthBars[2].style.background = "#22c55e";
            strengthBars[3].style.background = "#22c55e";

            strengthText.textContent = "Strong";
            strengthText.style.color = "#16a34a";
        }

    }


    passwordInput.addEventListener(
        "input",
        updatePasswordStrength
    );


    /* =====================================================
       VALIDATION HELPERS
    ===================================================== */

    function setError(input, errorElement, message) {

        errorElement.textContent = message;

        const wrapper = input.closest(".input-wrapper");

        if (wrapper) {
            wrapper.classList.add("input-error");
            wrapper.classList.remove("input-success");
        }

    }


    function clearError(input, errorElement) {

        errorElement.textContent = "";

        const wrapper = input.closest(".input-wrapper");

        if (wrapper) {
            wrapper.classList.remove("input-error");
        }

    }


    function setSuccess(input) {

        const wrapper = input.closest(".input-wrapper");

        if (wrapper) {
            wrapper.classList.remove("input-error");
            wrapper.classList.add("input-success");
        }

    }


    /* =====================================================
       EMAIL VALIDATION
    ===================================================== */

    function isValidEmail(email) {

        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    }


    /* =====================================================
       FORM VALIDATION
    ===================================================== */

    function validateForm() {

        let isValid = true;


        const nameError =
            document.getElementById("nameError");

        const emailError =
            document.getElementById("emailError");

        const passwordError =
            document.getElementById("passwordError");

        const confirmPasswordError =
            document.getElementById("confirmPasswordError");

        const termsError =
            document.getElementById("termsError");


        /* ---------------------------------------------
           Name
        --------------------------------------------- */

        clearError(nameInput, nameError);

        if (nameInput.value.trim() === "") {

            setError(
                nameInput,
                nameError,
                "Please enter your full name."
            );

            isValid = false;

        } else if (nameInput.value.trim().length < 2) {

            setError(
                nameInput,
                nameError,
                "Name must contain at least 2 characters."
            );

            isValid = false;

        } else {

            setSuccess(nameInput);

        }


        /* ---------------------------------------------
           Email
        --------------------------------------------- */

        clearError(emailInput, emailError);

        if (emailInput.value.trim() === "") {

            setError(
                emailInput,
                emailError,
                "Please enter your email address."
            );

            isValid = false;

        } else if (!isValidEmail(emailInput.value.trim())) {

            setError(
                emailInput,
                emailError,
                "Please enter a valid email address."
            );

            isValid = false;

        } else {

            setSuccess(emailInput);

        }


        /* ---------------------------------------------
           Password
        --------------------------------------------- */

        clearError(passwordInput, passwordError);

        const password = passwordInput.value;

        if (password === "") {

            setError(
                passwordInput,
                passwordError,
                "Please create a password."
            );

            isValid = false;

        } else if (password.length < 8) {

            setError(
                passwordInput,
                passwordError,
                "Password must contain at least 8 characters."
            );

            isValid = false;

        } else {

            setSuccess(passwordInput);

        }


        /* ---------------------------------------------
           Confirm Password
        --------------------------------------------- */

        clearError(
            confirmPasswordInput,
            confirmPasswordError
        );

        if (confirmPasswordInput.value === "") {

            setError(
                confirmPasswordInput,
                confirmPasswordError,
                "Please confirm your password."
            );

            isValid = false;

        } else if (
            confirmPasswordInput.value !== passwordInput.value
        ) {

            setError(
                confirmPasswordInput,
                confirmPasswordError,
                "Passwords do not match."
            );

            isValid = false;

        } else {

            setSuccess(confirmPasswordInput);

        }


        /* ---------------------------------------------
           Terms
        --------------------------------------------- */

        termsError.textContent = "";

        if (!termsInput.checked) {

            termsError.textContent =
                "Please accept the Terms & Conditions.";

            isValid = false;

        }


        return isValid;

    }


    /* =====================================================
   FORM SUBMIT
===================================================== */

   registerForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    formMessage.className = "form-message";
    formMessage.textContent = "";

    const isValid = validateForm();

    if (!isValid) {
        return;
    }

    registerBtn.disabled = true;

    registerBtn.querySelector("span").textContent =
        "Creating Account...";

    try {

        const nameValue =
            document.getElementById("name").value.trim();

        const emailValue =
            document.getElementById("email").value.trim().toLowerCase();

        const passwordValue =
            document.getElementById("password").value;


        const response = await fetch(
            "http://127.0.0.1:5000/api/auth/register",
            {
                method: "POST",

                credentials: "include",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    name: nameValue,
                    email: emailValue,
                    password: passwordValue
                })
            }
        );


        const data = await response.json();


        if (response.ok && data.success) {

            formMessage.textContent =
                "Account created successfully!";

            formMessage.classList.add("success");

            registerForm.reset();


            strengthBars.forEach(bar => {
                bar.style.background = "#e2e8f0";
            });


            strengthText.textContent =
                "Password strength";

            strengthText.style.color =
                "#94a3b8";


            setTimeout(() => {

                window.location.href =
                    "login.html";

            }, 1000);


        } else {

            formMessage.textContent =
                data.message || "Registration failed.";

            formMessage.classList.add("error");
        }


    } catch (error) {

        console.error(
            "Registration error:",
            error
        );

        formMessage.textContent =
            "Unable to connect to the server.";

        formMessage.classList.add("error");


    } finally {

        registerBtn.disabled = false;

        registerBtn.querySelector("span").textContent =
            "Create Account";
    }

});

    /* =====================================================
       REAL-TIME CONFIRM PASSWORD CHECK
    ===================================================== */

    confirmPasswordInput.addEventListener("input", () => {

        const errorElement =
            document.getElementById("confirmPasswordError");

        if (!confirmPasswordInput.value) {

            clearError(
                confirmPasswordInput,
                errorElement
            );

            return;
        }

        if (
            confirmPasswordInput.value !==
            passwordInput.value
        ) {

            setError(
                confirmPasswordInput,
                errorElement,
                "Passwords do not match."
            );

        } else {

            clearError(
                confirmPasswordInput,
                errorElement
            );

            setSuccess(confirmPasswordInput);

        }

    });

});