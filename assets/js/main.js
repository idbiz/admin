// add hovered class to selected list item
let list = document.querySelectorAll(".navigation li");

function activeLink() {
  list.forEach((item) => {
    item.classList.remove("hovered");
  });
  this.classList.add("hovered");
}

list.forEach((item) => item.addEventListener("mouseover", activeLink));

// Menu Toggle
let toggle = document.querySelector(".toggle");
let navigation = document.querySelector(".navigation");
let main = document.querySelector(".main");

toggle.onclick = function () {
  navigation.classList.toggle("active");
  main.classList.toggle("active");
};

// Cek apakah user sudah login, jika belum tampilkan peringatan dan redirect
let token = document.cookie.match(/(^| )login=([^;]+)/)?.[2];

if (!token) {
    Swal.fire({
        title: "Unauthorized",
        text: "You need to log in first!",
        icon: "warning",
        confirmButtonText: "OK"
    }).then(() => {
        window.location.href = "index.html";
    });
}
