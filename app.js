/**
 * URL - YOUR PARTNER FOR DIAGNOSIS
 * Core JavaScript Application Controller
 * Handles location synchronization, report tracking, per-card slide-down event drawers, and image lightbox.
 */

// Default Configuration State matching Official Corporate Brochure (Head Office: Pokhara, Nepal)
const DEFAULT_CLINIC_CONFIG = {
  accessCode: 'URL-DIAG-2026',
  branchName: 'UNITED REFERENCE LABORATORY PVT. LTD. (HEAD OFFICE)',
  address: 'Giri Complex, New Road, Pokhara-8, Kaski, Nepal',
  cityRegion: 'Pokhara, Gandaki Province',
  landMark: 'Giri Complex, New Road',
  phone: '+977-61-570503, 543503, 9856013595',
  emergencyPhone: '+977-61-584289, 9856013592 (Hospital Chowk 24/7)',
  email: 'urlnepal@gmail.com',
  operatingHours: 'Daily: 6:30 AM - 8:00 PM | Hospital Chowk: 24 Hours',
  googleMapEmbed: 'https://maps.google.com/maps?q=Pokhara%20New%20Road%20Nepal&t=&z=15&ie=UTF8&iwloc=&output=embed',
  announcement: 'Gandaki Province’s First & Leading Reference Laboratory Since 2013.'
};

// Complete Brochure Event Photo Dataset
const EVENT_GALLERIES = {
  anniversary: {
    title: "Anniversary & Health Award Ceremonies (11 Photos)",
    description: "Annual celebrations, national health awards, and journalism honors organized by URL.",
    items: [
      { src: "assets/page_18_img_1.jpeg", caption: "Establishment Day Inauguration Ceremony (2070)" },
      { src: "assets/page_19_img_4.jpeg", caption: "1st Anniversary Program - Welcome to Distinguished Guests" },
      { src: "assets/page_19_img_9.jpeg", caption: "4th Anniversary & Health Award Presentation" },
      { src: "assets/page_19_img_5.jpeg", caption: "5th Anniversary Health Journalism Award Ceremony" },
      { src: "assets/page_19_img_10.jpeg", caption: "6th Anniversary Health Journalism Award Presentation" },
      { src: "assets/page_20_img_1.jpeg", caption: "7th Anniversary Journalism Award Ceremony" },
      { src: "assets/page_20_img_2.jpeg", caption: "8th Anniversary Journalism Award Presentation" },
      { src: "assets/page_20_img_3.jpeg", caption: "National Health Award & Lifetime Achievement Honor" },
      { src: "assets/page_20_img_5.jpeg", caption: "Health Journalism Award Ceremony & Honor" },
      { src: "assets/page_20_img_6.jpeg", caption: "Anniversary Felicitation Ceremony" },
      { src: "assets/page_20_img_7.jpeg", caption: "Lifetime Achievement Award 2081 Presentation" }
    ]
  },
  camps: {
    title: "Free Health Camps & Community Awareness (9 Photos)",
    description: "Over 232 free health camps and 3 Lakhs+ free diagnostic services provided across Nepal.",
    items: [
      { src: "assets/page_18_img_4.jpeg", caption: "Free Diabetes, Kidney & Urine Checkup Camp (Lamp Lighting)" },
      { src: "assets/page_18_img_2.jpeg", caption: "Free Health Camp Patient Registration Desk" },
      { src: "assets/page_18_img_3.jpeg", caption: "Community Free Blood Test & Awareness Camp" },
      { src: "assets/page_18_img_5.jpeg", caption: "Free Diabetes & Kidney Checkup Camp (Lions Club Collaboration)" },
      { src: "assets/page_18_img_6.jpeg", caption: "Free Health Camp Felicitation Ceremony" },
      { src: "assets/page_18_img_7.jpeg", caption: "Community Health Awareness Program" },
      { src: "assets/page_18_img_8.jpeg", caption: "Free Blood Testing & Health Awareness Award Distribution" },
      { src: "assets/page_18_img_9.jpeg", caption: "Health Camp Honor & Token of Love Ceremony" },
      { src: "assets/page_18_img_10.jpeg", caption: "Free Check-up (FBS, PPBS, Triglycerides) & Awareness Program" }
    ]
  },
  cme: {
    title: "CME Seminars & Technical Training (6 Photos)",
    description: "Continuous Medical Education (CME) for doctors and skill enhancement for laboratory technicians.",
    items: [
      { src: "assets/page_19_img_1.jpeg", caption: "CME on Innovative Biomarkers (Powered by Roche)" },
      { src: "assets/page_19_img_2.jpeg", caption: "Laboratory Quality Management & Technology Seminar" },
      { src: "assets/page_19_img_3.jpeg", caption: "9 Years Service CME Program with Diagnotech Support & Roche" },
      { src: "assets/page_19_img_6.jpeg", caption: "Laboratory Management & Technical Skill Workshop" },
      { src: "assets/page_19_img_7.jpeg", caption: "Laboratory Quality Assurance Seminar Group" },
      { src: "assets/page_19_img_8.jpeg", caption: "Roche Automated Analyzer Operation & Training" }
    ]
  },
  csr: {
    title: "Roche Recognition & CSR Scholarships (3 Photos)",
    description: "National recognition from Roche Diagnostics & community education scholarships.",
    items: [
      { src: "assets/page_20_img_4.jpeg", caption: "Awarded by Roche Diagnostics at National Meet 2018" },
      { src: "assets/page_20_img_8.jpeg", caption: "URL Scholarship Distribution at Lila Secondary School" },
      { src: "assets/page_20_img_9.jpeg", caption: "URL Group Board of Directors Special General Meeting (AGM)" }
    ]
  }
};

// Initialize State
function getClinicConfig() {
  const saved = localStorage.getItem('url_clinic_config');
  if (saved) {
    try {
      return { ...DEFAULT_CLINIC_CONFIG, ...JSON.parse(saved) };
    } catch (e) {
      console.error('Error parsing clinic config', e);
    }
  }
  return DEFAULT_CLINIC_CONFIG;
}

function saveClinicConfig(config) {
  localStorage.setItem('url_clinic_config', JSON.stringify(config));
}

// Render Public Site Data
function renderPublicSiteData() {
  const config = getClinicConfig();

  const topPhone = document.getElementById('top-phone-display');
  if (topPhone) topPhone.innerText = config.phone;

  const topHours = document.getElementById('top-hours-display');
  if (topHours) topHours.innerText = config.operatingHours;

  const liveLocationText = document.getElementById('live-location-text');
  if (liveLocationText) {
    liveLocationText.innerHTML = `<strong>Current Location:</strong> ${config.address}`;
  }

  const locBranchName = document.getElementById('loc-branch-name');
  if (locBranchName) locBranchName.innerText = config.branchName;

  const locAddress = document.getElementById('loc-address');
  if (locAddress) locAddress.innerText = config.address;

  const locLandmark = document.getElementById('loc-landmark');
  if (locLandmark) locLandmark.innerText = config.landMark;

  const locPhone = document.getElementById('loc-phone');
  if (locPhone) locPhone.innerText = config.phone;

  const locEmergency = document.getElementById('loc-emergency');
  if (locEmergency) locEmergency.innerText = config.emergencyPhone;

  const locHours = document.getElementById('loc-hours');
  if (locHours) locHours.innerText = config.operatingHours;

  const mapIframe = document.getElementById('loc-map-iframe');
  if (mapIframe && config.googleMapEmbed) {
    mapIframe.src = config.googleMapEmbed;
  }
}

// Mobile Menu Toggle with Auto-Dismiss
function setupMobileMenu() {
  const toggleBtn = document.getElementById('mobile-menu-btn');
  const navMenu = document.getElementById('nav-menu');
  if (toggleBtn && navMenu) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      navMenu.classList.toggle('active');
    });

    // Close menu when tapping any nav link
    const navLinks = navMenu.querySelectorAll('a');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
      });
    });

    // Close menu when tapping outside
    document.addEventListener('click', (e) => {
      if (navMenu.classList.contains('active') && !navMenu.contains(e.target) && !toggleBtn.contains(e.target)) {
        navMenu.classList.remove('active');
      }
    });
  }
}

// Online Report Lookup Demo
function setupReportTracker() {
  const reportForm = document.getElementById('report-search-form');
  const resultBox = document.getElementById('report-result-box');

  if (reportForm) {
    reportForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const labNo = document.getElementById('lab-ref-input').value.trim();
      const mobileNo = document.getElementById('mobile-ref-input').value.trim();

      if (!labNo || !mobileNo) {
        alert('Please enter both Lab Reference Number and Mobile Number.');
        return;
      }

      resultBox.style.display = 'block';
      resultBox.className = 'alert-box alert-success';
      resultBox.innerHTML = `
        <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px;">
          <div>
            <strong>Sample ID: ${labNo.toUpperCase()}</strong>
            <p style="margin-top:4px; font-size:0.88rem;">Status: <strong>Processing Completed & Verified by Consultant Pathologist</strong></p>
          </div>
          <button onclick="alert('Downloading Official PDF Report for ${labNo}...');" class="btn btn-sm btn-primary"><i data-feather="download"></i> Download PDF</button>
        </div>
      `;
      if (window.feather) feather.replace();
    });
  }
}

// Per-Card In-Page Slide-Down Accordion Event Gallery Controller
function toggleEventSlideDrawer(categoryKey) {
  const targetDrawer = document.getElementById('drawer-' + categoryKey);
  const targetCard = document.querySelector(`.event-cat-card[data-category="${categoryKey}"]`);
  const allDrawers = document.querySelectorAll('.event-slide-drawer');
  const allCards = document.querySelectorAll('.event-cat-card');

  if (!targetDrawer) return;

  const isOpen = targetDrawer.classList.contains('open');

  // Close all other open drawers
  allDrawers.forEach(d => d.classList.remove('open'));
  allCards.forEach(c => c.classList.remove('active'));

  // If already open, close it
  if (isOpen) {
    return;
  }

  // Populate photos inside target drawer if empty
  const gridContainer = targetDrawer.querySelector('.drawer-photos-grid');
  if (gridContainer && EVENT_GALLERIES[categoryKey]) {
    let gridHtml = '';
    EVENT_GALLERIES[categoryKey].items.forEach(item => {
      gridHtml += `
        <div class="drawer-photo-card" onclick="openLightbox('${item.src}', '${item.caption.replace(/'/g, "\\'")}')">
          <div class="drawer-photo-box">
            <img src="${item.src}" alt="${item.caption}" loading="lazy">
            <div class="drawer-zoom-badge"><i data-feather="maximize-2"></i> Zoom</div>
          </div>
          <div class="drawer-photo-caption">${item.caption}</div>
        </div>
      `;
    });
    gridContainer.innerHTML = gridHtml;
  }

  // Slide open target drawer directly under card
  if (targetCard) targetCard.classList.add('active');
  targetDrawer.classList.add('open');

  if (window.feather) feather.replace();

  // Smooth scroll to card
  if (targetCard) {
    targetCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

// Image Lightbox Zoom Controller
function openLightbox(imgSrc, captionText) {
  const lightbox = document.getElementById('image-lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');

  if (lightbox && lightboxImg && lightboxCaption) {
    lightboxImg.src = imgSrc;
    lightboxCaption.innerText = captionText;
    lightbox.classList.add('active');
  }
}

function closeLightbox() {
  const lightbox = document.getElementById('image-lightbox');
  if (lightbox) lightbox.classList.remove('active');
}

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  renderPublicSiteData();
  setupMobileMenu();
  setupReportTracker();
  if (window.feather) feather.replace();

  // On page refresh, navigate directly to first page (top hero section) with a smooth transition
  if (window.location.hash) {
    history.replaceState(null, null, window.location.pathname);
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Configure manual scroll restoration so page always starts on first page on refresh
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
