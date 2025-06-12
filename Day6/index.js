var data = [
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
            "Mr. Frank's Class C",
        ],
        selectedClass: "Mr. Frank's Class B",
        students: 50,
        dateRange: "21-Aug-2020 - 21-Aug-2020",
        image: "images/imageMask.png",
        favouriteIcon: "icons/favourite.svg",
        isExpired: false,
        previweAllowed: true,
        courceManagementAllowed: true,
        gradeSubmissionsAllowed: true,
        reportsAllowed: true,
    },
    {
        title: "Displacement, Velocity and Speed",
        subject: "Physics",
        grade: "Grade 6",
        boost: "+3",
        units: 2,
        lessons: 15,
        topics: 20,
        classOptions: ["Math", "Science"],
        selectedClass: null, // "No classes" was selected
        students: null,
        dateRange: null,
        image: "images/imageMask-1.png",
        favouriteIcon: "icons/favourite.svg",
        isExpired: false,
        previweAllowed: true,
        courceManagementAllowed: false,
        gradeSubmissionsAllowed: false,
        reportsAllowed: true,
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
            "Mr. Frank's Class C",
        ],
        selectedClass: "All Classes",
        students: 300,
        dateRange: null,
        image: "images/imageMask-3.png",
        favouriteIcon: "icons/favourite.svg",
        isExpired: false,
        previweAllowed: true,
        courceManagementAllowed: false,
        gradeSubmissionsAllowed: false,
        reportsAllowed: true,
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
            "Mr. Frank's Class C",
        ],
        selectedClass: "Mr. Frank's Class B",
        students: 44,
        dateRange: "14-Oct-2019 - 20-Oct-2020",
        image: "images/imageMask-2.png",
        favouriteIcon: "icons/favourite_2.svg",
        isExpired: true,
        previweAllowed: true,
        courceManagementAllowed: true,
        gradeSubmissionsAllowed: true,
        reportsAllowed: true
    },
];
// // Load navbar
// fetch("navbar.html")
//     .then((response: Response) => response.text())
//     .then((data: string) => {
//         const navbarPlaceholder = document.getElementById("navbar-placeholder");
//         if (navbarPlaceholder) {
//             navbarPlaceholder.innerHTML = data;
//         }
//     })
//     .catch((error: Error) => {
//         console.error("Error loading navbar:", error);
//     });
var markup = "\n  ".concat(data
    .map(function (card) {
    var optionsMarkup = card.classOptions && card.classOptions.length > 0
        ? card.classOptions
            .map(function (cls) {
            return "<option value=\"".concat(cls, "\" ").concat(cls === card.selectedClass ? "selected" : "", ">").concat(cls, "</option>");
        })
            .join("")
        : "<option value=\"\" disabled selected>No classes</option>";
    var selectMarkup = !card.selectedClass && card.classOptions && card.classOptions.length > 0
        ? "<option value=\"\" disabled selected>No classes</option>" +
            optionsMarkup
        : optionsMarkup;
    return "\n      <div class=\"content_card rel\">\n            <div class=\"content_card_details\">\n              <img\n                class=\"content_img\"\n                src=".concat(card.image, "\n                alt=\"image1\"\n              />\n              <div class=\"content_card_details_left\">\n                <div class=\"card_title\">\n                  <p>").concat(card.title, "</p>\n                  <img src=").concat(card.favouriteIcon, " alt=\"favourite\" />\n                </div>\n                <div class=\"card_text\">\n                  ").concat(card.subject, "\n                  <div class=\"devider\"></div>\n                  ").concat(card.grade, "\n                  <span class=\"card_text_green\">").concat(card.boost != null ? "".concat(card.boost) : "", "</span>\n                </div>\n                <div class=\"card_text\">\n                    ").concat(card.units != null
        ? "<span><b style=\"color: black\">" +
            card.units +
            "</b> Units</span>"
        : "", "\n                  ").concat(card.lessons != null
        ? "<span><b style=\"color: black\">" +
            card.lessons +
            "</b> Lessons</span>"
        : "", "\n                  ").concat(card.topics != null
        ? "<span><b style=\"color: black\">" +
            card.topics +
            "</b> Topics</span>"
        : "", "\n                  </div>\n                <div class=\"card_select_div\">\n                  <select class=\"card_select\" name=\"classes\" id=\"classes\">\n                   ").concat(selectMarkup, "\n                 </select>\n                </div>\n                ").concat((card === null || card === void 0 ? void 0 : card.students) != null
        ? "<div class=\"card_text\">\n                          ".concat(card.students, " students ").concat(card.dateRange != null
            ? "<span class=\"devider\"></span>" + card.dateRange
            : "", "\n                </div>")
        : "", "\n              </div>\n              ").concat(card.isExpired ? "<div class=\"card_label\">EXPIRED</div>" : "", "\n            </div>\n            <div class=\"content_card_actions\">\n              <img src=").concat(card.previweAllowed ? "icons/preview.svg" : "icons/preview2.svg", " alt=\"preview\" />\n               <img src=").concat(card.courceManagementAllowed ? "icons/manageCourse.svg" : "icons/manageCourse2.svg", " alt=\"manage\" />\n               <img src=").concat(card.gradeSubmissionsAllowed ? "icons/gradeSubmissions.svg" : "icons/gradeSubmissions2.svg ", " alt=\"icons/grade submissions\"/>\n               <img src=").concat(card.reportsAllowed ? "icons/reports.svg" : "icons/reports2.svg", " alt=\"manage\" />\n            </div>\n          </div>\n      ");
})
    .join(""), "\n");
var contentPlaceholder = document.getElementById("content-placeholder");
if (contentPlaceholder) {
    contentPlaceholder.innerHTML = markup;
}
// Mobile menu functionality
var button = document.getElementById("navbarToggle");
var div = document.getElementById("navbarMob");
var hideTimeout;
if (button && div) {
    button.addEventListener("mouseenter", function () {
        if (hideTimeout !== undefined) {
            clearTimeout(hideTimeout);
        }
        if (div) {
            div.style.display = "block";
        }
    });
    button.addEventListener("mouseleave", function () {
        hideTimeout = setTimeout(function () {
            if (div) {
                div.style.display = "none";
            }
        }, 300);
    });
    div.addEventListener("mouseenter", function () {
        if (hideTimeout !== undefined) {
            clearTimeout(hideTimeout);
        }
        if (div) {
            div.style.display = "block";
        }
    });
    div.addEventListener("mouseleave", function () {
        hideTimeout = setTimeout(function () {
            if (div) {
                div.style.display = "none";
            }
        }, 300);
    });
}
// Alert functionality
var alertList = document.getElementById("alerts");
var alertIcon = document.getElementById("alerts_icon");
var alertCount = document.getElementById("alerts_count");
var hideAlertTimeout;
function showAlertList() {
    if (hideAlertTimeout !== undefined) {
        clearTimeout(hideAlertTimeout);
    }
    if (announcementList)
        announcementList.style.display = "none";
    if (announcementIcon)
        announcementIcon.src = "icons/announcements.svg";
    if (announcementCount)
        announcementCount.style.display = "flex";
    if (alertList)
        alertList.style.display = "flex";
    if (alertIcon)
        alertIcon.src = "icons/alerts 2.svg";
    if (alertCount)
        alertCount.style.display = "none";
}
if (alertIcon && alertList) {
    alertIcon.addEventListener("mouseenter", function () {
        showAlertList();
    });
    alertIcon.addEventListener("mouseleave", function () {
        hideAlertTimeout = setTimeout(function () {
            if (alertList)
                alertList.style.display = "none";
            if (alertIcon)
                alertIcon.src = "icons/alerts.svg";
            if (alertCount)
                alertCount.style.display = "flex";
        }, 300);
    });
    alertList.addEventListener("mouseenter", function () {
        showAlertList();
    });
    alertList.addEventListener("mouseleave", function () {
        hideAlertTimeout = setTimeout(function () {
            if (alertList)
                alertList.style.display = "none";
            if (alertIcon)
                alertIcon.src = "icons/alerts.svg";
            if (alertCount)
                alertCount.style.display = "flex";
        }, 300);
    });
}
// Announcement functionality
var announcementList = document.getElementById("announcements");
var announcementIcon = document.getElementById("announcements_icon");
var announcementCount = document.getElementById("announcements_count");
var hideAnnouncementTimeout;
function showAnnouncementList() {
    if (hideAnnouncementTimeout !== undefined) {
        clearTimeout(hideAnnouncementTimeout);
    }
    if (alertList)
        alertList.style.display = "none";
    if (alertIcon)
        alertIcon.src = "icons/alerts.svg";
    if (alertCount)
        alertCount.style.display = "flex";
    if (announcementList)
        announcementList.style.display = "flex";
    if (announcementIcon)
        announcementIcon.src = "icons/announcements 2.svg";
    if (announcementCount)
        announcementCount.style.display = "none";
}
function hideAnnouncementList() {
    hideAnnouncementTimeout = setTimeout(function () {
        if (announcementList)
            announcementList.style.display = "none";
        if (announcementIcon)
            announcementIcon.src = "icons/announcements.svg";
        if (announcementCount)
            announcementCount.style.display = "flex";
    }, 300);
}
if (announcementIcon && announcementList) {
    announcementIcon.addEventListener("mouseenter", function () {
        showAnnouncementList();
    });
    announcementIcon.addEventListener("mouseleave", function () {
        hideAnnouncementList();
    });
    announcementList.addEventListener("mouseenter", function () {
        showAnnouncementList();
    });
    announcementList.addEventListener("mouseleave", function () {
        hideAnnouncementList();
    });
}
// Navbar accordion functionality
var navbarLinkHeads = document.querySelectorAll('.navbar_link_head');
navbarLinkHeads.forEach(function (linkHead) {
    linkHead.addEventListener('click', function (e) {
        var target = e.target;
        var clickedOnArrow = target.tagName === 'IMG';
        var clickedOnLink = target.tagName === 'A';
        if (clickedOnLink && !clickedOnArrow) {
            return; // Let the link work normally
        }
        e.preventDefault();
        var currentNavbarLink = linkHead.closest('.navbar_link');
        var currentBody = currentNavbarLink === null || currentNavbarLink === void 0 ? void 0 : currentNavbarLink.querySelector('.navbar_link_body');
        if (!currentBody) {
            return;
        }
        // Close all other navbar_link_body elements
        var allNavbarLinks = document.querySelectorAll('.navbar_link');
        allNavbarLinks.forEach(function (navbarLink) {
            var body = navbarLink.querySelector('.navbar_link_body');
            var arrow = navbarLink.querySelector('img[alt="arrow"]');
            if (body && navbarLink !== currentNavbarLink) {
                body.style.display = 'none';
                navbarLink.style.backgroundColor = 'white';
                if (arrow) {
                    arrow.style.transform = 'rotate(0deg)';
                }
            }
        });
        var currentArrow = currentNavbarLink.querySelector('img[alt="arrow"]');
        if (currentBody.style.display === 'flex') {
            // Close current body
            currentBody.style.display = 'none';
            if (currentArrow) {
                currentArrow.style.transform = 'rotate(0deg)';
            }
            currentNavbarLink.style.backgroundColor = 'white';
        }
        else {
            // Open current body
            currentBody.style.display = 'flex';
            if (currentArrow) {
                currentArrow.style.transform = 'rotate(180deg)';
            }
            currentNavbarLink.style.backgroundColor = '#EEEEEE';
        }
    });
});
// Initialize navbar bodies as hidden
document.addEventListener('DOMContentLoaded', function () {
    var allBodies = document.querySelectorAll('.navbar_link_body');
    allBodies.forEach(function (body) {
        body.style.display = 'none';
    });
});
document.addEventListener("DOMContentLoaded", function () {
    var navLinks = document.querySelectorAll(".navbar_link");
    var controller = document.querySelectorAll(".content_option");
    navLinks.forEach(function (link) {
        link.addEventListener("click", function (e) {
            navLinks.forEach(function (navLink) {
                navLink.classList.remove("active");
            });
            this.classList.add("active");
        });
    });
    controller.forEach(function (link) {
        link.addEventListener("click", function (e) {
            controller.forEach(function (navLink) {
                navLink.classList.remove("option_active");
            });
            this.classList.add("option_active");
        });
    });
});
