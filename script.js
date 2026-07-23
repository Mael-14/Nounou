const heartLoader = document.querySelector(".cssload-main");
const screens = document.querySelectorAll(".screen");

const hideAllScreens = () => {
  screens.forEach((s) => (s.style.display = "none"));
  heartLoader.style.display = "none";
};

const playVideosIn = (el) => {
  el.querySelectorAll("video").forEach((v) => {
    v.currentTime = 0;
    v.play().catch(() => {});
  });
};

const showScreen = (name) => {
  hideAllScreens();
  const target = document.querySelector(`[data-screen="${name}"]`);
  if (!target) return;
  target.style.display = "flex";
  playVideosIn(target);
};

const showScreenWithLoader = (name, delay = 1800) => {
  hideAllScreens();
  heartLoader.style.display = "block";
  setTimeout(() => showScreen(name), delay);
};

/* ---------------- Screen 1: Do you love me? ---------------- */

const yesBtn = document.querySelector(".js-yes-btn");
const noBtn = document.querySelector(".js-no-btn");
const maybeBtn = document.querySelector(".js-maybe-btn");

let noClicks = 0;
const maxScale = 2.6;

// the "no" button dodges away on hover, just for fun
// (it stays a normal flex item in the row and only shifts with a
// transform, so it never jumps outside the card or overlaps other content)
const buttonRow = document.querySelector(".button-container");

noBtn.addEventListener("mouseover", () => {
  const rowRect = buttonRow.getBoundingClientRect();
  const btnRect = noBtn.getBoundingClientRect();

  const maxX = Math.max(rowRect.width - btnRect.width, 0) / 2;
  const maxY = Math.max(rowRect.height - btnRect.height, 40) / 2;

  const dx = Math.random() * maxX * 2 - maxX;
  const dy = Math.random() * maxY * 2 - maxY;

  noBtn.style.transform = `translate(${dx}px, ${dy}px)`;
});

// every click on "no" makes "yes" bigger
noBtn.addEventListener("click", () => {
  noClicks += 1;
  const scale = Math.min(1 + noClicks * 0.35, maxScale);
  yesBtn.style.transform = `scale(${scale})`;
});

yesBtn.addEventListener("click", () => {
  showScreenWithLoader("result", 2600);
});

maybeBtn.addEventListener("click", () => {
  showScreen("serious");
});

document.querySelector(".js-back-to-q1").addEventListener("click", () => {
  yesBtn.style.transform = "scale(1)";
  noClicks = 0;
  showScreen("q1");
});

/* ---------------- Screen 3: result -> next question ---------------- */

document.querySelector(".js-go-to-q2").addEventListener("click", () => {
  showScreen("q2");
});

/* ---------------- Screen 4: picnic or cinema ---------------- */

let chosenOption = null;

document.querySelectorAll(".js-option").forEach((btn) => {
  btn.addEventListener("click", () => {
    chosenOption = btn.dataset.option;
    document.querySelector(".js-option-label").textContent = chosenOption;
    buildCalendar();
    showScreen("calendar");
  });
});

document.querySelector(".js-back-to-q2").addEventListener("click", () => {
  showScreen("q2");
});

/* ---------------- Screen 5: calendar (September) ---------------- */

const YEAR = 2026;
const MONTH = 8; // September, 0-indexed
let selectedDate = null;

function buildCalendar() {
  const grid = document.querySelector(".js-calendar-grid");
  grid.innerHTML = "";
  selectedDate = null;
  document.querySelector(".js-selected-date").textContent = "No date selected yet";
  document.querySelector(".js-ok-btn").disabled = true;

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  dayNames.forEach((d) => {
    const el = document.createElement("div");
    el.className = "calendar-daylabel";
    el.textContent = d;
    grid.appendChild(el);
  });

  const firstDay = new Date(YEAR, MONTH, 1).getDay();
  const daysInMonth = new Date(YEAR, MONTH + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement("div");
    empty.className = "calendar-cell empty";
    grid.appendChild(empty);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = "calendar-cell";
    cell.textContent = day;
    cell.addEventListener("click", () => {
      document
        .querySelectorAll(".calendar-cell")
        .forEach((c) => c.classList.remove("selected"));
      cell.classList.add("selected");
      selectedDate = day;
      document.querySelector(
        ".js-selected-date"
      ).textContent = `September ${day}, ${YEAR} 💗`;
      document.querySelector(".js-ok-btn").disabled = false;
    });
    grid.appendChild(cell);
  }
}

const RECIPIENT_EMAIL = "robertmaelamagna@gmail.com";

// ---- EmailJS setup ----
// Fill these in with the values from your EmailJS dashboard
// (emailjs.com → Email Services / Email Templates / Account > General).
const EMAILJS_CONFIG = {
  publicKey: "twtIbqlEOdFmaE8Es",
  serviceID: "service_eg99u8n",
  templateID: "template_0zhuyvu",
};

const isEmailJSConfigured =
  window.emailjs &&
  !EMAILJS_CONFIG.publicKey.startsWith("YOUR_") &&
  !EMAILJS_CONFIG.serviceID.startsWith("YOUR_") &&
  !EMAILJS_CONFIG.templateID.startsWith("YOUR_");

if (isEmailJSConfigured) {
  emailjs.init(EMAILJS_CONFIG.publicKey);
}

function buildAnswersText(label) {
  return [
    "Here's what she answered:",
    "",
    "1) Do you love me?",
    `   → Yes 😍${noClicks > 0 ? ` (after clicking "No" ${noClicks} time${noClicks > 1 ? "s" : ""} first)` : ""}`,
    "",
    "2) Date idea for September:",
    `   → ${label}`,
    "",
    "3) Chosen date:",
    `   → September ${selectedDate}, ${YEAR}`,
    "",
    "Sent automatically from the \"Do you love me?\" page 💕",
  ].join("\n");
}

function sendViaMailto(subject, body) {
  const mailtoLink = `mailto:${RECIPIENT_EMAIL}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;
  const link = document.createElement("a");
  link.href = mailtoLink;
  link.click();
}

function sendAnswersByEmail(label) {
  const subject = "💌 Her answers on \"Do you love me?\"";
  const body = buildAnswersText(label);

  if (!isEmailJSConfigured) {
    // EmailJS keys haven't been set up yet — fall back to opening
    // her mail app with everything pre-filled instead.
    sendViaMailto(subject, body);
    return;
  }

  emailjs
    .send(EMAILJS_CONFIG.serviceID, EMAILJS_CONFIG.templateID, {
      to_email: RECIPIENT_EMAIL,
      subject: subject,
      message: body,
      love_answer: "Yes 😍",
      no_clicks: noClicks,
      date_option: label,
      chosen_date: `September ${selectedDate}, ${YEAR}`,
    })
    .catch((err) => {
      console.error("EmailJS send failed, falling back to mailto:", err);
      sendViaMailto(subject, body);
    });
}

document.querySelector(".js-ok-btn").addEventListener("click", () => {
  if (!selectedDate) return;
  const label = chosenOption === "cinema" ? "Cinema 🎬" : "Picnic 🧺";
  document.querySelector(
    ".js-final-summary"
  ).textContent = `${label} on September ${selectedDate}, ${YEAR}. Can't wait! 💕`;

  sendAnswersByEmail(label);
  showScreenWithLoader("final", 2200);
});

/* ---------------- init ---------------- */

showScreen("q1");
