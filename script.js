// script.js loaded
console.log("script.js loaded");

/**
 * Get element by selector with a clear error if missing.
 * @param {string} sel
 * @returns {HTMLElement}
 */
function $(sel) {
  const el = document.querySelector(sel);
  if (!el) {
    console.warn(`Selector not found: ${sel}`);
  }
  return el;
}

/**
 * Set text content safely.
 * @param {HTMLElement} el
 * @param {string} text
 */
function setText(el, text) {
  if (el) el.textContent = text;
}

/**
 * Show an error message near a field.
 * @param {HTMLElement} errorEl
 * @param {string} msg
 */
function showError(errorEl, msg) {
  if (!errorEl) return;
  errorEl.textContent = msg;
  errorEl.style.display = msg ? "block" : "none";
}

/**
 * Debounce helper for performant real-time validation.
 * @param {Function} fn
 * @param {number} delay
 */
function debounce(fn, delay = 250) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}

// ===== Global State / Constants =====
const LS_KEYS = {
  theme: "sid_theme",
  formDraft: "sid_contact_draft",
};

const EMAIL_REGEX =
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// ===== DOM References =====
const statusBar = $("#statusBar");
const themeToggleBtn = $("#themeToggle");
const bodyEl = document.body;

const contactForm = $("#contactForm");
const nameInput = $("#name");
const emailInput = $("#email");
const messageInput = $("#message");
const nameError = $("#nameError");
const emailError = $("#emailError");
const messageError = $("#messageError");
const formFeedback = $("#formFeedback");

const skillsControls = $("#skillsControls");
const skillsList = $("#skillsList");

const gallery = $("#gallery");
const lightbox = $("#lightbox");
const lightboxImg = $("#lightboxImg");
const lightboxClose = $("#lightboxClose");

// ===== Status Notification Toast =====
function updateStatus(message, ms = 2000) {
  if (!statusBar) return;
  setText(statusBar, message);
  statusBar.style.display = 'block';
  statusBar.setAttribute('aria-hidden', 'false');
  clearTimeout(updateStatus._t);
  updateStatus._t = setTimeout(() => { 
    statusBar.style.display = 'none'; 
    statusBar.setAttribute('aria-hidden', 'true');
  }, ms);
}

// Dynamic footer year
(function setFooterYear() {
  const yearEl = document.querySelector('#year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
})();

// ===== Event Handling =====
// Smooth scroll for internal links & auto-close mobile nav
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (e) => {
    const id = link.getAttribute('href');
    if (!id || id === '#') return;
    e.preventDefault();
    const target = document.querySelector(id);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (document.querySelector('#mainNav')?.classList.contains('open')) {
      document.querySelector('#mainNav').classList.remove('open');
      document.querySelector('#navToggle')?.setAttribute('aria-expanded', 'false');
    }
  });
});

// Header shrink on scroll
(function headerScroll() {
  const header = document.getElementById('siteHeader');
  if (!header) return;
  const onScroll = () => {
    if (window.scrollY > 64) header.classList.add('shrink'); else header.classList.remove('shrink');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

// Nav toggle for mobile
const navToggle = document.querySelector('#navToggle');
const mainNav = document.querySelector('#mainNav');
if (navToggle && mainNav) {
  navToggle.addEventListener('click', () => {
    const open = mainNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
}

// Reveal-on-scroll (intersection observer)
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));


// ===== Interactive Terminal Logic =====
const terminalInput = $("#terminalInput");
const terminalBody = $("#terminalBody");

if (terminalInput && terminalBody) {
  terminalInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const value = terminalInput.value.trim();
      terminalInput.value = "";
      if (value) {
        handleTerminalCommand(value);
      }
    }
  });

  // Keep terminal text input focused when clicking inside the console window
  $("#terminalWidget")?.addEventListener("click", () => {
    terminalInput.focus();
  });
}

function appendTerminalLine(text, type = "") {
  if (!terminalBody) return;
  const line = document.createElement("div");
  line.className = `terminal-line ${type}`;
  line.innerHTML = text;
  
  // Insert before the input line
  const inputLine = terminalBody.querySelector(".terminal-input-line");
  terminalBody.insertBefore(line, inputLine);
  
  // Scroll to bottom
  terminalBody.scrollTop = terminalBody.scrollHeight;
}

function handleTerminalCommand(cmd) {
  // Echo user input
  appendTerminalLine(`<span class="terminal-prompt">sid$</span> ${escapeHTML(cmd)}`);

  const cleanCmd = cmd.toLowerCase().trim();

  switch (cleanCmd) {
    case "help":
      appendTerminalLine(`Available commands:
  <span class="terminal-output--success">about</span>    - Siddharth's biography
  <span class="terminal-output--success">skills</span>   - List of technical capabilities
  <span class="terminal-output--success">projects</span> - View engineering portfolio summary
  <span class="terminal-output--success">contact</span>  - Prefill the contact form for easy message submission
  <span class="terminal-output--success">clear</span>    - Clear terminal logs`);
      break;

    case "about":
      appendTerminalLine(`Siddharth is a resilient backend developer and competitive programmer with a passion for building robust backend services. High contest ranking in Naukri Campus CodeQuezt (AIR 64/26K+) and 400+ LeetCode algorithms solved.`);
      break;

    case "skills":
      appendTerminalLine(`{
  "languages": ["C++", "Java", "Python", "JavaScript"],
  "backend": ["Spring Boot", "MySQL", "Docker", "Redis", "Nginx"],
  "cloud": ["AWS (ECS, VPC, EC2)"],
  "competencies": ["Data Structures & Algorithms", "OOPs", "Multithreading"]
}`, "terminal-output");
      break;

    case "projects":
      appendTerminalLine(`Featured Projects:
  1. <span class="terminal-output--success">project 1</span> - C++ Distributed Ledger (Blockchain local node)
  2. <span class="terminal-output--success">project 2</span> - Dockerized Scalable Web Service (Spring Boot + Nginx)
  3. <span class="terminal-output--success">project 3</span> - Python Strategy Backtester
Type e.g., "<span class="terminal-output--success">project 1</span>" to open its details modal!`);
      break;

    case "project 1":
      openProjectModalFromId("card-proj-1");
      appendTerminalLine("Opening details for Project One...", "terminal-output--success");
      break;

    case "project 2":
      openProjectModalFromId("card-proj-2");
      appendTerminalLine("Opening details for Project Two...", "terminal-output--success");
      break;

    case "project 3":
      openProjectModalFromId("card-proj-3");
      appendTerminalLine("Opening details for Project Three...", "terminal-output--success");
      break;

    case "contact":
      appendTerminalLine("Prefilling the contact form with a Recruiter template...", "terminal-output--success");
      prefillContactForm();
      break;

    case "clear":
      const inputLine = terminalBody.querySelector(".terminal-input-line");
      terminalBody.innerHTML = "";
      terminalBody.appendChild(inputLine);
      appendTerminalLine(`Terminal cleared. Type <span class="terminal-output--success">help</span> for commands.`);
      break;

    default:
      appendTerminalLine(`Command not found: "${escapeHTML(cmd)}". Type <span class="terminal-output--success">help</span> to list commands.`, "terminal-output--error");
  }
}

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

function prefillContactForm() {
  if (nameInput) nameInput.value = "Recruiter / Hiring Manager";
  if (emailInput) emailInput.value = "hiring@company.com";
  if (messageInput) messageInput.value = "Hi Siddharth, we reviewed your interactive portfolio and liked your Backend Architecture Simulator. Let's schedule a call to discuss backend engineering opportunities!";
  
  // Save to drafts automatically
  saveFormDraft();
  
  // Smooth scroll down to contact section
  const contactSec = document.querySelector("#contact");
  if (contactSec) {
    contactSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    pulseNode("contactForm", "var(--color-primary)");
  }
  updateStatus("Prefilled contact form. Feel free to edit and send!");
}


// ===== Playground Tabs Logic =====
const tabBtns = document.querySelectorAll(".tab-btn[data-tab]");
tabBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    // Deactivate all
    tabBtns.forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
    
    // Activate target
    btn.classList.add("active");
    const target = btn.dataset.tab;
    const tabContent = document.getElementById(`tabContent${target.charAt(0).toUpperCase() + target.slice(1)}`);
    if (tabContent) {
      tabContent.classList.add("active");
    }
    
    updateStatus(`Switched to ${btn.textContent}`);
    
    // Initialize array if switching to DSA Visualizer
    if (target === "dsa" && dsaArray.length === 0) {
      randomiseDsaArray();
    }
  });
});


// ===== System Design Simulator Logic =====
let isCacheEnabled = true;
let isServerACrashed = false;
let isSimulationRunning = false;

const btnSendRequest = $("#btnSendRequest");
const btnToggleCache = $("#btnToggleCache");
const btnCrashServerA = $("#btnCrashServerA");
const btnLoadSpike = $("#btnLoadSpike");

const lblLatency = $("#lblLatency");
const lblRoute = $("#lblRoute");
const lblCacheResult = $("#lblCacheResult");

if (btnSendRequest) {
  btnSendRequest.addEventListener("click", () => {
    if (isSimulationRunning) return;
    isSimulationRunning = true;
    btnSendRequest.disabled = true;
    btnLoadSpike.disabled = true;
    runRequestSequence(() => {
      isSimulationRunning = false;
      btnSendRequest.disabled = false;
      btnLoadSpike.disabled = false;
    });
  });
}

if (btnToggleCache) {
  btnToggleCache.addEventListener("click", () => {
    isCacheEnabled = !isCacheEnabled;
    btnToggleCache.classList.toggle("active", isCacheEnabled);
    
    const cacheStatusText = document.getElementById("status-cache");
    const cacheLight = document.getElementById("light-cache");
    const cacheRect = document.getElementById("rect-cache");
    
    if (cacheStatusText) cacheStatusText.textContent = isCacheEnabled ? "ENABLED" : "DISABLED";
    if (cacheLight) cacheLight.setAttribute("fill", isCacheEnabled ? "#a855f7" : "#ef4444");
    if (cacheRect) cacheRect.setAttribute("stroke", isCacheEnabled ? "#a855f7" : "#475569");
    
    updateStatus(`Redis cache ${isCacheEnabled ? 'enabled (Fast Hops)' : 'disabled (Direct DB lookup)'}`);
  });
}

if (btnCrashServerA) {
  btnCrashServerA.addEventListener("click", () => {
    isServerACrashed = !isServerACrashed;
    btnCrashServerA.classList.toggle("active", isServerACrashed);
    btnCrashServerA.textContent = isServerACrashed ? "⚡ Restore Server A" : "💥 Crash Server A";
    
    const serverStatusText = document.getElementById("status-server-a");
    const serverLight = document.getElementById("light-server-a");
    const serverRect = document.getElementById("rect-server-a");
    
    if (serverStatusText) serverStatusText.textContent = isServerACrashed ? "OFFLINE" : "ONLINE";
    if (serverLight) serverLight.setAttribute("fill", isServerACrashed ? "#ef4444" : "#10b981");
    if (serverRect) serverRect.setAttribute("stroke", isServerACrashed ? "#ef4444" : "#10b981");
    
    pulseNode("node-server-a", isServerACrashed ? "var(--color-danger)" : "var(--color-success)");
    updateStatus(`Server A is now ${isServerACrashed ? 'OFFLINE' : 'ONLINE'}. Nginx will failover.`);
  });
}

if (btnLoadSpike) {
  btnLoadSpike.addEventListener("click", () => {
    if (isSimulationRunning) return;
    isSimulationRunning = true;
    btnSendRequest.disabled = true;
    btnLoadSpike.disabled = true;
    
    let count = 0;
    const interval = setInterval(() => {
      runRequestSequence();
      count++;
      if (count >= 10) {
        clearInterval(interval);
        setTimeout(() => {
          isSimulationRunning = false;
          btnSendRequest.disabled = false;
          btnLoadSpike.disabled = false;
        }, 1500);
      }
    }, 1500 / 10);
    
    updateStatus("Sending load spike of 10 concurrent requests...");
  });
}

function animatePacket(pathId, duration, onComplete) {
  const path = document.getElementById(pathId);
  if (!path) {
    if (onComplete) onComplete();
    return;
  }
  
  const svg = path.ownerSVGElement;
  const pathD = path.getAttribute("d");
  
  const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  circle.setAttribute("r", "5");
  circle.setAttribute("fill", "var(--color-accent)");
  circle.style.filter = "drop-shadow(0 0 3px var(--color-accent))";
  
  const anim = document.createElementNS("http://www.w3.org/2000/svg", "animateMotion");
  anim.setAttribute("dur", `${duration}ms`);
  anim.setAttribute("repeatCount", "1");
  anim.setAttribute("fill", "freeze");
  anim.setAttribute("path", pathD);
  
  circle.appendChild(anim);
  svg.appendChild(circle);
  
  // Begin the motion animation
  anim.beginElement();
  
  setTimeout(() => {
    circle.remove();
    if (onComplete) onComplete();
  }, duration);
}

function pulseNode(nodeId, color) {
  const g = document.getElementById(nodeId);
  if (!g) return;
  const target = g.querySelector("rect") || g.querySelector("circle");
  if (!target) return;
  
  const originalStroke = target.getAttribute("stroke");
  const originalWidth = target.getAttribute("stroke-width") || "2";
  
  target.setAttribute("stroke", color);
  target.setAttribute("stroke-width", "4");
  
  setTimeout(() => {
    target.setAttribute("stroke", originalStroke);
    target.setAttribute("stroke-width", originalWidth);
  }, 400);
}

function runRequestSequence(callback) {
  const selectedServer = isServerACrashed ? "b" : "a";
  const hasCache = isCacheEnabled;
  
  if (lblRoute) lblRoute.textContent = "Routing Request...";
  
  // Connection line active state
  document.getElementById("conn-client-lb")?.classList.add("active");
  
  // Hop 1: Client to LB
  animatePacket("conn-client-lb", 350, () => {
    document.getElementById("conn-client-lb")?.classList.remove("active");
    pulseNode("node-lb", "var(--color-accent)");
    
    if (lblRoute) lblRoute.textContent = `Nginx ➔ Server ${selectedServer.toUpperCase()}`;
    document.getElementById(`conn-lb-server-${selectedServer}`)?.classList.add("active");
    
    // Hop 2: LB to Server
    animatePacket(`conn-lb-server-${selectedServer}`, 350, () => {
      document.getElementById(`conn-lb-server-${selectedServer}`)?.classList.remove("active");
      pulseNode(`node-server-${selectedServer}`, "var(--color-success)");
      
      // Hop 3: Check cache
      if (hasCache) {
        if (lblCacheResult) {
          lblCacheResult.textContent = "HIT";
          lblCacheResult.style.color = "var(--color-success)";
        }
        
        const hitLatency = Math.floor(Math.random() * 4) + 4; // 4-7ms
        if (lblLatency) lblLatency.textContent = `${hitLatency} ms`;
        
        document.getElementById(`conn-server-${selectedServer}-cache`)?.classList.add("active");
        
        animatePacket(`conn-server-${selectedServer}-cache`, 200, () => {
          document.getElementById(`conn-server-${selectedServer}-cache`)?.classList.remove("active");
          pulseNode("node-cache", "#a855f7");
          
          if (lblRoute) lblRoute.textContent = "Done (Cache Hit)";
          pulseNode("node-client", "var(--color-success)");
          
          if (callback) callback();
        });
      } else {
        if (lblCacheResult) {
          lblCacheResult.textContent = "MISS";
          lblCacheResult.style.color = "var(--color-danger)";
        }
        
        document.getElementById(`conn-server-${selectedServer}-cache`)?.classList.add("active");
        
        // Cache misses check Cache first, then go to Database
        animatePacket(`conn-server-${selectedServer}-cache`, 200, () => {
          document.getElementById(`conn-server-${selectedServer}-cache`)?.classList.remove("active");
          pulseNode("node-cache", "var(--color-danger)");
          
          if (lblRoute) lblRoute.textContent = `Server ${selectedServer.toUpperCase()} ➔ MySQL DB`;
          document.getElementById(`conn-server-${selectedServer}-db`)?.classList.add("active");
          
          // Hop 4: Server to Database
          animatePacket(`conn-server-${selectedServer}-db`, 450, () => {
            document.getElementById(`conn-server-${selectedServer}-db`)?.classList.remove("active");
            pulseNode("node-db", "#f59e0b");
            
            const dbLatency = Math.floor(Math.random() * 40) + 120; // 120-160ms
            if (lblLatency) lblLatency.textContent = `${dbLatency} ms`;
            if (lblRoute) lblRoute.textContent = "Done (DB Query)";
            pulseNode("node-client", "var(--color-success)");
            
            if (callback) callback();
          });
        });
      }
    });
  });
}


// ===== DSA Sorting Visualizer Logic =====
let dsaArray = [];
let comparisonsCount = 0;
let swapsCount = 0;
let isSorting = false;
let sortingAbortController = null;

const dsaCanvas = $("#dsaCanvas");
const dsaAlgoSelect = $("#dsaAlgo");
const dsaSpeedSelect = $("#dsaSpeed");

const btnDsaRandom = $("#btnDsaRandom");
const btnDsaSort = $("#btnDsaSort");

const lblDsaComparisons = $("#dsaComparisons");
const lblDsaSwaps = $("#dsaSwaps");
const lblDsaAction = $("#dsaAction");
const lblDsaAlgo = $("#lblDsaAlgo");

function randomiseDsaArray() {
  if (isSorting) {
    stopSorting();
  }
  
  dsaArray = [];
  comparisonsCount = 0;
  swapsCount = 0;
  updateDsaStats("Idle");
  
  const size = 20; // fixed size for visual layout
  for (let i = 0; i < size; i++) {
    // Generate height percentage values from 12% to 95%
    dsaArray.push(Math.floor(Math.random() * 83) + 12);
  }
  
  renderDsaArray();
}

function renderDsaArray() {
  if (!dsaCanvas) return;
  dsaCanvas.innerHTML = "";
  
  dsaArray.forEach(val => {
    const bar = document.createElement("div");
    bar.className = "dsa-bar";
    bar.style.height = `${val}%`;
    dsaCanvas.appendChild(bar);
  });
}

function updateDsaStats(status = "") {
  if (lblDsaComparisons) lblDsaComparisons.textContent = comparisonsCount;
  if (lblDsaSwaps) lblDsaSwaps.textContent = swapsCount;
  if (lblDsaAction && status) lblDsaAction.textContent = status;
}

if (btnDsaRandom) {
  btnDsaRandom.addEventListener("click", randomiseDsaArray);
}

if (btnDsaSort) {
  btnDsaSort.addEventListener("click", async () => {
    if (isSorting) {
      stopSorting();
      return;
    }
    
    isSorting = true;
    btnDsaSort.textContent = "⏹️ Stop";
    btnDsaRandom.disabled = true;
    if (dsaAlgoSelect) dsaAlgoSelect.disabled = true;
    
    comparisonsCount = 0;
    swapsCount = 0;
    updateDsaStats("Sorting...");
    
    const algo = dsaAlgoSelect ? dsaAlgoSelect.value : "bubble";
    if (lblDsaAlgo) {
      lblDsaAlgo.textContent = algo === "bubble" ? "Bubble Sort" : algo === "quick" ? "Quick Sort" : "Selection Sort";
    }
    
    try {
      if (algo === "bubble") {
        await runBubbleSort(dsaArray);
      } else if (algo === "selection") {
        await runSelectionSort(dsaArray);
      } else if (algo === "quick") {
        await runQuickSort(dsaArray, 0, dsaArray.length - 1);
      }
      
      if (isSorting) {
        await animateSortedWave();
        updateDsaStats("Sorted! ✅");
      }
    } catch (e) {
      console.log("Sorting execution interrupted", e);
    } finally {
      isSorting = false;
      btnDsaSort.textContent = "▶️ Sort";
      btnDsaRandom.disabled = false;
      if (dsaAlgoSelect) dsaAlgoSelect.disabled = false;
    }
  });
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function getDsaDelay() {
  const speed = dsaSpeedSelect ? dsaSpeedSelect.value : "medium";
  if (speed === "slow") return 220;
  if (speed === "fast") return 20;
  return 85; // medium default
}

function stopSorting() {
  isSorting = false;
  updateDsaStats("Interrupted ⏹️");
  randomiseDsaArray();
}

async function animateSortedWave() {
  const bars = dsaCanvas.querySelectorAll(".dsa-bar");
  for (let i = 0; i < bars.length; i++) {
    bars[i].className = "dsa-bar sorted";
    await sleep(25);
  }
}

// Bubble Sort Algorithm
async function runBubbleSort(arr) {
  const bars = dsaCanvas.querySelectorAll(".dsa-bar");
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (!isSorting) throw new Error("Abort");
      
      bars[j].classList.add("comparing");
      bars[j + 1].classList.add("comparing");
      comparisonsCount++;
      updateDsaStats();
      await sleep(getDsaDelay());
      
      if (arr[j] > arr[j + 1]) {
        // Swap values
        let temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
        
        bars[j].style.height = `${arr[j]}%`;
        bars[j + 1].style.height = `${arr[j + 1]}%`;
        
        bars[j].classList.add("swapping");
        bars[j + 1].classList.add("swapping");
        swapsCount++;
        updateDsaStats();
        await sleep(getDsaDelay());
        
        bars[j].classList.remove("swapping");
        bars[j + 1].classList.remove("swapping");
      }
      
      bars[j].classList.remove("comparing");
      bars[j + 1].classList.remove("comparing");
    }
    bars[n - i - 1].classList.add("sorted");
  }
  bars[0].classList.add("sorted");
}

// Selection Sort Algorithm
async function runSelectionSort(arr) {
  const bars = dsaCanvas.querySelectorAll(".dsa-bar");
  const n = arr.length;
  for (let i = 0; i < n; i++) {
    let minIdx = i;
    bars[i].classList.add("comparing");
    
    for (let j = i + 1; j < n; j++) {
      if (!isSorting) throw new Error("Abort");
      
      bars[j].classList.add("comparing");
      comparisonsCount++;
      updateDsaStats();
      await sleep(getDsaDelay());
      
      if (arr[j] < arr[minIdx]) {
        if (minIdx !== i) bars[minIdx].classList.remove("swapping");
        minIdx = j;
        bars[minIdx].classList.add("swapping");
      } else {
        bars[j].classList.remove("comparing");
      }
    }
    
    if (minIdx !== i) {
      let temp = arr[i];
      arr[i] = arr[minIdx];
      arr[minIdx] = temp;
      
      bars[i].style.height = `${arr[i]}%`;
      bars[minIdx].style.height = `${arr[minIdx]}%`;
      
      swapsCount++;
      updateDsaStats();
      await sleep(getDsaDelay());
      
      bars[minIdx].classList.remove("swapping");
    }
    bars[i].classList.remove("comparing");
    bars[i].classList.add("sorted");
  }
}

// Quick Sort Lomuto Partition
async function runQuickSort(arr, low, high) {
  if (!isSorting) throw new Error("Abort");
  if (low < high) {
    const pi = await partitionQuickSort(arr, low, high);
    await runQuickSort(arr, low, pi - 1);
    await runQuickSort(arr, pi + 1, high);
  } else if (low >= 0 && low < arr.length) {
    const bars = dsaCanvas.querySelectorAll(".dsa-bar");
    bars[low].classList.add("sorted");
  }
}

async function partitionQuickSort(arr, low, high) {
  const bars = dsaCanvas.querySelectorAll(".dsa-bar");
  const pivot = arr[high];
  bars[high].classList.add("comparing"); // Highlight pivot node
  
  let i = low - 1;
  for (let j = low; j < high; j++) {
    if (!isSorting) throw new Error("Abort");
    
    bars[j].classList.add("comparing");
    comparisonsCount++;
    updateDsaStats();
    await sleep(getDsaDelay());
    
    if (arr[j] < pivot) {
      i++;
      let temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
      
      bars[i].style.height = `${arr[i]}%`;
      bars[j].style.height = `${arr[j]}%`;
      
      bars[i].classList.add("swapping");
      bars[j].classList.add("swapping");
      swapsCount++;
      updateDsaStats();
      await sleep(getDsaDelay());
      
      bars[i].classList.remove("swapping");
      bars[j].classList.remove("swapping");
    }
    bars[j].classList.remove("comparing");
  }
  
  let temp = arr[i + 1];
  arr[i + 1] = arr[high];
  arr[high] = temp;
  
  bars[i + 1].style.height = `${arr[i + 1]}%`;
  bars[high].style.height = `${arr[high]}%`;
  
  bars[i + 1].classList.add("sorted");
  bars[high].classList.remove("comparing");
  
  swapsCount++;
  updateDsaStats();
  await sleep(getDsaDelay());
  
  return i + 1;
}


// ===== Skills filter logic =====
function filterSkills(category) {
  const items = skillsList ? skillsList.querySelectorAll(".skill") : [];
  items.forEach((item) => {
    const cat = item.getAttribute("data-cat");
    const show = category === "all" || category === cat;
    item.style.display = show ? "block" : "none";
  });
  updateStatus(`Skills filtered: ${category.charAt(0).toUpperCase() + category.slice(1)}`);
}

if (skillsControls) {
  skillsControls.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-filter]");
    if (!btn) return;
    
    // Toggle active class
    skillsControls.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    
    const cat = btn.getAttribute("data-filter");
    filterSkills(cat);
  });
}


// ===== Image Lightbox =====
function openLightbox(src, alt = "Image") {
  if (!lightbox || !lightboxImg) return;
  lightboxImg.src = src;
  lightboxImg.alt = alt;
  lightbox.hidden = false;
  document.body.style.overflow = "hidden";
  updateStatus("Lightbox opened.");
}

function closeLightbox() {
  if (!lightbox) return;
  lightbox.hidden = true;
  document.body.style.overflow = "";
  updateStatus("Lightbox closed.");
}

if (gallery) {
  gallery.addEventListener("click", (e) => {
    const cardLink = e.target.closest("a.project-card");
    if (cardLink) {
      e.preventDefault();
      openProjectModalFromCard(cardLink);
    }
  });
}


// ===== Project Modal Details Logic =====
const projectModal = document.getElementById('projectModal');
const projectModalClose = document.getElementById('projectModalClose');
const projectModalImg = document.getElementById('projectModalImg');
const projectModalTitle = document.getElementById('projectModalTitle');
const projectModalDesc = document.getElementById('projectModalDesc');
const projectModalDemo = document.getElementById('projectModalDemo');
const projectModalCode = document.getElementById('projectModalCode');
const projectModalSvgContainer = document.getElementById('projectModalSvgContainer');
let _lastFocused = null;

function openProjectModalFromId(cardId) {
  const card = document.getElementById(cardId);
  if (card) openProjectModalFromCard(card);
}

function openProjectModalFromCard(card) {
  const title = card.querySelector('.project h3')?.textContent || 'Project';
  const desc = card.querySelector('.project p')?.textContent || '';
  
  // Clone the project icon SVG into the modal
  const svgWrap = card.querySelector('.project-svg-wrap');
  if (svgWrap && projectModalSvgContainer) {
    projectModalSvgContainer.innerHTML = svgWrap.innerHTML;
  }
  
  // Bind appropriate source code urls dynamically based on the project id
  let demoHref = "#playground";
  let codeHref = "https://github.com/UndefinedSid";
  
  if (card.id === 'card-proj-1') {
    demoHref = "#playground";
    codeHref = "https://github.com/UndefinedSid/Distributed-Ledger-Cpp";
  } else if (card.id === 'card-proj-2') {
    demoHref = "#playground";
    codeHref = "https://github.com/UndefinedSid/Scalable-API-Java";
  } else if (card.id === 'card-proj-3') {
    demoHref = "#playground";
    codeHref = "https://github.com/UndefinedSid/Strategy-Backtester-Python";
  }

  if (projectModalTitle) projectModalTitle.textContent = title;
  if (projectModalDesc) projectModalDesc.textContent = desc;
  if (projectModalDemo) projectModalDemo.href = demoHref;
  if (projectModalCode) projectModalCode.href = codeHref;

  projectModal.hidden = false;
  projectModal.setAttribute('aria-hidden', 'false');

  _lastFocused = document.activeElement;
  projectModalClose.focus();

  document.addEventListener('focus', trapFocus, true);
  document.addEventListener('keydown', onModalKeyDown);
  updateStatus(`Viewing project: ${title}`);
}

function closeProjectModal() {
  if (!projectModal) return;
  projectModal.hidden = true;
  projectModal.setAttribute('aria-hidden', 'true');
  document.removeEventListener('focus', trapFocus, true);
  document.removeEventListener('keydown', onModalKeyDown);
  if (_lastFocused) _lastFocused.focus();
}

function trapFocus(e) {
  if (!projectModal || projectModal.hidden) return;
  if (!projectModal.contains(e.target)) {
    e.stopPropagation();
    projectModalClose.focus();
  }
}

function onModalKeyDown(e) {
  if (e.key === 'Escape') closeProjectModal();
  if (e.key === 'Tab') {
    const focusable = projectModal.querySelectorAll('a[href], button:not([disabled])');
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
}

projectModalClose?.addEventListener('click', closeProjectModal);
projectModal?.addEventListener('click', (e) => { 
  if (e.target.classList.contains('project-modal__backdrop')) closeProjectModal(); 
});


// ===== Certificate modal logic =====
const certModal = document.getElementById('certModal');
const certModalClose = document.getElementById('certModalClose');
const certFrame = document.getElementById('certFrame');
const certImageFallback = document.getElementById('certImageFallback');
const certModalTitle = document.getElementById('certModalTitle');
const certDownload = document.getElementById('certDownload');
const certVerify = document.getElementById('certVerify');

function openCertModal(src, title = '', verify = '') {
  if (!certModal) return;
  
  const isPdf = src.toLowerCase().endsWith(".pdf");
  
  if (isPdf) {
    if (certFrame) {
      certFrame.src = src;
      certFrame.style.display = "block";
    }
    if (certImageFallback) {
      certImageFallback.style.display = "none";
    }
  } else {
    // If it's a thumbnail image fallback
    if (certImageFallback) {
      certImageFallback.src = src;
      certImageFallback.style.display = "block";
    }
    if (certFrame) {
      certFrame.src = "";
      certFrame.style.display = "none";
    }
  }
  
  if (certModalTitle) certModalTitle.textContent = title || 'Certificate';
  if (certDownload) certDownload.href = src;
  
  if (verify) { 
    if (certVerify) {
      certVerify.href = verify; 
      certVerify.hidden = false; 
    }
  } else { 
    if (certVerify) {
      certVerify.hidden = true; 
      certVerify.href = '#'; 
    }
  }

  certModal.hidden = false;
  certModal.setAttribute('aria-hidden', 'false');

  _lastFocused = document.activeElement;
  if (certModalClose) certModalClose.focus();
  
  document.addEventListener('focus', trapCertFocus, true);
  document.addEventListener('keydown', onCertKeyDown);
  updateStatus(`Opening certificate: ${title}`);
}

function closeCertModal() {
  if (!certModal) return;
  certModal.hidden = true;
  certModal.setAttribute('aria-hidden', 'true');
  if (certFrame) certFrame.src = '';
  document.removeEventListener('focus', trapCertFocus, true);
  document.removeEventListener('keydown', onCertKeyDown);
  if (_lastFocused) _lastFocused.focus();
}

function trapCertFocus(e) {
  if (!certModal || certModal.hidden) return;
  if (!certModal.contains(e.target)) {
    e.stopPropagation();
    if (certModalClose) certModalClose.focus();
  }
}

function onCertKeyDown(e) {
  if (e.key === 'Escape') closeCertModal();
  if (e.key === 'Tab') {
    const focusable = certModal.querySelectorAll('a[href], button:not([disabled])');
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
}

if (certModalClose) certModalClose.addEventListener('click', closeCertModal);
if (certModal) {
  certModal.addEventListener('click', (e) => { 
    if (e.target.classList.contains('project-modal__backdrop')) closeCertModal(); 
  });
}

// Wire up cert gallery click views
document.querySelectorAll('.cert-view').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const src = btn.dataset.src;
    const title = btn.dataset.title || '';
    const verify = btn.dataset.verify || '';
    openCertModal(src, title, verify);
  });
});

const certGrid = document.querySelector('.certs-grid');
if (certGrid) {
  certGrid.addEventListener('click', (e) => {
    const thumb = e.target.closest('img.cert-thumb');
    if (!thumb) return;
    const card = thumb.closest('.cert-card');
    const btn = card.querySelector('.cert-view');
    if (btn) btn.click();
  });
}


// ===== Back-To-Top Button =====
(function addScrollToTop() {
  const btn = document.createElement("button");
  btn.id = "scrollTop";
  btn.textContent = "↑ Top";
  btn.style.position = "fixed";
  btn.style.right = "1.5rem";
  btn.style.bottom = "1.5rem";
  btn.style.display = "none";
  btn.style.padding = "0.6rem 0.9rem";
  btn.style.border = "none";
  btn.style.borderRadius = "8px";
  btn.style.cursor = "pointer";
  document.body.appendChild(btn);

  function onScroll() {
    btn.style.display = window.scrollY > 300 ? "block" : "none";
  }
  window.addEventListener("scroll", onScroll);
  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
})();


// ===== Light / Dark Mode Toggle Logic =====
function applyTheme(theme) {
  const isDark = theme === 'dark';
  bodyEl.classList.toggle('dark', isDark);
  if (themeToggleBtn) {
    themeToggleBtn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
    themeToggleBtn.textContent = isDark ? '☀️' : '🌙';
  }
  updateStatus(isDark ? 'Dark theme enabled.' : 'Light theme enabled.');
}

function initTheme() {
  const saved = localStorage.getItem(LS_KEYS.theme) || "dark"; // Default to dark mode for hacker aesthetic
  applyTheme(saved);
}

function toggleTheme() {
  const next = bodyEl.classList.contains("dark") ? "light" : "dark";
  localStorage.setItem(LS_KEYS.theme, next);
  applyTheme(next);
}

if (themeToggleBtn) {
  themeToggleBtn.addEventListener("click", toggleTheme);
  initTheme();
}


// ===== Form Validation & Local Storage Drafts =====
function validateName(value) {
  if (!value.trim()) return "Name is required.";
  if (value.trim().length < 2) return "Name must be at least 2 characters.";
  return "";
}

function validateEmail(value) {
  if (!value.trim()) return "Email is required.";
  if (!EMAIL_REGEX.test(value.trim())) return "Enter a valid email address.";
  return "";
}

function validateMessage(value) {
  if (!value.trim()) return "Message is required.";
  if (value.trim().length < 10) return "Message must be at least 10 characters.";
  return "";
}

function validateField(inputEl, errorEl, validatorFn) {
  if (!inputEl) return true;
  const msg = validatorFn(inputEl.value);
  showError(errorEl, msg);
  return !msg;
}

function validateForm() {
  const isNameValid = validateField(nameInput, nameError, validateName);
  const isEmailValid = validateField(emailInput, emailError, validateEmail);
  const isMessageValid = validateField(messageInput, messageError, validateMessage);
  return isNameValid && isEmailValid && isMessageValid;
}

if (nameInput) nameInput.addEventListener("input", debounce(() => validateField(nameInput, nameError, validateName)));
if (emailInput) emailInput.addEventListener("input", debounce(() => validateField(emailInput, emailError, validateEmail)));
if (messageInput) messageInput.addEventListener("input", debounce(() => validateField(messageInput, messageError, validateMessage)));

if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    formFeedback.textContent = "";
    if (!validateForm()) {
      e.preventDefault();
      setText(formFeedback, "Please fix the errors above before submitting.");
      formFeedback.style.color = "var(--color-danger)";
      updateStatus("Form submission blocked: validation errors.");
    } else {
      updateStatus("Form submitted. Thank you!");
      localStorage.removeItem(LS_KEYS.formDraft);
    }
  });
}

function saveFormDraft() {
  const draft = {
    name: nameInput?.value || "",
    email: emailInput?.value || "",
    message: messageInput?.value || "",
    ts: Date.now(),
  };
  localStorage.setItem(LS_KEYS.formDraft, JSON.stringify(draft));
}

function restoreFormDraft() {
  const raw = localStorage.getItem(LS_KEYS.formDraft);
  if (!raw) return;
  try {
    const draft = JSON.parse(raw);
    if (nameInput && draft.name) nameInput.value = draft.name;
    if (emailInput && draft.email) emailInput.value = draft.email;
    if (messageInput && draft.message) messageInput.value = draft.message;
    updateStatus("Restored your last form draft.");
  } catch {
    // Ignore draft parse errors
  }
}

if (contactForm) {
  const debouncedSave = debounce(saveFormDraft, 300);
  ["input", "change"].forEach((evt) => {
    contactForm.addEventListener(evt, debouncedSave);
  });
  restoreFormDraft();
}


// ===== Initialize Playground Elements =====
// Initialize first array visualization
randomiseDsaArray();

updateStatus('Developer Console and Sandbox initialized.', 1500);