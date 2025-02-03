document.addEventListener("DOMContentLoaded", async function () {
    const tableBody = document.querySelector(".recentOrders tbody");
    const dateHeader = document.querySelector(".recentOrders thead td:first-child");
    const searchInput = document.getElementById("searchInput");
    
    let sortAscending = false;
    let transactionsData = [];
    let usersData = [];
    let filteredTransactions = [];

    async function fetchData() {
        try {
            const transactionsResponse = await fetch("https://asia-southeast2-awangga.cloudfunctions.net/idbiz/data/transaksi");
            if (!transactionsResponse.ok) {
                throw new Error("Failed to fetch transactions");
            }
            transactionsData = await transactionsResponse.json();

            const usersResponse = await fetch("https://asia-southeast2-awangga.cloudfunctions.net/idbiz/auth/users/all");
            if (!usersResponse.ok) {
                throw new Error("Failed to fetch users");
            }
            const usersJson = await usersResponse.json();
            usersData = usersJson.user || []; // Pastikan mendapatkan array user

            // Default sort by newest date
            sortTransactions();
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }

    function getUserEmail(namaPemesan) {
        const user = usersData.find(user => user.name.toLowerCase() === namaPemesan.toLowerCase());
        return user ? user.email : null;
    }

    function sortTransactions() {
        transactionsData.sort((a, b) => {
            return sortAscending 
                ? new Date(a.tanggal_pesanan) - new Date(b.tanggal_pesanan) 
                : new Date(b.tanggal_pesanan) - new Date(a.tanggal_pesanan);
        });
        renderTable(transactionsData);
        updateSortIcon();
    }

    function renderTable(transactions) {
        tableBody.innerHTML = "";
        transactions.forEach(transaction => {
            const formattedDate = new Date(transaction.tanggal_pesanan).toLocaleDateString("id-ID", {
                day: "2-digit", month: "long", year: "numeric"
            });
            
            const email = getUserEmail(transaction.nama_pemesan);
            const mailtoLink = email ? `mailto:${email}` : "#";
            const alertOnClick = email ? "" : "onclick=\"alert('Email not found!')\"";
            
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${formattedDate}</td>
                <td><a href="${mailtoLink}" ${alertOnClick}>${transaction.nama_pemesan}</a></td>
                <td>${transaction.nama_desain}</td>
                <td>Rp ${parseInt(transaction.harga).toLocaleString()}</td>
                <td>${transaction.catatan_pesanan}</td>
                <td><a href="${transaction.bukti_pembayaran}" target="_blank">See Receipt</a></td>
                <td>
                    <select class="status-dropdown" data-id="${transaction._id}">
                        <option value="pending" ${transaction.status_pesanan === "pending" ? "selected" : ""}>Pending</option>
                        <option value="done" ${transaction.status_pesanan === "done" ? "selected" : ""}>Done</option>
                        <option value="return" ${transaction.status_pesanan === "return" ? "selected" : ""}>Return</option>
                    </select>
                </td>
                <td><button class="edit-status" onclick="editTransaction('${transaction._id}')"> Save
                </button></td>
            `;
            tableBody.appendChild(row);
        });

        document.querySelectorAll(".status-dropdown").forEach(dropdown => {
            dropdown.addEventListener("change", function () {
                const transactionId = this.getAttribute("data-id");
                editTransaction(transactionId, this.value);
            });
        });
    }

    function updateSortIcon() {
        dateHeader.innerHTML = `Date <ion-icon name="${sortAscending ? 'caret-down-circle-outline' : 'caret-up-circle-outline'}"></ion-icon>`;
    }

    
    // Fungsi pencarian
    function searchTransactions() {
        const searchText = searchInput.value.trim().toLowerCase();

        filteredTransactions = transactionsData.filter(transaction => {
            const formattedDate = new Date(transaction.tanggal_pesanan).toLocaleDateString("id-ID", {
                day: "2-digit", month: "long", year: "numeric"
            }).toLowerCase();

            return (
                transaction.nama_pemesan.toLowerCase().includes(searchText) || 
                transaction.nama_desain.toLowerCase().includes(searchText) ||
                formattedDate.includes(searchText)
            );
        });
        renderTable(filteredTransactions);
    }

    async function editTransaction(id, newStatus) {
        const token = document.cookie.match(/(^| )login=([^;]+)/)?.[2];
        if (!token) {
            Swal.fire("Unauthorized", "Please log in first.", "error");
            return;
        }
    
        // Cari transaksi berdasarkan ID
        const transaction = transactionsData.find(trx => trx._id === id);
        if (!transaction) {
            Swal.fire("Error", "Transaction not found", "error");
            return;
        }
    
        // Siapkan data yang akan dikirim ke API
        const payload = {
            user_id: transaction.user_id || "", // Pastikan ada user_id
            nama_pemesan: transaction.nama_pemesan,
            desain_id: transaction.desain_id || "", // Pastikan ada desain_id
            nama_desain: transaction.nama_desain,
            harga: transaction.harga,
            status_pesanan: newStatus, // Status yang dipilih
            catatan_pesanan: transaction.catatan_pesanan,
            bukti_pembayaran: transaction.bukti_pembayaran,
            tanggal_pesanan: transaction.tanggal_pesanan
        };
    
        try {
            const response = await fetch(`https://asia-southeast2-awangga.cloudfunctions.net/idbiz/update/transaksi?id=${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "login": token
                },
                body: JSON.stringify(payload)
            });
    
            const result = await response.json();
    
            if (!response.ok) {
                console.error("API Error Response:", result);
                throw new Error(result.message || "Failed to update transaction");
            }
    
            Swal.fire("Success", "Transaction status updated successfully", "success").then(() => {
                fetchData();
            });
    
        } catch (error) {
            console.error("Error updating transaction:", error);
            Swal.fire("Error", error.message || "Failed to update transaction", "error");
        }
    }

    // Event listener untuk pencarian
    searchInput.addEventListener("input", searchTransactions);

    dateHeader.addEventListener("click", function () {
        sortAscending = !sortAscending;
        sortTransactions();
    });

    fetchData();

    // Pastikan fungsi editTransaction tersedia secara global
    window.editTransaction = editTransaction;
});
