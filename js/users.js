document.addEventListener("DOMContentLoaded", async function () {
    const userTableBody = document.getElementById("usersTable");
    const modal = document.getElementById("editUserModal");
    const modalTitle = document.getElementById("modalTitle");
    const form = document.getElementById("editUserForm");
    const closeModalBtn = document.getElementById("closeModal");
    const searchInput = document.getElementById("searchInput");

    let users = [];

    if (!userTableBody || !modal || !form || !closeModalBtn) {
        console.error("Error: One or more elements not found in the DOM!");
        return;
    }

    closeModalBtn.addEventListener("click", function () {
        modal.style.display = "none";
    });

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
            
            users = usersData.user.sort((a, b) => a.name.localeCompare(b.name));
            renderUsersTable(usersData.user.sort((a, b) => a.name.localeCompare(b.name)));
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    }

    function renderUsersTable(userList) {
        userTableBody.innerHTML = "";
        userList.forEach(user => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${user.name || "-"}</td>
                <td><a href="https://wa.me/${user.phonenumber}" target="_blank">${user.phonenumber || "-"}</a></td>
                <td><a href="mailto:${user.email}" target="_blank">${user.email || "-"}</a></td>
                <td>${user.role || "-"}</td>
                <td>********</td>
                <td class="action-buttons">
                    <button class="edit-btn" onclick="editUser('${user._id || ""}', '${user.name}', '${user.phonenumber}', '${user.email}', '${user.role}')">
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

    function editUser(id, name, phonenumber, email, role) {
        modal.style.display = "flex";
        modalTitle.innerText = "Edit User";
        document.getElementById("editName").value = name;
        document.getElementById("editPhone").value = phonenumber;
        document.getElementById("editEmail").value = email;
        document.getElementById("editRole").value = role;
        document.getElementById("editPassword").value = "";  // Kosongkan field password
        form.setAttribute("data-user-id", id);
    }

    form.addEventListener("submit", async function (event) {
        event.preventDefault();
        const token = document.cookie.match(/(^| )login=([^;]+)/)?.[2];
        if (!token) {
            Swal.fire("Unauthorized", "Please log in first.", "error");
            return;
        }

        const userId = form.getAttribute("data-user-id");
        if (!userId) {
            Swal.fire("Error", "User ID not found", "error");
            return;
        }

        const updatedData = {
            name: document.getElementById("editName").value,
            phonenumber: document.getElementById("editPhone").value,
            email: document.getElementById("editEmail").value,
            role: document.getElementById("editRole").value
        };

        // Ambil password baru (jika ada)
        const newPassword = document.getElementById("editPassword").value;
        if (newPassword.trim()) {
            updatedData.password = newPassword;
        }

        try {
            const response = await fetch(`https://asia-southeast2-awangga.cloudfunctions.net/idbiz/update/user?id=${userId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "login": token
                },
                body: JSON.stringify(updatedData)
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || "Failed to update user");
            }

            Swal.fire("Success", "User updated successfully", "success").then(() => {
                modal.style.display = "none";
                fetchUsers();
            });
        } catch (error) {
            console.error("Error updating user:", error);
            Swal.fire("Error", error.message || "Failed to update user", "error");
        }
    });

    async function deleteUser(id) {
        const token = document.cookie.match(/(^| )login=([^;]+)/)?.[2];
        if (!token) {
            Swal.fire("Unauthorized", "Please log in first.", "error");
            return;
        }

        Swal.fire({
            title: "Are you sure?",
            text: "This action cannot be unsettlement!",
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

    function searchUser() {
        const searchText = searchInput.value.trim().toLowerCase();
        const filteredUsers = users.filter(user => 
            user.name.toLowerCase().includes(searchText) || 
            (user.phonenumber && user.phonenumber.toLowerCase().includes(searchText)) || 
            user.email.toLowerCase().includes(searchText)
        );
        renderUsersTable(filteredUsers);
    }

    searchInput.addEventListener("input", searchUser);

    fetchUsers();
    window.editUser = editUser;
    window.deleteUser = deleteUser;
});
