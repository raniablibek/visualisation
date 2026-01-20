// portal-main.js
;(() => {
  const landing = document.getElementById("landing")
  const app = document.getElementById("app")
  const bigButtons = document.querySelectorAll(".bigbtn")
  const navBtns = document.querySelectorAll(".navbtn")
  const panels = document.querySelectorAll(".panel")
  const showLandingBtn = document.getElementById("showLanding")
  const guideBtn = document.getElementById("guideBtn")
  const landingGuideBtn = document.getElementById("landingGuideBtn")
  const guideModal = document.getElementById("guideModal")
  const closeGuide = document.getElementById("closeGuide")

  const guideToggle = document.getElementById("guideToggle")
  const guideContent = document.getElementById("guideContent")

  let phishingMounted = false
  const phishingRoot = document.getElementById("phishing-root")
  const PhishingSimulator = window.PhishingSimulator

  function maybeMountPhishing() {
    if (!phishingMounted && typeof window.PhishingSimulator !== "undefined" && phishingRoot) {
      window.PhishingSimulator.mount(phishingRoot, { tickMs: 400, maxEmailsPerTick: 8, zIndex: 10000 })
      phishingMounted = true
    }
  }

  function showAppPanel(name) {
    landing.style.display = "none"
    app.style.display = "flex"
    app.setAttribute("aria-hidden", "false")

    panels.forEach((p) => p.classList.remove("active"))
    const panel = document.getElementById(name)
    if (panel) panel.classList.add("active")

    navBtns.forEach((b) => b.classList.toggle("active", b.dataset.target === name))
    window.scrollTo(0, 0)

    if (name === "phishing") {
      maybeMountPhishing()
    }
  }

  bigButtons.forEach((b) => b.addEventListener("click", () => showAppPanel(b.dataset.target)))
  navBtns.forEach((b) => b.addEventListener("click", () => showAppPanel(b.dataset.target)))
  showLandingBtn.addEventListener("click", () => {
    app.style.display = "none"
    landing.style.display = "flex"
    app.setAttribute("aria-hidden", "true")
    panels.forEach((p) => p.classList.remove("active"))
  })

  guideBtn.addEventListener("click", () => {
    guideModal.classList.add("active")
    guideModal.setAttribute("aria-hidden", "false")
  })

  landingGuideBtn.addEventListener("click", () => {
    guideModal.classList.add("active")
    guideModal.setAttribute("aria-hidden", "false")
  })

  closeGuide.addEventListener("click", () => {
    guideModal.classList.remove("active")
    guideModal.setAttribute("aria-hidden", "true")
  })

  guideModal.addEventListener("click", (e) => {
    if (e.target === guideModal) {
      guideModal.classList.remove("active")
      guideModal.setAttribute("aria-hidden", "true")
    }
  })

  guideToggle.addEventListener("click", () => {
    const isHidden = guideContent.style.display === "none"
    guideContent.style.display = isHidden ? "block" : "none"
    guideToggle.classList.toggle("active", isHidden)
  })

  app.style.display = "none"
  landing.style.display = "flex"
})()
