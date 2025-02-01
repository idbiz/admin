document.addEventListener("DOMContentLoaded", async function () {
    const tableBody = document.querySelector(".recentOrders tbody");

    function getCookie(name) {
        let match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return match ? match[2] : null;
    }

    async function fetchData() {
        try {
            const token = getCookie("login");
            if (!token) {
                throw new Error("No login token found in cookies");
            }
            
            const response = await fetch("https://asia-southeast2-awangga.cloudfunctions.net/idbiz/portofolio", {
                method: "GET",
                headers: {
                    "login": token,
                    "Accept": "application/json"
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch data: ${response.status}`);
            }

            const data = await response.json();
            renderTable(data);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }

    function renderTable(portfolios) {
        tableBody.innerHTML = ""; // Clear existing table data
        portfolios.forEach(portfolio => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${portfolio.nama_desain}</td>
                <td>Rp ${parseInt(portfolio.harga).toLocaleString()}</td>
                <td>${portfolio.deskripsi}</td>
                <td>${portfolio.kategori}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    fetchData();
});
