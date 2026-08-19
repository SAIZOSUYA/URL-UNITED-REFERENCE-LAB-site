/**
 * United Reference Laboratory Pvt. Ltd.
 * Main Application Controller
 */

// Clinic Config & Defaults
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

// Event Photo Galleries Dataset
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

// Mobile Menu Navigation Controller
function setupMobileMenu() {
  const toggleBtn = document.getElementById('mobile-menu-btn');
  const navMenu = document.getElementById('nav-menu');
  if (toggleBtn && navMenu) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      navMenu.classList.toggle('active');
    });

    const navLinks = navMenu.querySelectorAll('a');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
      });
    });

    document.addEventListener('click', (e) => {
      if (navMenu.classList.contains('active') && !navMenu.contains(e.target) && !toggleBtn.contains(e.target)) {
        navMenu.classList.remove('active');
      }
    });
  }
}

// Category Filter Pills Handler for Services Showcase
function setupCategoryFilters() {
  const pills = document.querySelectorAll('.filter-pill');
  const cards = document.querySelectorAll('.tech-card');

  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      const filterValue = pill.getAttribute('data-filter');

      cards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filterValue === 'all' || category === filterValue) {
          card.style.display = 'flex';
          card.style.animation = 'fadeIn 0.4s ease forwards';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

// District Filter Handler for Branches
function setupDistrictFilters() {
  const districtBtns = document.querySelectorAll('.district-btn');
  const branchCards = document.querySelectorAll('.branch-photo-card');

  districtBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      districtBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const district = btn.getAttribute('data-district');

      branchCards.forEach(card => {
        const cardDistrict = card.getAttribute('data-district');
        if (district === 'all' || cardDistrict === district) {
          card.style.display = 'block';
          card.style.animation = 'fadeIn 0.4s ease forwards';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

// Event Gallery Accordion Slide Drawer
function toggleEventSlideDrawer(categoryKey) {
  const targetDrawer = document.getElementById('drawer-' + categoryKey);
  const targetCard = document.querySelector(`.event-cat-card[data-category="${categoryKey}"]`);
  const allDrawers = document.querySelectorAll('.event-slide-drawer');
  const allCards = document.querySelectorAll('.event-cat-card');

  if (!targetDrawer) return;

  const isOpen = targetDrawer.classList.contains('open');

  allDrawers.forEach(d => d.classList.remove('open'));
  allCards.forEach(c => c.classList.remove('active'));

  if (isOpen) return;

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

  if (targetCard) targetCard.classList.add('active');
  targetDrawer.classList.add('open');

  if (window.feather) feather.replace();

  if (targetCard) {
    targetCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

// Lightbox Zoom Modal
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

// Helper to get Clinic Config (Tries Live Express Backend API first, falls back to localStorage)
function getClinicConfig() {
  const saved = localStorage.getItem('url_clinic_config');
  if (saved) {
    try { return JSON.parse(saved); } catch (e) {}
  }
  return DEFAULT_CLINIC_CONFIG;
}

// Fetch Live Config from Backend
async function fetchLiveClinicConfig() {
  try {
    const res = await fetch('/api/config');
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.config) {
        localStorage.setItem('url_clinic_config', JSON.stringify(data.config));
        return data.config;
      }
    }
  } catch (err) {
    console.log('Using local config cache (Backend offline or local file mode)');
  }
  return getClinicConfig();
}

// Save Config to Backend
async function saveClinicConfig(configData) {
  localStorage.setItem('url_clinic_config', JSON.stringify(configData));
  try {
    const res = await fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ updatedConfig: configData })
    });
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (err) {
    console.warn('Backend API unavailable, saved to browser localStorage.');
  }
  return { success: true, message: 'Saved to local storage.' };
}

// Appointment / "LET'S CONNECT" Form Submission Handler
function setupConnectForm() {
  const form = document.getElementById('appointment-connect-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('connect-name').value.trim();
      const phone = document.getElementById('connect-phone').value.trim();
      const test = document.getElementById('connect-test-select').value;
      const branch = document.getElementById('connect-branch-select').value;

      if (!name || !phone) {
        alert('Please provide your Name and Mobile Number.');
        return;
      }

      let savedRecord = null;

      // Submit to Express Backend API first
      try {
        const res = await fetch('/api/appointments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, phone, test, branch })
        });
        let data = {};
        try { data = await res.json(); } catch (e) {}

        if (res.ok && data.success && data.appointment) {
          savedRecord = data.appointment;
        } else if (!res.ok && data.message) {
          alert(data.message);
          return;
        }
      } catch (err) {
        console.warn('Appointment API offline, recording to local storage fallback.');
      }

      // If backend was offline, create fallback local record
      if (!savedRecord) {
        savedRecord = {
          id: 'APT-' + Math.floor(1000 + Math.random() * 9000),
          name,
          phone,
          test: test || 'General Diagnostic Checkup',
          branch: branch || 'URL Head Office - New Road, Pokhara',
          date: new Date().toISOString(),
          status: 'Pending Review'
        };
      }

      // Sync with localStorage array (deduplicated by ID)
      try {
        const savedApts = JSON.parse(localStorage.getItem('url_appointments') || '[]');
        const exists = savedApts.some(a => a.id === savedRecord.id);
        if (!exists) {
          savedApts.unshift(savedRecord);
          localStorage.setItem('url_appointments', JSON.stringify(savedApts));
        }
      } catch (err) {}

      showSuccessPopupModal(savedRecord);
      form.reset();
    });
  }
}

// Custom Success Popup Modal Handlers
function showSuccessPopupModal(record) {
  const modal = document.getElementById('booking-success-modal');
  if (!modal) return;

  document.getElementById('popup-patient-name').textContent = record.name || 'Patient';
  document.getElementById('popup-apt-code').textContent = record.id || 'APT-0000';
  document.getElementById('popup-test-name').textContent = record.test || 'General Health Package';
  document.getElementById('popup-branch-name').textContent = record.branch || 'URL Head Office';
  document.getElementById('popup-phone-num').textContent = record.phone || 'N/A';

  modal.classList.add('active');
  if (window.feather) feather.replace();
}

function closeSuccessPopup() {
  const modal = document.getElementById('booking-success-modal');
  if (modal) modal.classList.remove('active');
}

// Scroll Reveal Animations Handler for Every Section
function setupScrollReveal() {
  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  const targets = document.querySelectorAll('.why-card, .tech-card, .process-step, .stat-card, .leader-photo-card, .doctor-card, .cert-card, .branch-photo-card, .event-cat-card, .director-chip, .head-office-card');
  targets.forEach((el, index) => {
    if (!el.style.transitionDelay && !el.style.animationDelay) {
      el.style.transitionDelay = `${(index % 4) * 0.1}s`;
    }
    observer.observe(el);
  });
}

// Smart Auto-Hide Navigation Bar on Scroll
function setupAutoHideHeader() {
  const header = document.querySelector('.main-header');
  const navMenu = document.getElementById('nav-menu');
  if (!header) return;

  let lastScrollY = window.scrollY;
  const scrollThreshold = 8;

  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;

    // Do not hide if mobile navigation menu is expanded
    if (navMenu && navMenu.classList.contains('active')) {
      header.classList.remove('nav-hidden');
      return;
    }

    // Always keep header visible near top of page
    if (currentScrollY <= 80) {
      header.classList.remove('nav-hidden');
      header.classList.remove('scrolled');
      lastScrollY = currentScrollY;
      return;
    }

    header.classList.add('scrolled');

    // Hide when scrolling down, reveal when scrolling up
    if (Math.abs(currentScrollY - lastScrollY) > scrollThreshold) {
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        header.classList.add('nav-hidden');
      } else {
        header.classList.remove('nav-hidden');
      }
      lastScrollY = currentScrollY;
    }
  }, { passive: true });
}

// Animated Stat Counter Handler
function setupStatCounters() {
  const statNumbers = document.querySelectorAll('.stat-number');
  if (!statNumbers.length || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const targetStr = el.getAttribute('data-target');
        if (!targetStr) return;

        const target = parseFloat(targetStr);
        const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
        const suffix = el.getAttribute('data-suffix') || '';
        const duration = 2200;
        const startTime = performance.now();

        function updateCounter(currentTime) {
          const elapsedTime = currentTime - startTime;
          const progress = Math.min(elapsedTime / duration, 1);
          const easeProgress = 1 - Math.pow(1 - progress, 3);
          const currentValue = (easeProgress * target).toFixed(decimals);

          el.textContent = currentValue + suffix;

          if (progress < 1) {
            requestAnimationFrame(updateCounter);
          } else {
            el.textContent = (decimals > 0 ? target.toFixed(decimals) : target) + suffix;
          }
        }

        requestAnimationFrame(updateCounter);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.25 });

  statNumbers.forEach(num => observer.observe(num));
}

// Scroll-Driven Timeline Progress Dot Movement Handler
function setupScrollTimelineDot() {
  const timeline = document.querySelector('.process-timeline');
  const dot = document.querySelector('.progress-pulse-dot');
  if (!timeline || !dot) return;

  function updateDotPosition() {
    const rect = timeline.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    // Start tracking when timeline enters viewport center
    const startPoint = viewportHeight * 0.45;
    const scrollDistance = startPoint - rect.top;
    const totalDistance = rect.height;

    let progress = scrollDistance / totalDistance;
    progress = Math.max(0, Math.min(1, progress));

    dot.style.top = `${(progress * 100).toFixed(2)}%`;
  }

  window.addEventListener('scroll', updateDotPosition, { passive: true });
  updateDotPosition();
}

// Apply Live CMS & Config Data to DOM
async function applyLiveContent() {
  try {
    const config = await fetchLiveClinicConfig();
    if (config) {
      const topPhoneEls = document.querySelectorAll('.top-info-item span');
      topPhoneEls.forEach(el => {
        if (el.textContent.includes('Tel:')) {
          el.textContent = 'Tel: ' + (config.phone || '+977-61-570503, 9856013595');
        }
      });
    }

    const templateRes = await fetch('/api/template');
    if (templateRes.ok) {
      const data = await templateRes.json();
      if (data.success && data.template) {
        const t = data.template;
        if (t.hero) {
          const badge = document.querySelector('.hero-badge');
          if (badge && t.hero.badge) badge.innerText = t.hero.badge;
          const subtitle = document.querySelector('.hero-subtitle');
          if (subtitle && t.hero.subtitle) subtitle.innerText = t.hero.subtitle;
        }
        if (t.about) {
          const aboutSubtitle = document.querySelector('#about .section-subtitle');
          if (aboutSubtitle && t.about.subtitle) aboutSubtitle.innerText = t.about.subtitle;
          const aboutTitle = document.querySelector('#about .section-title');
          if (aboutTitle && t.about.title) aboutTitle.innerText = t.about.title;
          const aboutDesc = document.querySelector('#about .section-desc');
          if (aboutDesc && t.about.desc) aboutDesc.innerText = t.about.desc;
        }
      }
    }
  } catch (err) {}
}

// Interactive 3D Holographic Mouse & Touch Parallax Tilt Engine
function setup3DTiltEffect() {
  const tiltCards = document.querySelectorAll('.doctor-card, .leader-photo-card, .branch-photo-card, .connect-form-card');

  tiltCards.forEach(card => {
    // Mouse movement 3D tilt
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((centerY - y) / centerY) * 8;
      const rotateY = ((x - centerX) / centerX) * 8;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(8px) scale(1.02)`;
      card.style.transition = 'transform 0.08s ease-out';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale(1)';
      card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
    });

    // Touch devices (Mobile / Tablet / iPad) 3D tilt & tap elevation
    card.addEventListener('touchstart', (e) => {
      if (!e.touches || !e.touches[0]) return;
      const rect = card.getBoundingClientRect();
      const touch = e.touches[0];
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((centerY - y) / centerY) * 6;
      const rotateY = ((x - centerX) / centerX) * 6;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(10px) scale(1.02)`;
      card.style.transition = 'transform 0.15s ease-out';
    }, { passive: true });

    card.addEventListener('touchend', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale(1)';
      card.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
    }, { passive: true });
  });
}

// Document Ready Initialization
document.addEventListener('DOMContentLoaded', () => {
  setupMobileMenu();
  setupAutoHideHeader();
  setupCategoryFilters();
  setupDistrictFilters();
  setupConnectForm();
  setupScrollReveal();
  setupStatCounters();
  setupScrollTimelineDot();
  setup3DTiltEffect();
  applyLiveContent();

  if (window.feather) feather.replace();

  if (window.location.hash) {
    history.replaceState(null, null, window.location.pathname);
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
