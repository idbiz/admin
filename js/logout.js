document.addEventListener("DOMContentLoaded", function () {
    const logoutButton = document.getElementById("logout");

    async function logout() {
        try {
            // Ambil token dari cookie
            const tokenMatch = document.cookie.match(/(^| )login=([^;]+)/);
            const token = tokenMatch ? tokenMatch[2] : null;

            if (!token) {
                console.error("No login token found! Redirecting to login...");
                window.location.href = "https://id.biz.id/";
                return;
            }

            const response = await fetch("https://asia-southeast2-awangga.cloudfunctions.net/idbiz/auth/logout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "login": token // Sertakan token login
                },
                credentials: "include"
            });

            if (!response.ok) {
                throw new Error("Logout failed");
            }

            // Hapus cookie login
            document.cookie = "login=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

            // Hapus data dari localStorage/sessionStorage (jika ada)
            localStorage.removeItem("login");
            sessionStorage.removeItem("login");

            // Redirect ke halaman login
            window.location.href = "https://id.biz.id/";
        } catch (error) {
            console.error("Error logging out:", error);
            alert("Failed to logout. Please try again.");
        }
    }

    logoutButton.addEventListener("click", function (event) {
        event.preventDefault();
        logout();
    });
});
