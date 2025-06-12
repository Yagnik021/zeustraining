// const data = [
//   {
//     title: "Acceleration",
//     subject: "Physics",
//     grade: "Grade 7",
//     boost: "+2",
//     units: 4,
//     lessons: 18,
//     topics: 24,
//     classOptions: [
//       "Mr. Frank's Class B",
//       "Mr. Frank's Class A",
//       "Mr. Frank's Class C",
//     ],
//     selectedClass: "Mr. Frank's Class B",
//     students: 50,
//     dateRange: "21-Aug-2020 - 21-Aug-2020",
//     image: "images/imageMask.png",
//     favouriteIcon: "icons/favourite.svg",
//     isExpired: false,
//     previweAllowed: true,
//     courceManagementAllowed: true,
//     gradeSubmissionsAllowed: true,
//     reportsAllowed: true,
//   },
//   {
//     title: "Displacement, Velocity and Speed",
//     subject: "Physics",
//     grade: "Grade 6",
//     boost: "+3",
//     units: 2,
//     lessons: 15,
//     topics: 20,
//     classOptions: ["Math", "Science"],
//     selectedClass: null, // "No classes" was selected
//     students: null,
//     dateRange: null,
//     image: "images/imageMask-1.png",
//     favouriteIcon: "icons/favourite.svg",
//     isExpired: false,
//     previweAllowed: true,
//     courceManagementAllowed: false,
//     gradeSubmissionsAllowed: false,
//     reportsAllowed: true,
//   },
//   {
//     title:
//       "Introduction to Biology: Micro organisms and how they affect the other Life Systems in En...",
//     subject: "Biology",
//     grade: "Grade 4",
//     boost: "+1",
//     units: 5,
//     lessons: 16,
//     topics: 22,
//     classOptions: [
//       "All Classes",
//       "Mr. Frank's Class B",
//       "Mr. Frank's Class A",
//       "Mr. Frank's Class C",
//     ],
//     selectedClass: "All Classes",
//     students: 300,
//     dateRange: null,
//     image: "images/imageMask-3.png",
//     favouriteIcon: "icons/favourite.svg",
//     isExpired: false,
//     previweAllowed: true,
//     courceManagementAllowed: false,
//     gradeSubmissionsAllowed: false,
//     reportsAllowed: true,
//   },
//   {
//     title: "Introduction to High School Mathematics",
//     subject: "Mathematics",
//     grade: "Grade 8",
//     boost: "+5",
//     units: null,
//     lessons: null,
//     topics: null,
//     classOptions: [
//       "Mr. Frank's Class B",
//       "Mr. Frank's Class A",
//       "Mr. Frank's Class C",
//     ],
//     selectedClass: "Mr. Frank's Class B",
//     students: 44,
//     dateRange: "14-Oct-2019 - 20-Oct-2020",
//     image: "images/imageMask-2.png",
//     favouriteIcon: "icons/favourite_2.svg",
//     isExpired: true,
//     previweAllowed: true,
//     courceManagementAllowed: true,
//     gradeSubmissionsAllowed: true,
//     reportsAllowed: true
//   },
// ];

// fetch("navbar.html")
//   .then((response) => response.text())
//   .then((data) => {
//     document.getElementById("navbar-placeholder").innerHTML = data;
//   });

// function setActiveNavLink() {
//   const navLinks = document.querySelectorAll(".navbar_link");

//   navLinks.forEach((link) => {
//     link.addEventListener("click", function (e) {
//       navLinks.forEach((navLink) => {
//         navLink.classList.remove("active");
//       });

//       this.classList.add("active");
//     });
//   });
// }

// function setActiveController() {
//   const controller = document.querySelectorAll(".content_option");

//   controller.forEach((link) => {
//     link.addEventListener("click", function (e) {
//       controller.forEach((navLink) => {
//         navLink.classList.remove("option_active");
//       });

//       this.classList.add("option_active");
//     });
//   });
// }

// const markup = `
//   ${data
//     .map((card) => {
//       const optionsMarkup =
//         card.classOptions && card.classOptions.length > 0
//           ? card.classOptions
//             .map(
//               (cls) =>
//                 `<option value="${cls}" ${cls === card.selectedClass ? "selected" : ""
//                 }>${cls}</option>`
//             )
//             .join("")
//           : `<option value="" disabled selected>No classes</option>`;

//       const selectMarkup =
//         !card.selectedClass && card.classOptions && card.classOptions.length > 0
//           ? `<option value="" disabled selected>No classes</option>` +
//           optionsMarkup
//           : optionsMarkup;
//             console.log("card", data.previweAllowed);
            
//       return `
//       <div class="content_card rel">
//             <div class="content_card_details">
//               <img
//                 class="content_img"
//                 src=${card.image}
//                 alt="image1"
//               />
//               <div class="content_card_details_left">
//                 <div class="card_title">
//                   <p>${card.title}</p>
//                   <img src=${card.favouriteIcon} alt="favourite" />
//                 </div>
//                 <div class="card_text">
//                   ${card.subject}
//                   <div class="devider"></div>
//                   Grade ${card.grade}
//                   <span class="card_text_green">${card.boost != null ? `${card.boost}` : ""}</span>
//                 </div>
//                 <div class="card_text">
//                     ${card.units != null
//           ? `<span><b style="color: black">` +
//           card.units +
//           `</b> Units</span>`
//           : ""
//         }
//                   ${card.lessons != null
//           ? `<span><b style="color: black">` +
//           card.lessons +
//           `</b> Lessons</span>`
//           : ""
//         }
//                   ${card.topics != null
//           ? `<span><b style="color: black">` +
//           card.topics +
//           `</b> Topics</span>`
//           : ""
//         }
//                   </div>
//                 <div class="card_select_div">
//                   <select class="card_select" name="classes" id="classes">
//                    ${selectMarkup}
//                  </select>
//                 </div>
//                 ${card?.students != null
//           ? `<div class="card_text">
//                           ${card.students} students ${card.dateRange != null
//             ? `<span class="devider"></span>` + card.dateRange
//             : ""
//           }
//                 </div>`
//           : ""
//         }
//               </div>
//               ${card.isExpired ? `<div class="card_label">EXPIRED</div>` : ""}
//             </div>
//             <div class="content_card_actions">
//               <img src=${card.previweAllowed ? "icons/preview.svg" : "icons/preview2.svg"} alt="preview" />
//               <img src=${card.courceManagementAllowed ? "icons/manageCourse.svg" : "icons/manageCourse2.svg"} alt="manage" />
//               <img src=${card.gradeSubmissionsAllowed ? "icons/gradeSubmissions.svg" : "icons/gradeSubmissions2.svg "} alt="icons/grade submissions"/>
//               <img src=${card.reportsAllowed ? "icons/reports.svg" : "icons/reports2.svg"} alt="manage" />
//             </div>
//           </div>
//       `;
//     })
//     .join("")}
// `;

// document.getElementById("content-placeholder").innerHTML = markup;

// const button = document.getElementById("navbarToggle");
// const div = document.getElementById("navbarMob");

// let hideTimeout;
// function showMenu() {
//   if (hideTimeout !== null) {
//     clearTimeout(hideTimeout);
//   }
//   div.style.display = "block";
//   div.style.opacity = "0";
//   div.offsetHeight;
//   div.style.opacity = "1";
// }

// function hideMenu() {
//   hideTimeout = setTimeout(function () {
//     div.style.display = "none";
//   }, 300);
// }

// button.addEventListener("mouseenter", showMenu);
// button.addEventListener("mouseleave", hideMenu);

// div.addEventListener("mouseenter", showMenu);
// div.addEventListener("mouseleave", hideMenu);

// const alert_list = document.getElementById("alerts");
// const alert_icon = document.getElementById("alerts_icon");
// const alert_count = document.getElementById("alerts_count");

// let hideAlertTimeout;

// function showAlertList() {

//   if (hideAlertTimeout !== undefined) {
//     clearTimeout(hideAlertTimeout);
//   }

//   announcement_list.style.display = "none";
//   announcement_icon.src = "icons/announcements.svg";
//   announcement_count.style.display = "flex";
//   alert_list.style.display = "flex";
//   alert_icon.src = "icons/alerts 2.svg";
//   alert_count.style.display = "none";
  
//   alert_list.style.opacity = "0";
//   alert_list.offsetHeight;
//   alert_list.style.opacity = "1";
// }

// function hideAlertList() {
//   hideAlertTimeout = setTimeout(function () {
//     alert_list.style.display = "none";
//     alert_icon.src = "icons/alerts.svg";
//     alert_count.style.display = "flex";
//   }, 300);
// }

// alert_icon.addEventListener("mouseenter", showAlertList);
// alert_icon.addEventListener("mouseleave", hideAlertList);

// alert_list.addEventListener("mouseenter", showAlertList);
// alert_list.addEventListener("mouseleave", hideAlertList);

// const announcement_list = document.getElementById("announcements");
// const announcement_icon = document.getElementById("announcements_icon");
// const announcement_count = document.getElementById("announcements_count");


// let hideAnnouncementTimeout;
// function showAnnouncementList() {
//   if (hideAnnouncementTimeout !== undefined) {
//     clearTimeout(hideAnnouncementTimeout);
//   }

//   alert_list.style.display = "none";
//   alert_icon.src = "icons/alerts.svg";
//   alert_count.style.display = "flex";
//   announcement_list.style.display = "flex";
//   announcement_icon.src = "icons/announcements 2.svg";
//   announcement_count.style.display = "none";
    
//   announcement_list.style.opacity = "0";
//   announcement_list.offsetHeight;
//   announcement_list.style.opacity = "1";
// }

// function hideAnnouncementList() {
//   hideAnnouncementTimeout = setTimeout(function () {
//     announcement_list.style.display = "none";
//     announcement_icon.src = "icons/announcements.svg";
//     announcement_count.style.display = "flex";
//   }, 300);
// }

// announcement_icon.addEventListener("mouseenter", showAnnouncementList);
// announcement_icon.addEventListener("mouseleave", hideAnnouncementList);

// announcement_list.addEventListener("mouseenter", showAnnouncementList);
// announcement_list.addEventListener("mouseleave", hideAnnouncementList);


// const navbarLinkHeads = document.querySelectorAll('.navbar_link_head');

// navbarLinkHeads.forEach(function (linkHead) {
//   linkHead.addEventListener('click', function (e) {
//     const clickedOnArrow = e.target.tagName === 'IMG';
//     const clickedOnLink = e.target.tagName === 'A';

//     if (clickedOnLink && !clickedOnArrow) {
//       return; // Let the link work normally
//     }

//     e.preventDefault();

//     const currentNavbarLink = linkHead.closest('.navbar_link');
//     const currentBody = currentNavbarLink.querySelector('.navbar_link_body');

//     if (!currentBody) {
//       return;
//     }

//     // Close all other navbar_link_body elements
//     const allNavbarLinks = document.querySelectorAll('.navbar_link');
//     allNavbarLinks.forEach(function (navbarLink) {
//       const body = navbarLink.querySelector('.navbar_link_body');
//       const arrow = navbarLink.querySelector('img[alt="arrow"]');

//       if (body && navbarLink !== currentNavbarLink) {
//         body.style.display = 'none';
//         navbarLink.style.backgroundColor = 'white';
//         if (arrow) {
//           arrow.style.transform = 'rotate(0deg)';
//         }
//       }
//     });

//     const currentArrow = currentNavbarLink.querySelector('img[alt="arrow"]');

//     if (currentBody.style.display === 'flex') {
//       // Close current body
//       currentBody.style.display = 'none';
//       if (currentArrow) {
//         currentArrow.style.transform = 'rotate(0deg)';
//       }
//       currentNavbarLink.style.backgroundColor = 'white';
//     } else {
//       // Open current body
//       currentBody.style.display = 'flex';
//       if (currentArrow) {
//         currentArrow.style.transform = 'rotate(180deg)';
//       }
//       currentNavbarLink.style.backgroundColor = '#EEEEEE';
//     }
//   });
// });

// document.addEventListener('DOMContentLoaded', function () {
//   const allBodies = document.querySelectorAll('.navbar_link_body');
//   allBodies.forEach(function (body) {
//     body.style.display = 'none';
//   });
// });

// document.addEventListener("DOMContentLoaded", setActiveNavLink);
// document.addEventListener("DOMContentLoaded", setActiveController);
