document.addEventListener("DOMContentLoaded", async function () {
    const tableBody = document.querySelector(".recentOrders tbody");
    const modal = document.getElementById("portofolioModal");
    const modalTitle = document.querySelector("#portofolioModal h2");
    const form = document.getElementById("portofolioForm");

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
        tableBody.innerHTML = "";
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
        const token = getCookie("login");
        if (!token) {
            Swal.fire("Unauthorized", "Please log in first.", "error");
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
    
            form.reset();
            document.getElementById("nama_desain").value = portfolio.nama_desain;
            document.getElementById("deskripsi").value = portfolio.deskripsi;
            document.getElementById("gambar").value = portfolio.gambar;
            document.getElementById("kategori").value = portfolio.kategori;
            document.getElementById("harga").value = portfolio.harga;
            modal.setAttribute("data-id", id);
            modalTitle.innerText = "Edit Portofolio";
            modal.style.display = "flex";
        } catch (error) {
            console.error("Error fetching portfolio:", error);
            Swal.fire("Error", "Failed to fetch portfolio data", "error");
        }
    }

    async function savePortfolio(event) {
        event.preventDefault();
        const token = getCookie("login");
        if (!token) {
            Swal.fire("Unauthorized", "Please log in first.", "error");
            return;
        }

        const id = modal.getAttribute("data-id");
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

            Swal.fire("Success", `Portfolio ${id ? "updated" : "added"} successfully`, "success").then(() => {
                modal.style.display = "none";
                fetchData();
            });
        } catch (error) {
            console.error("Error saving portfolio:", error);
            Swal.fire("Error", "Failed to save portfolio", "error");
        }
    }

    async function deletePortfolio(id) {
        const token = getCookie("login");
        if (!token) {
            Swal.fire("Unauthorized", "Please log in first.", "error");
            return;
        }
    
        Swal.fire({
            title: "Are you sure?",
            text: "Once deleted, you will not be able to recover this portfolio!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "Cancel"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await fetch(`https://asia-southeast2-awangga.cloudfunctions.net/idbiz/delete/portofolio?id=${id}`, {
                        method: "DELETE",
                        headers: {
                            "login": token,
                            "Accept": "application/json"
                        }
                    });
    
                    if (!response.ok) throw new Error(`Failed to delete portfolio: ${response.status}`);
    
                    Swal.fire("Deleted!", "Your portfolio has been deleted.", "success").then(() => {
                        fetchData();
                    });
                } catch (error) {
                    console.error("Error deleting portfolio:", error);
                    Swal.fire("Error", "Failed to delete portfolio", "error");
                }
            }
        });
    }

    document.getElementById("portofolioForm").addEventListener("submit", savePortfolio);

    document.getElementById("addBtn").addEventListener("click", function() {
        form.reset();
        modal.removeAttribute("data-id");
        modalTitle.innerText = "Add New Portofolio";
        modal.style.display = "flex";
    });

    document.getElementById("closeModal").addEventListener("click", function() {
        modal.style.display = "none";
    });

    window.editPortfolio = editPortfolio;
    window.deletePortfolio = deletePortfolio;
    fetchData();
});
