const intensity = document.getElementById("dosIntensity")
const capacity = document.getElementById("dosCapacity")
const defense = document.getElementById("dosDefense")
const requestsEl = document.getElementById("dosRequests")
const blockedEl = document.getElementById("dosBlocked")
const loadBar = document.getElementById("dosLoadBar")
const loadPct = document.getElementById("dosLoadPercent")
const stateEl = document.getElementById("dosState")
const toggle = document.getElementById("dosToggle")
const reset = document.getElementById("dosReset")
const intensityLabel = document.getElementById("dosIntensityLabel")
const capacityLabel = document.getElementById("dosCapacityLabel")
const defenseLabel = document.getElementById("dosDefenseLabel")
const warningBanner = document.getElementById("dosWarning")
const canvas = document.getElementById("dosChart")
const ctx = canvas.getContext("2d")

const animCanvas = document.getElementById("dosAnimation")
const animCtx = animCanvas.getContext("2d")
let packets = []

let running = true
let totalReq = 0
let totalBlocked = 0
let timeline = Array(60).fill(0)

function fmt(n) {
  return Math.round(n).toLocaleString("en-US")
}

function updateLabels() {
  intensityLabel.textContent = intensity.value
  capacityLabel.textContent = capacity.value
  defenseLabel.textContent = defense.value
}
;[intensity, capacity, defense].forEach((i) => i.addEventListener("input", updateLabels))

toggle.addEventListener("click", () => {
  running = !running
  toggle.textContent = running ? "Stop" : "Resume"
})

reset.addEventListener("click", () => {
  totalReq = 0
  totalBlocked = 0
  timeline = Array(60).fill(0)
  packets = [] // Clear packets on reset
  updateUI()
  drawChart()
})

function createPacket() {
  const def = Number(defense.value) / 100
  const blocked = Math.random() < def
  packets.push({
    x: 100,
    y: 100,
    targetX: animCanvas.width - 100,
    targetY: 100,
    progress: 0,
    blocked: blocked,
    size: 4 + Math.random() * 4,
  })
}

function drawAnimation() {
  const w = animCanvas.width
  const h = animCanvas.height

  // Clear canvas
  animCtx.fillStyle = "#0a0a0f"
  animCtx.fillRect(0, 0, w, h)

  // Draw attacker (left side)
  animCtx.font = "48px Arial"
  animCtx.textAlign = "center"
  animCtx.textBaseline = "middle"
  animCtx.fillText("💀", 100, 100)

  // Draw attacker label
  animCtx.font = "12px 'Courier New'"
  animCtx.fillStyle = "#ff0066"
  animCtx.fillText("ATTACKER", 100, 140)

  // Draw server (right side)
  animCtx.font = "48px Arial"
  animCtx.fillText("🖥️", w - 100, 100)

  // animCtx.fillText("SERVER", w - 100, 140)

  // Update and draw packets
  for (let i = packets.length - 1; i >= 0; i--) {
    const p = packets[i]
    p.progress += 0.02

    if (p.progress >= 1) {
      packets.splice(i, 1)
      continue
    }

    const x = p.x + (p.targetX - p.x) * p.progress
    const y = p.y + (p.targetY - p.y) * p.progress

    // Draw packet
    animCtx.beginPath()
    animCtx.arc(x, y, p.size, 0, Math.PI * 2)
    animCtx.fillStyle = p.blocked ? "#ffaa00" : "#00ffff"
    animCtx.fill()

    // Draw trail
    animCtx.beginPath()
    animCtx.moveTo(p.x, p.y)
    animCtx.lineTo(x, y)
    animCtx.strokeStyle = p.blocked ? "rgba(255, 170, 0, 0.3)" : "rgba(0, 255, 255, 0.3)"
    animCtx.lineWidth = 2
    animCtx.stroke()

    // Draw glow
    animCtx.shadowBlur = 15
    animCtx.shadowColor = p.blocked ? "#ffaa00" : "#00ffff"
    animCtx.beginPath()
    animCtx.arc(x, y, p.size, 0, Math.PI * 2)
    animCtx.fill()
    animCtx.shadowBlur = 0
  }
}

function step() {
  if (!running) return

  const base = Number(intensity.value)
  const incoming = base * (0.9 + Math.random() * 0.2)
  const def = Number(defense.value) / 100
  const blocked = incoming * def
  const allowed = Math.max(0, incoming - blocked)

  totalReq += incoming
  totalBlocked += blocked

  const inst = incoming * (1 - def)
  const cap = Number(capacity.value)

  const load = Math.min(100, Math.round((inst / Math.max(1, cap)) * 100))

  if (load >= 70) {
    warningBanner.style.display = "block"
    if (load >= 90) {
      loadBar.className = "danger"
    } else {
      loadBar.className = "warning"
    }
  } else {
    warningBanner.style.display = "none"
    loadBar.className = ""
  }

  if (inst > cap) {
    stateEl.textContent = "DOWN"
    stateEl.className = "state down"
  } else if (inst > cap * 0.9) {
    stateEl.textContent = "RISK"
    stateEl.className = "state"
  } else {
    stateEl.textContent = "UP"
    stateEl.className = "state up"
  }

  loadBar.style.width = load + "%"
  loadPct.textContent = load + "%"

  timeline.shift()
  timeline.push(load)

  const packetRate = Math.max(1, Math.floor(base / 50))
  for (let i = 0; i < packetRate; i++) {
    if (Math.random() < 0.3) {
      createPacket()
    }
  }

  updateUI()
  drawChart()
}

function drawChart() {
  const w = canvas.width
  const h = canvas.height
  ctx.clearRect(0, 0, w, h)
  ctx.fillStyle = "#0a0a0f"
  ctx.fillRect(0, 0, w, h)

  // Grid lines
  ctx.strokeStyle = "#2a2a3a"
  ctx.lineWidth = 1
  for (let i = 0; i <= 4; i++) {
    ctx.beginPath()
    ctx.moveTo(0, h - i * (h / 4))
    ctx.lineTo(w, h - i * (h / 4))
    ctx.stroke()
  }

  // Draw line
  const maxVal = 100
  ctx.beginPath()
  for (let i = 0; i < timeline.length; i++) {
    const x = (i / (timeline.length - 1)) * w
    const y = h - (timeline[i] / maxVal) * (h - 10)
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.strokeStyle = "#00ffff"
  ctx.lineWidth = 3
  ctx.stroke()

  // Fill area
  ctx.lineTo(w, h)
  ctx.lineTo(0, h)
  ctx.closePath()
  ctx.fillStyle = "rgba(0, 255, 255, 0.15)"
  ctx.fill()
}

function updateUI() {
  requestsEl.textContent = fmt(totalReq)
  blockedEl.textContent = fmt(totalBlocked)
}

function animate() {
  drawAnimation()
  requestAnimationFrame(animate)
}

setInterval(step, 200)
updateLabels()
updateUI()
drawChart()
animate() // Start animation loop
