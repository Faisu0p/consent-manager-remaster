import bannerTemplateModel from "../models/bannerTemplateModel.js";
import consentModel from "../models/consentModel.js";
import bcrypt from "bcryptjs";

const getFullBannerTemplateById = async (req, res) => {
    try {
        const templateId = parseInt(req.params.templateId, 10);

        // Validate templateId
        if (isNaN(templateId)) {
            return res.status(400).json({ error: "Invalid template ID" });
        }

        // Step 1: Fetch the banner template
        const template = await bannerTemplateModel.getBannerTemplateById(templateId);
        if (!template) {
            return res.status(404).json({ error: "Banner template not found" });
        }

        // Step 2: Fetch related data for this template
        const [portal, categories, partners] = await Promise.all([
            bannerTemplateModel.getConsentPortalByTemplateId(templateId),
            bannerTemplateModel.getConsentCategories(templateId),
            bannerTemplateModel.getPartners(templateId),
        ]);

        // Step 3: Fetch subcategories for each category asynchronously
        const updatedCategories = await Promise.all(
            categories.map(async (category) => {
                category.subcategories = await bannerTemplateModel.getConsentSubcategories(category.id);
                return category;
            })
        );

        // Step 4: Construct response object
        const response = {
            ...template,
            portal: portal.length > 0 ? portal[0] : null, // Adjust if multiple portals are expected
            categories: updatedCategories,
            partners,
        };

        // Send response
        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error while fetching banner template details" });
    }
};


// Register a new consent user and store consent
const registerAndStoreConsent = async (req, res) => {
    try {
        const { user, email, phone, given, selectedCategories } = req.body;

        // Basic input validation
        if (!user || typeof user !== "string" || user.length < 3) {
            return res.status(400).json({ error: "Invalid username" });
        }
        
        // Require either email OR phone, not necessarily both
        if ((!email && !phone) || 
            (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) || 
            (phone && !/^\d{10}$/.test(phone))) {
            return res.status(400).json({ error: "Either valid email or valid phone is required" });
        }
        
        if (typeof given !== "boolean" || 
            !Array.isArray(selectedCategories) || 
            !selectedCategories.every(id => Number.isInteger(id))) {
            return res.status(400).json({ error: "Invalid consent data" });
        }

        // Check if user already exists by email or phone
        let existingUser = await consentModel.getConsentUserByEmailOrPhone(email, phone);
        let consentUserId;

        if (existingUser) {
            consentUserId = existingUser.id;

            // Check if a consent record already exists for this user
            const existingConsent = await consentModel.getConsentByUserId(consentUserId);
            if (existingConsent) {
                return res.status(409).json({ error: "User consent already exists" });
            }
        } else {
            // Create a new user with either email or phone or both
            consentUserId = await consentModel.createConsentUser(user, email || null, phone || null);
        }

        // Insert consent record
        const consentId = await consentModel.createConsent(consentUserId, given);

        // Insert selected categories if consent is given
        if (given && selectedCategories.length > 0) {
            await consentModel.createConsentCategories(consentId, selectedCategories);
        }

        res.status(201).json({
            message: "User registered and consent recorded successfully",
            consentUserId,
            consentId,
        });

    } catch (error) {
        console.error("Error in registerAndStoreConsent:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};




const generateConsentScript = async (req, res) => {
    try {
        const { templateId } = req.params;
        const { lang } = req.query; // Get selected language from query params

        let finalTemplateId = templateId; // Default template ID
        
        // Fetch available languages for this template
        const availableLanguages = await bannerTemplateModel.getAvailableLanguages(templateId);

        if (lang) {
            // Fetch translated template ID
            const languageMapping = await bannerTemplateModel.getTemplateIdByLanguage(templateId, lang);
            if (languageMapping) {
                finalTemplateId = languageMapping.template_id; // Use translated template ID
            }
        }

        // Fetch the full template details using the correct translated template ID
        const template = await bannerTemplateModel.getBannerTemplateById(finalTemplateId);
        if (!template) {
            return res.status(404).send("Template not found");
        }

        // Fetch categories, partners, and portal data using finalTemplateId
        const categories = await bannerTemplateModel.getConsentCategories(finalTemplateId);
        const partners = await bannerTemplateModel.getPartners(finalTemplateId);
        const portalData = await bannerTemplateModel.getConsentPortalByTemplateId(finalTemplateId);
        const portal = portalData.length > 0 ? portalData[0] : null;

        // Fetch subcategories for each category
        for (const category of categories) {
            category.subcategories = await bannerTemplateModel.getConsentSubcategories(category.id);
        }

        // Construct the response object
        const response = {
            ...template,
            categories,
            partners,
            portal,
            availableLanguages,
        };
  
        // Generate JavaScript dynamically using template details
        const scriptContent = `
            (function() {

                function setCookie(name, value, days) {
                    var expires = "";
                    if (days) {
                        var date = new Date();
                        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                        expires = "; expires=" + date.toUTCString();
                    }
                    document.cookie = name + "=" + value + "; path=/; SameSite=None; Secure" + expires;
                }

                function getCookie(name) {
                    var nameEQ = name + "=";
                    var ca = document.cookie.split(';');
                    for(var i = 0; i < ca.length; i++) {
                        var c = ca[i];
                        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
                        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
                    }
                    return null;
                }

                if (getCookie("consentGiven")) return;
  
                var banner = document.createElement("div");
                banner.classList.add("cookie-banner-container");
  
                banner.innerHTML = \`
                    <div class="cookie-banner">
                        <div class="cookie-banner-header">
                            <h1 class="cookie-banner-company-name">${response.name}</h1>
                            <h2 class="cookie-banner-title">${response.header_text}</h2>
                        </div>

<label for="languageSelector" style="color: black;">Choose Language:</label>
<select id="languageSelector">
    <option value="">Default</option>
    ${response.availableLanguages.map(lang => {
        const languageNames = {
            en: "English",
            hi: "हिन्दी",
            fr: "Français",
            es: "Español",
            de: "Deutsch"
        };
        return `<option value="${lang.language_code}">${languageNames[lang.language_code] || lang.language_code.toUpperCase()}</option>`;
    }).join("")}
</select>



                        <div class="cookie-banner-content">
                            <p class="cookie-banner-intro">${response.main_text}</p>
                            <p class="cookie-banner-details">${response.info_paragraph}</p>
                            <div class="cookie-banner-buttons">
                                <button class="cookie-banner-configure-button" onclick="openConfig()">${response.button_configure_text}</button>
                                <button class="cookie-banner-disagree-button" onclick="rejectConsent()">${response.button_reject_text}</button>
                                <button class="cookie-banner-agree-button" onclick="acceptConsent()">${response.button_accept_text}</button>
                            </div>
                        </div>
                    </div>
                \`;
                
  
                var style = document.createElement("style");
                style.innerHTML = \`
                    .cookie-banner-container {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: rgba(0, 0, 0, 0.5);
                        z-index: 10000;
                    }
                    .cookie-banner {
                        background-color: white;
                        border-radius: 10px;
                        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
                        width: 90%;
                        max-width: 600px;
                        overflow: hidden;
                        text-align: center;
                        padding: 20px;
                    }
                    .cookie-banner-header {
                        padding: 15px;
                        border-bottom: 1px solid #eaeaea;
                        background-color: #f8f8f8;
                    }
                    .cookie-banner-company-name {
                        font-size: 24px;
                        font-weight: bold;
                        color: #1a2a3a;
                        margin-bottom: 10px;
                        text-transform: uppercase;
                    }
                    .cookie-banner-title {
                        font-size: 18px;
                        font-weight: bold;
                        color: #1a2a3a;
                    }
                    .cookie-banner-content {
                        padding: 20px;
                    }
                    .cookie-banner-intro, .cookie-banner-details {
                        font-size: 14px;
                        color: #333;
                        margin-bottom: 15px;
                    }
                    .cookie-banner-buttons {
                        display: flex;
                        justify-content: space-between;
                        gap: 10px;
                        margin-top: 15px;
                    }
                    .cookie-banner-configure-button,
                    .cookie-banner-disagree-button,
                    .cookie-banner-agree-button {
                        flex: 1;
                        padding: 12px 20px;
                        border-radius: 25px; /* Makes buttons more cylindrical */
                        font-size: 14px;
                        font-weight: bold;
                        cursor: pointer;
                        transition: background-color 0.2s ease, transform 0.1s ease;
                        border: none;
                    }

                    .cookie-banner-configure-button:hover,
                    .cookie-banner-disagree-button:hover,
                    .cookie-banner-agree-button:hover {
                        transform: scale(1.05); /* Slight hover effect */
                    }

                    .cookie-banner-configure-button {
                        background-color: white;
                        color: #3373cc;
                        border: 1px solid #3373cc;
                    }
                    .cookie-banner-configure-button:hover {
                        background-color: #f0f5ff;
                    }
                    .cookie-banner-disagree-button {
                        background-color: #f1f1f1;
                        color: #333;
                    }
                    .cookie-banner-disagree-button:hover {
                        background-color: #e5e5e5;
                    }
                    .cookie-banner-agree-button {
                        background-color: #3373cc;
                        color: white;
                    }
                    .cookie-banner-agree-button:hover {
                        background-color: #2861b1;
                    }
                \`;
  
                document.head.appendChild(style);
                document.body.appendChild(banner);



        // Add event listener for language selection
        // document.getElementById("languageSelector").addEventListener("change", function(event) {
        //     var selectedLang = event.target.value;
        //     if (selectedLang) {
        //         // Reload the script with the selected language
        //         var scriptElement = document.querySelector('script[src*="generate-script"]');
        //         if (scriptElement) {
        //             var newScript = document.createElement("script");
        //             newScript.src = scriptElement.src.split("?")[0] + "?lang=" + selectedLang;
        //             newScript.async = true;
        //             scriptElement.parentNode.replaceChild(newScript, scriptElement);
        //         }
        //     }
        // });






        // Event listener for language selection
        document.getElementById("languageSelector").addEventListener("change", function(event) {
        var selectedLang = event.target.value;
        if (selectedLang) {
            // Store the language preference
            setCookie("preferredLanguage", selectedLang, 365);
            
            // Instead of replacing the script immediately, remove the banner first
            var bannerContainer = document.querySelector(".cookie-banner-container");
            if (bannerContainer) {
                document.body.removeChild(bannerContainer);
            }
            
            // Now replace the script
            var scriptElement = document.querySelector('script[src*="generate-script"]');
            if (scriptElement) {
                var newScript = document.createElement("script");
                newScript.src = scriptElement.src.split("?")[0] + "?lang=" + selectedLang;
                newScript.async = true;
                
                // Use a different approach to avoid race conditions
                scriptElement.parentNode.insertBefore(newScript, scriptElement);
                scriptElement.parentNode.removeChild(scriptElement);
            }
        }
    });






                // Event handler for the Accept button
                window.acceptConsent = function() {
                    var categories = ${JSON.stringify(response.categories)};
                    var selectedCategories = categories.map(cat => ({ id: cat.id, name: cat.name }));

                    // Function to get cookie value by name
                    function getCookie(name) {
                        var match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
                        return match ? decodeURIComponent(match[2]) : null;
                    }

                    var existingCategories = getCookie("consentCategories");

                    if (existingCategories) {
                        // If selectedCategories are already present, only save consentGiven
                        setCookie("consentGiven", "true", 365);
                    } else {
                        // If selectedCategories are not in cookies, save them
                        document.cookie = "consentCategories=" + encodeURIComponent(JSON.stringify(selectedCategories)) + "; path=/; max-age=" + (365 * 24 * 60 * 60);
                        setCookie("consentGiven", "true", 365);
                    }

                    document.body.removeChild(banner);

                    // Check if user is logged in
                    openLoginStatusWindow();


                };


                function openLoginStatusWindow() {
                    var loginWindow = document.createElement("div");
                    loginWindow.style.position = "fixed";
                    loginWindow.style.top = "0";
                    loginWindow.style.left = "0";
                    loginWindow.style.width = "100vw";
                    loginWindow.style.height = "100vh";
                    loginWindow.style.background = "rgba(0, 0, 0, 0.5)";
                    loginWindow.style.display = "flex";
                    loginWindow.style.justifyContent = "center";
                    loginWindow.style.alignItems = "center";
                    loginWindow.style.zIndex = "1000";

                    loginWindow.innerHTML = \`
                        <div style="background: white; padding: 25px; border-radius: 10px; 
                                    box-shadow: 0px 4px 15px rgba(0,0,0,0.3); text-align: center; 
                                    width: 350px; font-family: Arial, sans-serif;">
                            <h3 style="margin-bottom: 15px; color: #333;">Please re-authenticate yourself to save your privacy consent.</h3>
                            <button onclick="handleLoginStatus(true)" 
                                style="background: #007bff; color: white; border: none; padding: 10px 15px; 
                                        border-radius: 5px; cursor: pointer; width: 100%; margin-bottom: 10px;
                                        font-size: 16px;">Save my privacy preference</button>
                            <button onclick="handleLoginStatus(false)" 
                                style="background: #dc3545; color: white; border: none; padding: 10px 15px; 
                                        border-radius: 5px; cursor: pointer; width: 100%; font-size: 16px;">ignore</button>
                        </div>
                    \`;

                    document.body.appendChild(loginWindow);
                }


                window.handleLoginStatus = function(isLoggedIn) {
                    document.body.lastChild.remove(); // Remove the login status window

                    if (isLoggedIn) {
                        document.cookie = "userLoggedIn=true; path=/; max-age=" + (365 * 24 * 60 * 60);
                        openAuthPopup(); // Show authentication popup
                    } else {
                        document.cookie = "userLoggedIn=false; path=/; max-age=" + (365 * 24 * 60 * 60);
                    }
                };


                function openAuthPopup() {
                    var popup = document.createElement("div");
                    popup.style.position = "fixed";
                    popup.style.top = "0";
                    popup.style.left = "0";
                    popup.style.width = "100vw";
                    popup.style.height = "100vh";
                    popup.style.background = "rgba(0, 0, 0, 0.5)";
                    popup.style.display = "flex";
                    popup.style.justifyContent = "center";
                    popup.style.alignItems = "center";
                    popup.style.zIndex = "1000";

                    popup.innerHTML = \`
                        <div style="background: white; padding: 25px; border-radius: 10px; 
                                    box-shadow: 0px 4px 15px rgba(0,0,0,0.3); text-align: center; 
                                    width: 350px; font-family: Arial, sans-serif;">
                            <h3 style="margin-bottom: 15px; color: #333;">Enter your details to save privacy preferences</h3>

                            <input type="text" id="popupUsername" placeholder="Username" 
                                style="width: 100%; padding: 10px; margin-bottom: 10px; 
                                    border: 1px solid #ccc; border-radius: 5px; font-size: 14px;">

                            <p style="margin: 10px 0; font-size: 14px; color: #666;">and</p>

                            
                            <input type="email" id="popupEmail" placeholder="Email" 
                                style="width: 100%; padding: 10px; margin-bottom: 10px; 
                                    border: 1px solid #ccc; border-radius: 5px; font-size: 14px;">
                            <input type="text" id="popupEmailOTP" placeholder="Enter OTP" 
                                style="width: 100%; padding: 10px; margin-bottom: 10px; 
                                    border: 1px solid #ccc; border-radius: 5px; font-size: 14px;">
                            
                            <p style="margin: 10px 0; font-size: 14px; color: #666;">or</p>

                            <input type="tel" id="popupPhone" placeholder="Phone" 
                                style="width: 100%; padding: 10px; margin-bottom: 10px; 
                                    border: 1px solid #ccc; border-radius: 5px; font-size: 14px;">
                            <input type="text" id="popupPhoneOTP" placeholder="Enter OTP" 
                                style="width: 100%; padding: 10px; margin-bottom: 15px; 
                                    border: 1px solid #ccc; border-radius: 5px; font-size: 14px;">

                            <button onclick="saveCredentials()" 
                                style="background: #007bff; color: white; border: none; padding: 10px 15px; 
                                    border-radius: 5px; cursor: pointer; width: 100%; font-size: 16px;">
                                Save
                            </button>
                            
                            <button onclick="document.body.removeChild(popup)" 
                                style="background: #dc3545; color: white; border: none; padding: 10px 15px; 
                                    border-radius: 5px; cursor: pointer; width: 100%; margin-top: 10px; font-size: 16px;">
                                Cancel
                            </button>
                        </div>
                    \`;

                    document.body.appendChild(popup);
                }




                // window.saveCredentials = function() {
                //     var email = document.getElementById("popupEmail").value;
                //     var password = document.getElementById("popupPassword").value;

                //     if (email && password) {
                //         document.cookie = "userEmail=" + encodeURIComponent(email) + "; path=/; max-age=" + (365 * 24 * 60 * 60);
                //         document.cookie = "userPassword=" + encodeURIComponent(password) + "; path=/; max-age=" + (365 * 24 * 60 * 60);
                        
                //         document.body.lastChild.remove(); // Remove popup
                //         alert("Credentials saved!");
                //     } else {
                //         alert("Please enter both email and password.");
                //     }
                // }

                
window.saveCredentials = function() {

    var user = document.getElementById("popupUsername").value;
    var email = document.getElementById("popupEmail").value;
    var emailOTP = document.getElementById("popupEmailOTP").value;
    var phone = document.getElementById("popupPhone").value;
    var phoneOTP = document.getElementById("popupPhoneOTP").value;

    // Validate input
    if (!user) {
        alert("Please enter a username.");
        return;
    }
    if (email && emailOTP !== "123456") {
        alert("Invalid Email OTP!");
        return;
    }

    if (phone && phoneOTP !== "123456") {
        alert("Invalid Phone OTP!");
        return;
    }

    if (!(email && emailOTP) && !(phone && phoneOTP)) {
        alert("Please enter either email with OTP or phone with OTP.");
        return;
    }


    // Save credentials to cookies
    document.cookie = "user=" + encodeURIComponent(user) + "; path=/; max-age=" + (365 * 24 * 60 * 60);
    if (email) document.cookie = "userEmail=" + encodeURIComponent(email) + "; path=/; max-age=" + (365 * 24 * 60 * 60);
    if (phone) document.cookie = "userPhone=" + encodeURIComponent(phone) + "; path=/; max-age=" + (365 * 24 * 60 * 60);


    // Retrieve cookies
    var cookies = document.cookie.split("; ").reduce((acc, cookie) => {
        var [key, value] = cookie.split("=");
        acc[key] = decodeURIComponent(value);
        return acc;
    }, {});

    if (cookies.userLoggedIn !== "true") {
        console.log("User not logged in, skipping database save.");
        return;
    }

    var given = cookies.consentGiven === "true";
    var selectedCategories = [];

    if (given) {
        if (cookies.selectedCategories) {
            try {
                selectedCategories = JSON.parse(cookies.selectedCategories).map(category => Number(category.id));
            } catch (e) {
                console.error("Error parsing selectedCategories:", e);
                selectedCategories = [];
            }
        } else if (cookies.consentCategories) {
            try {
                selectedCategories = JSON.parse(cookies.consentCategories).map(category => Number(category.id));
            } catch (e) {
                console.error("Error parsing consentCategories:", e);
                selectedCategories = [];
            }
        }
    }

    // Prepare request payload
    var requestData = {
        user: user,
        email: email || null,
        phone: phone || null,
        given: given,
        selectedCategories: selectedCategories
    };

    console.log("Sending request data:", requestData); // Debugging output

    fetch("http://localhost:5000/api/register-and-store-consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData)
    })
    .then(response => response.json())
    .then(data => {
        console.log("Server response:", data);
        if (data.message === "User registered and consent recorded successfully") {

            if (data.consentUserId) {
                document.cookie = "userId=" + encodeURIComponent(data.consentUserId) + "; path=/; max-age=" + (365 * 24 * 60 * 60);
            }

            document.body.lastChild.remove();
            alert("Credentials saved and consent data stored!");
        } else {
            alert("Error saving consent data.");
        }
    })
    .catch(error => console.error("Fetch error:", error));
};






                // Event handlers for the Reject button
                window.rejectConsent = function() {
                    setCookie("consentGiven", "false", 365);
                    openLoginStatusWindow();
                    document.body.removeChild(banner);
                };







                // Open config modal
                window.openConfig = function(response) {
                    if (document.querySelector(".cookie-config-modal")) return; // Prevent multiple modals

                    var modal = document.createElement("div");
                    modal.classList.add("cookie-config-modal");

                    // Modal styling
                    modal.style.position = "fixed";
                    modal.style.top = "10vh";
                    modal.style.left = "50%";
                    modal.style.transform = "translate(-50%)";
                    modal.style.backgroundColor = "#fff";
                    modal.style.padding = "20px";
                    modal.style.borderRadius = "10px";
                    modal.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.2)";
                    modal.style.zIndex = "10001"; // Higher than the banner
                    modal.style.width = "90vh";
                    modal.style.maxWidth = "500px";
                    modal.style.maxHeight = "80vh"; // Prevents overflow
                    modal.style.overflowY = "auto";

                    // Modal content using API response data
                    modal.innerHTML = \`
                        <div class="cookie-portal-banner">


                            <!-- Header -->
                            <div class="cookie-portal-header" style="
                                display: flex;
                                align-items: center;
                                justify-content: space-between;
                                padding-bottom: 15px;
                                border-bottom: 1px solid #e0e0e0;
                                position: relative;
                                text-align: left;
                            ">
                                <!-- Left Side: Icon and Text -->
                                <div style="display: flex; align-items: center; gap: 10px;">
                                    <div class="cookie-portal-icon-container" style="
                                        width: 40px;
                                        height: 40px;
                                        background: #e6f0fa;
                                        display: flex;
                                        justify-content: center;
                                        align-items: center;
                                        border-radius: 50%;
                                    ">
                                        <div class="cookie-portal-pen-icon">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M18 2L22 6L12 16H8V12L18 2Z" fill="#2E75B7"/>
                                            </svg>
                                        </div>
                                    </div>

                                    <h1 class="cookie-banner-company-name" style="
                                        font-size: 18px;
                                        font-weight: bold;
                                        color: #2c3e50;
                                        margin: 0;
                                    ">
                                        Welcome to ${response.name}
                                    </h1>
                                </div>

                                <!-- Close Button (Right Side) -->
                                <button class="cookie-portal-close-button" style="
                                    position: absolute;
                                    top: 10px;
                                    right: 10px;
                                    background: none;
                                    border: none;
                                    font-size: 18px;
                                    cursor: pointer;
                                    color: #777;
                                ">✕</button>
                            </div>



                            <!-- Main Content -->

                            <div class="cookie-portal-content">
                                <p class="cookie-portal-consent-text" style="
                                    font-size: 14px;
                                    color: #333;
                                    line-height: 1.5;
                                    margin: 15px 0;
                                ">
                                    ${response.portal?.upper_text || "We use cookies to enhance your experience. You can manage your preferences here."}
                                </p>




                                <div class="cookie-portal-allow-section" style="
                                    display: flex;
                                    flex-direction: column;
                                    gap: 15px;
                                    padding: 10px;
                                    background: #f8f9fa;
                                    border-radius: 8px;
                                    margin-bottom: 15px;
                                ">
                                    ${response.categories.map(category => `
                                        <div class="cookie-portal-allow-item" style="display: flex; flex-direction: column; align-items: flex-start;">
                                            <label style="display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; color: #2c3e50;">
                                                <input type="checkbox" checked data-id="${category.id}" class="cookie-category-checkbox"> ${category.name}

                                            </label>
                                            <ul style="
                                                margin-top: 5px;
                                                margin-left: 30px; /* Adjust indentation */
                                                font-size: 12px;
                                                color: #555;
                                                list-style-type: disc; /* Bulleted list */
                                                padding-left: 20px;
                                                text-align: left; /* Ensures text aligns left */
                                            ">
                                                ${category.subcategories.map(sub => `<li>${sub.name}</li>`).join('')}
                                            </ul>
                                        </div>
                                    `).join('')}
                                </div>



                                <p class="cookie-portal-consent-text" style="
                                    font-size: 14px;
                                    color: #333;
                                    line-height: 1.5;
                                    margin: 15px 0;
                                ">
                                    ${response.portal?.lower_text || "We use cookies to enhance your experience. You can manage your preferences here."}
                                </p>
                            </div>


                            <div class="cookie-portal-footer" style="
                                display: flex;
                                justify-content: space-between;
                                align-items: center;
                                padding: 10px 15px;
                                border-top: 1px solid #e0e0e0;
                                background: #f8f9fa;
                            ">
                                <!-- SVG Logo on the left -->
                                <div class="cookie-portal-logo-container" style="
                                    display: flex;
                                    align-items: center;
                                ">
                                    <svg width="100" height="30" viewBox="0 0 100 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <rect width="100" height="30" rx="5" fill="#2e75b7"/>
                                        <text x="50%" y="50%" text-anchor="middle" dy=".35em" fill="white" font-size="14" font-family="Arial, sans-serif">Your Logo</text>
                                    </svg>
                                </div>



                                <!-- Save button with text below -->
                                <div class="cookie-portal-save-container" style="
                                    text-align: center;
                                ">
                                    <button class="cookie-portal-save-button" style="
                                        background: #2e75b7;
                                        color: white;
                                        border: none;
                                        padding: 8px 15px;
                                        border-radius: 4px;
                                        font-size: 14px;
                                        cursor: pointer;
                                        font-weight: 500;
                                    ">Save</button>
                                    <p class="cookie-portal-save-text" style="
                                        font-size: 12px;
                                        color: #666;
                                        margin-top: 5px;
                                    ">Set all your preferences to save and continue</p>
                                </div>
                            </div>

                            
                        </div>
                    \`;

                    // Close modal event
                    modal.querySelector(".cookie-portal-close-button").addEventListener("click", closeConfig);

                    // Append modal to body
                    document.body.appendChild(modal);

                    // Save button event
                    modal.querySelector(".cookie-portal-save-button").addEventListener("click", function() {
                        var selectedCategories = [];
                        document.querySelectorAll(".cookie-category-checkbox:checked").forEach(checkbox => {
                            selectedCategories.push({
                                id: checkbox.getAttribute("data-id"),
                                name: checkbox.parentElement.textContent.trim()
                            });
                        });

                        // Store selected categories in a cookie
                        document.cookie = "selectedCategories=" + encodeURIComponent(JSON.stringify(selectedCategories)) + "; path=/; max-age=31536000"; // 1 year expiration

                        // Close modal after saving
                        closeConfig();
                    });

                };

                // Close config modal
                window.closeConfig = function() {
                    var modal = document.querySelector(".cookie-config-modal");
                    if (modal) {
                        modal.remove();
                    }
                };
                
            })();
        `;
  
        // Return JavaScript response
        res.setHeader("Content-Type", "application/javascript");
        res.send(scriptContent);
    } catch (error) {
        console.error("Error generating script:", error);
        res.status(500).send("Internal Server Error");
    }
  };
  


// Export the controller functions
export { getFullBannerTemplateById, generateConsentScript, registerAndStoreConsent };
