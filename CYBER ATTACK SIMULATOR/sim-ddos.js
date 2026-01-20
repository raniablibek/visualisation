document.addEventListener("DOMContentLoaded", () => {
  const totalEl = document.getElementById("ddosTotal")
  const botsEl = document.getElementById("ddosBots")
  const sourcesEl = document.getElementById("ddosSources")
  const mapEl = document.getElementById("ddosMap")
  const canvas = document.getElementById("ddosChart")

  if (!canvas) {
    console.error("DDoS canvas not found")
    return
  }

  const ctx = canvas.getContext("2d")

  const animCanvas = document.getElementById("ddosAnimation")
  const animCtx = animCanvas.getContext("2d")
  let packets = []
  const attackers = []

  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2
    const radius = 130
    attackers.push({
      x: animCanvas.width / 2 + Math.cos(angle) * radius,
      y: animCanvas.height / 2 + Math.sin(angle) * radius,
    })
  }

  const perBot = document.getElementById("ddosPerBot")
  const botCount = document.getElementById("ddosBotCount")
  const capacity = document.getElementById("ddosCapacity")
  const defense = document.getElementById("ddosDefense")
  const perBotLabel = document.getElementById("ddosPerBotLabel")
  const botCountLabel = document.getElementById("ddosBotCountLabel")
  const capacityLabel = document.getElementById("ddosCapacityLabel")
  const defenseLabel = document.getElementById("ddosDefenseLabel")

  let timeline = Array(60).fill(0)
  let running = true

  function fmt(n) {
    return Math.round(n).toLocaleString("en-US")
  }

  function updateLabels() {
    perBotLabel.textContent = perBot.value
    botCountLabel.textContent = botCount.value
    capacityLabel.textContent = capacity.value
    defenseLabel.textContent = defense.value
  }
  ;[perBot, botCount, capacity, defense].forEach((i) => i.addEventListener("input", updateLabels))

  document.getElementById("ddosToggle").addEventListener("click", () => {
    running = !running
    document.getElementById("ddosToggle").textContent = running ? "Stop" : "Resume"
  })

  document.getElementById("ddosReset").addEventListener("click", () => {
    timeline = Array(60).fill(0)
    packets = [] // Clear packets on reset
    updateUI()
  })

  function createPacket() {
    const def = Number(defense.value) / 100
    const blocked = Math.random() < def
    const attacker = attackers[Math.floor(Math.random() * attackers.length)]

    packets.push({
      x: attacker.x,
      y: attacker.y,
      targetX: animCanvas.width / 2,
      targetY: animCanvas.height / 2,
      progress: 0,
      blocked: blocked,
      size: 3 + Math.random() * 3,
    })
  }

  function drawAnimation() {
    const w = animCanvas.width
    const h = animCanvas.height

    // Clear canvas
    animCtx.fillStyle = "#0a0a0f"
    animCtx.fillRect(0, 0, w, h)

    // Draw attackers (bots around the edges)
    animCtx.font = "24px Arial"
    animCtx.textAlign = "center"
    animCtx.textBaseline = "middle"
    attackers.forEach((attacker) => {
      animCtx.fillText("💀", attacker.x, attacker.y)
    })

    // Draw attacker label
    animCtx.font = "12px 'Courier New'"
    animCtx.fillStyle = "#ff0066"
    animCtx.fillText("BOTS", w / 2, 30)

    // Draw server (center)
    animCtx.font = "48px Arial"
    animCtx.fillText("🖥️", w / 2, h / 2)

    // Update and draw packets
    for (let i = packets.length - 1; i >= 0; i--) {
      const p = packets[i]
      p.progress += 0.015

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
      animCtx.strokeStyle = p.blocked ? "rgba(255, 170, 0, 0.2)" : "rgba(0, 255, 255, 0.2)"
      animCtx.lineWidth = 1.5
      animCtx.stroke()

      // Draw glow
      animCtx.shadowBlur = 10
      animCtx.shadowColor = p.blocked ? "#ffaa00" : "#00ffff"
      animCtx.beginPath()
      animCtx.arc(x, y, p.size, 0, Math.PI * 2)
      animCtx.fill()
      animCtx.shadowBlur = 0
    }
  }

  function step() {
    if (!running) return

    const totalBots = Number(botCount.value)
    const per = Number(perBot.value)
    const maxCapacity = Number(capacity.value)
    const defenseFactor = Number(defense.value) / 100

    const incoming = totalBots * per
    const blocked = incoming * defenseFactor
    const allowed = Math.max(0, incoming - blocked)

    const loadPercent = (allowed / maxCapacity) * 100
    const warningEl = document.getElementById("ddosWarning")
    const serverDownEl = document.getElementById("ddosServerDown")

    if (loadPercent >= 100) {
      warningEl.style.display = "none"
      serverDownEl.style.display = "block"
    } else if (loadPercent >= 70) {
      warningEl.style.display = "block"
      serverDownEl.style.display = "none"
    } else {
      warningEl.style.display = "none"
      serverDownEl.style.display = "none"
    }

    timeline.shift()
    timeline.push(allowed)

    const packetRate = Math.max(1, Math.floor(totalBots / 1000))
    for (let i = 0; i < packetRate; i++) {
      if (Math.random() < 0.4) {
        createPacket()
      }
    }

    drawChart()

    totalEl.textContent = fmt(Math.round(incoming)) + " req/s"
    botsEl.textContent = fmt(Math.round(totalBots))
    sourcesEl.textContent = fmt(Math.round(totalBots / 50))
  }

  function drawChart() {
    const w = canvas.width
    const h = canvas.height
    ctx.clearRect(0, 0, w, h)
    ctx.fillStyle = "#0a0a0f"
    ctx.fillRect(0, 0, w, h)

    ctx.strokeStyle = "#2a2a3a"
    ctx.lineWidth = 1
    for (let i = 0; i < 4; i++) {
      ctx.beginPath()
      ctx.moveTo(0, h - i * (h / 4))
      ctx.lineTo(w, h - i * (h / 4))
      ctx.stroke()
    }

    const maxVal = Math.max(1, ...timeline)
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

    ctx.lineTo(w, h)
    ctx.lineTo(0, h)
    ctx.closePath()
    ctx.fillStyle = "rgba(0, 255, 255, 0.15)"
    ctx.fill()
  }

  function updateUI() {
    drawChart()
  }

  function animate() {
    drawAnimation()
    requestAnimationFrame(animate)
  }

  setInterval(step, 300)
  updateLabels()
  animate() // Start animation loop
})
