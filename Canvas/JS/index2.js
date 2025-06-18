const selected = document.querySelector(".selected");
const dropdownList = document.querySelector(".dropdown-list");
const items = document.querySelectorAll(".dropdown-item");
const form = document.getElementById("myForm");
const errorMsg = document.getElementById("error");

let selectedValue = "";

selected.addEventListener("click", () => {
  dropdownList.style.display =
    dropdownList.style.display === "block" ? "none" : "block";
});

items.forEach(item => {
  item.addEventListener("click", () => {
    selected.textContent = item.textContent;
    selectedValue = item.textContent;
    dropdownList.style.display = "none";
    selected.classList.remove("error");
    errorMsg.style.display = "none";
  });
});

document.addEventListener("click", (e) => {
  if (!e.target.closest(".custom-dropdown")) {
    dropdownList.style.display = "none";
  }
});

// Form validation on submit
form.addEventListener("submit", (e) => {
  if (!selectedValue) {
    e.preventDefault();
    selected.classList.add("error");
    errorMsg.style.display = "block";
  }
});
