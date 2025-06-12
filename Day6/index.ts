interface CardData {
    title: string;
    subject: string;
    grade: string;
    boost: string | null;
    units: number | null;
    lessons: number | null;
    topics: number | null;
    classOptions: string[];
    selectedClass: string | null;
    students: number | null;
    dateRange: string | null;
    image: string;
    favouriteIcon: string;
    isExpired: boolean;
    previweAllowed: boolean;
    courceManagementAllowed: boolean;
    gradeSubmissionsAllowed: boolean;
    reportsAllowed: boolean;
}

const data: CardData[] = [
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
    title:
      "Introduction to Biology: Micro organisms and how they affect the other Life Systems in En...",
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

const markup: string = `
  ${data
        .map((card: CardData) => {
            const optionsMarkup: string =
                card.classOptions && card.classOptions.length > 0
                    ? card.classOptions
                        .map(
                            (cls: string) =>
                                `<option value="${cls}" ${cls === card.selectedClass ? "selected" : ""
                                }>${cls}</option>`
                        )
                        .join("")
                    : `<option value="" disabled selected>No classes</option>`;

            const selectMarkup: string =
                !card.selectedClass && card.classOptions && card.classOptions.length > 0
                    ? `<option value="" disabled selected>No classes</option>` +
                    optionsMarkup
                    : optionsMarkup;

            return `
      <div class="content_card rel">
            <div class="content_card_details">
              <img
                class="content_img"
                src=${card.image}
                alt="image1"
              />
              <div class="content_card_details_left">
                <div class="card_title">
                  <p>${card.title}</p>
                  <img src=${card.favouriteIcon} alt="favourite" />
                </div>
                <div class="card_text">
                  ${card.subject}
                  <div class="devider"></div>
                  ${card.grade}
                  <span class="card_text_green">${card.boost != null ? `${card.boost}` : ""}</span>
                </div>
                <div class="card_text">
                    ${card.units != null
                    ? `<span><b style="color: black">` +
                    card.units +
                    `</b> Units</span>`
                    : ""
                }
                  ${card.lessons != null
                    ? `<span><b style="color: black">` +
                    card.lessons +
                    `</b> Lessons</span>`
                    : ""
                }
                  ${card.topics != null
                    ? `<span><b style="color: black">` +
                    card.topics +
                    `</b> Topics</span>`
                    : ""
                }
                  </div>
                <div class="card_select_div">
                  <select class="card_select" name="classes" id="classes">
                   ${selectMarkup}
                 </select>
                </div>
                ${card?.students != null
                    ? `<div class="card_text">
                          ${card.students} students ${card.dateRange != null
                        ? `<span class="devider"></span>` + card.dateRange
                        : ""
                    }
                </div>`
                    : ""
                }
              </div>
              ${card.isExpired ? `<div class="card_label">EXPIRED</div>` : ""}
            </div>
            <div class="content_card_actions">
              <img src=${card.previweAllowed ? "icons/preview.svg" : "icons/preview2.svg"} alt="preview" />
               <img src=${card.courceManagementAllowed ? "icons/manageCourse.svg" : "icons/manageCourse2.svg"} alt="manage" />
               <img src=${card.gradeSubmissionsAllowed ? "icons/gradeSubmissions.svg" : "icons/gradeSubmissions2.svg "} alt="icons/grade submissions"/>
               <img src=${card.reportsAllowed ? "icons/reports.svg" : "icons/reports2.svg"} alt="manage" />
            </div>
          </div>
      `;
        })
        .join("")}
`;

const contentPlaceholder = document.getElementById("content-placeholder");
if (contentPlaceholder) {
    contentPlaceholder.innerHTML = markup;
}

// Mobile menu functionality
const button = document.getElementById("navbarToggle") as HTMLElement;
const div = document.getElementById("navbarMob") as HTMLElement;

let hideTimeout: ReturnType<typeof setTimeout> | undefined;

if (button && div) {
    button.addEventListener("mouseenter", function (): void {
        if (hideTimeout !== undefined) {
            clearTimeout(hideTimeout);
        }
        if (div) {
            div.style.display = "block";
        }
    });
    button.addEventListener("mouseleave", function (): void {
        hideTimeout = setTimeout(() => {
            if (div) {
                div.style.display = "none";
            }
        }, 300);
    });

    div.addEventListener("mouseenter", function (): void {
        if (hideTimeout !== undefined) {
            clearTimeout(hideTimeout);
        }
        if (div) {
            div.style.display = "block";
        }
    });
    div.addEventListener("mouseleave", function (): void {
        hideTimeout = setTimeout(() => {
            if (div) {
                div.style.display = "none";
            }
        }, 300);
    });
}

// Alert functionality
const alertList = document.getElementById("alerts") as HTMLElement;
const alertIcon = document.getElementById("alerts_icon") as HTMLImageElement;
const alertCount = document.getElementById("alerts_count") as HTMLElement;

let hideAlertTimeout: ReturnType<typeof setTimeout> | undefined;

function showAlertList(): void {
    if (hideAlertTimeout !== undefined) {
        clearTimeout(hideAlertTimeout);
    }

    if (announcementList) announcementList.style.display = "none";
    if (announcementIcon) announcementIcon.src = "icons/announcements.svg";
    if (announcementCount) announcementCount.style.display = "flex";
    if (alertList) alertList.style.display = "flex";
    if (alertIcon) alertIcon.src = "icons/alerts 2.svg";
    if (alertCount) alertCount.style.display = "none";
}

if (alertIcon && alertList) {
    alertIcon.addEventListener("mouseenter", function () {
        showAlertList();
    });
    alertIcon.addEventListener("mouseleave", function (): void {
        hideAlertTimeout = setTimeout(() => {
            if (alertList) alertList.style.display = "none";
            if (alertIcon) alertIcon.src = "icons/alerts.svg";
            if (alertCount) alertCount.style.display = "flex";
        }, 300);
    });

    alertList.addEventListener("mouseenter", function () {
        showAlertList();
    });
    alertList.addEventListener("mouseleave", function (): void {
        hideAlertTimeout = setTimeout(() => {
            if (alertList) alertList.style.display = "none";
            if (alertIcon) alertIcon.src = "icons/alerts.svg";
            if (alertCount) alertCount.style.display = "flex";
        }, 300);
    });
}

// Announcement functionality
const announcementList = document.getElementById("announcements") as HTMLElement;
const announcementIcon = document.getElementById("announcements_icon") as HTMLImageElement;
const announcementCount = document.getElementById("announcements_count") as HTMLElement;

let hideAnnouncementTimeout: ReturnType<typeof setTimeout> | undefined;

function showAnnouncementList(): void {
    if (hideAnnouncementTimeout !== undefined) {
        clearTimeout(hideAnnouncementTimeout);
    }

    if (alertList) alertList.style.display = "none";
    if (alertIcon) alertIcon.src = "icons/alerts.svg";
    if (alertCount) alertCount.style.display = "flex";
    if (announcementList) announcementList.style.display = "flex";
    if (announcementIcon) announcementIcon.src = "icons/announcements 2.svg";
    if (announcementCount) announcementCount.style.display = "none";
}

function hideAnnouncementList(): void {
    hideAnnouncementTimeout = setTimeout(() => {
        if (announcementList) announcementList.style.display = "none";
        if (announcementIcon) announcementIcon.src = "icons/announcements.svg";
        if (announcementCount) announcementCount.style.display = "flex";
    }, 300);
}

if (announcementIcon && announcementList) {
    announcementIcon.addEventListener("mouseenter", function () {
        showAnnouncementList();
    });
    announcementIcon.addEventListener("mouseleave", function () {
        hideAnnouncementList()
    });
    announcementList.addEventListener("mouseenter", function () {
        showAnnouncementList();
    });
    announcementList.addEventListener("mouseleave", function () {
        hideAnnouncementList();
    });
}

// Navbar accordion functionality
const navbarLinkHeads: NodeListOf<Element> = document.querySelectorAll('.navbar_link_head');

navbarLinkHeads.forEach((linkHead: Element) => {
    linkHead.addEventListener('click', (e: Event) => {
        const target = e.target as HTMLElement;
        const clickedOnArrow: boolean = target.tagName === 'IMG';
        const clickedOnLink: boolean = target.tagName === 'A';

        if (clickedOnLink && !clickedOnArrow) {
            return; // Let the link work normally
        }

        e.preventDefault();

        const currentNavbarLink = linkHead.closest('.navbar_link') as HTMLElement;
        const currentBody = currentNavbarLink?.querySelector('.navbar_link_body') as HTMLElement;

        if (!currentBody) {
            return;
        }

        // Close all other navbar_link_body elements
        const allNavbarLinks: NodeListOf<Element> = document.querySelectorAll('.navbar_link');
        allNavbarLinks.forEach((navbarLink: Element) => {
            const body = navbarLink.querySelector('.navbar_link_body') as HTMLElement;
            const arrow = navbarLink.querySelector('img[alt="arrow"]') as HTMLImageElement;

            if (body && navbarLink !== currentNavbarLink) {
                body.style.display = 'none';
                (navbarLink as HTMLElement).style.backgroundColor = 'white';
                if (arrow) {
                    arrow.style.transform = 'rotate(0deg)';
                }
            }
        });

        const currentArrow = currentNavbarLink.querySelector('img[alt="arrow"]') as HTMLImageElement;

        if (currentBody.style.display === 'flex') {
            // Close current body
            currentBody.style.display = 'none';
            if (currentArrow) {
                currentArrow.style.transform = 'rotate(0deg)';
            }
            currentNavbarLink.style.backgroundColor = 'white';
        } else {
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
document.addEventListener('DOMContentLoaded', () => {
    const allBodies: NodeListOf<Element> = document.querySelectorAll('.navbar_link_body');
    allBodies.forEach((body: Element) => {
        (body as HTMLElement).style.display = 'none';
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const navLinks: NodeListOf<Element> = document.querySelectorAll(".navbar_link");
    const controller: NodeListOf<Element> = document.querySelectorAll(".content_option");

    navLinks.forEach((link: Element) => {
        link.addEventListener("click", function (e: Event) {
            navLinks.forEach((navLink: Element) => {
                navLink.classList.remove("active");
            });

            (this as Element).classList.add("active");
        });
    });

    controller.forEach((link: Element) => {
        link.addEventListener("click", function (e: Event) {
            controller.forEach((navLink: Element) => {
                navLink.classList.remove("option_active");
            });

            (this as Element).classList.add("option_active");
        });
    });
});