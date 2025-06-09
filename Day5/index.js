fetch("navbar.html")
  .then((response) => response.text())
  .then((data) => {
    document.getElementById("navbar-placeholder").innerHTML = data;
  });

function setActiveNavLink() {
  const navLinks = document.querySelectorAll(".navbar_link");

  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      navLinks.forEach((navLink) => {
        navLink.classList.remove("active");
      });

      this.classList.add("active");
    });
  });
}

document.addEventListener("DOMContentLoaded", setActiveNavLink);
