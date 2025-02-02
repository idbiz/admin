document.addEventListener("DOMContentLoaded", async function () {
    const tableBody = document.querySelector(".recentOrders tbody");
    const dateHeader = document.querySelector(".recentOrders thead td:first-child");
    let sortAscending = false;
    let transactionsData = [];

    async function fetchData() {
        try {
            const response = await fetch("https://asia-southeast2-awangga.cloudfunctions.net/idbiz/data/transaksi");
            if (!response.ok) {
                throw new Error("Failed to fetch data");
            }
            transactionsData = await response.json();
            
            // Default sort by newest date
            sortTransactions();
        } catch (error) {
            console.error("Error fetching data:", error);
        }
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
            
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${formattedDate}</td>
                <td>${transaction.nama_pemesan}</td>
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
