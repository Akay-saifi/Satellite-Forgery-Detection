// Configuration
const config = {
    scrollOffset: 80,
    animationThreshold: 0.8
  };
  
  // DOM Elements
  const dom = {
    hamburger: document.querySelector('.hamburger'),
    navLinks: document.querySelector('.nav-links'),
    satelliteOrbit: document.querySelector('.satellite-orbit'),
    aiChip: document.querySelector('.ai-chip'),
    heroSection: document.querySelector('.hero'),
    newsletterForm: document.querySelector('.footer-newsletter form')
  };
  
  // Initialize the app
  function init() {
    setupMobileNavigation();
    setupSmoothScrolling();
    setupAnimations();
    setupSatelliteInteractions();
    setupNewsletterForm();
    createScrollToTopButton();
  }
  
  // Mobile Navigation
  function setupMobileNavigation() {
    if (!dom.hamburger || !dom.navLinks) return;
  
    dom.hamburger.addEventListener('click', () => {
      dom.navLinks.classList.toggle('active');
      dom.hamburger.classList.toggle('active');
      document.body.classList.toggle('nav-active');
    });
  }
  
  // Smooth Scrolling
  function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#' || !targetId) return;
  
        e.preventDefault();
        const target = document.querySelector(targetId);
        if (target) {
          window.scrollTo({
            top: target.offsetTop - config.scrollOffset,
            behavior: 'smooth'
          });
  
          // Close mobile menu if open
          if (dom.navLinks.classList.contains('active')) {
            dom.navLinks.classList.remove('active');
            dom.hamburger.classList.remove('active');
          }
        }
      });
    });
  }
  
  // Animations on Scroll
  function setupAnimations() {
    const animateElements = () => {
      document.querySelectorAll('.feature-card, .step, .sector-item').forEach(el => {
        const rect = el.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight * config.animationThreshold;
        if (isVisible) el.classList.add('animate');
      });
    };
  
    const debouncedAnimate = debounce(animateElements, 100);
    window.addEventListener('scroll', debouncedAnimate);
    animateElements(); // Initial check
  }
  
  // Satellite Interactions
  function setupSatelliteInteractions() {
    if (!dom.satelliteOrbit) return;
  
    let isOrbitPaused = false;
    const satellite = dom.satelliteOrbit.querySelector('.satellite');
  
    const toggleOrbit = () => {
      isOrbitPaused = !isOrbitPaused;
      dom.satelliteOrbit.style.animationPlayState = isOrbitPaused ? 'paused' : 'running';
      satellite.style.animationPlayState = isOrbitPaused ? 'paused' : 'running';
    };
  
    dom.satelliteOrbit.addEventListener('mouseenter', () => !isOrbitPaused && toggleOrbit());
    dom.satelliteOrbit.addEventListener('mouseleave', () => !isOrbitPaused && toggleOrbit());
    dom.satelliteOrbit.addEventListener('click', toggleOrbit);
  }
  
  // Newsletter Form
  function setupNewsletterForm() {
    if (!dom.newsletterForm) return;
  
    dom.newsletterForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const emailInput = dom.newsletterForm.querySelector('input[type="email"]');
      
      if (!validateEmail(emailInput.value)) {
        showFormError(emailInput, 'Please enter a valid email');
        return;
      }
  
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        showFormSuccess(dom.newsletterForm);
      } catch (error) {
        showFormError(emailInput, 'Subscription failed. Please try again.');
      }
    });
  }
  
  // Helper Functions
  function debounce(func, wait) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }
  
  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
  
  function showFormError(input, message) {
    const errorElement = input.nextElementSibling || document.createElement('div');
    errorElement.className = 'form-error';
    errorElement.textContent = message;
    input.classList.add('error');
    input.after(errorElement);
    setTimeout(() => input.classList.remove('error'), 2000);
  }
  
  function showFormSuccess(form) {
    form.innerHTML = `
      <div class="form-success">
        <i class="fas fa-check-circle"></i>
        <p>Thank you for subscribing!</p>
      </div>
    `;
  }
  
  function createScrollToTopButton() {
    const btn = document.createElement('button');
    btn.className = 'scroll-to-top';
    btn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    btn.ariaLabel = 'Scroll to top';
    document.body.appendChild(btn);
  
    window.addEventListener('scroll', () => {
      btn.classList.toggle('show', window.scrollY > 300);
    });
  
    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
  
  // Initialize
  document.addEventListener('DOMContentLoaded', init);