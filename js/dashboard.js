document.addEventListener("DOMContentLoaded", async function () {
    const tableBody = document.querySelector(".recentOrders tbody");
    const dateHeader = document.querySelector(".recentOrders thead td:first-child");
    const searchInput = document.getElementById("searchInput");

    const ordersCard = document.querySelector(".cardBox .card:nth-child(1) .numbers");
    const pendingCard = document.querySelector(".cardBox .card:nth-child(2) .numbers");
    const soldCard = document.querySelector(".cardBox .card:nth-child(3) .numbers");
    const returnCard = document.querySelector(".cardBox .card:nth-child(4) .numbers");
    const earningsCard = document.querySelector(".cardBox .card:nth-child(5) .numbers");

    let sortAscending = false;
    let transactionsData = [];
    let filteredTransactions = [];

    async function fetchData() {
        try {
            const response = await fetch("https://asia-southeast2-awangga.cloudfunctions.net/idbiz/data/transaksi");
            if (!response.ok) {
                throw new Error("Failed to fetch data");
            }
            transactionsData = await response.json();

            // Default sort by newest date
            sortTransactions();
            updateCards();
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

        filteredTransactions = [...transactionsData]; // Simpan data terfilter
        renderTable(filteredTransactions);
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

    // 🔍 Fungsi pencarian
    function searchTransactions() {
        const searchText = searchInput.value.trim().toLowerCase();
        filteredTransactions = transactionsData.filter(transaction => 
            transaction.nama_pemesan.toLowerCase().includes(searchText) || 
            transaction.nama_desain.toLowerCase().includes(searchText)
        );
        renderTable(filteredTransactions);
    }

    // 🔹 Fungsi untuk format angka Earnings ke dalam ribuan, jutaan, dst.
    function formatCurrency(value) {
        if (value >= 10000000) return (value / 1000000).toFixed(0) + "jt";
        if (value >= 1000000) return (value / 1000000).toFixed(1) + "jt";
        if (value >= 100000) return (value / 1000).toFixed(0) + "rb";
        return value.toLocaleString(); // Default format angka biasa
    }

    // 🔹 Fungsi untuk update data cards
    function updateCards() {
        const totalOrders = transactionsData.length;
        const totalPending = transactionsData.filter(t => t.status_pesanan.toLowerCase() === "pending").length;
        const totalSold = transactionsData.filter(t => t.status_pesanan.toLowerCase() === "done").length;
        const totalReturn = transactionsData.filter(t => t.status_pesanan.toLowerCase() === "return").length;

        // Perbaikan Total Earnings
        const totalEarnings = transactionsData
            .filter(t => t.status_pesanan.toLowerCase() !== "return") // Hanya yang bukan "return"
            .reduce((sum, t) => sum + parseInt(t.harga), 0); // Menjumlahkan harga

        ordersCard.textContent = totalOrders.toLocaleString();
        pendingCard.textContent = totalPending.toLocaleString();
        soldCard.textContent = totalSold.toLocaleString();
        returnCard.textContent = totalReturn.toLocaleString();
        earningsCard.textContent = `Rp ${formatCurrency(totalEarnings)}`;
    }

    // Event listener untuk pencarian
    searchInput.addEventListener("input", searchTransactions);

    // Klik header tanggal untuk sorting
    dateHeader.addEventListener("click", function () {
        sortAscending = !sortAscending;
        sortTransactions();
    });

    fetchData();
});
