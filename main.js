const toggleBtn = document.getElementById('toggleSidebar');
const sidebar = document.getElementById('sidebar');
const mainContent = document.getElementById('mainContent');
toggleBtn.addEventListener('click', () => {
  sidebar.classList.toggle('collapsed');
  toggleBtn.textContent = sidebar.classList.contains('collapsed') ? '▼' : '▲';
});

// Define the menu order for continue button navigation
const menuOrder = [
  'welcome',
  'team',
  'values',
  'internaltools',
  'whydolf',
  'tutorialvideos',
  'quizzes', 
  'locations',
  'contact'
];

// Function to get next menu item
function getNextMenuItem(currentSection) {
  if(currentSection.startsWith('quiz')) {
    // If on a quiz, go to the next quiz or next section after quizzes
    const quizNum = parseInt(currentSection.replace('quiz',''));
    if(quizNum < 4) return `quiz${quizNum+1}`;
    return 'locations';
  }
  // Special case: if on locations (map), next should be contact
  if(currentSection === 'locations') {
    return 'contact';
  }
  // Special case: if on whydolf, next should be companytourvideo
  if(currentSection === 'whydolf') {
    return 'companytourvideo';
  }
  const currentIndex = menuOrder.indexOf(currentSection);
  if (currentIndex === -1 || currentIndex === menuOrder.length - 1) {
    return null; // No next item
  }
  // If next is quizzes, go to first quiz
  if(menuOrder[currentIndex+1] === 'quizzes') return 'quiz1';
  return menuOrder[currentIndex + 1];
}

// Function to create continue button
function createContinueButton(currentSection, inline = false) {
  const nextSection = getNextMenuItem(currentSection);
  if (!nextSection) return '';
  if (inline) {
    return `<button class="continue-btn" onclick="navigateToSection('${nextSection}')">Continue →</button>`;
  }
  return `
    <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
      <button class="continue-btn" onclick="navigateToSection('${nextSection}')">Continue →</button>
    </div>
  `;
}

// Function to create previous button
function createPrevButton(currentSection) {
  const menuOrder = [
    'welcome',
    'team',
    'values',
    'internaltools',
    'whydolf',
    'companytourvideo',
    'platformdemo',
    'tutorialvideos',
    'quizzes',
    'locations',
    'contact'
  ];
  const currentIndex = menuOrder.indexOf(currentSection);
  if (currentIndex <= 0) return '';
  const prevSection = menuOrder[currentIndex - 1];
  return `
    <button class="continue-btn" style="margin-right: 16px;" onclick="navigateToSection('${prevSection}')">← Previous</button>
  `;
}

// Coordinates for Dolf Technologies branches
const DOLF_LOCATIONS = {
  egypt: {
    name: "DOLF TECHNOLOGIES، 3 Abd El-Salam Ibrahim, Al Matar, El Nozha, Cairo Governorate 4470311, Egypt",
    lat: 30.0444,
    lng: 31.2357
  },
  sa: {
    name: "2925 طريق الأمير سلطان، Al Andalus, Sidra Complex, Al Khobar 34437",
    lat: 26.333348927579664, 
    lng: 50.18430572906374
  }
};

// Leaflet map instance
let dolfMap = null;
let mapMarkers = [];

// Initialize Leaflet map
function initDolfMap(mode = 'all') {
  // Check if Leaflet is loaded
  if (typeof L === 'undefined') {
    console.error('Leaflet library not loaded!');
    return;
  }
  
  const mapDiv = document.getElementById('map');
  if (!mapDiv) {
    console.error('Map div not found');
    return;
  }
  
  console.log('Map div found, initializing Leaflet map...');
  
  // Clear existing map if any
  if (dolfMap) {
    dolfMap.remove();
    dolfMap = null;
    mapMarkers = [];
  }
  
  try {
    // Create new map
    dolfMap = L.map('map', {
      zoomControl: true,
      attributionControl: false
    });
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(dolfMap);
    
    console.log('Map initialized successfully, updating with mode:', mode);
    
    // Update map based on mode
    updateDolfMap(mode);
  } catch (error) {
    console.error('Error initializing map:', error);
  }
}

// Update map markers and view
function updateDolfMap(mode) {
  const mapAddress = document.getElementById('mapAddress');
  if (!dolfMap || !mapAddress) {
    console.error('Map or address element not found. dolfMap:', dolfMap, 'mapAddress:', mapAddress);
    return;
  }
  
  console.log('Updating map with mode:', mode);
  
  // Clear existing markers
  mapMarkers.forEach(marker => dolfMap.removeLayer(marker));
  mapMarkers = [];
  
  if (mode === 'egypt') {
    mapAddress.textContent = DOLF_LOCATIONS.egypt.name;
    addMapMarker(DOLF_LOCATIONS.egypt, 'Egypt Branch', 'red');
    dolfMap.setView([DOLF_LOCATIONS.egypt.lat, DOLF_LOCATIONS.egypt.lng], 17);
    console.log('Set map to Egypt view');
  } else if (mode === 'sa') {
    mapAddress.textContent = DOLF_LOCATIONS.sa.name;
    addMapMarker(DOLF_LOCATIONS.sa, 'SA Branch', 'blue');
    dolfMap.setView([DOLF_LOCATIONS.sa.lat, DOLF_LOCATIONS.sa.lng], 17);
    console.log('Set map to SA view');
  } else {
    // All locations - show both with multiple markers
    mapAddress.textContent = 'Dolf Technologies - Multiple Locations (Red Pin: Egypt Branch, Blue Pin: SA Branch)';
    
    // Add both markers
    addMapMarker(DOLF_LOCATIONS.egypt, 'Egypt Branch', 'red');
    addMapMarker(DOLF_LOCATIONS.sa, 'SA Branch', 'blue');
    
    // Fit bounds to show both locations
    const bounds = L.latLngBounds([
      [DOLF_LOCATIONS.egypt.lat, DOLF_LOCATIONS.egypt.lng],
      [DOLF_LOCATIONS.sa.lat, DOLF_LOCATIONS.sa.lng]
    ]);
    dolfMap.fitBounds(bounds, { padding: [20, 20] });
    console.log('Set map to show both locations with bounds:', bounds);
  }
}

// Add a marker to the map
function addMapMarker(location, label, color) {
  try {
    // Create custom pin icon with the specified color
    const customIcon = L.divIcon({
      className: 'custom-pin-marker',
      html: `
        <div style="
          position: relative;
          width: 0;
          height: 0;
        ">
          <div style="
            position: absolute;
            top: -20px;
            left: -10px;
            width: 20px;
            height: 20px;
            background-color: ${color};
            border: 2px solid white;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          "></div>
          <div style="
            position: absolute;
            top: -8px;
            left: -2px;
            width: 4px;
            height: 4px;
            background-color: white;
            border-radius: 50%;
          "></div>
        </div>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 20]
    });
    
    const marker = L.marker([location.lat, location.lng], {
      icon: customIcon
    }).addTo(dolfMap);
    
    // Add popup with location info
    marker.bindPopup(`<b>${label}</b><br>${location.name}`);
    
    mapMarkers.push(marker);
    console.log(`Added ${color} pin marker for ${label} at [${location.lat}, ${location.lng}]`);
  } catch (error) {
    console.error(`Error adding marker for ${label}:`, error);
  }
}

// Function to navigate to a specific section
function navigateToSection(section) {
  // Find the corresponding menu item and trigger click
  if (section.startsWith('quiz')) {
    const quizNum = section.replace('quiz', '');
    const quizItem = document.querySelector(`[data-quiz="${quizNum}"]`);
    if (quizItem) quizItem.click();
  } else if (section === 'locations') {
    // Handle locations (Dolf Headquarters Map)
    mainContent.innerHTML = `
      <h2 style="font-size:2em;margin-bottom:8px;"><span style="font-size:1.2em;">📍</span> Dolf Headquarters Map</h2>
      
      <div class="map-tabs">
        <button class="map-tab active" data-location="all">All</button>
        <button class="map-tab" data-location="egypt">Egypt Branch</button>
        <button class="map-tab" data-location="sa">SA Branch</button>
      </div>
      
              <div class="dolf-map-section">
          <div class="dolf-map-address" id="mapAddress">Dolf Technologies - Multiple Locations (Red Pin: Egypt Branch, Blue Pin: SA Branch)</div>
          <div class="dolf-map-iframe" id="map">
            <div style="text-align: center; padding: 40px; color: #666;">
              Loading map...<br>
              <small>If the map doesn't load, please refresh the page</small>
            </div>
          </div>
        </div>
      ${createContinueButton('locations')}
    `;
    
    // Initialize the map
    setTimeout(() => {
      console.log('Initializing map with timeout...');
      initDolfMap('all');
      
      // Add event listeners for map tabs
      const mapTabs = document.querySelectorAll('.map-tab');
      console.log('Found map tabs:', mapTabs.length);
      
      mapTabs.forEach(tab => {
        tab.addEventListener('click', function() {
          console.log('Tab clicked:', this.getAttribute('data-location'));
          
          // Remove active class from all tabs
          mapTabs.forEach(t => t.classList.remove('active'));
          // Add active class to clicked tab
          this.classList.add('active');
          
          const location = this.getAttribute('data-location');
          console.log('Updating map for location:', location);
          updateDolfMap(location);
        });
      });
    }, 100);
  } else {
    const menuItem = document.querySelector(`[data-section="${section}"]`);
    if (menuItem) menuItem.click();
  }
}

const sections = {
  welcome: {
    title: 'Welcome to DolfTech',
    desc: `<div style="text-align:center; padding: 40px 0;">
      <img src="assets/dolftech_logo.jpeg" alt="DolfTech Logo" style="max-width:400px; border-radius:12px; box-shadow:0 4px 20px rgba(0,0,0,0.15); margin-bottom:24px;">
      <p style="font-size:1.2em; color:#333; margin-top:24px;">We are excited to have you join our team! Explore the portal to learn more about Dolf Technology.</p>
    </div>`
  },
  team: {
    title: 'Who Are We ?',
    desc: `Dolf Technologies a leader in digital transformation since 2007 delivers innovative solutions that seamlessly integrate digital content systems and environments. Our strategies align with Saudi Vision 2030 focusing on broadening horizons, providing tailored expertise, and ensuring seamless integration.
    <div class="about-card" style="margin-top:24px;">
      <h2>Vision</h2>
      <p>A pioneer in digital transformation</p>
    </div>
    <div class="about-card" style="margin-top:16px;">
      <h2>Mission</h2>
      <p>Our mission is to apply innovative technologies to develop skills, improve processes and enhance operational efficiency across a range of industries</p>
    </div>`
  },
  vision: {
    title: 'Vision',
    desc: 'A pioneer in digital transformation'
  },
  mission: {
    title: 'Mission',
    desc: 'Our mission is to apply innovative technologies to develop skills, improve processes and enhance operational efficiency across a range of industries'
  },
  values: {
    title: 'Values',
    desc: `<ul class="about-values">
      <li><span class="about-icon">🛠️</span> <span class="about-value-title">Empowering Skills -</span> <span>By boosting client capabilities through innovative digital tools allowing for growth and advancement</span></li>
      <li><span class="about-icon">🎯</span> <span class="about-value-title">Fostering Innovation -</span> <span>Creative solutions that precisely address client challenges</span></li>
      <li><span class="about-icon">🚀</span> <span class="about-value-title">Exceeding Expectations -</span> <span>Through exceptional service and even better results</span></li>
      <li><span class="about-icon">🤝</span> <span class="about-value-title">Building Partnerships -</span> <span>Building strong relationships and collaboration for lasting success</span></li>
    </ul>`
  },
  internaltools: {
    title: "Dolf's Services",
    desc: `
      <div class="dolf-services-section">
        <div class="dolf-services-card">
          <div class="dolf-services-card-title">Digital Content</div>
          <div class="dolf-services-badges">
            <span class="service-badge">NELC</span>
            <span class="service-badge">TVTC</span>
            <span class="service-badge">Doroob</span>
            <span class="service-badge">Banks</span>
            <span class="service-badge">Telecom</span>
          </div>
        </div>
        <div class="dolf-services-card">
          <div class="dolf-services-card-title">Enterprise Platforms</div>
          <div class="dolf-services-badges">
            <span class="service-badge">Monsha'at Academy</span>
            <span class="service-badge">Ministry of Sport</span>
            <span class="service-badge">Financial Academy (CBS)</span>
          </div>
        </div>
        <div class="dolf-services-card">
          <div class="dolf-services-card-title">AR/VR/XR Solutions</div>
          <div class="dolf-services-badges">
            <span class="service-badge">Saudi Aramco</span>
            <span class="service-badge">Ministry of Energy</span>
            <span class="service-badge">Magic Leap</span>
          </div>
        </div>
      </div>
    `
  },
  whydolf: {
    title: 'Why Dolf ?',
    desc: '' // not done yet
  },
  contact: {
    title: 'Contact Us',
    desc: `
      <div style="text-align: center; margin-bottom: 32px;">
        <h2 style="font-size: 2.2em; margin-bottom: 16px; color: #1976d2;">📧 Contact Us</h2>
        <p style="font-size: 1.2em; color: #333; margin-bottom: 24px;">Feel free to reach out to us. Our team is ready to assist you with any inquiries or needs you may have.</p>
      </div>
      
      <div class="contact-details" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; margin-bottom: 32px;">
        <div class="contact-card" style="background: #f8f9fa; border-radius: 12px; padding: 24px; border-left: 4px solid #2196f3;">
          <div style="font-size: 1.3em; margin-bottom: 8px;">🌐</div>
          <div style="font-weight: 600; color: #1976d2; margin-bottom: 8px;">Website</div>
          <div style="color: #333;">www.dolftech.com</div>
        </div>
        
        <div class="contact-card" style="background: #f8f9fa; border-radius: 12px; padding: 24px; border-left: 4px solid #2196f3;">
          <div style="font-size: 1.3em; margin-bottom: 8px;">📞</div>
          <div style="font-weight: 600; color: #1976d2; margin-bottom: 8px;">Phone</div>
          <div style="color: #333;">
            +966138829411<br>
            +966138829014<br>
            +966548161616
          </div>
        </div>
        
        <div class="contact-card" style="background: #f8f9fa; border-radius: 12px; padding: 24px; border-left: 4px solid #2196f3;">
          <div style="font-size: 1.3em; margin-bottom: 8px;">✉️</div>
          <div style="font-weight: 600; color: #1976d2; margin-bottom: 8px;">Email</div>
          <div style="color: #333;">
            humidi@dolftech.com<br>
            info@dolftech.com
          </div>
        </div>
        
        <div class="contact-card" style="background: #f8f9fa; border-radius: 12px; padding: 24px; border-left: 4px solid #2196f3;">
          <div style="font-size: 1.3em; margin-bottom: 8px;">📱</div>
          <div style="font-weight: 600; color: #1976d2; margin-bottom: 8px;">Social Media</div>
          <div style="color: #333;">
            <span style="background: #0077b5; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.9em; margin-right: 8px;">in</span> DolfTech<br>
            <span style="background: #1da1f2; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.9em; margin-right: 8px;">X</span> DolfLtd
          </div>
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
        <button class="continue-btn" onclick="navigateToSection('welcome')">Go to Home</button>
      </div>
    `
  },
  tutorialvideos: {
    title: '1st Video about DolfTech',
    desc: `
      <div style="text-align:center; padding: 40px 0;">
        <h2 style="margin-bottom:16px;">DolfTech Screen Recording</h2>
        <p style="margin-bottom:24px; color:#333;">Watch this screen recording to learn more about DolfTech's platform in action.</p>
        <video id="dolftech-tutorial-video" width="640" height="360" controls autoplay muted style="border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.12);">
          <source src="assets/Screen Recording 2025-07-01 104339.mp4" type="video/mp4">
          Your browser does not support the video tag.
        </video>
        <div style="text-align:center; margin-top: 40px;">
          ${createPrevButton('tutorialvideos')}
          ${createContinueButton('tutorialvideos')}
        </div>
     
    `
  },
  companytourvideo: {
    title: 'Company Tour Video',
    desc: `
      <div style="text-align:center; padding: 40px 0;">
        <video id="company-tour-video" width="640" height="360" controls autoplay style="border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.12);">
          <source src="assets/Screen Recording 2025-07-01 104339.mp4" type="video/mp4">
          Your browser does not support the video tag.
        </video>
        <div style="text-align:center; margin-top: 40px;">
          ${createContinueButton('companytourvideo')}
        </div>
      </div>
       </div>
      <div style="text-align:center; margin-top: 40px;">
        <button class="continue-btn" onclick="navigateToSection('platformdemo')">Continue</button>
      </div>
    `
  },
  platformdemo: {
    title: 'DolfTech Platform Demo',
    desc: `
      <div style="text-align:center; padding: 40px 0;">
        <video id="platform-demo-video" width="640" height="360" controls autoplay style="border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.12);">
          <source src="assets/Screen Recording 2025-07-01 104339.mp4" type="video/mp4">
          Your browser does not support the video tag.
        </video>
        <div style="text-align:center; margin-top: 40px;">
          <button class="continue-btn" onclick="navigateToSection('quiz1')">Continue</button>
        </div>
      </div>
    `
  }
};

// Quiz data about Dolf Technology
const quizzes = {
  1: {
    question: 'What is Dolf Technology a pioneer in?',
    options: ['Artificial Intelligence', 'Digital Transformation', 'Mobile Apps', 'Social Media'],
    correct: 1 // 'Digital Transformation'
  },
  2: {
    question: 'Which of the following is NOT one of Dolf Technology\'s core values?',
    options: ['Empowering Skills', 'Fostering Innovation', 'Exceeding Expectations', 'Maximizing Profits'],
    correct: 3 // 'Maximizing Profits'
  },
  3: {
    question: 'How many years of experience does Dolf Technology leverage for delivering digital solutions?',
    options: ['5 years', '10 years', '17 years', '25 years'],
    correct: 2 // '17 years'
  },
  4: {
    question: 'What is the mission of Dolf Technology?',
    options: [
      'To create mobile games',
      'To apply innovative technologies to develop skills, improve processes, and enhance operational efficiency',
      'To sell hardware',
      'To provide social media marketing'
    ],
    correct: 1 // 'To aply innovative technologies...'
  }
};

// Quiz submit logic: handle feedback and continue button
function handleQuizSubmit(quizNum) {
  const quiz = quizzes[quizNum];
  const selected = document.querySelector(`input[name='quiz${quizNum}']:checked`);
  const feedback = document.getElementById('quizFeedback');
  const continueSection = document.getElementById('continueSection');
  if (!selected) {
    feedback.textContent = 'Please select an answer.';
    feedback.style.color = '#d32f2f';
    continueSection.style.display = 'none';
    return;
  }
  const answer = parseInt(selected.value);
  if (answer === quiz.correct) {
    feedback.textContent = 'Correct!';
    feedback.style.color = '#388e3c';
  } else {
    feedback.textContent = 'Incorrect!';
    feedback.style.color = '#d32f2f';
  }
  continueSection.style.display = 'inline-block';
}

// Attach quiz submit handler to all quiz renders
function attachQuizSubmitHandler(quizNum) {
  setTimeout(() => {
    const submitBtn = document.getElementById('submitQuiz');
    if (submitBtn) {
      submitBtn.onclick = () => handleQuizSubmit(quizNum);
    }
  }, 0);
}

// Handle section menu clicks
document.querySelectorAll('.menu-item').forEach(item => {
  item.addEventListener('click', function(e) {
    // Expand/collapse About Dolf Technology submenu
    if(this.classList.contains('has-submenu')) {
      e.stopPropagation();
      this.classList.toggle('open');
      return;
    }
    const section = this.getAttribute('data-section');
    const data = sections[section];
    if(section === 'tutorialvideos' || section === 'companytourvideo' || section === 'platformdemo') {
      mainContent.innerHTML = `<div class='card'>${data.desc}</div>`;
      setTimeout(() => {
        const vid = document.getElementById(section === 'tutorialvideos' ? 'dolftech-tutorial-video' : section === 'companytourvideo' ? 'company-tour-video' : 'platform-demo-video');
        if(vid) { vid.play(); }
      }, 100);
    } else if(section === 'whydolf') {
      mainContent.innerHTML = `<div class='card'>
        <div style="text-align: center; margin-bottom: 32px;">
          <h2 style="font-size: 2.2em; margin-bottom: 16px; color: #1976d2;">🖐️ Why Dolf?</h2>
          <p style="font-size: 1.2em; color: #333; margin-bottom: 24px;">Discover what makes Dolf Technologies the preferred choice for digital transformation solutions.</p>
        </div>
        
        <div class="contact-details" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; margin-bottom: 32px;">
          <div class="contact-card" style="background: #f8f9fa; border-radius: 12px; padding: 24px; border-left: 4px solid #2196f3;">
            <div style="font-size: 1.3em; margin-bottom: 8px;">🎯</div>
            <div style="font-weight: 600; color: #1976d2; margin-bottom: 8px;">Customized Solutions</div>
            <div style="color: #333;">Tailoring solutions to meet clients' specific needs for maximum impact and value</div>
          </div>
          
          <div class="contact-card" style="background: #f8f9fa; border-radius: 12px; padding: 24px; border-left: 4px solid #2196f3;">
            <div style="font-size: 1.3em; margin-bottom: 8px;">🏆</div>
            <div style="font-weight: 600; color: #1976d2; margin-bottom: 8px;">Proven Expertise</div>
            <div style="color: #333;">Leveraging over 17 years of experience to deliver reliable and enduring digital solutions</div>
          </div>
          
          <div class="contact-card" style="background: #f8f9fa; border-radius: 12px; padding: 24px; border-left: 4px solid #2196f3;">
            <div style="font-size: 1.3em; margin-bottom: 8px;">🚀</div>
            <div style="font-weight: 600; color: #1976d2; margin-bottom: 8px;">Innovative Leadership</div>
            <div style="color: #333;">Investing in cutting-edge technologies to keep clients ahead in a fast-changing digital world</div>
          </div>
          
          <div class="contact-card" style="background: #f8f9fa; border-radius: 12px; padding: 24px; border-left: 4px solid #2196f3;">
            <div style="font-size: 1.3em; margin-bottom: 8px;">🤝</div>
            <div style="font-weight: 600; color: #1976d2; margin-bottom: 8px;">Client-Centric Approach</div>
            <div style="color: #333;">Building trust through close collaboration and aligning solutions with clients' goals</div>
          </div>
        </div>
        
        ${createContinueButton('whydolf')}
      </div>`;
    } else if(section === 'locations') {
      mainContent.innerHTML = `<div class='card'>
        <h2 style="font-size:2em;margin-bottom:8px;"><span style="font-size:1.2em;">📍</span> Dolf Headquarters Map</h2>
        
        <div class="map-tabs">
          <button class="map-tab active" data-location="all">All</button>
          <button class="map-tab" data-location="egypt">Egypt Branch</button>
          <button class="map-tab" data-location="sa">SA Branch</button>
        </div>
        
        <div class="dolf-map-section">
          <div class="dolf-map-address" id="mapAddress">Dolf Technologies - Multiple Locations (Red Pin: Egypt Branch, Blue Pin: SA Branch)</div>
          <div class="dolf-map-iframe" id="map">
            <div style="text-align: center; padding: 40px; color: #666;">
              Loading map...<br>
              <small>If the map doesn't load, please refresh the page</small>
            </div>
          </div>
        </div>
        ${createContinueButton('locations')}
      </div>`;
      
      // Initialize the map
      setTimeout(() => {
        console.log('Initializing map with timeout...');
        initDolfMap('all');
        
        // Add event listeners for map tabs
        const mapTabs = document.querySelectorAll('.map-tab');
        console.log('Found map tabs:', mapTabs.length);
        
        mapTabs.forEach(tab => {
          tab.addEventListener('click', function() {
            console.log('Tab clicked:', this.getAttribute('data-location'));
            
            // Remove active class from all tabs
            mapTabs.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            this.classList.add('active');
            
            const location = this.getAttribute('data-location');
            console.log('Updating map for location:', location);
            updateDolfMap(location);
          });
        });
      }, 100);
    } else if(section === 'contact') {
      mainContent.innerHTML = `<div class='card'>${data.desc}</div>`;
    } else {
      mainContent.innerHTML = `<div class='card'><h2>${data.title}</h2><p>${data.desc}</p>${createContinueButton(section)}</div>`;
    }
  });
});

// Handle About Dolf Technology submenu clicks
document.querySelectorAll('.submenu-item').forEach(item => {
  item.addEventListener('click', function(e) {
    e.stopPropagation();
    const section = this.getAttribute('data-section');
    const data = sections[section];
    mainContent.innerHTML = `<div class="about-card"><h2>${data.title}</h2><p>${data.desc}</p></div>`;
  });
});

// Handle quiz menu clicks
document.querySelectorAll('.quiz-item').forEach(item => {
  item.addEventListener('click', function() {
    const quizNum = this.getAttribute('data-quiz');
    const quiz = quizzes[quizNum];
    let optionsHtml = '';
    quiz.options.forEach((opt, idx) => {
      optionsHtml += `<input type="radio" name="quiz${quizNum}" value="${idx}" id="option${idx}">
                      <label for="option${idx}" class="quiz-option-label">${opt}</label><br/>`;
    });
    mainContent.innerHTML = `
      <div class='card'>
        <h2>${quiz.question}</h2>
        <div class="quiz-options">
          ${optionsHtml}
        </div>
        <div class='quiz-action-row'>
          <button id="submitQuiz" class="submit-btn">Submit</button>
          <div id="continueSection" style="display:none;">${createContinueButton(`quiz${quizNum}`, true)}</div>
        </div>
        <div id="quizFeedback" style="margin-top:16px;font-weight:bold;text-align:center;"></div>
      </div>
    `;
    attachQuizSubmitHandler(quizNum);
  });
});

// Handle Dolf Headquarters Map click
document.querySelectorAll('li').forEach(item => {
  if (item.textContent.includes('📍 Dolf Headquarters Map')) {
    item.addEventListener('click', function() {
      mainContent.innerHTML = `
        <h2 style="font-size:2em;margin-bottom:8px;"><span style="font-size:1.2em;">📍</span> Dolf Headquarters Map</h2>
        
        <div class="map-tabs">
          <button class="map-tab active" data-location="all">All</button>
          <button class="map-tab" data-location="egypt">Egypt Branch</button>
          <button class="map-tab" data-location="sa">SA Branch</button>
        </div>
        
        <div class="dolf-map-section">
          <div class="dolf-map-address" id="mapAddress">Dolf Technologies - Multiple Locations (Red Pin: Egypt Branch, Blue Pin: SA Branch)</div>
          <div class="dolf-map-iframe" id="map">
            <div style="text-align: center; padding: 40px; color: #666;">
              Loading map...<br>
              <small>If the map doesn't load, please refresh the page</small>
            </div>
          </div>
        </div>
        ${createContinueButton('locations')}
      `;
      
      // Initialize the map
      setTimeout(() => {
        console.log('Initializing map with timeout...');
        initDolfMap('all');
        
        // Add event listeners for map tabs
        const mapTabs = document.querySelectorAll('.map-tab');
        console.log('Found map tabs:', mapTabs.length);
        
        mapTabs.forEach(tab => {
          tab.addEventListener('click', function() {
            console.log('Tab clicked:', this.getAttribute('data-location'));
            
            // Remove active class from all tabs
            mapTabs.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            this.classList.add('active');
            
            const location = this.getAttribute('data-location');
            console.log('Updating map for location:', location);
            updateDolfMap(location);
          });
        });
      }, 100);
    });
  }
});

// Add continue button to initial welcome message
document.addEventListener('DOMContentLoaded', function() {
  const initialContent = mainContent.innerHTML;
  if (initialContent.includes('Welcome to DolfTech Learning Portal') && initialContent.includes('Select a menu item to get started')) {
    mainContent.innerHTML = `
      <h1>Welcome to DolfTech Learning Portal</h1>
      <p>Select a menu item to get started.</p>
      ${createContinueButton('welcome')}
    `;
  }
});

// Add event listener for quiz submenu toggle
const quizDropdownToggle = document.getElementById('quizDropdownToggle');
const quizSubmenu = document.getElementById('quizSubmenu');
if (quizDropdownToggle && quizSubmenu) {
  quizDropdownToggle.tabIndex = 0;
  quizDropdownToggle.setAttribute('role', 'button');
  quizDropdownToggle.setAttribute('aria-expanded', 'false');
  quizDropdownToggle.addEventListener('click', function() {
    const isOpen = quizSubmenu.style.display === 'block';
    quizSubmenu.style.display = isOpen ? 'none' : 'block';
    quizDropdownToggle.setAttribute('aria-expanded', !isOpen);
  });
  quizDropdownToggle.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      quizDropdownToggle.click();
    }
  });
}
// Add event listeners for quiz submenu items
const quizSubmenuItems = document.querySelectorAll('.submenu-item[data-quiz]');
quizSubmenuItems.forEach(item => {
  item.addEventListener('click', function() {
    const quizNum = this.getAttribute('data-quiz');
    if (quizNum && quizzes[quizNum]) {
      const quiz = quizzes[quizNum];
      let optionsHtml = '';
      quiz.options.forEach((opt, idx) => {
        optionsHtml += `<input type=\"radio\" name=\"quiz${quizNum}\" value=\"${idx}\" id=\"option${idx}\">\n                        <label for=\"option${idx}\" class=\"quiz-option-label\">${opt}</label><br/>`;
      });
      mainContent.innerHTML = `
        <div class='card'>
          <h2>${quiz.question}</h2>
          <div class=\"quiz-options\">
            ${optionsHtml}
          </div>
          <div class='quiz-action-row'>
            <button id=\"submitQuiz\" class=\"submit-btn\">Submit</button>
            <div id=\"continueSection\" style=\"display:none;\">${createContinueButton(`quiz${quizNum}`, true)}</div>
          </div>
          <div id=\"quizFeedback\" style=\"margin-top:16px;font-weight:bold;text-align:center;\"></div>
        </div>
      `;
      attachQuizSubmitHandler(quizNum);
    }
  });
}); 