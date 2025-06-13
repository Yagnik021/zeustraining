var alerts = [
    {
        "id": 1,
        "type": "license_assignment",
        "status": "unread",
        "highlighted": true,
        "title": "License for Introduction to Algebra has been assigned to your school",
        "course": null,
        "class": null,
        "timestamp": "15-Sep-2018 at 07:21 pm",
        "close_icon": "icons/icons8-minus-18.png"
    },
    {
        "id": 2,
        "type": "overdue_assignment",
        "status": "read",
        "highlighted": false,
        "title": "Lesson 3 Practice Worksheet overdue for Amy Santiago",
        "course": "Advanced Mathematics",
        "class": null,
        "timestamp": "15-Sep-2018 at 05:21 pm",
        "close_icon": "icons/icons8-checkmark-18 (1).png"
    },
    {
        "id": 3,
        "type": "student_creation",
        "status": "unread",
        "highlighted": true,
        "title": "23 new students created",
        "course": null,
        "class": null,
        "timestamp": "14-Sep-2018 at 01:21 pm",
        "close_icon": "icons/icons8-minus-18.png"
    },
    {
        "id": 4,
        "type": "submissions_ready",
        "status": "unread",
        "highlighted": true,
        "title": "15 submissions ready for evaluation",
        "course": null,
        "class": "Basics of Algebra",
        "timestamp": "15-Sep-2018 at 05:21 pm",
        "close_icon": "icons/icons8-minus-18.png"
    },
    {
        "id": 5,
        "type": "license_assignment",
        "status": "unread",
        "highlighted": true,
        "title": "License for Basic Concepts in Geometry has been assigned to your... school",
        "course": null,
        "class": null,
        "timestamp": "15-Sep-2018 at 07:21 pm",
        "close_icon": "icons/icons8-minus-18.png"
    },
    {
        "id": 6,
        "type": "overdue_assignment",
        "status": "read",
        "highlighted": false,
        "title": "Lesson 3 Practice Worksheet overdue for Sam Diego",
        "course": "Advanced Mathematics",
        "class": null,
        "timestamp": "15-Sep-2018 at 05:21 pm",
        "close_icon": "icons/icons8-checkmark-18 (1).png"
    }
];
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
var announcements = [
    {
        "id": 1,
        "status": "read",
        "highlighted": false,
        "author": "Wilson Kumar",
        "body": "No classes will be held on 21st Nov",
        "course": null,
        "attachments": {
            "count": 2,
            "icon": "./icons/icons8-attachment-24.png"
        },
        "timestamp": "15-Sep-2018 at 07:21 pm",
        "close_icon": "icons/icons8-checkmark-18 (1).png"
    },
    {
        "id": 2,
        "status": "unread",
        "highlighted": true,
        "author": "Samson White",
        "body": "Guest lecture on Geometry on 20th September",
        "course": null,
        "attachments": {
            "count": 2,
            "icon": "./icons/icons8-attachment-24.png"
        },
        "timestamp": "15-Sep-2018 at 07:21 pm",
        "close_icon": "icons/icons8-minus-18.png"
    },
    {
        "id": 3,
        "status": "read",
        "highlighted": false,
        "author": "Wilson Kumar",
        "body": "Additional course materials available on request",
        "course": "Mathematics 101",
        "attachments": null,
        "timestamp": "15-Sep-2018 at 07:21 pm",
        "close_icon": "icons/icons8-checkmark-18 (1).png"
    },
    {
        "id": 4,
        "status": "unread",
        "highlighted": true,
        "author": "Wilson Kumar",
        "body": "No classes will be held on 25th Dec",
        "course": null,
        "attachments": null,
        "timestamp": "15-Sep-2018 at 07:21 pm",
        "close_icon": "icons/icons8-minus-18.png"
    },
    {
        "id": 5,
        "status": "unread",
        "highlighted": true,
        "author": "Wilson Kumar",
        "body": "Additional course materials available on request",
        "course": null,
        "attachments": {
            "count": 2,
            "icon": "./icons/icons8-attachment-24.png"
        },
        "timestamp": "15-Sep-2018 at 07:21 pm",
        "close_icon": "icons/icons8-minus-18.png"
    }
];
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
var alertMarkup = "\n        ".concat(alerts.map(function (alert) {
    return "\n                <li class=\"alerts_list_item ".concat(alert.status === "unread" ? "bg_yellow" : "", "\">\n                        <div class=\"alerts_list_item_text space_between\">\n                          <div class=\"alerts_list_item_text_head\">\n                            ").concat(alert.title, "\n                          </div>\n                          <img src=").concat(alert.status === "unread" ? "icons/icons8-minus-18.png" : "icons/icons8-checkmark-18_check.png", " class=\"alerts_list_item_text_head_close\" alt=\"close\" />\n                        </div>\n                        ").concat(alert.course != null ?
        "<div class=\"alerts_list_item_text\">\n                                <span class=\"text_light\">Course:</span> ".concat(alert.course, "\n                            </div>")
        : "", "\n                        ").concat(alert.timestamp != null ?
        "<div class=\"alerts_list_item_time_stamp\">\n                                ".concat(alert.timestamp, "\n                            </div>")
        : "", "\n                        \n                      </li>\n                ");
}).join(""), "\n");
var announcementMarkup = "\n        ".concat(announcements.map(function (announcement) {
    return "\n            <li class=\"alerts_list_item ".concat(announcement.status === "unread" ? "bg_yellow" : "", "\">\n                <div class=\"anouncements_list_item_head\">\n                    <div class=\"anouncements_list_item_text_head\">\n                    <span>PA: </span> ").concat(announcement.author, "\n                    </div>\n                    <img src=").concat(announcement.status === "unread" ? "icons/icons8-minus-18.png" : "icons/icons8-checkmark-18_check.png", " class=\"anouncements_list_item_text_head_close\"\n                    alt=\"close\" />\n                </div>\n                <div class=\"anouncements_list_item_body\">\n                    ").concat(announcement.body, "\n                </div>\n                ").concat(announcement.course != null ?
        "\n                    <span>\n                        Course: ".concat(announcement.course, "\n                    </span>\n                    ") : "", "\n                <div class=\"anouncements_list_item_time_stamp\">\n                    ").concat(announcement.attachments != null
        ? "<img width=\"14\" height=\"15\" src=".concat(announcement.attachments.icon, " alt=\"attach\"/> ").concat(announcement.attachments.count, " files are attached")
        : "", "\n                    <span>").concat(announcement.timestamp, "</span>\n                </div>\n            </li>\n            ");
}).join(""), "\n");
var contentPlaceholder = document.getElementById("content-placeholder");
if (contentPlaceholder) {
    contentPlaceholder.innerHTML = markup;
}
var alerPlaceholder = document.getElementById("alerts_placeholder");
if (alerPlaceholder) {
    alerPlaceholder.innerHTML = alertMarkup;
}
var anouncementPlaceholder = document.getElementById("anouncements_placeholder");
if (anouncementPlaceholder) {
    anouncementPlaceholder.innerHTML = announcementMarkup;
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
        alertIcon.src = "icons/alerts2.svg";
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
        announcementIcon.src = "icons/announcements2.svg";
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
