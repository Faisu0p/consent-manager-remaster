// export const getEmbedScript = (req, res) => {
//     const script = `
//         (function () {
//             document.addEventListener("DOMContentLoaded", function () {
//                 const privacyButton = document.getElementById("manageConsentBtn");

//                 if (!privacyButton) {
//                     console.warn("Privacy Settings button not found. Make sure the button has the correct ID.");
//                     return;
//                 }

//                 privacyButton.addEventListener("click", function () {
//                     function getCookie(name) {
//                         const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
//                         return match ? decodeURIComponent(match[2]) : null;
//                     }

//                     const userLoggedIn = getCookie("userLoggedIn");
//                     const userId = getCookie("userId");

//                     if (userLoggedIn === "true" && userId) {
//                         const popupUrl = "http://localhost:5173/my-consent?userId=" + encodeURIComponent(userId);

//                         // Calculate center position for better UI experience
//                         const width = 600, height = 700;
//                         const left = (window.screen.width - width) / 2;
//                         const top = (window.screen.height - height) / 2;
                        
//                         window.open(
//                             popupUrl,
//                             "ConsentManager",
//                             "width=" + width + ",height=" + height + ",top=" + top + ",left=" + left + ",noopener,noreferrer"
//                         );
//                     } else {
//                         alert("You are not logged in. Kindly log in to view privacy settings.");
//                     }
//                 });
//             });
//         })();
//     `;

//     res.setHeader("Content-Type", "application/javascript");
//     res.send(script);
// };




export const getEmbedScript = (req, res) => {
    const script = `
        (function () {
            const interval = setInterval(() => {
                const privacyButton = document.getElementById("manageConsentBtn");

                if (privacyButton) {
                    clearInterval(interval);

                    privacyButton.addEventListener("click", function () {
                        function getCookie(name) {
                            const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
                            return match ? decodeURIComponent(match[2]) : null;
                        }

                        const userLoggedIn = getCookie("userLoggedIn");
                        const userId = getCookie("userId");

                        if (userLoggedIn === "true" && userId) {
                            const popupUrl = "http://localhost:5173/my-consent?userId=" + encodeURIComponent(userId);

                            // Calculate center position for better UI experience
                            const width = 600, height = 700;
                            const left = (window.screen.width - width) / 2;
                            const top = (window.screen.height - height) / 2;

                            window.open(
                                popupUrl,
                                "ConsentManager",
                                "width=" + width + ",height=" + height + ",top=" + top + ",left=" + left + ",noopener,noreferrer"
                            );
                        } else {
                            alert("You are not logged in. Kindly log in to view privacy settings.");
                        }
                    });
                }
            }, 300);
        })();
    `;

    res.setHeader("Content-Type", "application/javascript");
    res.send(script);
};
