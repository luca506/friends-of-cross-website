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

  // ---- Session state ----
  var sessionContext = { lastIntent: null };
  var sessionHistory = {};  // { intentKey: timesAnswered }
  var responseIndex = {};   // { intentKey: nextVariantIndex }

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
  // LAYER 1 — Input Normalisation
  // ========================================

  var contractions = {
    "don't": 'do not', "doesn't": 'does not', "didn't": 'did not',
    "can't": 'can not', "couldn't": 'could not', "won't": 'will not',
    "wouldn't": 'would not', "shouldn't": 'should not', "isn't": 'is not',
    "aren't": 'are not', "wasn't": 'was not', "weren't": 'were not',
    "haven't": 'have not', "hasn't": 'has not', "hadn't": 'had not',
    "i'm": 'i am', "i've": 'i have', "i'll": 'i will', "i'd": 'i would',
    "you're": 'you are', "you've": 'you have', "you'll": 'you will', "you'd": 'you would',
    "we're": 'we are', "we've": 'we have', "we'll": 'we will', "we'd": 'we would',
    "they're": 'they are', "they've": 'they have', "they'll": 'they will', "they'd": 'they would',
    "he's": 'he is', "she's": 'she is', "it's": 'it is',
    "that's": 'that is', "there's": 'there is', "here's": 'here is',
    "what's": 'what is', "who's": 'who is', "where's": 'where is',
    "how's": 'how is', "let's": 'let us'
  };

  var fillerPhrases = [
    'can you', 'could you', 'tell me', 'i want to know', 'i would like to know',
    'do you know', 'would you', 'i am wondering', 'i was wondering',
    'may i ask', 'let me know', 'i am curious'
  ];

  var fillerWords = ['um', 'uh', 'like', 'just', 'please', 'actually', 'basically', 'literally', 'well', 'so', 'okay', 'ok', 'right'];

  function normalise(text) {
    var s = text.toLowerCase().trim();
    // Strip punctuation except apostrophes (for contractions)
    s = s.replace(/[^\w\s']/g, ' ');
    // Expand contractions
    Object.keys(contractions).forEach(function (key) {
      s = s.replace(new RegExp('\\b' + key.replace("'", "\\'") + '\\b', 'g'), contractions[key]);
    });
    // Remove filler phrases (longer first)
    fillerPhrases.forEach(function (phrase) {
      s = s.replace(new RegExp('\\b' + phrase + '\\b', 'g'), ' ');
    });
    // Remove filler words
    fillerWords.forEach(function (word) {
      s = s.replace(new RegExp('\\b' + word + '\\b', 'g'), ' ');
    });
    // Collapse whitespace
    return s.replace(/\s+/g, ' ').trim();
  }

  // ========================================
  // KNOWLEDGE BASE — organised by intent
  // ========================================

  var chatbotKB = {

    greeting: {
      triggers: {
        exact: ['hello', 'hi', 'hey', 'hiya', 'howdy', 'good morning', 'good afternoon', 'good evening', 'greetings'],
        partial: ['hello', 'hi there'],
        keywords: ['hello', 'hi', 'hey', 'morning', 'afternoon', 'evening']
      },
      responses: [
        'Hi there! I\'m Hope, your friendly guide to Friends of CROSS. I\'d love to help you learn about our cancer research work, upcoming events, or how you can get involved. What\'s on your mind?',
        'Hello! Welcome \u2014 I\'m Hope. Whether you\'re curious about our charity, want to donate, or just want to chat about what we do, I\'m here for you. What would you like to know?',
        'Hey! Great to see you here. I\'m Hope, and I know a thing or two about Friends of CROSS. Ask me anything about our research, events, donations, or how to get involved!'
      ],
      followUp: 'Is there something specific I can help you with? I can tell you about our research, events, how to donate, or how to volunteer \u2014 whatever interests you most!'
    },

    thanks: {
      triggers: {
        exact: ['thank you', 'thanks', 'cheers', 'ta', 'appreciate it', 'thank you so much'],
        partial: ['thank', 'cheers', 'appreciate'],
        keywords: ['thank', 'thanks', 'cheers', 'appreciate', 'grateful']
      },
      responses: [
        'You\'re so welcome! If anything else comes to mind, I\'m right here. And thank you for your interest in supporting cancer research in Ireland \u2014 it really does mean the world.',
        'Happy to help! Don\'t hesitate to ask if you think of anything else. Your support and curiosity about our work genuinely makes a difference.',
        'Not at all \u2014 that\'s what I\'m here for! If you\'d like to learn more or get involved, I\'m always just a message away.'
      ],
      followUp: 'Is there anything else I can help with? I\'m always happy to chat about what CROSS is up to!'
    },

    about: {
      triggers: {
        exact: ['what is cross', 'who are you', 'tell me about cross', 'what do you do', 'what does cross do', 'about cross', 'what is friends of cross'],
        partial: ['what is', 'who are', 'about', 'mission', 'purpose', 'charity', 'explain', 'overview'],
        keywords: ['cross', 'about', 'mission', 'purpose', 'charity', 'what', 'who', 'organisation', 'organization']
      },
      responses: [
        'CROSS is a registered Irish charity supporting cancer research and improved patient care at the Trinity Translational Medicine Institute, Trinity College Dublin, and St. James\'s Hospital. Friends of CROSS is our fundraising arm \u2014 a voluntary group that raises cancer awareness across Ireland and funds research through fun, inclusive community events. The best part? We have <strong>zero administrative costs</strong>, so every cent goes directly to equipment and research.',
        'Friends of CROSS is a voluntary fundraising group that supports cancer research at Trinity College Dublin and St. James\'s Hospital. We were founded in 2004 by Conor Headon and Ronan Murphy to support the pioneering research of Professor John Reynolds. Since then, we\'ve raised <strong>over \u20AC1 million</strong> for life-saving equipment and translational research. We\'re a registered charity (CHY 15364) with no admin costs \u2014 everything goes straight to the science.',
        'At its heart, CROSS is about people coming together to fight cancer through research. We fund cutting-edge equipment at the Trinity Translational Medicine Institute, support young cancer researchers, and raise awareness through community events. Founded in 2004 and run entirely by volunteers, we\'re proof that a dedicated group of people can make a massive difference. Over \u20AC1 million raised and counting!'
      ],
      followUp: 'Would you like to know more about a specific aspect? I can tell you about our research, the equipment we\'ve funded, our history, or the team behind it all.'
    },

    donate: {
      triggers: {
        exact: ['how can i donate', 'i want to donate', 'make a donation', 'how to donate', 'where can i donate'],
        partial: ['donat', 'give', 'contribut', 'payment', 'money', 'fund', 'support financial', 'stripe', 'pay', 'gift', 'one off', 'one-off', 'monthly', 'regular giving'],
        keywords: ['donate', 'donation', 'give', 'contribute', 'money', 'pay', 'support', 'fund', 'stripe', 'payment', 'gift', 'monthly']
      },
      responses: [
        'Thank you so much for thinking about donating \u2014 that\'s wonderful! You can donate directly through our website using our secure Stripe payment link. We have suggested amounts of \u20AC25, \u20AC50, \u20AC100, \u20AC250, or \u20AC500, but any amount is incredibly appreciated. Every euro goes <strong>directly</strong> to cancer research equipment and training. <a href="#donate" style="color: var(--color-accent); font-weight: 600;">Click here to donate now</a>.',
        'That\'s so generous of you! Donating is easy \u2014 just scroll down to our Donate section or <a href="#donate" style="color: var(--color-accent); font-weight: 600;">click here</a>. We process everything securely through Stripe, and you can choose a preset amount or enter your own. The amazing thing about CROSS is that we have no admin costs, so 100% of your donation funds research.',
        'I love that you\'re thinking about supporting our work! You can make a one-time donation right here on the website via our secure Stripe link. Whether it\'s \u20AC25 or \u20AC500, every contribution makes a real impact on cancer research. <strong>Top tip:</strong> Many Irish employers offer donation matching programmes \u2014 check with your HR or payroll team and your gift could be worth double! <a href="#donate" style="color: var(--color-accent); font-weight: 600;">Head to the donation section</a> to get started.'
      ],
      followUp: 'If you have any questions about the donation process or how your money is used, I\'m happy to explain. We use Stripe for secure payment processing, and every cent goes to equipment and research at Trinity and St. James\'s. And don\'t forget to check if your employer offers donation matching!'
    },

    research: {
      triggers: {
        exact: ['what research do you fund', 'tell me about the research', 'what science do you support', 'cancer research'],
        partial: ['research', 'science', 'lab', 'laborator', 'stud', 'cancer', 'equipment', 'machine', 'cryostat', 'pcr', 'cytometer', 'microarray', 'translational', 'clinical', 'finding', 'cure', 'seahorse', 'gelcount', 'gene scanner', 'quantstudio'],
        keywords: ['research', 'science', 'lab', 'study', 'cancer', 'equipment', 'machine', 'translational', 'clinical', 'cure', 'treatment', 'prevention']
      },
      responses: [
        'Our research is where the real magic happens! CROSS funds translational research at the Trinity Translational Medicine Institute, focusing on understanding and treating a range of cancers. We\'ve funded incredible equipment including a <strong>Flow Cytometer</strong> (which fires lasers at thousands of cells per second to identify cancer and immune cells), a <strong>Tissue Microarrayer</strong> (tests hundreds of patient samples at once to find cancer biomarkers), a <strong>Cryostat</strong> (rapidly freezes and slices tissue for microscopic examination), a <strong>PCR Thermal Cycler</strong> (detects genetic mutations driving cancer), plus a Seahorse Analyzer, QuantStudio, and GelCount. Over <strong>60 researchers</strong> across multiple disciplines use this equipment daily. We work with key partners including <a href="https://www.tcd.ie/" target="_blank" rel="noopener" style="color: var(--color-accent);">Trinity College Dublin</a>, <a href="https://www.stjames.ie/" target="_blank" rel="noopener" style="color: var(--color-accent);">St. James\'s Hospital</a>, <a href="https://www.tcd.ie/ttmi/" target="_blank" rel="noopener" style="color: var(--color-accent);">TTMI</a>, <a href="https://www.stjames.ie/cancer/" target="_blank" rel="noopener" style="color: var(--color-accent);">TSJCI</a>, <a href="https://www.uniphar.ie/" target="_blank" rel="noopener" style="color: var(--color-accent);">Uniphar PLC</a>, <a href="https://www.breakthroughcancerresearch.ie/" target="_blank" rel="noopener" style="color: var(--color-accent);">Breakthrough Cancer Research</a>, <a href="https://ocf.ie/" target="_blank" rel="noopener" style="color: var(--color-accent);">Oesophageal Cancer Fund</a>, and <a href="https://allcan.ie/" target="_blank" rel="noopener" style="color: var(--color-accent);">AllCaN</a>.',
        'CROSS supports cutting-edge cancer research at Trinity College Dublin and St. James\'s Hospital. The team studies everything from treatment resistance to tumour immunology and the role of obesity in cancer development. We\'ve invested in essential equipment like <strong>PCR thermal cyclers</strong> that detect the genetic mutations driving each patient\'s cancer, <strong>flow cytometers</strong> that sort and analyse individual cells at incredible speed, <strong>tissue microarrayers</strong> that test hundreds of samples simultaneously, and <strong>cryostats</strong> that preserve tissue in its natural state for rapid diagnosis. This equipment is used by over 60 researchers working on multiple cancer types. Our research partners include Trinity College Dublin, St. James\'s Hospital, TTMI, TSJCI, Uniphar PLC, Breakthrough Cancer Research, the Oesophageal Cancer Fund, and AllCaN.',
        'The research we fund is genuinely world-class. Our funded equipment at the Trinity Translational Medicine Institute supports research into cancer metabolism, immunotherapy, radiation resistance, and biomarker discovery. Each piece of equipment makes a direct difference: the <strong>flow cytometer</strong> helps develop personalised therapies, the <strong>tissue microarrayer</strong> speeds up the search for cancer biomarkers, the <strong>cryostat</strong> enables rapid tissue diagnosis, and the <strong>PCR thermal cycler</strong> identifies the exact genetic changes driving a patient\'s cancer. All used by 60+ researchers every day. Our network of research partners includes Trinity College Dublin, St. James\'s Hospital, TTMI, TSJCI, Uniphar PLC, Breakthrough Cancer Research, the Oesophageal Cancer Fund, and the AllCaN network.'
      ],
      followUp: 'Would you like to know more about a specific piece of equipment, the types of cancer being studied, or the research team? I can also tell you about some of the breakthroughs that have come from this work.'
    },

    events: {
      triggers: {
        exact: ['what events do you run', 'upcoming events', 'tell me about your events', 'any events coming up'],
        partial: ['event', 'boxing', 'golf', 'classic', 'fundrais', 'night', 'upcoming', 'calendar', 'participat', 'join', 'attend', 'ticket', 'cycle', 'carol', 'concert', 'christmas', 'rugby', 'lunch'],
        keywords: ['event', 'boxing', 'golf', 'fundraiser', 'night', 'calendar', 'ticket', 'cycle', 'concert', 'attend', 'participate', 'rugby', 'lunch']
      },
      responses: [
        'There are no CROSS events scheduled right now, but we have two fantastic marathon opportunities coming up! You can run the <strong><a href="https://www.vhiwomensminimarathon.ie/" target="_blank" rel="noopener" style="color: var(--color-accent)">Vhi Women\'s Mini Marathon</a></strong> on <strong>31st May 2026</strong> or take on the <strong><a href="https://irishlifedublinmarathon.ie/" target="_blank" rel="noopener" style="color: var(--color-accent)">Irish Life Dublin Marathon</a></strong> on <strong>25th October 2026</strong> — both for Friends of CROSS. Check the <a href="#get-involved" style="color: var(--color-accent); font-weight: 600;">Get Involved section</a> for more details!',
        'No CROSS events are currently scheduled, but there are two brilliant ways to get involved in 2026! Lace up for the <strong><a href="https://www.vhiwomensminimarathon.ie/" target="_blank" rel="noopener" style="color: var(--color-accent)">Vhi Women\'s Mini Marathon</a></strong> on <strong>31st May 2026</strong>, or go the full distance at the <strong><a href="https://irishlifedublinmarathon.ie/" target="_blank" rel="noopener" style="color: var(--color-accent)">Irish Life Dublin Marathon</a></strong> on <strong>25th October 2026</strong>. Every step raises vital funds for cancer research. <a href="#get-involved" style="color: var(--color-accent); font-weight: 600;">Find out more</a>.',
        'We don\'t have any CROSS events on the calendar just now, but keep an eye out — and in the meantime, why not take on a running challenge for CROSS? The <strong><a href="https://www.vhiwomensminimarathon.ie/" target="_blank" rel="noopener" style="color: var(--color-accent)">Vhi Women\'s Mini Marathon</a></strong> is on <strong>31st May 2026</strong> and the <strong><a href="https://irishlifedublinmarathon.ie/" target="_blank" rel="noopener" style="color: var(--color-accent)">Irish Life Dublin Marathon</a></strong> is on <strong>25th October 2026</strong>. <a href="#get-involved" style="color: var(--color-accent); font-weight: 600;">See how to get involved</a>.'
      ],
      followUp: 'Would you like to know more about running for CROSS, or are you thinking about organising your own fundraising event? I\'d love to point you in the right direction!'
    },

    volunteer: {
      triggers: {
        exact: ['how can i volunteer', 'i want to volunteer', 'can i help out', 'how do i get involved', 'how to get involved'],
        partial: ['volunteer', 'help out', 'give time', 'get involved', 'assist', 'contribute time', 'sign up', 'lend a hand', 'marathon', 'challenge', 'raffle', 'sea swim', 'cold water', 'swim'],
        keywords: ['volunteer', 'help', 'involved', 'participate', 'join', 'assist', 'sign', 'marathon', 'challenge', 'swim']
      },
      responses: [
        'We\'d absolutely love to have you involved! There are lots of ways to help: <strong>volunteer</strong> at our events, <strong>run the <a href="https://www.vhiwomensminimarathon.ie/" target="_blank" rel="noopener" style="color: var(--color-accent);">Vhi Women\'s Mini Marathon</a></strong> for CROSS, <strong>take on a sea swim challenge</strong> and get sponsored, <strong>take on a personal challenge</strong> (a sponsored cycle, climb, or adventure), <strong>host a fundraising event</strong> in your community, <strong>spread awareness</strong> on social media, or explore <strong>corporate sponsorship</strong> opportunities. Just fill out our <a href="#contact" style="color: var(--color-accent); font-weight: 600;">contact form</a> and someone from the team will be in touch to chat about how you can get involved.',
        'That\'s brilliant \u2014 thank you! Whether you can spare a few hours for an event or want to take on something bigger, we\'d love your help. You could assist at our events, run the <a href="https://www.vhiwomensminimarathon.ie/" target="_blank" rel="noopener" style="color: var(--color-accent);">Vhi Women\'s Mini Marathon</a>, brave the Irish waters with a <strong>sea swim challenge</strong>, take on a personal challenge like a sponsored cycle, host a community fundraiser, help with social media, or simply spread the word. <a href="#contact" style="color: var(--color-accent); font-weight: 600;">Drop us a message</a> and we\'ll find the perfect fit for you.',
        'Getting involved with CROSS is one of the best ways to make a tangible difference for cancer research in Ireland. Our volunteers are the backbone of everything we do. You could run the <a href="https://www.vhiwomensminimarathon.ie/" target="_blank" rel="noopener" style="color: var(--color-accent);">Vhi Women\'s Mini Marathon</a>, take on a <strong>sea swim challenge</strong>, volunteer at events, host a fundraiser, or help spread the word. If you\'re interested, <a href="#contact" style="color: var(--color-accent); font-weight: 600;">reach out through our contact form</a> and a team member will chat with you about what suits your interests and availability.'
      ],
      followUp: 'If you\'d like, I can tell you more about specific volunteer opportunities, or you can contact the team directly at info@crosscharity.ie. They\'re always happy to have a chat!'
    },

    impact: {
      triggers: {
        exact: ['how much have you raised', 'what impact have you had', 'what have you achieved', 'what difference have you made'],
        partial: ['impact', 'raised', 'million', 'how much raised', 'difference', 'achievement', 'result', 'success', 'accomplish', 'total'],
        keywords: ['impact', 'raised', 'million', 'difference', 'achievement', 'success', 'accomplish', 'result']
      },
      responses: [
        'I\'m so proud to share this! Over the past 12+ years, Friends of CROSS has raised <strong>over \u20AC1 million</strong> for cancer research. This has funded life-changing equipment used by <strong>60+ researchers</strong> across multiple cancer types at Trinity College Dublin and St. James\'s Hospital. Our Boxing Nights alone have raised \u20AC70,000, our Christmas Carol Concert raised \u20AC14,000, and the legendary Rugby Legends Cycle has generated hundreds of thousands. Every euro has gone directly to research \u2014 zero admin costs.',
        'The impact has been incredible. <strong>Over \u20AC1 million raised</strong>, funding equipment that\'s used daily by more than <strong>60 researchers</strong> studying cancers of the oesophagus, breast, colon, lung, and more. We\'ve funded a Seahorse Analyzer (\u20AC105,000 alone!), PCR systems, flow cytometers, and other critical research tools. Ireland has the highest rate of oesophageal cancer in the world, so this work is genuinely saving lives.',
        'In a nutshell: <strong>\u20AC1 million+ raised</strong>, <strong>8 major pieces of equipment</strong> funded, <strong>60+ researchers</strong> supported, and <strong>zero admin costs</strong>. From the very first Mizen-to-Malin cycle in 2012 that raised \u20AC52,000, to Uniphar\'s Unity for Hope campaign contributing \u20AC110,000, every single effort adds up. The equipment we\'ve funded is being used right now in labs at Trinity to advance our understanding of cancer.'
      ],
      followUp: 'Would you like to know more about specific milestones, the equipment we\'ve funded, or how individual events have contributed? Happy to go deeper!'
    },

    contact_committee: {
      triggers: {
        exact: ['contact a committee member', 'email a committee member', 'reach a committee member', 'speak to a committee member', 'talk to a committee member', 'get in touch with the committee', 'contact the team', 'email the team', 'reach the team', 'speak to the team', 'talk to the team', 'contact the chair'],
        partial: ['contact committee', 'contact member', 'contact chair', 'contact team', 'email committee', 'email member', 'email chair', 'email team', 'reach committee', 'reach member', 'reach chair', 'reach team', 'speak to committee', 'speak to member', 'speak to chair', 'speak to team', 'talk to committee', 'talk to member', 'talk to chair', 'talk to team', 'get in touch committee', 'get in touch member', 'get in touch team', 'contact james', 'contact john', 'contact sean', 'contact conor', 'contact patrick', 'contact jacqueline', 'contact luca', 'contact ben', 'contact philip', 'contact jacintha'],
        keywords: []
      },
      responses: [
        'The best way to get in touch with the Friends of CROSS team, including committee members, is to reach out directly at <strong>info@crosscharity.ie</strong> \u2014 they\'ll make sure your message gets to the right person. You can also use our <a href="#contact" style="color: var(--color-accent); font-weight: 600;">contact form</a> on this page.',
        'If you\'d like to reach a specific committee member, the easiest route is to email <strong>info@crosscharity.ie</strong> and let them know who you\'d like to speak with. The team will pass your message along promptly. You can also use our <a href="#contact" style="color: var(--color-accent); font-weight: 600;">contact form</a>.',
        'To get in touch with the committee or any member of the CROSS team, drop a message to <strong>info@crosscharity.ie</strong> \u2014 they\'re very responsive and will connect you with the right person. Our <a href="#contact" style="color: var(--color-accent); font-weight: 600;">contact form</a> works too!'
      ],
      followUp: 'If you let me know what your query is about, I might be able to help directly \u2014 otherwise the team at info@crosscharity.ie will be happy to assist.'
    },

    committee: {
      triggers: {
        exact: ['who is on the committee', 'who runs cross', 'tell me about the team', 'committee members', 'who are the committee members', 'who is on the board', 'board members'],
        partial: ['committee', 'board', 'who runs', 'team', 'member', 'chair', 'leadership', 'patron', 'wallace'],
        keywords: ['committee', 'board', 'team', 'member', 'chair', 'james', 'john', 'sean', 'conor', 'patrick', 'jacqueline', 'luca', 'ben', 'philip', 'jacintha', 'leadership', 'wallace', 'reynolds', 'headon', 'patron']
      },
      responses: [
        'The Friends of CROSS Committee is a wonderful group of dedicated volunteers. They are: <strong>James O\'Connor</strong> (Chair), <strong>Professor John Reynolds</strong> (Trinity & St James\' Representative \u2014 he\'s also the Professor of Clinical Surgery who co-founded CROSS), <strong>Conor Headon</strong> (co-founder of CROSS), <strong>Sean Headon</strong>, <strong>Patrick Headon</strong>, <strong>Jacqueline Rafter</strong>, <strong>Luca Mariotti</strong>, <strong>Ben English</strong>, <strong>Philip Smith</strong>, and <strong>Jacintha O\'Sullivan</strong>. Our patron is <strong>Paul Wallace</strong>, the former Irish rugby international and British & Irish Lion. If you\'d like to reach the committee, drop a line to <strong>info@crosscharity.ie</strong>.',
        'Our committee is led by <strong>James O\'Connor</strong> as Chair, with <strong>Professor John Reynolds</strong> representing Trinity and St. James\'s. The Headon family are deeply involved \u2014 <strong>Conor</strong> co-founded CROSS back in 2004, while <strong>Sean</strong> and <strong>Patrick</strong> also serve on the committee (Sean and Patrick also run Headon Boxing Academy, which has been an incredible fundraising partner). Rounding out the team are <strong>Jacqueline Rafter</strong>, <strong>Luca Mariotti</strong>, <strong>Ben English</strong>, <strong>Philip Smith</strong>, and <strong>Jacintha O\'Sullivan</strong>. Our patron is rugby legend <strong>Paul Wallace</strong>. You can reach the team at <strong>info@crosscharity.ie</strong>.',
        'We\'re fortunate to have an amazing team driving Friends of CROSS. Chair <strong>James O\'Connor</strong> leads the committee alongside <strong>Professor John Reynolds</strong> (a world-renowned surgical oncologist), <strong>Conor, Sean, and Patrick Headon</strong>, <strong>Jacqueline Rafter</strong>, <strong>Luca Mariotti</strong>, <strong>Ben English</strong>, <strong>Philip Smith</strong>, and <strong>Jacintha O\'Sullivan</strong>. CROSS was co-founded in 2004 by Conor Headon and Ronan Murphy, and our patron since 2011 is <strong>Paul Wallace</strong>, one of three Wallace brothers in the Guinness Book of Records for all playing for the British & Irish Lions. To get in touch with any of them, email <strong>info@crosscharity.ie</strong>.'
      ],
      followUp: 'Would you like to know more about the research team at Trinity, or about our patron Paul Wallace? You can also reach the committee directly at info@crosscharity.ie.'
    },

    contact: {
      triggers: {
        exact: ['how can i contact you', 'contact details', 'get in touch', 'email address', 'where are you located'],
        partial: ['contact', 'reach', 'email', 'phone', 'address', 'get in touch', 'speak to', 'talk to', 'find you', 'located', 'where are'],
        keywords: ['contact', 'reach', 'email', 'phone', 'address', 'touch', 'speak', 'talk', 'location']
      },
      responses: [
        'I\'d love to connect you with the team! Here are our details:<br><br><strong>Email:</strong> info@crosscharity.ie<br><strong>Address:</strong> Trinity College Dublin, Dept. of Surgery, St. James\'s Hospital, Dublin 8, Ireland<br><strong>Website:</strong> crosscharity.ie<br><br>You can also fill out our <a href="#contact" style="color: var(--color-accent); font-weight: 600;">contact form</a> right here on the site and someone will get back to you promptly.',
        'Here\'s how to reach us:<br><br><strong>Email:</strong> info@crosscharity.ie<br><strong>Address:</strong> Dept. of Surgery, Trinity College Dublin at St. James\'s Hospital, Dublin 8<br><br>Or simply use the <a href="#contact" style="color: var(--color-accent); font-weight: 600;">contact form</a> on this page \u2014 it goes straight to the team. They\'re a lovely bunch and always happy to chat!',
        'The quickest way to get in touch is by emailing <strong>info@crosscharity.ie</strong> or using our <a href="#contact" style="color: var(--color-accent); font-weight: 600;">online contact form</a>. Our base is at Trinity College Dublin, Dept. of Surgery, St. James\'s Hospital, Dublin 8, Ireland. Whether you have a question about donating, events, or volunteering, the team would love to hear from you.'
      ],
      followUp: 'Is there something specific you\'d like to ask the team about? I might be able to help right here, or I can make sure your message gets to the right person.'
    },

    hospital: {
      triggers: {
        exact: ['tell me about st james', 'trinity partnership', 'where is the research done', 'cancer institute'],
        partial: ['st james', 'trinity', 'hospital', 'institute', 'cancer centre', 'cancer center', 'tsjci', 'dublin', 'partnership', 'ttmi'],
        keywords: ['trinity', 'james', 'hospital', 'institute', 'dublin', 'partnership', 'cancer']
      },
      responses: [
        'CROSS is deeply embedded in Ireland\'s leading cancer research institutions. We work within the <strong>Trinity Translational Medicine Institute (TTMI)</strong> at <strong>Trinity College Dublin</strong>, with all our funded equipment based at <strong>St. James\'s Hospital</strong> \u2014 Ireland\'s largest acute teaching hospital. The <strong>Trinity St James\'s Cancer Institute (TSJCI)</strong> is Ireland\'s first OECI-accredited comprehensive cancer centre, with over 180 scientists working on cancer projects. It\'s an incredible environment for our research.',
        'Our research home is at the <strong>Trinity Translational Medicine Institute</strong>, part of Trinity College Dublin\'s Department of Surgery at <strong>St. James\'s Hospital</strong> in Dublin 8. This is where all the equipment we\'ve funded lives and where 60+ researchers use it daily. The <strong>Trinity St James\'s Cancer Institute</strong> is the first in Ireland to receive OECI accreditation as a comprehensive cancer centre \u2014 meaning it meets the highest European standards for cancer care and research.',
        'The partnership between CROSS and Trinity/St. James\'s is what makes our work so impactful. St. James\'s Hospital is Ireland\'s largest teaching hospital, and the <strong>Trinity St James\'s Cancer Institute</strong> brings together clinical expertise and world-class research. CROSS also collaborates with the <strong>AllCaN (All-Ireland Cancer Network)</strong>, linking universities across Ireland and Northern Ireland to tackle oesophageal cancer together.'
      ],
      followUp: 'Want to know more about the specific research happening at these institutions, or about the Trinity St James\'s Cancer Institute\'s accreditation?'
    },

    corporate: {
      triggers: {
        exact: ['corporate sponsorship', 'can my company sponsor', 'business partnership', 'corporate partnership'],
        partial: ['corporate', 'sponsor', 'company', 'business', 'partnership', 'brand', 'team building', 'organisation', 'organization', 'uniphar'],
        keywords: ['corporate', 'sponsor', 'company', 'business', 'partnership', 'brand', 'organisation']
      },
      responses: [
        'We\'d love to partner with your organisation! Corporate sponsorship with CROSS is a fantastic opportunity \u2014 you can support life-saving research while bringing your team together for memorable events. Past partners include <strong>Uniphar PLC</strong> (whose Unity for Hope campaign raised \u20AC110,000 with matched funding) and <strong>Viviscal</strong>. Opportunities range from sponsoring our Boxing Nights and Golf Classic to bespoke partnership arrangements. Many Irish employers also offer <strong>donation matching programmes</strong> \u2014 ask your HR team if your company matches charitable donations to double the impact! <a href="#contact" style="color: var(--color-accent); font-weight: 600;">Get in touch</a> to explore the possibilities!',
        'Corporate partnerships are incredibly valuable to CROSS. <strong>Uniphar PLC</strong> has been a fantastic partner \u2014 their staff campaign raised significant funds which the company matched, contributing over \u20AC110,000. We offer sponsorship opportunities across our events (Boxing Nights, Golf Classic, Carol Concert) and are always open to creative collaborations. <strong>Tip:</strong> Many Irish employers offer donation matching, so employee contributions could be doubled by the company. It\'s a wonderful way to align your brand with a meaningful cause. <a href="#contact" style="color: var(--color-accent); font-weight: 600;">Let\'s chat about how we can work together</a>.',
        'We\'re always delighted to work with businesses who want to make a difference. Whether it\'s event sponsorship, team fundraising challenges, or something completely new, we\'ll make it work. Companies like Uniphar and Viviscal have been incredible supporters over the years. Don\'t forget \u2014 many employers in Ireland offer <strong>donation matching programmes</strong>, so check with your HR or payroll team to see if your company can match employee donations. <a href="#contact" style="color: var(--color-accent); font-weight: 600;">Contact us at info@crosscharity.ie</a> and we\'ll tailor something that works for both of us.'
      ],
      followUp: 'Would you like to hear about specific sponsorship packages, or shall I connect you with the team to discuss a custom partnership?'
    },

    awareness: {
      triggers: {
        exact: ['how can i spread the word', 'share on social media', 'how to raise awareness'],
        partial: ['share', 'social media', 'spread', 'awareness', 'tell people', 'promote', 'post', 'instagram', 'linkedin', 'twitter', 'facebook'],
        keywords: ['share', 'social', 'spread', 'awareness', 'promote', 'post', 'instagram', 'linkedin', 'media']
      },
      responses: [
        'Spreading the word is one of the most powerful things you can do! You can follow us on social media (find us as <strong>@crosscharity_ie</strong> on X/Twitter), share our posts, tell friends and family about our work, or even share this website. If you\'re part of a school, club, or workplace, you could also organise a small awareness event. Every conversation about cancer research matters!',
        'Thank you for wanting to help spread the word \u2014 awareness is incredibly important! Here\'s what you can do: follow <strong>@crosscharity_ie</strong> on social media and share our posts, talk to friends and colleagues about our mission, share the crosscharity.ie website, or even organise a small fundraiser in your community or workplace. Word of mouth has been one of our most powerful tools over the years.',
        'Awareness is everything! Simply talking about CROSS in your community makes a huge difference. You can follow us at <strong>@crosscharity_ie</strong> on social media, share our event details with your network, or even organise something locally \u2014 a bake sale, a quiz night, anything goes! Some of our most successful fundraising has come from schools and community groups who got creative.'
      ],
      followUp: 'Would you like our social media links, or are you thinking about organising something specific? We can help with ideas and support!'
    },

    history: {
      triggers: {
        exact: ['when was cross founded', 'history of cross', 'how did cross start', 'who founded cross'],
        partial: ['founded', 'history', 'start', 'began', 'origin', 'founder', '2004', 'headon', 'murphy'],
        keywords: ['founded', 'history', 'start', 'began', 'origin', 'founder', 'year', 'first']
      },
      responses: [
        'CROSS has a wonderful story! It was <strong>founded in 2004</strong> by businessmen <strong>Conor Headon</strong> and <strong>Ronan Murphy</strong> to support the cancer research of <strong>Professor John Reynolds</strong> at Trinity College Dublin. The first patron was <strong>Felipe Contepomi</strong>, the Argentine rugby legend who\'s also a qualified doctor! In 2011, former Irish rugby international <strong>Paul Wallace</strong> became patron and proposed the first Mizen-to-Malin charity cycle in 2012, which raised \u20AC52,000 and kicked off an incredible tradition.',
        'It all began in <strong>2004</strong> when <strong>Conor Headon</strong> and <strong>Ronan Murphy</strong> wanted to support the pioneering cancer research of Professor John Reynolds at Trinity. Rugby legend <strong>Felipe Contepomi</strong> (who is also a medical doctor!) became the first patron. When Contepomi moved to France in 2009, <strong>Paul Wallace</strong> stepped in as patron in 2011 and launched the famous <strong>Rugby Legends Cycle</strong> in 2012. From that first \u20AC52,000 raised, the charity has grown to over \u20AC1 million!',
        'CROSS has come a long way since <strong>Conor Headon and Ronan Murphy</strong> founded it in <strong>2004</strong>. What started as rugby-themed fundraiser lunches with patron Felipe Contepomi evolved into the legendary <strong>Rugby Legends Cycle</strong> under Paul Wallace\'s leadership from 2012. Over the years, the cycle has taken various routes \u2014 Mizen to Malin, the Wild Atlantic Way, Ireland\'s Ancient East \u2014 and the charity has expanded into boxing nights, golf classics, and carol concerts. It\'s been an incredible journey.'
      ],
      followUp: 'Want to hear more about a specific era, the Rugby Legends Cycle, or how the charity has evolved over the years?'
    },

    payment: {
      triggers: {
        exact: ['is it safe to donate', 'is payment secure', 'how is payment processed', 'stripe payment'],
        partial: ['stripe', 'payment', 'secure', 'safe', 'credit card', 'debit card', 'security'],
        keywords: ['stripe', 'payment', 'secure', 'safe', 'card', 'security', 'process']
      },
      responses: [
        'Your security is our top priority. We use <strong>Stripe</strong> for all payment processing, which is one of the world\'s most trusted and secure platforms. Your card details are encrypted and never stored on our servers. Friends of CROSS is also a registered charity (CHY 15364), so you can donate with complete confidence. <a href="#donate" style="color: var(--color-accent); font-weight: 600;">Ready to donate?</a>',
        'We process all donations through <strong>Stripe</strong>, which handles payments for companies like Amazon and Google, so your details are in very safe hands. Everything is encrypted end-to-end, and we never see or store your card information. As a registered Irish charity (CHY 15364), transparency and trust are central to everything we do.',
        'Your donation is processed securely through <strong>Stripe</strong> \u2014 a world-leading payment platform trusted by millions of businesses globally. Your personal and financial data is fully encrypted and protected. And because we have zero administrative costs, you can rest assured that every cent of your donation goes directly to cancer research.'
      ],
      followUp: 'Would you like to go ahead and make a donation, or do you have any other questions about the process?'
    },

    oesophageal: {
      triggers: {
        exact: ['oesophageal cancer', 'stomach cancer', 'barrett oesophagus', 'baretts'],
        partial: ['oesophag', 'esophag', 'stomach', 'barrett', 'gullet', 'gastric', 'upper gi', 'gastrointestin'],
        keywords: ['oesophageal', 'esophageal', 'stomach', 'barrett', 'gastric', 'gullet']
      },
      responses: [
        'Oesophageal cancer is very close to our hearts at CROSS. Ireland and the UK have the <strong>highest incidence of oesophageal adenocarcinoma worldwide</strong>, with about 500 new cases in Ireland each year. The 5-year survival rate is only 24% \u2014 meaning just 1 in 4 patients survive. That\'s exactly why our research is so critical. Our team studies treatment resistance, cancer metabolism, immunotherapy approaches, and Barrett\'s oesophagus (a pre-cancerous condition). We also manage the Barrett\'s Oesophagus Biobank at St. James\'s Hospital.',
        'This is the core of what CROSS was founded to address. <strong>Oesophageal and stomach cancer</strong> have devastating survival rates \u2014 only about 24% of patients in Ireland survive five years after diagnosis. Ireland has one of the highest rates in the world. Our researchers are working on understanding why some tumours resist treatment, developing new approaches to radiation therapy, and studying Barrett\'s oesophagus, which is a key precursor to oesophageal cancer.',
        'It\'s one of the most challenging cancers, and CROSS is on the front line. With around <strong>500 new cases annually</strong> in Ireland and a 5-year survival rate of just 24%, there\'s an urgent need for better treatments. Our funded research covers cancer metabolism, immunotherapy combinations, radiation resistance, and the Barrett\'s Oesophagus Biobank \u2014 a collection of patient samples that\'s invaluable for translational research.'
      ],
      followUp: 'Would you like to know more about our specific research projects, the Barrett\'s Biobank, or the statistics around oesophageal cancer in Ireland?'
    }
  };

  // ========================================
  // LAYER 2 & 3 — Intent Classification + Scored Matching
  // ========================================

  var SCORE_EXACT = 3;
  var SCORE_PARTIAL = 2;
  var SCORE_KEYWORD = 1;
  var MIN_THRESHOLD = 2;

  // Combined-intent detection: check if both contact and committee signals co-exist
  var contactSignals = ['contact', 'reach', 'email', 'speak to', 'talk to', 'get in touch', 'phone'];
  var committeeSignals = ['committee', 'board', 'member', 'chair', 'leadership', 'team', 'james', 'john', 'sean', 'conor', 'patrick', 'jacqueline', 'luca', 'ben', 'philip', 'jacintha', 'wallace', 'reynolds', 'headon', 'patron'];

  function hasOverlap(cleaned, signals) {
    for (var i = 0; i < signals.length; i++) {
      if (cleaned.indexOf(signals[i]) !== -1) return true;
    }
    return false;
  }

  function classifyIntent(cleaned) {
    // Pre-check: if both contact and committee signals present, route to contact_committee
    if (hasOverlap(cleaned, contactSignals) && hasOverlap(cleaned, committeeSignals)) {
      return 'contact_committee';
    }

    var bestIntent = null;
    var bestScore = 0;
    var words = cleaned.split(' ');

    var intentKeys = Object.keys(chatbotKB);
    for (var i = 0; i < intentKeys.length; i++) {
      var key = intentKeys[i];
      var triggers = chatbotKB[key].triggers;
      var score = 0;

      // Exact phrase matches
      if (triggers.exact) {
        for (var e = 0; e < triggers.exact.length; e++) {
          if (cleaned === triggers.exact[e] || cleaned.indexOf(triggers.exact[e]) !== -1) {
            score += SCORE_EXACT;
          }
        }
      }

      // Partial (stem) matches
      if (triggers.partial) {
        for (var p = 0; p < triggers.partial.length; p++) {
          if (cleaned.indexOf(triggers.partial[p]) !== -1) {
            score += SCORE_PARTIAL;
          }
        }
      }

      // Single keyword matches
      if (triggers.keywords) {
        for (var k = 0; k < triggers.keywords.length; k++) {
          for (var w = 0; w < words.length; w++) {
            if (words[w] === triggers.keywords[k] || words[w].indexOf(triggers.keywords[k]) !== -1) {
              score += SCORE_KEYWORD;
              break; // only count each keyword once
            }
          }
        }
      }

      if (score > bestScore) {
        bestScore = score;
        bestIntent = key;
      }
    }

    if (bestScore >= MIN_THRESHOLD && bestIntent) {
      return bestIntent;
    }
    return null;
  }

  // ========================================
  // LAYER 4 — Contextual Follow-up Detection
  // ========================================

  var followUpTriggers = ['it', 'that', 'this', 'they', 'more', 'go on', 'tell me more', 'how', 'why', 'really', 'yes', 'yeah', 'yep', 'sure', 'absolutely', 'definitely', 'continue', 'what else', 'and', 'also', 'interesting', 'wow', 'cool', 'great', 'nice', 'elaborate', 'expand', 'details', 'specifically'];

  function isFollowUp(cleaned) {
    var wordCount = cleaned.split(' ').length;
    if (wordCount > 4) return false;
    for (var i = 0; i < followUpTriggers.length; i++) {
      if (cleaned === followUpTriggers[i] || cleaned.indexOf(followUpTriggers[i]) !== -1) {
        return true;
      }
    }
    // Very short message (1-2 words) with question mark intent
    if (wordCount <= 2) return true;
    return false;
  }

  // ========================================
  // LAYER 5 — Conversational Continuity
  // ========================================

  function getResponse(intentKey) {
    var entry = chatbotKB[intentKey];
    if (!entry) return null;

    // Track how many times this intent has been answered
    if (!sessionHistory[intentKey]) sessionHistory[intentKey] = 0;
    if (!responseIndex[intentKey]) responseIndex[intentKey] = 0;

    // If answered twice already, give a gentle nudge
    if (sessionHistory[intentKey] >= 2) {
      sessionHistory[intentKey]++;
      return 'Happy to keep talking about this \u2014 is there a specific aspect I can help clarify? Or if you\'d like, I can tell you about something different like our <a href="#events" style="color: var(--color-accent); font-weight: 600;">events</a>, <a href="#donate" style="color: var(--color-accent); font-weight: 600;">how to donate</a>, or <a href="#contact" style="color: var(--color-accent); font-weight: 600;">how to get in touch</a>.';
    }

    // Rotate through response variants
    var idx = responseIndex[intentKey] % entry.responses.length;
    responseIndex[intentKey]++;
    sessionHistory[intentKey]++;

    return entry.responses[idx];
  }

  function getFollowUpResponse(intentKey) {
    var entry = chatbotKB[intentKey];
    if (!entry || !entry.followUp) return null;
    return entry.followUp;
  }

  // ========================================
  // Unknown Fallback Variants
  // ========================================

  var unknownResponses = [
    'I don\'t have that one handy \u2014 please contact us at <strong>info@crosscharity.ie</strong> and we\'ll be happy to help!',
    'I\'m not sure about that one, but the team can help \u2014 reach out to <strong>info@crosscharity.ie</strong> and they\'ll get back to you.',
    'I don\'t have the answer to that right now \u2014 please email <strong>info@crosscharity.ie</strong> and someone will be in touch.'
  ];
  var unknownIndex = 0;

  function getUnknownResponse() {
    var resp = unknownResponses[unknownIndex % unknownResponses.length];
    unknownIndex++;
    return resp;
  }

  // ========================================
  // Main Answer Function
  // ========================================

  function findAnswer(text) {
    var cleaned = normalise(text);

    // Layer 4: Check for follow-up
    if (sessionContext.lastIntent && isFollowUp(cleaned)) {
      var followUp = getFollowUpResponse(sessionContext.lastIntent);
      if (followUp) return followUp;
    }

    // Layer 2 & 3: Classify intent with scoring
    var intent = classifyIntent(cleaned);

    if (intent) {
      sessionContext.lastIntent = intent;
      return getResponse(intent);
    }

    // Unknown fallback
    return getUnknownResponse();
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

  function sendMessage(text) {
    if (!text.trim()) return;

    addMessage(text, 'user');
    showTyping();

    // Vary delay: 1000–2000ms, longer for longer responses
    var answer = findAnswer(text);
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

  var style = document.createElement('style');
  style.textContent = '.revealed { opacity: 1 !important; transform: translateY(0) !important; }';
  document.head.appendChild(style);

});
