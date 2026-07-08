/* ========================================
   FRIENDS OF CROSS — Main JavaScript
   ======================================== */

document.addEventListener('DOMContentLoaded', function () {

  // ---- Navbar scroll behaviour ----
  const navbar = document.getElementById('navbar');
  const donationWidget = document.getElementById('donationWidget');

  function handleScroll() {
    const scrollY = window.scrollY;
    navbar.classList.toggle('scrolled', scrollY > 50);
    if (donationWidget) {
      donationWidget.classList.toggle('visible', scrollY > 600);
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // ---- Mobile nav toggle ----
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      navToggle.classList.toggle('open');
      navLinks.classList.toggle('open');
    });

    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navToggle.classList.remove('open');
        navLinks.classList.remove('open');
      });
    });
  }

  // ---- Active nav link highlight on scroll ----
  const sections = document.querySelectorAll('section[id]');
  const navLinkElements = document.querySelectorAll('.nav-links a');

  function highlightNav() {
    const scrollY = window.scrollY + 100;
    sections.forEach(function (section) {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      if (scrollY >= top && scrollY < top + height) {
        navLinkElements.forEach(function (link) {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + id) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', highlightNav, { passive: true });

  // ---- Donation widget amount buttons ----
  function setupAmountButtons(containerSelector, inputSelector) {
    var container = document.querySelector(containerSelector);
    var input = document.querySelector(inputSelector);
    if (!container) return;

    container.querySelectorAll('button[data-amount], .amount-btn, .donate-amount-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        container.querySelectorAll('button[data-amount], .amount-btn, .donate-amount-btn').forEach(function (b) {
          b.classList.remove('active');
        });
        btn.classList.add('active');
        if (input) input.value = '';
      });
    });

    if (input) {
      input.addEventListener('focus', function () {
        container.querySelectorAll('button[data-amount], .amount-btn, .donate-amount-btn').forEach(function (b) {
          b.classList.remove('active');
        });
      });
    }
  }

  setupAmountButtons('.donation-widget-body', '#customAmount');
  setupAmountButtons('.donate-amounts-section', '#donateCustomAmount');

  // ---- Contact form (placeholder handling) ----
  var contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = document.getElementById('contactName').value;
      alert('Thank you, ' + name + '! Your message has been received. A member of our team will be in touch shortly.');
      contactForm.reset();
    });
  }

  // ========================================
  // HOPE CHATBOT — Full Rewrite
  // ========================================

  var chatbot = document.getElementById('chatbot');
  var chatbotToggle = document.getElementById('chatbotToggle');
  var chatbotClose = document.getElementById('chatbotClose');
  var chatbotMessages = document.getElementById('chatbotMessages');
  var chatbotForm = document.getElementById('chatbotForm');
  var chatbotInput = document.getElementById('chatbotInput');

  // ---- Toggle chatbot ----
  function toggleChatbot() {
    chatbot.classList.toggle('open');
    if (chatbot.classList.contains('open')) {
      chatbotInput.focus();
    }
  }

  chatbotToggle.addEventListener('click', toggleChatbot);
  chatbotClose.addEventListener('click', toggleChatbot);

  // ---- Auto-open after 4 seconds ----
  setTimeout(function () {
    if (!chatbot.classList.contains('open')) {
      chatbot.classList.add('open');
    }
  }, 4000);

  // ========================================
  // Hope chatbot — proxied to Anthropic API via Cloudflare Worker
  // Configure WORKER_URL to your deployed Worker endpoint.
  // ========================================

  var WORKER_URL = 'YOUR_WORKER_URL';

  async function findAnswer(userMessage) {
    try {
      var response = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });
      if (!response.ok) {
        return "Sorry — I'm having trouble reaching my brain just now. Please try again in a moment, or email <a href=\"mailto:info@crosscharity.ie\" style=\"color: var(--color-accent); font-weight: 600;\">info@crosscharity.ie</a>.";
      }
      var data = await response.json();
      return data.reply || "Sorry, I didn't quite catch that. Could you rephrase?";
    } catch (err) {
      return "Sorry — I'm having trouble connecting right now. Please try again, or email <a href=\"mailto:info@crosscharity.ie\" style=\"color: var(--color-accent); font-weight: 600;\">info@crosscharity.ie</a>.";
    }
  }

  // ========================================
  // Chat UI Functions
  // ========================================

  function addMessage(text, sender) {
    var messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message ' + sender;
    var bubble = document.createElement('div');
    bubble.className = 'chat-bubble';
    bubble.innerHTML = text;
    messageDiv.appendChild(bubble);
    chatbotMessages.appendChild(messageDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
  }

  function showTyping() {
    var messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message bot';
    messageDiv.id = 'typingIndicator';
    var bubble = document.createElement('div');
    bubble.className = 'chat-bubble';
    bubble.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';
    messageDiv.appendChild(bubble);
    chatbotMessages.appendChild(messageDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
  }

  function removeTyping() {
    var indicator = document.getElementById('typingIndicator');
    if (indicator) indicator.remove();
  }

  async function sendMessage(text) {
    if (!text.trim()) return;

    addMessage(text, 'user');
    showTyping();

    // Vary delay: 1000–2000ms, longer for longer responses
    var answer = await findAnswer(text);
    var baseDelay = 1000 + Math.random() * 600;
    var lengthBonus = Math.min(answer.length / 3, 400);
    var delay = baseDelay + lengthBonus;

    setTimeout(function () {
      removeTyping();
      addMessage(answer, 'bot');
    }, delay);
  }

  // Form submission
  chatbotForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var text = chatbotInput.value;
    chatbotInput.value = '';
    sendMessage(text);
  });

  // ---- Smooth scroll for anchor links (fallback) ----
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        var offset = navbar.offsetHeight + 16;
        var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });

  // ---- Simple scroll reveal animation ----
  var revealElements = document.querySelectorAll(
    '.about-grid, .about-video, .friends-subsection, .impact-stat, .equipment-card, ' +
    '.event-card, .event-gallery .gallery-img, .testimonial-card, ' +
    '.involved-card, .team-card, .donate-content, .contact-grid'
  );

  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  revealElements.forEach(function (el) {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    revealObserver.observe(el);
  });

  var style = document.createElement('style');
  style.textContent = '.revealed { opacity: 1 !important; transform: translateY(0) !important; }';
  document.head.appendChild(style);

});
