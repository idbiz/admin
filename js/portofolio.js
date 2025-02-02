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
                <td class="action-buttons">
                    <button class="edit-btn" onclick="editPortfolio('${portfolio._id}')">
                        <span class="icon">
                            <ion-icon name="create"></ion-icon>
                        </span>
                    </button>
                    <button class="delete-btn" onclick="deletePortfolio('${portfolio._id}')">
                        <span class="icon">
                            <ion-icon name="trash"></ion-icon>
                        </span>
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    async function editPortfolio(id) {
        const token = getCookie("login"); // Ambil token dari cookie
        if (!token) {
            swal("Unauthorized", "Please log in first.", "error");
            return;
        }
    
        try {
            const response = await fetch(`https://asia-southeast2-awangga.cloudfunctions.net/idbiz/portofolio/?id=${id}`, {
                method: "GET",
                headers: {
                    "login": token,
                    "Accept": "application/json"
                }
            });
    
            if (!response.ok) throw new Error(`Failed to fetch portfolio data: ${response.status}`);
    
            const portfolio = await response.json();
    
            document.getElementById("nama_desain").value = portfolio.nama_desain;
            document.getElementById("deskripsi").value = portfolio.deskripsi;
            document.getElementById("gambar").value = portfolio.gambar;
            document.getElementById("kategori").value = portfolio.kategori;
            document.getElementById("harga").value = portfolio.harga;
            document.getElementById("portofolioModal").setAttribute("data-id", id);
    
            document.getElementById("portofolioModal").style.display = "flex";
        } catch (error) {
            console.error("Error fetching portfolio:", error);
            swal("Error", "Failed to fetch portfolio data", "error");
        }
    }
    

    async function deletePortfolio(id) {
        const token = getCookie("login"); // Ambil token dari cookie
        if (!token) {
            swal("Unauthorized", "Please log in first.", "error");
            return;
        }
    
        swal({
            title: "Are you sure?",
            text: "Once deleted, you will not be able to recover this portfolio!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        }).then(async (willDelete) => {
            if (willDelete) {
                try {
                    const response = await fetch(`https://asia-southeast2-awangga.cloudfunctions.net/idbiz/delete/portofolio?id=${id}`, {
                        method: "DELETE",
                        headers: {
                            "login": token,
                            "Accept": "application/json"
                        }
                    });
    
                    if (!response.ok) throw new Error(`Failed to delete portfolio: ${response.status}`);
    
                    swal("Deleted!", "Your portfolio has been deleted.", "success").then(() => {
                        fetchData();
                    });
                } catch (error) {
                    console.error("Error deleting portfolio:", error);
                    swal("Error", "Failed to delete portfolio", "error");
                }
            }
        });
    }    

    window.editPortfolio = editPortfolio;
    window.deletePortfolio = deletePortfolio;

    document.getElementById("addBtn").addEventListener("click", function() {
        document.getElementById("portofolioModal").style.display = "flex";
    });

    document.getElementById("closeModal").addEventListener("click", function() {
        document.getElementById("portofolioModal").style.display = "none";
    });

    document.getElementById("portofolioForm").addEventListener("submit", async function(event) {
        event.preventDefault();
        
        const token = getCookie("login");
        if (!token) {
            swal("Unauthorized", "Please log in first.", "error");
            return;
        }

        const id = document.getElementById("portofolioModal").getAttribute("data-id");
        const formData = {
            nama_desain: document.getElementById("nama_desain").value,
            deskripsi: document.getElementById("deskripsi").value,
            gambar: document.getElementById("gambar").value,
            kategori: document.getElementById("kategori").value,
            harga: document.getElementById("harga").value
        };

        const url = id ? 
            `https://asia-southeast2-awangga.cloudfunctions.net/idbiz/update/portofolio?id=${id}` : 
            "https://asia-southeast2-awangga.cloudfunctions.net/idbiz/insert/portofolio";

        try {
            const response = await fetch(url, {
                method: id ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                    "login": token
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error("Failed to save portfolio");

            swal("Success", `Portfolio ${id ? "updated" : "added"} successfully`, "success").then(() => {
                document.getElementById("portofolioModal").style.display = "none";
                fetchData();
            });
        } catch (error) {
            console.error("Error saving portfolio:", error);
            swal("Error", "Failed to save portfolio", "error");
        }
    });

    fetchData();
});
