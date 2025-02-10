async function fetchTransactions() {
    try {
        const response = await fetch("https://asia-southeast2-awangga.cloudfunctions.net/idbiz/data/transaksi");
        if (!response.ok) {
            throw new Error(`Failed to fetch transactions: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching transactions:", error);
        return [];
    }
}

async function fetchPortfolios() {
    try {
        const token = getCookie("login"); // Ambil token dari cookie
        if (!token) {
            throw new Error("User not logged in (Token missing)");
        }

        const response = await fetch("https://asia-southeast2-awangga.cloudfunctions.net/idbiz/portofolio", {
            headers: {
                "login": token, // Gunakan "login" sebagai header
                "Accept": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch portfolios: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching portfolios:", error);
        return [];
    }
}

// Fungsi untuk mengambil token dari cookie
function getCookie(name) {
    const cookies = document.cookie.split("; ");
    for (let cookie of cookies) {
        const [key, value] = cookie.split("=");
        if (key === name) return value;
    }
    return null;
}

// Fungsi untuk mengelompokkan pendapatan berdasarkan kategori desain
async function calculateEarningsByCategory() {
    const transactions = await fetchTransactions();
    const portfolios = await fetchPortfolios();

    if (transactions.length === 0 || portfolios.length === 0) {
        console.warn("No data available for transactions or portfolios.");
        return;
    }

    const categoryEarnings = {};

    transactions.forEach(transaction => {
        if (transaction.status_pesanan.toLowerCase() === "settlement") { // Hanya transaksi yang selesai
            const portfolio = portfolios.find(p => p.nama_desain === transaction.nama_desain);
            const category = portfolio ? portfolio.kategori : "Uncategorized";

            if (!categoryEarnings[category]) {
                categoryEarnings[category] = 0;
            }

            categoryEarnings[category] += parseInt(transaction.harga);
        }
    });

    displayEarningsByCategory(categoryEarnings);
}

// Fungsi untuk menampilkan pendapatan per kategori di dalam tabel
function displayEarningsByCategory(categoryEarnings) {
    const tableBody = document.querySelector(".reportCategory tbody");
    tableBody.innerHTML = ""; // Kosongkan tabel sebelum menambahkan data baru

    for (const [category, earnings] of Object.entries(categoryEarnings)) {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td colspan="2"><strong>${category}</strong></td>
            <td colspan="2"><strong>Rp ${earnings.toLocaleString("id-ID")}</strong></td>
        `;
        tableBody.appendChild(row);
    }
}

// Jalankan fungsi untuk menampilkan pendapatan berdasarkan kategori desain
calculateEarningsByCategory();
