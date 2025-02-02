document.addEventListener("DOMContentLoaded", async function () {
    const userTableBody = document.getElementById("usersTable");

    if (!userTableBody) {
        console.error("Error: User table body element not found!");
        return;
    }

    async function fetchUsers() {
        try {
            const response = await fetch("https://asia-southeast2-awangga.cloudfunctions.net/idbiz/auth/users/all");
            if (!response.ok) {
                throw new Error("Failed to fetch users");
            }
            const usersData = await response.json();
            
            if (!usersData.user || !Array.isArray(usersData.user)) {
                throw new Error("Invalid data format: Expected an array under 'user'");
            }
            
            renderUsersTable(usersData.user.sort((a, b) => a.name.localeCompare(b.name)));
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    }

    function renderUsersTable(users) {
        userTableBody.innerHTML = "";
        users.forEach(user => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${user.name || "-"}</td>
                <td><a href="https://wa.me/${user.phonenumber}" target="_blank">${user.phonenumber || "-"}</a></td>
                <td><a href="mailto:${user.email}" target="_blank">${user.email || "-"}</a></td>
                <td>${user.role || "-"}</td>
                <td>********</td>
                <td class="action-buttons">
                    <button class="edit-btn" onclick="editUser('${user._id || ""}')">
                        <span class="icon">
                            <ion-icon name="create"></ion-icon>
                        </span>
                    </button>
                    <button class="delete-btn" onclick="deleteUser('${user._id || ""}')">
                        <span class="icon">
                            <ion-icon name="trash"></ion-icon>
                        </span>
                    </button>
                </td>
            `;
            userTableBody.appendChild(row);
        });
    }

    async function editUser(id) {
        console.log("Edit user:", id);
        // Implement edit logic here
    }

    async function deleteUser(id) {
        const token = document.cookie.match(/(^| )login=([^;]+)/)?.[2];
        if (!token) {
            Swal.fire("Unauthorized", "Please log in first.", "error");
            return;
        }

        Swal.fire({
            title: "Are you sure?",
            text: "This action cannot be undone!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "Cancel"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await fetch(`https://asia-southeast2-awangga.cloudfunctions.net/idbiz/delete/user?id=${id}`, {
                        method: "DELETE",
                        headers: {
                            "Content-Type": "application/json",
                            "login": token
                        }
                    });

                    if (!response.ok) throw new Error("Failed to delete user");

                    Swal.fire("Deleted!", "The user has been deleted.", "success").then(() => {
                        fetchUsers();
                    });
                } catch (error) {
                    console.error("Error deleting user:", error);
                    Swal.fire("Error", "Failed to delete user", "error");
                }
            }
        });
    }

    fetchUsers();

    window.deleteUser = deleteUser;
});
