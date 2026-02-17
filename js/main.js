/* ========================================
   FRIENDS OF CROSS — Main JavaScript
   ======================================== */

document.addEventListener('DOMContentLoaded', function () {

  // ---- Navbar scroll behaviour ----
  const navbar = document.getElementById('navbar');
  const donationWidget = document.getElementById('donationWidget');

  function handleScroll() {
    const scrollY = window.scrollY;
    // Add scrolled class to navbar
    navbar.classList.toggle('scrolled', scrollY > 50);
    // Show donation widget after scrolling past hero
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

    // Close mobile nav on link click
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
  // CHATBOT
  // ========================================

  var chatbot = document.getElementById('chatbot');
  var chatbotToggle = document.getElementById('chatbotToggle');
  var chatbotClose = document.getElementById('chatbotClose');
  var chatbotMessages = document.getElementById('chatbotMessages');
  var chatbotForm = document.getElementById('chatbotForm');
  var chatbotInput = document.getElementById('chatbotInput');
  var chatbotSuggestions = document.getElementById('chatbotSuggestions');

  // Toggle chatbot open/close
  function toggleChatbot() {
    chatbot.classList.toggle('open');
    if (chatbot.classList.contains('open')) {
      chatbotInput.focus();
    }
  }

  chatbotToggle.addEventListener('click', toggleChatbot);
  chatbotClose.addEventListener('click', toggleChatbot);

  // ---- Chatbot Knowledge Base ----
  var chatbotKB = [
    {
      keywords: ['what', 'cross', 'do', 'about', 'mission', 'who', 'are you', 'what is'],
      answer: 'Friends of CROSS (Cancer Research Oncology Surgery Support) raises vital funds to support cancer research and improve patient care across Ireland. We work closely with the Trinity St James Cancer Institute and St. James\'s Hospital, funding state-of-the-art laboratory equipment and supporting the education and training of medical students. Our work focuses on translational research projects aimed at the prevention, understanding, and treatment of various forms of cancer. We are a registered charity in Ireland (Charity Number 15364).'
    },
    {
      keywords: ['donate', 'donation', 'give', 'contribute', 'money', 'pay', 'support financially'],
      answer: 'Thank you for your interest in donating! You can donate directly through our website — just click the "Donate Now" button or scroll to the Donate section. If you want to donate, you can do it directly through me! We accept donations via our secure Stripe payment link. You can make a one-time donation or set up regular contributions. Every euro makes a crucial difference to the future of cancer research. <a href="#donate" style="color: #3AA0E8; font-weight: 600;">Click here to donate now</a>.'
    },
    {
      keywords: ['where', 'donations go', 'money go', 'funds go', 'spent', 'use'],
      answer: 'Your donations go directly towards supporting cancer research at Trinity College Dublin\'s Dept. of Surgery at St. James\'s Hospital. Specifically, funds are used to purchase cutting-edge cancer research equipment (we\'ve raised over \u20AC1 million to date), support the education and training of medical students, and drive translational research projects aimed at preventing and treating various forms of cancer. Equipment funded includes flow cytometers, tissue microarrayers, cryostats, and PCR thermal cyclers.'
    },
    {
      keywords: ['research', 'fund', 'projects', 'equipment', 'science', 'study'],
      answer: 'CROSS funds translational research projects at the Trinity College Dublin Dept. of Surgery at St. James\'s Hospital. To date, over \u20AC1 million has been raised to purchase cutting-edge equipment including: Flow Cytometers (for cell analysis), Tissue Microarrayers (for tissue sample analysis), Cryostats (for tissue section preparation), and PCR Thermal Cyclers (for DNA research). This equipment is essential for ongoing research into the prevention, understanding, and treatment of cancer.'
    },
    {
      keywords: ['volunteer', 'help', 'involved', 'get involved', 'participate', 'join'],
      answer: 'There are many ways to get involved with CROSS! You can: volunteer your time and skills for events and campaigns, participate in fundraising events like our Charity Boxing Nights and Golf Classic, spread awareness on social media and in your community, or explore corporate sponsorship opportunities. To learn more, fill out our <a href="#contact" style="color: #3AA0E8; font-weight: 600;">Contact Us form</a> and a team member will be in touch!'
    },
    {
      keywords: ['event', 'events', 'boxing', 'golf', 'fundrais'],
      answer: 'Friends of CROSS runs exciting events throughout the year! Key events include our Charity Boxing Nights (great fun for all skill levels) and the CROSS Golf Classic in the summer. We also welcome people who want to organise their own events in support of our work. Check the <a href="#events" style="color: #3AA0E8; font-weight: 600;">Events section</a> for more details or <a href="#contact" style="color: #3AA0E8; font-weight: 600;">get in touch</a> to learn about upcoming events.'
    },
    {
      keywords: ['board', 'team', 'member', 'who runs', 'people', 'staff'],
      answer: 'The Friends of CROSS Board includes: James O\'Connor (Chair), John Reynolds (Trinity & St James\' Rep), Conor Headon, Sean Headon, Patrick Headon, Tom Conachy, Ben English, and Philip Smith. They are a dedicated group of individuals who commit their time to creating and supporting initiatives to raise money for cancer research.'
    },
    {
      keywords: ['contact', 'reach', 'email', 'address', 'phone', 'location', 'where'],
      answer: 'You can reach Friends of CROSS at: <br><strong>Address:</strong> Trinity College Dublin, Dept. of Surgery, St. James\'s Hospital, Dublin 8, Ireland<br><strong>Email:</strong> info@crosscharity.ie<br>You can also fill out our <a href="#contact" style="color: #3AA0E8; font-weight: 600;">Contact Us form</a> and a member of the team will get back to you.'
    },
    {
      keywords: ['charity', 'number', 'registered', 'legitimate', 'legal', 'tax'],
      answer: 'Yes, Friends of CROSS is a fully registered charity in Ireland. Our Charity Number is 15364. All donations go directly towards supporting cancer research at Trinity College Dublin and St. James\'s Hospital.'
    },
    {
      keywords: ['corporate', 'sponsor', 'partnership', 'company', 'business'],
      answer: 'We are always open to working with corporate partners across our events. Corporate sponsorship with CROSS is a great opportunity to bring teams together while supporting a worthwhile cause. Please <a href="#contact" style="color: #3AA0E8; font-weight: 600;">contact us</a> to discuss partnership opportunities.'
    },
    {
      keywords: ['stripe', 'payment', 'secure', 'safe'],
      answer: 'We use Stripe for secure payment processing. Stripe is one of the world\'s most trusted payment platforms, ensuring your donation details are safe and secure. If you want to donate, you can do it directly through me! <a href="#donate" style="color: #3AA0E8; font-weight: 600;">Click here to go to our donation page</a>.'
    },
    {
      keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'],
      answer: 'Hello! Welcome to Friends of CROSS. I\'m here to help answer any questions you might have about our charity, how to donate, our research, or how to get involved. What would you like to know?'
    },
    {
      keywords: ['thank', 'thanks', 'cheers'],
      answer: 'You\'re very welcome! If you have any other questions, feel free to ask. And thank you for your interest in supporting cancer research in Ireland!'
    },
    {
      keywords: ['trinity', 'james', 'hospital', 'institute'],
      answer: 'Friends of CROSS works closely with the Trinity St James Cancer Institute and St. James\'s Hospital in Dublin. Our funding supports the Department of Surgery at Trinity College Dublin, based at St. James\'s Hospital, where cutting-edge cancer research takes place. The equipment we fund is essential for the department\'s ongoing translational research programmes.'
    }
  ];

  // Find the best matching answer
  function findAnswer(question) {
    var q = question.toLowerCase().trim();
    var bestMatch = null;
    var bestScore = 0;

    for (var i = 0; i < chatbotKB.length; i++) {
      var entry = chatbotKB[i];
      var score = 0;
      for (var j = 0; j < entry.keywords.length; j++) {
        if (q.indexOf(entry.keywords[j]) !== -1) {
          score += entry.keywords[j].length; // Longer keyword matches score higher
        }
      }
      if (score > bestScore) {
        bestScore = score;
        bestMatch = entry;
      }
    }

    if (bestScore > 0 && bestMatch) {
      return bestMatch.answer;
    }

    return 'I\'m not sure about that specific question, but I\'d love to help! You can ask me about what CROSS does, how to donate, where donations go, our research, events, volunteering, or our team. For more detailed queries, please <a href="#contact" style="color: #3AA0E8; font-weight: 600;">contact our team directly</a>.';
  }

  // Add a message to the chat window
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

  // Show typing indicator
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

  // Handle sending a message
  function sendMessage(text) {
    if (!text.trim()) return;

    // Add user message
    addMessage(text, 'user');

    // Hide suggestions after first interaction
    if (chatbotSuggestions) {
      chatbotSuggestions.style.display = 'none';
    }

    // Show typing indicator
    showTyping();

    // Simulate response delay
    setTimeout(function () {
      removeTyping();
      var answer = findAnswer(text);
      addMessage(answer, 'bot');
    }, 800 + Math.random() * 600);
  }

  // Form submission
  chatbotForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var text = chatbotInput.value;
    chatbotInput.value = '';
    sendMessage(text);
  });

  // Suggestion buttons
  chatbotSuggestions.querySelectorAll('.suggestion-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      sendMessage(btn.getAttribute('data-question'));
    });
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
    '.about-grid, .friends-subsection, .impact-stat, .equipment-card, ' +
    '.event-card, .involved-card, .team-card, .donate-content, .contact-grid'
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

  // Add revealed styles via a style element
  var style = document.createElement('style');
  style.textContent = '.revealed { opacity: 1 !important; transform: translateY(0) !important; }';
  document.head.appendChild(style);

});
