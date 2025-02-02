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
            
            renderUsersTable(usersData.user);
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
                <td>${user.phonenumber || "-"}</td>
                <td>${user.email || "-"}</td>
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
                            <ion-icon name="create"></ion-icon>
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
        console.log("Delete user:", id);
        // Implement delete logic here
    }

    fetchUsers();
});
