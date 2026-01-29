/**
 * AquaBlade Water Jet Services
 * Dynamic Pricing Calculator Application
 */

// ==========================================
// MATERIAL DATA & PRICING CONFIGURATION
// ==========================================
const MATERIALS = {
  'stone': {
    name: 'Stone & Granite',
    pierceFactor: 1.5,          // Multiplier for pierce time based on thickness
    basePierceTime: 8,          // Base pierce time in seconds for 10mm
    cutSpeed: 150,              // mm/min at 10mm thickness
    costPerMinute: 2.50,        // Base cost per cutting minute
    costMultiplier: 1.3,        // Material difficulty multiplier
    maxThickness: 150
  },
  'glass': {
    name: 'Glass & Crystal',
    pierceFactor: 1.2,
    basePierceTime: 5,
    cutSpeed: 200,
    costPerMinute: 2.50,
    costMultiplier: 1.1,
    maxThickness: 100
  },
  'steel': {
    name: 'Steel & Iron',
    pierceFactor: 2.0,
    basePierceTime: 12,
    cutSpeed: 120,
    costPerMinute: 2.50,
    costMultiplier: 1.5,
    maxThickness: 200
  },
  'stainless-steel': {
    name: 'Stainless Steel',
    pierceFactor: 2.5,
    basePierceTime: 15,
    cutSpeed: 100,
    costPerMinute: 2.50,
    costMultiplier: 1.8,
    maxThickness: 180
  },
  'rubber': {
    name: 'Rubber & Foam',
    pierceFactor: 0.5,
    basePierceTime: 2,
    cutSpeed: 400,
    costPerMinute: 2.50,
    costMultiplier: 0.7,
    maxThickness: 300
  },
  'carbon-fiber': {
    name: 'Carbon Fiber',
    pierceFactor: 1.8,
    basePierceTime: 10,
    cutSpeed: 180,
    costPerMinute: 2.50,
    costMultiplier: 2.0,
    maxThickness: 80
  },
  'aluminum': {
    name: 'Aluminum',
    pierceFactor: 1.0,
    basePierceTime: 4,
    cutSpeed: 250,
    costPerMinute: 2.50,
    costMultiplier: 0.9,
    maxThickness: 200
  },
  'titanium': {
    name: 'Titanium',
    pierceFactor: 3.0,
    basePierceTime: 18,
    cutSpeed: 80,
    costPerMinute: 2.50,
    costMultiplier: 2.5,
    maxThickness: 100
  },
  'copper': {
    name: 'Copper & Brass',
    pierceFactor: 1.3,
    basePierceTime: 6,
    cutSpeed: 180,
    costPerMinute: 2.50,
    costMultiplier: 1.2,
    maxThickness: 150
  },
  'ceramic': {
    name: 'Ceramic & Tile',
    pierceFactor: 1.4,
    basePierceTime: 7,
    cutSpeed: 160,
    costPerMinute: 2.50,
    costMultiplier: 1.4,
    maxThickness: 50
  }
};

// ==========================================
// STATE MANAGEMENT
// ==========================================
let appState = {
  file: null,
  fileName: '',
  pathLength: 0,
  pierceCount: 1,
  parsedEntities: []
};

// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initMobileMenu();
  initFileUpload();
  initCalculator();
  initSmoothScroll();
  initAnimations();
});

// ==========================================
// HEADER SCROLL EFFECT
// ==========================================
function initHeader() {
  const header = document.getElementById('header');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

// ==========================================
// MOBILE MENU
// ==========================================
function initMobileMenu() {
  const menuBtn = document.getElementById('mobileMenuBtn');
  const navLinks = document.getElementById('navLinks');

  menuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    menuBtn.classList.toggle('active');
  });

  // Close menu when clicking a link
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      menuBtn.classList.remove('active');
    });
  });
}

// ==========================================
// FILE UPLOAD HANDLING
// ==========================================
function initFileUpload() {
  const fileUpload = document.getElementById('fileUpload');
  const fileInput = document.getElementById('cadFile');
  const fileInfo = document.getElementById('fileInfo');
  const fileName = document.getElementById('fileName');
  const removeFile = document.getElementById('removeFile');

  // Drag and drop events
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    fileUpload.addEventListener(eventName, preventDefaults, false);
  });

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  ['dragenter', 'dragover'].forEach(eventName => {
    fileUpload.addEventListener(eventName, () => {
      fileUpload.classList.add('drag-over');
    });
  });

  ['dragleave', 'drop'].forEach(eventName => {
    fileUpload.addEventListener(eventName, () => {
      fileUpload.classList.remove('drag-over');
    });
  });

  // Handle file drop
  fileUpload.addEventListener('drop', (e) => {
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  });

  // Handle file input change
  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  });

  // Remove file button
  removeFile.addEventListener('click', () => {
    appState.file = null;
    appState.fileName = '';
    appState.pathLength = 0;
    appState.pierceCount = 1;
    appState.parsedEntities = [];

    fileInput.value = '';
    fileInfo.classList.remove('visible');
    document.getElementById('pathLength').value = '';
    document.getElementById('pierceCount').value = '1';
  });
}

// ==========================================
// FILE PROCESSING
// ==========================================
function handleFile(file) {
  const validExtensions = ['.dxf', '.dwg'];
  const extension = '.' + file.name.split('.').pop().toLowerCase();

  if (!validExtensions.includes(extension)) {
    showNotification('Please upload a DXF or DWG file', 'error');
    return;
  }

  appState.file = file;
  appState.fileName = file.name;

  // Update UI
  document.getElementById('fileName').textContent = file.name;
  document.getElementById('fileInfo').classList.add('visible');

  // Parse the file
  if (extension === '.dxf') {
    parseDXFFile(file);
  } else {
    // DWG files require server-side processing
    showNotification('DWG file uploaded. For accurate measurement, consider converting to DXF.', 'warning');
    // Use default estimate
    estimateFromFileSize(file);
  }
}

// ==========================================
// DXF PARSER
// ==========================================
function parseDXFFile(file) {
  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      const content = e.target.result;
      const result = parseDXF(content);

      appState.pathLength = result.totalLength;
      appState.pierceCount = result.pierceCount;
      appState.parsedEntities = result.entities;

      // Update form fields
      document.getElementById('pathLength').value = Math.round(result.totalLength);
      document.getElementById('pierceCount').value = result.pierceCount;

      showNotification(`File parsed: ${result.entities.length} entities, ${Math.round(result.totalLength)}mm path`, 'success');
    } catch (error) {
      console.error('DXF parsing error:', error);
      showNotification('Error parsing file. Please enter values manually.', 'error');
    }
  };

  reader.readAsText(file);
}

// Simple DXF Parser
function parseDXF(content) {
  const entities = [];
  let totalLength = 0;
  let pierceCount = 0;

  // Split into lines and parse
  const lines = content.split('\n').map(l => l.trim());
  let i = 0;

  // Find ENTITIES section
  while (i < lines.length && lines[i] !== 'ENTITIES') {
    i++;
  }

  // Parse entities
  let currentEntity = null;
  let entityData = {};

  while (i < lines.length && lines[i] !== 'ENDSEC') {
    const code = parseInt(lines[i]);
    const value = lines[i + 1];

    if (code === 0) {
      // New entity type
      if (currentEntity) {
        const result = calculateEntityLength(currentEntity, entityData);
        if (result.length > 0) {
          entities.push({ type: currentEntity, ...entityData, length: result.length });
          totalLength += result.length;
          pierceCount += result.pierces;
        }
      }
      currentEntity = value;
      entityData = {};
    } else if (currentEntity) {
      // Store entity data by group code
      switch (code) {
        case 10: entityData.x1 = parseFloat(value); break;
        case 20: entityData.y1 = parseFloat(value); break;
        case 11: entityData.x2 = parseFloat(value); break;
        case 21: entityData.y2 = parseFloat(value); break;
        case 40: entityData.radius = parseFloat(value); break;
        case 50: entityData.startAngle = parseFloat(value); break;
        case 51: entityData.endAngle = parseFloat(value); break;
        case 42: entityData.bulge = parseFloat(value); break;
      }
    }

    i += 2;
  }

  // Process last entity
  if (currentEntity) {
    const result = calculateEntityLength(currentEntity, entityData);
    if (result.length > 0) {
      entities.push({ type: currentEntity, ...entityData, length: result.length });
      totalLength += result.length;
      pierceCount += result.pierces;
    }
  }

  // Minimum 1 pierce
  pierceCount = Math.max(1, pierceCount);

  return { entities, totalLength, pierceCount };
}

function calculateEntityLength(type, data) {
  let length = 0;
  let pierces = 0;

  switch (type) {
    case 'LINE':
      if (data.x1 !== undefined && data.y1 !== undefined &&
        data.x2 !== undefined && data.y2 !== undefined) {
        length = Math.sqrt(
          Math.pow(data.x2 - data.x1, 2) +
          Math.pow(data.y2 - data.y1, 2)
        );
        pierces = 1;
      }
      break;

    case 'CIRCLE':
      if (data.radius !== undefined) {
        length = 2 * Math.PI * data.radius;
        pierces = 1;
      }
      break;

    case 'ARC':
      if (data.radius !== undefined) {
        let startAngle = data.startAngle || 0;
        let endAngle = data.endAngle || 360;
        let angleDiff = endAngle - startAngle;
        if (angleDiff < 0) angleDiff += 360;
        length = (angleDiff / 360) * 2 * Math.PI * data.radius;
        pierces = 1;
      }
      break;

    case 'POLYLINE':
    case 'LWPOLYLINE':
      // Polylines are more complex, estimate based on vertex count
      pierces = 1;
      break;

    case 'SPLINE':
      // Splines need control points - use rough estimate
      pierces = 1;
      break;
  }

  return { length, pierces };
}

function estimateFromFileSize(file) {
  // Rough estimate based on file size for DWG files
  // Assuming ~100 bytes per entity, ~50mm average per entity
  const estimatedEntities = Math.floor(file.size / 100);
  const estimatedLength = estimatedEntities * 50;

  appState.pathLength = estimatedLength;
  appState.pierceCount = Math.max(1, Math.floor(estimatedEntities / 10));

  document.getElementById('pathLength').value = Math.round(estimatedLength);
  document.getElementById('pierceCount').value = appState.pierceCount;

  showNotification('Path length estimated from file. Adjust manually for accuracy.', 'info');
}

// ==========================================
// CALCULATOR
// ==========================================
function initCalculator() {
  const form = document.getElementById('calculatorForm');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculateCost();
  });
}

function calculateCost() {
  // Get form values
  const materialKey = document.getElementById('material').value;
  const thickness = parseFloat(document.getElementById('thickness').value);
  const quantity = parseInt(document.getElementById('quantity').value) || 1;
  const pathLength = parseFloat(document.getElementById('pathLength').value) || appState.pathLength;
  const pierceCount = parseInt(document.getElementById('pierceCount').value) || appState.pierceCount || 1;

  // Validation
  if (!materialKey) {
    showNotification('Please select a material', 'error');
    return;
  }

  if (!thickness || thickness <= 0) {
    showNotification('Please enter a valid thickness', 'error');
    return;
  }

  if (!pathLength || pathLength <= 0) {
    showNotification('Please upload a file or enter cutting path length', 'error');
    return;
  }

  const material = MATERIALS[materialKey];

  if (thickness > material.maxThickness) {
    showNotification(`Maximum thickness for ${material.name} is ${material.maxThickness}mm`, 'error');
    return;
  }

  // ==========================================
  // CALCULATE PIERCE TIME
  // ==========================================
  // Pierce time increases exponentially with thickness
  const thicknessRatio = thickness / 10; // Normalize to 10mm baseline
  const pierceTimePerPierce = material.basePierceTime * Math.pow(thicknessRatio, material.pierceFactor);
  const totalPierceTime = pierceTimePerPierce * pierceCount;

  // ==========================================
  // CALCULATE CUT TIME
  // ==========================================
  // Cut speed decreases with thickness
  const adjustedCutSpeed = material.cutSpeed / Math.pow(thicknessRatio, 0.8);
  const cutTimeMinutes = pathLength / adjustedCutSpeed;

  // ==========================================
  // CALCULATE COST
  // ==========================================
  // Total time in minutes
  const totalTimeMinutes = (totalPierceTime / 60) + cutTimeMinutes;

  // Base cutting cost
  const baseCost = totalTimeMinutes * material.costPerMinute * material.costMultiplier;

  // Add setup cost (fixed)
  const setupCost = 15;

  // Total for one piece
  const costPerPiece = baseCost + (setupCost / quantity);
  const totalCost = costPerPiece * quantity;

  // ==========================================
  // DISPLAY RESULTS
  // ==========================================
  displayResults({
    material: material.name,
    thickness,
    pathLength,
    pierceCount,
    quantity,
    pierceTimePerPierce,
    totalPierceTime,
    cutSpeed: adjustedCutSpeed,
    cutTimeMinutes,
    totalTimeMinutes,
    costPerMinute: material.costPerMinute * material.costMultiplier,
    costPerPiece,
    totalCost,
    setupCost
  });
}

function displayResults(data) {
  const resultsSection = document.getElementById('resultsSection');
  const resultsBody = document.getElementById('resultsBody');

  // Build table rows
  resultsBody.innerHTML = `
    <tr>
      <td>Material</td>
      <td><strong>${data.material}</strong></td>
      <td>-</td>
    </tr>
    <tr>
      <td>Material Thickness</td>
      <td>${data.thickness}</td>
      <td>mm</td>
    </tr>
    <tr>
      <td>Cutting Path Length</td>
      <td>${formatNumber(data.pathLength)}</td>
      <td>mm</td>
    </tr>
    <tr>
      <td>Number of Pierces</td>
      <td>${data.pierceCount}</td>
      <td>-</td>
    </tr>
    <tr>
      <td>Pierce Time (per pierce)</td>
      <td>${data.pierceTimePerPierce.toFixed(1)}</td>
      <td>seconds</td>
    </tr>
    <tr>
      <td>Adjusted Cut Speed</td>
      <td>${data.cutSpeed.toFixed(1)}</td>
      <td>mm/min</td>
    </tr>
    <tr>
      <td>Total Cutting Time</td>
      <td>${data.totalTimeMinutes.toFixed(2)}</td>
      <td>minutes</td>
    </tr>
    <tr>
      <td>Quantity</td>
      <td>${data.quantity}</td>
      <td>pieces</td>
    </tr>
    <tr>
      <td>Cost Per Piece</td>
      <td class="highlight">$${data.costPerPiece.toFixed(2)}</td>
      <td>USD</td>
    </tr>
  `;

  // Update summary cards
  document.getElementById('totalPierceTime').textContent =
    data.totalPierceTime >= 60
      ? `${(data.totalPierceTime / 60).toFixed(1)} min`
      : `${data.totalPierceTime.toFixed(1)} sec`;

  document.getElementById('totalCutTime').textContent =
    data.cutTimeMinutes >= 60
      ? `${(data.cutTimeMinutes / 60).toFixed(1)} hr`
      : `${data.cutTimeMinutes.toFixed(1)} min`;

  document.getElementById('totalCost').textContent = `$${data.totalCost.toFixed(2)}`;

  // Show results with animation
  resultsSection.classList.add('visible');

  // Scroll to results
  resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ==========================================
// NOTIFICATIONS
// ==========================================
function showNotification(message, type = 'info') {
  // Remove existing notifications
  const existing = document.querySelector('.notification');
  if (existing) existing.remove();

  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <span>${message}</span>
    <button onclick="this.parentElement.remove()">×</button>
  `;

  // Add styles if not already present
  if (!document.getElementById('notificationStyles')) {
    const style = document.createElement('style');
    style.id = 'notificationStyles';
    style.textContent = `
      .notification {
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        display: flex;
        align-items: center;
        gap: 1rem;
        font-weight: 500;
        z-index: 9999;
        animation: slideIn 0.3s ease;
        box-shadow: 0 10px 40px rgba(0,0,0,0.15);
      }
      .notification-success {
        background: linear-gradient(135deg, #00C853, #00E676);
        color: white;
      }
      .notification-error {
        background: linear-gradient(135deg, #FF5252, #FF1744);
        color: white;
      }
      .notification-warning {
        background: linear-gradient(135deg, #FFB300, #FFC107);
        color: #333;
      }
      .notification-info {
        background: linear-gradient(135deg, #4FC3F7, #00B8D4);
        color: white;
      }
      .notification button {
        background: none;
        border: none;
        color: inherit;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0;
        line-height: 1;
        opacity: 0.7;
        transition: opacity 0.2s;
      }
      .notification button:hover {
        opacity: 1;
      }
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(notification);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.style.animation = 'slideIn 0.3s ease reverse';
      setTimeout(() => notification.remove(), 300);
    }
  }, 5000);
}

// ==========================================
// SMOOTH SCROLLING
// ==========================================
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        const headerOffset = 80;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

// ==========================================
// ANIMATIONS ON SCROLL
// ==========================================
function initAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  // Observe material cards
  document.querySelectorAll('.material-card').forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = `all 0.6s ease ${index * 0.1}s`;
    observer.observe(card);
  });

  // Observe feature items
  document.querySelectorAll('.feature-item').forEach((item, index) => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(20px)';
    item.style.transition = `all 0.5s ease ${index * 0.1}s`;
    observer.observe(item);
  });

  // Observe stat items
  document.querySelectorAll('.stat-item').forEach((stat, index) => {
    stat.style.opacity = '0';
    stat.style.transform = 'translateY(20px)';
    stat.style.transition = `all 0.5s ease ${index * 0.1}s`;
    observer.observe(stat);
  });
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================
function formatNumber(num) {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2
  }).format(num);
}

// Add counter animation for stats
function animateCounters() {
  const counters = document.querySelectorAll('.stat-number');

  counters.forEach(counter => {
    const target = counter.textContent;
    const isPercentage = target.includes('%');
    const hasPlus = target.includes('+');
    const hasK = target.includes('K');

    let numValue = parseFloat(target.replace(/[^0-9.]/g, ''));

    if (hasK) numValue *= 1000;

    let current = 0;
    const increment = numValue / 50;
    const duration = 2000;
    const stepTime = duration / 50;

    const timer = setInterval(() => {
      current += increment;
      if (current >= numValue) {
        current = numValue;
        clearInterval(timer);
      }

      let displayValue = current;
      if (hasK && current >= 1000) {
        displayValue = (current / 1000).toFixed(current >= numValue ? 0 : 1) + 'K';
      } else {
        displayValue = Math.round(current);
      }

      counter.textContent = (hasPlus ? '' : '') + displayValue + (hasPlus ? '+' : '') + (isPercentage ? '%' : '');
    }, stepTime);
  });
}

// Trigger counter animation when stats section is visible
const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounters();
      statsObserver.disconnect();
    }
  });
}, { threshold: 0.5 });

document.addEventListener('DOMContentLoaded', () => {
  const statsGrid = document.querySelector('.stats-grid');
  if (statsGrid) {
    statsObserver.observe(statsGrid);
  }

  // Initialize work carousel
  initWorkCarousel();
});

// ==========================================
// WORK CAROUSEL
// ==========================================
function initWorkCarousel() {
  const carousel = document.getElementById('workCarousel');
  if (!carousel) return;

  const images = carousel.querySelectorAll('.carousel-image');
  const prevBtn = carousel.querySelector('.carousel-prev');
  const nextBtn = carousel.querySelector('.carousel-next');
  const dotsContainer = document.getElementById('carouselDots');

  let currentIndex = 0;
  const totalImages = images.length;

  // Create dots
  images.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.className = `carousel-dot${index === 0 ? ' active' : ''}`;
    dot.setAttribute('aria-label', `Go to image ${index + 1}`);
    dot.addEventListener('click', () => goToSlide(index));
    dotsContainer.appendChild(dot);
  });

  const dots = dotsContainer.querySelectorAll('.carousel-dot');

  function updateCarousel() {
    images.forEach((img, index) => {
      img.classList.toggle('active', index === currentIndex);
    });
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentIndex);
    });
  }

  function goToSlide(index) {
    currentIndex = index;
    updateCarousel();
  }

  function nextSlide() {
    currentIndex = (currentIndex + 1) % totalImages;
    updateCarousel();
  }

  function prevSlide() {
    currentIndex = (currentIndex - 1 + totalImages) % totalImages;
    updateCarousel();
  }

  // Event listeners
  nextBtn.addEventListener('click', nextSlide);
  prevBtn.addEventListener('click', prevSlide);

  // Auto-advance every 4 seconds
  let autoPlay = setInterval(nextSlide, 4000);

  // Pause on hover
  carousel.addEventListener('mouseenter', () => clearInterval(autoPlay));
  carousel.addEventListener('mouseleave', () => {
    autoPlay = setInterval(nextSlide, 4000);
  });

  // Touch/swipe support
  let touchStartX = 0;
  let touchEndX = 0;

  carousel.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  carousel.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    const swipeThreshold = 50;
    if (touchEndX < touchStartX - swipeThreshold) {
      nextSlide();
    } else if (touchEndX > touchStartX + swipeThreshold) {
      prevSlide();
    }
  }
}
