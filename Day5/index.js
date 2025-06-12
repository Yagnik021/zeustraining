const data = [
  {
    title: "Acceleration",
    subject: "Physics",
    grade: "Grade 7",
    boost: "+2",
    units: 4,
    lessons: 18,
    topics: 24,
    classOptions: [
      "Mr. Frank's Class B",
      "Mr. Frank's Class A",
      "Mr. Frank's Class C"
    ],
    selectedClass: "Mr. Frank's Class B",
    students: 50,
    dateRange: "21-Aug-2020 - 21-Aug-2020",
    image: "images/imageMask.png",
    favouriteIcon: "icons/favourite.svg",
    isExpired: false
  },
  {
    title: "Displacement, Velocity and Speed",
    subject: "Physics",
    grade: "Grade 6",
    boost: "+3",
    units: 2,
    lessons: 15,
    topics: 20,
    classOptions: [
      "Math",
      "Science"
    ],
    selectedClass: null, // "No classes" was selected
    students: null,
    dateRange: null,
    image: "images/imageMask-1.png",
    favouriteIcon: "icons/favourite.svg",
    isExpired: false
  },
  {
    title: "Introduction to Biology: Micro organisms and how they affect the other Life Systems in En...",
    subject: "Biology",
    grade: "Grade 4",
    boost: "+1",
    units: 5,
    lessons: 16,
    topics: 22,
    classOptions: [
      "All Classes",
      "Mr. Frank's Class B",
      "Mr. Frank's Class A",
      "Mr. Frank's Class C"
    ],
    selectedClass: "All Classes",
    students: 300,
    dateRange: null,
    image: "images/imageMask-3.png",
    favouriteIcon: "icons/favourite.svg",
    isExpired: false
  },
  {
    title: "Introduction to High School Mathematics",
    subject: "Mathematics",
    grade: "Grade 8",
    boost: "+5",
    units: null,
    lessons: null,
    topics: null,
    classOptions: [
      "Mr. Frank's Class B",
      "Mr. Frank's Class A",
      "Mr. Frank's Class C"
    ],
    selectedClass: "Mr. Frank's Class B",
    students: 44,
    dateRange: "14-Oct-2019 - 20-Oct-2020",
    image: "images/imageMask-2.png",
    favouriteIcon: "icons/favourite_2.svg",
    isExpired: true
  }
];

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
