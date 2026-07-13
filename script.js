// ==========================================================================
// CONFIGURATION: PRICING & OPTIONS
// ==========================================================================
const CONFIG = {
  sizes: {
    6: { price: 1450, oldPrice: 1950 },
    15: { price: 2800, oldPrice: 3390 }
  },
  shipping: {
    insideDhaka: 60,
    outsideDhaka: 120,
    freeThresholdSize: 15 // Bottles of this size (and above) get free shipping
  },
  brandName: "Hibran"
};

// ==========================================================================
// INTERACTIVE PRICING & DELIVERY CALCULATOR
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const sizeCards = document.querySelectorAll('.size-option-card');
  const shipInsideBtn = document.getElementById('shipInside');
  const shipOutsideBtn = document.getElementById('shipOutside');
  const selectedSizeInput = document.getElementById('selectedSize');
  const shippingCostInput = document.getElementById('shippingCostVal');
  
  // Summary Elements
  const summarySize = document.getElementById('summarySize');
  const summaryProductPrice = document.getElementById('summaryProductPrice');
  const summaryShippingPrice = document.getElementById('summaryShippingPrice');
  const summaryTotalPrice = document.getElementById('summaryTotalPrice');
  const shippingRow = document.getElementById('shippingRow');

  // Sticky CTA Elements
  const stickyMainText = document.querySelector('.sticky-main-text');

  // Initial State variables
  let currentSize = 6;
  let currentProductPrice = CONFIG.sizes[currentSize].price;
  let shippingCost = CONFIG.shipping.insideDhaka;

  // Update Summary values in DOM
  function updateSummary() {
    let finalShipping = shippingCost;
    
    // Check if free shipping threshold met
    if (currentSize >= CONFIG.shipping.freeThresholdSize) {
      finalShipping = 0;
      summaryShippingPrice.textContent = 'Free';
      if (shippingRow) shippingRow.classList.add('free-shipping');
    } else {
      summaryShippingPrice.textContent = `৳${finalShipping}`;
      if (shippingRow) shippingRow.classList.remove('free-shipping');
    }

    const total = currentProductPrice + finalShipping;
    
    // DOM Updates
    if (summarySize) summarySize.textContent = currentSize;
    if (summaryProductPrice) summaryProductPrice.textContent = currentProductPrice;
    if (summaryTotalPrice) summaryTotalPrice.textContent = total;

    // Update floating bottom bar price description dynamically
    if (stickyMainText) {
      stickyMainText.textContent = `Dior Sauvage Decant (${currentSize}ml) • ৳${currentProductPrice}`;
    }
  }

  // Sizing click handler
  sizeCards.forEach(card => {
    card.addEventListener('click', () => {
      // Update variables
      currentSize = parseInt(card.getAttribute('data-size'));
      currentProductPrice = CONFIG.sizes[currentSize].price;
      selectedSizeInput.value = currentSize;

      // Remove active class from all sizing cards
      sizeCards.forEach(c => c.classList.remove('active'));
      
      // Add active class to all matching cards (syncs desktop & mobile)
      document.querySelectorAll(`.size-option-card[data-size="${currentSize}"]`).forEach(c => {
        c.classList.add('active');
      });

      // Update Summary UI
      updateSummary();
    });
  });

  // Shipping Inside click handler
  if (shipInsideBtn) {
    shipInsideBtn.addEventListener('click', () => {
      shipInsideBtn.classList.add('active');
      if (shipOutsideBtn) shipOutsideBtn.classList.remove('active');
      shippingCost = CONFIG.shipping.insideDhaka;
      shippingCostInput.value = CONFIG.shipping.insideDhaka;
      updateSummary();
    });
  }

  // Shipping Outside click handler
  if (shipOutsideBtn) {
    shipOutsideBtn.addEventListener('click', () => {
      shipOutsideBtn.classList.add('active');
      if (shipInsideBtn) shipInsideBtn.classList.remove('active');
      shippingCost = CONFIG.shipping.outsideDhaka;
      shippingCostInput.value = CONFIG.shipping.outsideDhaka;
      updateSummary();
    });
  }

  // Set initial state value to inputs
  selectedSizeInput.value = currentSize;
  shippingCostInput.value = shippingCost;
  updateSummary();

  // ==========================================================================
  // SCROLL REVEAL ANIMATIONS
  // ==========================================================================
  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-active');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => {
    revealObserver.observe(el);
  });

  // ==========================================================================
  // FORM VALIDATION & SIMULATION
  // ==========================================================================
  const orderForm = document.getElementById('orderForm');
  const checkoutCard = document.getElementById('checkout-form-container');
  const successOverlay = document.getElementById('successOverlay');
  const successOrderId = document.getElementById('successOrderId');
  const btnSuccessClose = document.getElementById('btnSuccessClose');

  if (orderForm) {
    orderForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Inputs
      const nameInput = document.getElementById('userName');
      const phoneInput = document.getElementById('userPhone');
      const addressInput = document.getElementById('userAddress');

      let isValid = true;

      // Reset border styles
      [nameInput, phoneInput, addressInput].forEach(input => {
        if (input) input.style.borderColor = 'rgba(15, 46, 90, 0.15)';
      });

      // Name Validation
      if (!nameInput || !nameInput.value.trim()) {
        if (nameInput) nameInput.style.borderColor = '#ef4444';
        isValid = false;
      }

      // Phone Validation (BD format starts with 01, length 11 digits)
      if (phoneInput) {
        const phoneNum = phoneInput.value.trim().replace(/[\s-+]/g, '');
        const cleanPhone = phoneNum.startsWith('88') ? phoneNum.slice(2) : phoneNum;
        
        if (!cleanPhone || cleanPhone.length !== 11 || !cleanPhone.startsWith('01')) {
          phoneInput.style.borderColor = '#ef4444';
          isValid = false;
        }
      } else {
        isValid = false;
      }

      // Address Validation
      if (!addressInput || !addressInput.value.trim() || addressInput.value.trim().length < 5) {
        if (addressInput) addressInput.style.borderColor = '#ef4444';
        isValid = false;
      }

      if (!isValid) {
        // Shake form on error
        if (checkoutCard) {
          checkoutCard.classList.add('form-shake');
          setTimeout(() => {
            checkoutCard.classList.remove('form-shake');
          }, 300);
        }
        return;
      }

      // Generate order ID
      const randomNum = Math.floor(10000 + Math.random() * 90000);
      const orderId = `HB-${randomNum}`;

      // Build WhatsApp message content
      let finalShipping = shippingCost;
      if (currentSize >= CONFIG.shipping.freeThresholdSize) {
        finalShipping = 0;
      }
      const totalBill = currentProductPrice + finalShipping;

      const whatsappMsg = `আসসালামু আলাইকুম। আমি ওয়েবসাইট থেকে একটি অর্ডার করেছি।\n\n` +
                          `📦 *অর্ডার আইডি:* ${orderId}\n` +
                          `👤 *নাম:* ${nameInput.value.trim()}\n` +
                          `📞 *ফোন নম্বর:* ${phoneInput.value.trim()}\n` +
                          `📍 *ডেলিভারি ঠিকানা:* ${addressInput.value.trim()}\n` +
                          `🧪 *প্রোডাক্ট:* Dior Sauvage Decant (${currentSize}ml)\n` +
                          `💵 *মোট বিল:* ৳${totalBill} (শিপিং চার্জসহ)`;

      const encodedMsg = encodeURIComponent(whatsappMsg);
      const whatsappUrl = `https://wa.me/8801831160939?text=${encodedMsg}`;

      // Link to WhatsApp button in success modal
      const btnWhatsAppSummary = document.getElementById('btnWhatsAppSummary');
      if (btnWhatsAppSummary) {
        btnWhatsAppSummary.href = whatsappUrl;
      }

      // Open success modal
      if (successOrderId) successOrderId.textContent = orderId;
      if (successOverlay) successOverlay.classList.add('active');

      // Trigger Confetti
      createConfetti();

      // Reset form
      orderForm.reset();
      
      // Reset sizing to default (6ml)
      if (sizeCards[0]) {
        sizeCards[0].click();
      }
    });
  }

  // Success Modal close events
  if (btnSuccessClose) {
    btnSuccessClose.addEventListener('click', () => {
      if (successOverlay) successOverlay.classList.remove('active');
    });
  }

  if (successOverlay) {
    successOverlay.addEventListener('click', (e) => {
      if (e.target === successOverlay) {
        successOverlay.classList.remove('active');
      }
    });
  }

  // ==========================================================================
  // CONFETTI EFFECT ENGINE (VANILLA JS)
  // ==========================================================================
  function createConfetti() {
    const container = document.body;
    const colors = ['#d4af37', '#f3cf55', '#0f2e5a', '#1e427b', '#ffffff', '#4ade80'];
    const confettiCount = 80;

    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      
      confetti.style.position = 'fixed';
      confetti.style.width = Math.random() * 8 + 6 + 'px';
      confetti.style.height = Math.random() * 15 + 8 + 'px';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.left = Math.random() * 100 + 'vw';
      confetti.style.top = -20 + 'px';
      confetti.style.opacity = Math.random() * 0.7 + 0.3;
      confetti.style.borderRadius = '2px';
      confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
      confetti.style.zIndex = '9999';
      confetti.style.pointerEvents = 'none';
      
      const speed = Math.random() * 2 + 1.8;
      confetti.style.transition = `transform ${speed}s linear, top ${speed}s linear, opacity ${speed}s ease-out`;
      
      container.appendChild(confetti);
      
      setTimeout(() => {
        confetti.style.top = '105vh';
        confetti.style.transform = `rotate(${Math.random() * 720}deg) translateX(${Math.random() * 120 - 60}px)`;
        confetti.style.opacity = '0';
      }, 50);
      
      setTimeout(() => {
        confetti.remove();
      }, speed * 1000 + 100);
    }
  }

  // ==========================================================================
  // FLOATING STICKY CTA SCROLL CONTROLLER
  // ==========================================================================
  const stickyCta = document.getElementById('stickyCta');
  const heroSection = document.querySelector('.hero');

  if (stickyCta && checkoutCard && heroSection) {
    const handleStickyVisibility = () => {
      const checkoutRect = checkoutCard.getBoundingClientRect();
      const isNearCheckout = checkoutRect.top < window.innerHeight && checkoutRect.bottom > 0;
      
      if (!isNearCheckout) {
        stickyCta.classList.add('visible');
      } else {
        stickyCta.classList.remove('visible');
      }
    };

    window.addEventListener('scroll', handleStickyVisibility);
    handleStickyVisibility(); // Run on load
  }
});
