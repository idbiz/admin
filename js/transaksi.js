document.addEventListener("DOMContentLoaded", async function () {
    const tableBody = document.querySelector(".recentOrders tbody");
    const dateHeader = document.querySelector(".recentOrders thead td:first-child");
    let sortAscending = false;
    let transactionsData = [];
    let usersData = [];

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
                <td><span class="status ${getStatusClass(transaction.status_pesanan)}">${transaction.status_pesanan}</span></td>
            `;
            tableBody.appendChild(row);
        });
    }

    function updateSortIcon() {
        dateHeader.innerHTML = `Date <ion-icon name="${sortAscending ? 'caret-down-circle-outline' : 'caret-up-circle-outline'}"></ion-icon>`;
    }

    function getStatusClass(status) {
        switch (status.toLowerCase()) {
            case "pending": return "pending";
            case "done": return "done";
            case "return": return "return";
            case "in progress": return "inProgress";
            default: return "unknown";
        }
    }

    dateHeader.addEventListener("click", function () {
        sortAscending = !sortAscending;
        sortTransactions();
    });

    fetchData();
});
