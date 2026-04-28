var stackPanel = null;

function createStackPanel() {
  if (stackPanel) return stackPanel;

  const panel = document.createElement("div");
  panel.className = "csm-stack-panel";
  panel.style.display = "none";

  // ---------- NAV BAR ----------
  const nav = document.createElement("div");
  nav.className = "csm-stack-nav";

  const title = document.createElement("div");
  title.className = "csm-stack-title";
  title.textContent = "Stack";

  const closeBtn = document.createElement("button");
  closeBtn.className = "csm-stack-close";
  closeBtn.textContent = "✕";
  closeBtn.onclick = () => (panel.style.display = "none");

  nav.appendChild(title);
  nav.appendChild(closeBtn);

  // ---------- BODY ----------
  const body = document.createElement("div");
  body.className = "csm-stack-body";

  const list = document.createElement("div");
  list.className = "csm-stack-list";
  body.appendChild(list);

  StackList.init(list);

  // ---------- FOOTER ----------
  const footer = document.createElement("div");
  footer.className = "csm-stack-footer";

  // Custom Slider Container
  const sliderContainer = document.createElement("div");
  sliderContainer.className = "csm-slider-container";

  const sliderTrack = document.createElement("div");
  sliderTrack.className = "csm-slider-track";

  const sliderThumb = document.createElement("div");
  sliderThumb.className = "csm-slider-thumb";

  sliderTrack.appendChild(sliderThumb);
  sliderContainer.appendChild(sliderTrack);

  // Slider logic
  let isDragging = false;
  let currentValue = 80; // Default 80%

  function updateThumbPosition(value) {
    currentValue = Math.max(0, Math.min(100, value));
    const percentage = currentValue / 100;
    sliderThumb.style.left = `${percentage * 100}%`;

    // Slide left → panel fades out so you can read the content underneath
    // Minimum 0.08 so the panel never fully vanishes
    panel.style.opacity = Math.max(0.08, percentage);
  }

  function handleMove(clientX) {
    const rect = sliderTrack.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    updateThumbPosition(percentage * 100);
  }

  sliderThumb.addEventListener("mousedown", (e) => {
    isDragging = true;
    e.preventDefault();
  });

  sliderTrack.addEventListener("click", (e) => {
    if (e.target !== sliderThumb) {
      handleMove(e.clientX);
    }
  });

  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
  });

  // Touch support
  sliderThumb.addEventListener("touchstart", (e) => {
    isDragging = true;
    e.preventDefault();
  });

  document.addEventListener("touchmove", (e) => {
    if (isDragging) {
      handleMove(e.touches[0].clientX);
    }
  });

  document.addEventListener("touchend", () => {
    isDragging = false;
  });

  // Initialize position
  updateThumbPosition(currentValue);

  const summaryBtn = document.createElement("button");
  summaryBtn.className = "csm-stack-summary";
  summaryBtn.textContent = "Summary";

  footer.appendChild(sliderContainer);
  footer.appendChild(summaryBtn);


  // ---------- ASSEMBLE ----------
  panel.appendChild(nav);
  panel.appendChild(body);
  panel.appendChild(footer);

  document.body.appendChild(panel);
  stackPanel = panel;

  return panel;
}

function toggleStackPanel() {
  const panel = createStackPanel();
  panel.style.display = panel.style.display === "none" ? "flex" : "none";
}

function openStackPanelIfClosed() {
  const panel = createStackPanel();
  if (panel.style.display === "none") {
    panel.style.display = "flex";
  }
}


chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "TOGGLE_STACK_PANEL") {
    toggleStackPanel();
  }

  if (msg.action === "ADD_STACK_ITEM") {
    openStackPanelIfClosed();
    StackList.add(msg.item);
  }

  sendResponse({ ok: true });
  return true;
});


