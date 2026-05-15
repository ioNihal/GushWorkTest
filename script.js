
document.addEventListener('DOMContentLoaded', () => {

  /*  Sticky Header:
     - Within hero (first fold): header stays in normal document flow
     - Scrolling DOWN past hero: header becomes fixed, slides in
     - Scrolling UP past hero: header slides out (hidden) 
     -A dynamic spacer prevents layout jumps when switching to fixed.
     */
  const mainHeader = document.getElementById('mainHeader');
  const heroSection = document.getElementById('heroSection');
  let lastScrollY = 0;

  // Spacer div: injected after header to preserve layout height
  // when header switches from relative → fixed positioning
  const headerSpacer = document.createElement('div');
  headerSpacer.style.display = 'none';
  mainHeader.parentNode.insertBefore(headerSpacer, mainHeader.nextSibling);

  function handleStickyHeader() {
    const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
    const currentScrollY = window.scrollY;
    const headerHeight = mainHeader.offsetHeight;
    const scrollingDown = currentScrollY > lastScrollY;

    if (currentScrollY <= heroBottom - headerHeight) {
      // Within hero - keep header in normal document flow
      mainHeader.classList.remove('header--sticky', 'header--hidden');
      headerSpacer.style.display = 'none';
    } else {
      // Past hero - switch to fixed positioning
      if (!mainHeader.classList.contains('header--sticky')) {
        // First transition to sticky - activate spacer to prevent content jump
        headerSpacer.style.display = 'block';
        headerSpacer.style.height = headerHeight + 'px';
        mainHeader.classList.add('header--sticky');
      }

      if (scrollingDown) {
        // Scrolling DOWN → reveal sticky header
        mainHeader.classList.remove('header--hidden');
      } else {
        // Scrolling UP → hide sticky header
        mainHeader.classList.add('header--hidden');
      }
    }

    lastScrollY = currentScrollY;
  }

  // Throttled scroll listener via requestAnimationFrame
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        handleStickyHeader();
        ticking = false;
      });
      ticking = true;
    }
  });


  /* Image Carousel:
     - Navigate slides via prev/next arrows or thumbnail clicks.
     - Wraps around at both ends.
     */
  const carouselImages = document.querySelectorAll('.hero__carousel-img');
  const thumbButtons = document.querySelectorAll('.hero__thumb');
  const prevBtn = document.getElementById('carouselPrev');
  const nextBtn = document.getElementById('carouselNext');
  let currentSlide = 0;
  const totalSlides = carouselImages.length;

  function goToSlide(index) {
    // Wrap index to loop infinitely
    if (index < 0) index = totalSlides - 1;
    if (index >= totalSlides) index = 0;
    currentSlide = index;

    // Sync active state on carousel images
    carouselImages.forEach((img, i) => {
      img.classList.toggle('active', i === currentSlide);
    });

    // Sync active state on thumbnail buttons
    thumbButtons.forEach((btn, i) => {
      btn.classList.toggle('active', i === currentSlide);
    });
  }

  prevBtn.addEventListener('click', () => goToSlide(currentSlide - 1));
  nextBtn.addEventListener('click', () => goToSlide(currentSlide + 1));

  thumbButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      goToSlide(parseInt(btn.dataset.index));
    });
  });


  /* Image Zoom on Hover:
     - Desktop only (>= 1080px). Shows a magnified preview
     - pane beside the carousel, tracking mouse position.
     */
  const carouselMain = document.getElementById('carouselMain');
  const zoomPreview = document.getElementById('zoomPreview');

  carouselMain.addEventListener('mouseenter', () => {
    // Only show zoom on desktop-width screens
    if (window.innerWidth < 1080) return;
    const activeImg = carouselMain.querySelector('.hero__carousel-img.active');
    if (!activeImg) return;
    zoomPreview.style.backgroundImage = `url(${activeImg.src})`;
    zoomPreview.classList.add('visible');
  });

  carouselMain.addEventListener('mousemove', (e) => {
    if (window.innerWidth < 1080) return;
    const rect = carouselMain.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    zoomPreview.style.backgroundPosition = `${x}% ${y}%`;
  });

  carouselMain.addEventListener('mouseleave', () => {
    zoomPreview.classList.remove('visible');
  });




  /* FAQ Accordion:
     - Only one item open at a time (auto-closes siblings).
     */
  const faqItems = document.querySelectorAll('.faq__item');

  faqItems.forEach((item) => {
    const question = item.querySelector('.faq__question');
    question.addEventListener('click', () => {
      // Close all other items (single-open accordion)
      faqItems.forEach((other) => {
        if (other !== item) {
          other.classList.remove('open');
          other.querySelector('.faq__question').setAttribute('aria-expanded', 'false');
        }
      });
      // Toggle the clicked item
      const isOpen = item.classList.toggle('open');
      question.setAttribute('aria-expanded', String(isOpen));
    });
  });


  /* Applications Carousel:
   - Slides the track left/right by one card width + gap on arrow click.
   - Clamps at both ends (no infinite loop).
*/
  const appsTrack = document.getElementById('appsTrack');
  const appsPrev = document.getElementById('appsPrev');
  const appsNext = document.getElementById('appsNext');

  if (appsTrack && appsPrev && appsNext) {
    let appsIndex = 0;

    function getAppsCardWidth() {
      const card = appsTrack.querySelector('.applications__card');
      if (!card) return 340;
      const gap = 20;
      return card.offsetWidth + gap;
    }

    function updateAppsTrack() {
      const offset = appsIndex * getAppsCardWidth();
      appsTrack.style.transform = `translateX(-${offset}px)`;
      const totalCards = appsTrack.querySelectorAll('.applications__card').length;
      const visibleCount = Math.floor(appsTrack.parentElement.offsetWidth / getAppsCardWidth());
      appsPrev.disabled = appsIndex === 0;
      appsNext.disabled = appsIndex >= totalCards - visibleCount;
      appsPrev.style.opacity = appsPrev.disabled ? '0.4' : '1';
      appsNext.style.opacity = appsNext.disabled ? '0.4' : '1';
    }

    appsPrev.addEventListener('click', () => {
      if (appsIndex > 0) { appsIndex--; updateAppsTrack(); }
    });

    appsNext.addEventListener('click', () => {
      const totalCards = appsTrack.querySelectorAll('.applications__card').length;
      const visibleCount = Math.floor(appsTrack.parentElement.offsetWidth / getAppsCardWidth());
      if (appsIndex < totalCards - visibleCount) { appsIndex++; updateAppsTrack(); }
    });

    updateAppsTrack();
  }


  /* Modals:
     - Two modals: Download Brochure & Request a Call Back.
     - Closeable via ✕ button, overlay click, or Escape key.
     */
  const downloadModal = document.getElementById('downloadModal');
  const callbackModal = document.getElementById('callbackModal');

  // Trigger buttons → Download Brochure modal
  const downloadTriggers = [
    document.getElementById('downloadDatasheetBtn'),
    document.getElementById('downloadCatalogueBtn'),
  ];

  // Trigger buttons → Request a Call Back modal
  const callbackTriggers = [
    document.getElementById('headerQuoteBtn'),
    document.getElementById('heroQuoteBtn'),
    document.getElementById('ctaQuoteBtn'),
    document.getElementById('requestSampleBtn'),
    document.getElementById('talkToSalesBtn'),
  ];

  function openModal(modal) {
    if (!modal) return;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  downloadTriggers.forEach((btn) => {
    if (btn) btn.addEventListener('click', () => openModal(downloadModal));
  });

  callbackTriggers.forEach((btn) => {
    if (btn) btn.addEventListener('click', () => openModal(callbackModal));
  });

  // Close via X button inside modal
  document.querySelectorAll('[data-close-modal]').forEach((btn) => {
    btn.addEventListener('click', () => {
      closeModal(downloadModal);
      closeModal(callbackModal);
    });
  });

  // Close on overlay (backdrop) click
  [downloadModal, callbackModal].forEach((modal) => {
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal(modal);
      });
    }
  });

  // Close on Escape key press
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal(downloadModal);
      closeModal(callbackModal);
    }
  });

  // "View Technical Specs" scrolls to specs section
  const heroTechBtn = document.getElementById('heroTechBtn');
  const specsSection = document.getElementById('specsSection');
  if (heroTechBtn && specsSection) {
    heroTechBtn.addEventListener('click', () => {
      specsSection.scrollIntoView({ behavior: 'smooth' });
    });
  }


  /* Mobile Nav Toggle:
     - Hamburger button toggles the .open class on nav.
     */
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mainNav = document.getElementById('mainNav');

  hamburgerBtn.addEventListener('click', () => {
    mainNav.classList.toggle('open');
  });


  /* Process Step Tabs:
   - Tab buttons switch the visible panel.
   - Image arrows inside each panel also navigate between tabs.
*/
  const processSteps = document.querySelectorAll('.process__step');
  const processPanels = document.querySelectorAll('.process__panel');
  const totalProcessSteps = processSteps.length;
  let currentProcessStep = 0;

  function goToProcessStep(index) {
    if (index < 0) index = 0;
    if (index >= totalProcessSteps) index = totalProcessSteps - 1;
    currentProcessStep = index;

    processSteps.forEach((s, i) => s.classList.toggle('active', i === index));
    processPanels.forEach((p, i) => p.classList.toggle('active', i === index));

    // Scroll active tab into view
    const activeTab = processSteps[index];
    activeTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });

    // Update arrow disabled states
    document.querySelectorAll('.process__img-arrow--prev').forEach(btn => {
      btn.disabled = currentProcessStep === 0;
    });
    document.querySelectorAll('.process__img-arrow--next').forEach(btn => {
      btn.disabled = currentProcessStep === totalProcessSteps - 1;
    });
  }

  processSteps.forEach((step, i) => {
    step.addEventListener('click', () => goToProcessStep(i));
  });

  document.querySelectorAll('.process__img-arrow').forEach(btn => {
    btn.addEventListener('click', () => {
      const dir = parseInt(btn.dataset.dir);
      goToProcessStep(currentProcessStep + dir);
    });
  });

  // Init arrow states
  goToProcessStep(0);

});
