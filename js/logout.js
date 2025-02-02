document.addEventListener("DOMContentLoaded", function () {
    const logoutButton = document.getElementById("logout");

    async function logout() {
        try {
            const response = await fetch("https://asia-southeast2-awangga.cloudfunctions.net/idbiz/auth/logout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include" // Ensures cookies are sent with the request
            });

            if (!response.ok) {
                throw new Error("Logout failed");
            }
            
            // Clear login cookie
            document.cookie = "login=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            
            // Redirect to login page
            window.location.href = "https://id.biz.id/";
        } catch (error) {
            console.error("Error logging out:", error);
        }
    }

    logoutButton.addEventListener("click", function (event) {
        event.preventDefault();
        logout();
    });
});
