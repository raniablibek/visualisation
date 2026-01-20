;((global) => {
  function mount(targetEl, options = {}) {
    if (!targetEl) throw new Error("PhishingSimulator: target element is required.")

    try {
      const cs = getComputedStyle(targetEl)
      if (cs.position === "static") targetEl.style.position = "relative"
      if (!targetEl.style.zIndex) targetEl.style.zIndex = (options.zIndex || 9999).toString()
      targetEl.style.pointerEvents = "auto"
    } catch (e) {
      /* no-op */
    }

    const shadow = targetEl.attachShadow({ mode: "open" })
    const css = `
:root{
  --bg-0:#0a0a0f;
  --panel:#1a1a24;
  --muted:#e0e0ff;
  --text:#ffffff;
  --accent:#00ffff;
  --success:#00ff88;
  --danger:#ff0066;
  --glass:rgba(255,255,255,0.02);
  --card-radius:12px;
}
*{box-sizing:border-box}
:host{ all: initial }
body, ._root{
  font-family: "Courier New", Courier, monospace;
  background: radial-gradient(circle at 10% 10%, rgba(0,255,255,0.08), rgba(2,6,23,0) 20%),
              radial-gradient(circle at 90% 90%, rgba(255,0,255,0.06), rgba(2,6,23,0) 20%),
              linear-gradient(180deg,#0a0a0f 0%, #12121a 40%, #1a1a24 100%);
  color:var(--text);
}
._root{ padding:28px; display:block }
.container{ max-width:1400px; margin:0 auto; }

.header{ display:flex; gap:20px; align-items:center; margin-bottom:18px; }
.logo{
  width:56px;height:56px;border-radius:12px;
  display:grid;place-items:center;font-size:26px;
  background:linear-gradient(135deg,var(--accent),#00aaaa);
  color:#000;font-weight:900;
  box-shadow:0 0 30px rgba(0,255,255,0.6);
}
.title-block{flex:1}
.title{font-size:28px;margin:0 0 6px 0;color:#ffffff;font-weight:900;letter-spacing:3px;text-transform:uppercase}
.subtitle{color:var(--muted);font-size:14px;margin:0;letter-spacing:2px}

.controls{ display:flex; gap:12px; margin:18px 0; flex-wrap:wrap; }
.btn{
  padding:10px 14px;border-radius:6px;border:2px solid;font-weight:700;cursor:pointer;
  box-shadow:0 4px 15px rgba(0,0,0,0.4);transition:all 0.3s;
  font-family: "Courier New", Courier, monospace;
  letter-spacing:2px;text-transform:uppercase;font-size:12px;
}
.btn.ghost{background:transparent;border-color:rgba(255,255,255,0.3);color:#ffffff}
.btn.ghost:hover{background:rgba(255,255,255,0.1);border-color:#ffffff;color:#ffffff}
.btn.start{background:var(--accent);color:#000;border-color:var(--accent)}
.btn.start:hover{box-shadow:0 0 25px rgba(0,255,255,0.8)}
.btn.pause{background:#ffaa00;color:#000;border-color:#ffaa00}
.btn.pause:hover{box-shadow:0 0 25px rgba(255,170,0,0.8)}
.btn.resume{background:#00aaff;color:#000;border-color:#00aaff}
.btn.resume:hover{box-shadow:0 0 25px rgba(0,170,255,0.8)}
.btn.clear{background:var(--danger);color:#fff;border-color:var(--danger);font-weight:900}
.btn.clear:hover{box-shadow:0 0 25px rgba(255,0,102,0.8)}

.notice{
  margin:10px 0 18px 0;padding:12px;border-radius:6px;
  background:rgba(0,255,136,0.15);color:var(--success);
  border:2px solid var(--success);display:none;font-weight:700;
  letter-spacing:1px;
}

.metrics{
  display:grid; grid-template-columns:repeat(3,1fr);
  gap:16px; margin-bottom:18px;
}
.metric{
  background:var(--panel);
  padding:18px;border-radius:8px;border:2px solid rgba(0,255,255,0.3);
  box-shadow:0 0 20px rgba(0,255,255,0.2);
}
.metric h3{margin:0 0 8px 0;font-size:12px;color:#ffffff;letter-spacing:2px;text-transform:uppercase;font-weight:700}
.metric h2{margin:0;font-size:32px;color:var(--accent);font-weight:900;text-shadow:0 0 15px rgba(0,255,255,0.6)}

.panel{ background:var(--panel); border-radius:8px;padding:16px;border:2px solid rgba(0,255,255,0.3);box-shadow:0 0 20px rgba(0,255,255,0.2); }

.data-frame{ margin-top:14px;background:rgba(0,0,0,0.5);padding:12px;border-radius:6px;border:2px solid rgba(0,255,255,0.2); }
table{ width:100%;border-collapse:collapse;font-size:13px; }
thead th{ text-align:left;padding:10px;color:#ffffff;font-weight:700;border-bottom:2px solid rgba(0,255,255,0.4);letter-spacing:1px;text-transform:uppercase}
tbody td{padding:10px;border-bottom:1px solid rgba(255,255,255,0.15);color:#ffffff;font-weight:500}
tr.info{background:rgba(0,255,136,0.1)}
tr.warn{background:rgba(255,170,0,0.2);color:#ffee99}
tr.alert{background:rgba(255,0,102,0.25);color:#ffddee;font-weight:700}

.warn-area{margin-top:22px}
.warn-area h2{color:#ffffff;font-size:18px;font-weight:900;letter-spacing:2px;text-transform:uppercase}
.select{width:100%;padding:12px;border-radius:6px;border:2px solid rgba(0,255,255,0.4);
  background:var(--panel);color:#ffffff;font-family: "Courier New", Courier, monospace;
  font-size:13px;font-weight:600}
.details-box{margin-top:14px;background:#000;padding:16px;border-radius:6px;color:#00ff88;
  white-space:pre-wrap;overflow:auto;max-height:300px;border:2px solid rgba(0,255,136,0.4);
  font-family: "Courier New", Courier, monospace;font-size:12px;line-height:1.6}
.person{margin-top:12px;background:rgba(0,255,136,0.2);color:var(--success);padding:12px;
  border-radius:6px;display:inline-block;border:2px solid var(--success);font-weight:700;letter-spacing:1px}

@media (max-width:980px){
  .metrics{grid-template-columns:1fr}
  .header{flex-direction:column;align-items:flex-start;gap:8px}
}
    `.trim()

    const html = `
<div class="_root" part="root">
  <style>${css}</style>
  <div class="container">
    <div class="header">
      <div class="logo">✉️</div>
      <div class="title-block">
        <h1 class="title">Phishing Attack Simulator</h1>
        <div class="subtitle">Active Scenario: <strong id="scenarioName">Mass Phishing (simulated)</strong></div>
      </div>
    </div>

    <div class="controls">
      <button id="startBtn" class="btn start">🚀 Start</button>
      <button id="pauseBtn" class="btn pause">⏸ Pause</button>
      <button id="resumeBtn" class="btn resume">▶ Resume</button>
      <button id="clearBtn" class="btn clear">🗑 Clear All</button>
    </div>

    <div id="notice" class="notice"></div>

    <div class="metrics">
      <div class="metric panel">
        <h3>📧 Emails Received</h3>
        <h2 id="emailsCount">0</h2>
      </div>
      <div class="metric panel">
        <h3>🖱 Clicks</h3>
        <h2 id="clicksCount">0</h2>
      </div>
      <div class="metric panel">
        <h3>🚨 Alerts</h3>
        <h2 id="alertsCount">0</h2>
      </div>
    </div>

    <div class="panel">
      <div class="data-frame">
        <table id="eventsTable" aria-live="polite">
          <thead>
            <tr><th style="width:6%">#</th><th style="width:18%">Time</th><th style="width:18%">Type</th><th style="width:10%">Severity</th><th>Info</th></tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>

      <div class="warn-area">
        <h2 style="margin:16px 0 6px 0">⚠️ Warning / Alert Details</h2>
        <select id="warnSelect" class="select"><option>No warnings/alerts</option></select>
        <div class="details-box" id="eventDetails">{ select a warning/alert }</div>
        <div id="personBox" class="person" style="display:none"></div>
      </div>
    </div>
  </div>
</div>
    `.trim()

    shadow.innerHTML = html

    // ===== JS LOGIC (scoped to shadow) =====
    const $ = (id) => shadow.getElementById(id)

    const FAKE_DOMAINS = [
      "bnpparibas-secure.com",
      "creditagricole-verification.fr",
      "societegenerale-alert.fr",
      "axa-assurance.com",
      "allianz-secure.fr",
      "facebook-security.com",
      "instagram-verify.com",
      "linkedin-account.com",
      "paypal-secure.com",
      "amazon-verification.com",
    ]

    const NAMES = ["Lounas", "Yanis", "Rania", "Imene", "Yasmine"]

    const SERVICES = [
      "BNP Paribas",
      "Crédit Agricole",
      "Société Générale",
      "AXA Assurance",
      "Allianz",
      "Facebook",
      "Instagram",
      "LinkedIn",
      "PayPal",
      "Amazon",
    ]

    const state = { running: false, started: false, events: [] }
    let tickTimer = null
    const TICK_MS = options.tickMs || 500

    const randInt = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a
    const nowstr = () => {
      const d = new Date()
      const z = (n) => String(n).padStart(2, "0")
      return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())} ${z(d.getHours())}:${z(d.getMinutes())}:${z(d.getSeconds())}`
    }
    const randChoice = (arr) => arr[Math.floor(Math.random() * arr.length)]
    const escapeHtml = (s) =>
      (s || "")
        .toString()
        .replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[m])

    function fake_email_id() {
      return `e-${randInt(10000, 99999)}`
    }

    function gen_fake_sender() {
      const service = randChoice(SERVICES)
      const domainMap = {
        "BNP Paribas": "bnpparibas-secure.com",
        "Crédit Agricole": "creditagricole-verification.fr",
        "Société Générale": "societegenerale-alert.fr",
        "AXA Assurance": "axa-assurance.com",
        Allianz: "allianz-secure.fr",
        Facebook: "facebook-security.com",
        Instagram: "instagram-verify.com",
        LinkedIn: "linkedin-account.com",
        PayPal: "paypal-secure.com",
        Amazon: "amazon-verification.com",
      }
      const domain = domainMap[service] || randChoice(FAKE_DOMAINS)
      const prefix = Math.random() < 0.5 ? "no-reply" : Math.random() < 0.5 ? "security" : "support"
      return `${service} <${prefix}@${domain}>`
    }

    function gen_subject(service) {
      const templates = {
        "BNP Paribas": [
          "Action requise: Vérification de votre compte BNP Paribas",
          "Alerte sécurité: Activité inhabituelle détectée",
          "Mise à jour obligatoire de vos informations bancaires",
          "Confirmation de transaction - Réf: " + randInt(100000, 999999),
        ],
        "Crédit Agricole": [
          "Sécurité: Validez votre identité Crédit Agricole",
          "Votre compte nécessite une vérification immédiate",
          "Nouvelle connexion détectée sur votre compte",
          "Mise à jour de sécurité obligatoire",
        ],
        "Société Générale": [
          "Action urgente: Sécurisez votre compte",
          "Vérification de sécurité requise",
          "Tentative de connexion suspecte détectée",
          "Confirmez vos informations bancaires",
        ],
        "AXA Assurance": [
          "Votre contrat AXA nécessite une mise à jour",
          "Remboursement en attente - Action requise",
          "Renouvellement de votre assurance",
          "Document important concernant votre contrat",
        ],
        Allianz: [
          "Mise à jour de votre contrat Allianz",
          "Remboursement disponible - Cliquez ici",
          "Votre police d'assurance expire bientôt",
          "Action requise: Vérification de vos informations",
        ],
        Facebook: [
          "Réinitialisez votre mot de passe Facebook",
          "Alerte de sécurité: Nouvelle connexion détectée",
          "Votre compte Facebook a été compromis",
          "Confirmez votre identité Facebook",
        ],
        Instagram: [
          "Réinitialisez votre mot de passe Instagram",
          "Tentative de connexion depuis un nouvel appareil",
          "Votre compte Instagram nécessite une vérification",
          "Action requise: Sécurisez votre compte",
        ],
        LinkedIn: [
          "Réinitialisez votre mot de passe LinkedIn",
          "Activité suspecte détectée sur votre compte",
          "Vérification de sécurité LinkedIn requise",
          "Confirmez votre adresse email LinkedIn",
        ],
        PayPal: [
          "Action requise: Vérifiez votre compte PayPal",
          "Transaction suspecte détectée",
          "Votre compte PayPal a été limité",
          "Confirmez vos informations de paiement",
        ],
        Amazon: [
          "Problème avec votre commande Amazon",
          "Votre compte Amazon nécessite une vérification",
          "Mise à jour de vos informations de paiement",
          "Livraison en attente - Action requise",
        ],
      }
      const serviceTemplates = templates[service] || [
        `Action requise: Mise à jour ${service}`,
        `Alerte de sécurité ${service}`,
        `Vérification nécessaire - ${service}`,
        `${service} - Confirmation requise`,
      ]
      return randChoice(serviceTemplates)
    }

    function gen_email_body(service, tracking = true) {
      const link = `https://${service.toLowerCase().replace(/\s+/g, "-")}.secure-login.fake/${randInt(1000, 9999)}`
      let body = `Bonjour,\n\nNous avons détecté une activité suspecte sur votre compte ${service}.\n`
      if (tracking) body += `Veuillez vérifier ici : ${link}\n\nMerci,\nL'équipe ${service}`
      else body += "Veuillez consulter votre espace.\n\nCordialement."
      return { body, link }
    }

    function gen_phishing_events(params = {}) {
      const events = []
      const max_emails = Number.parseInt(params.max_emails_per_tick || 8, 10)
      const n_emails = randInt(0, max_emails)
      if (n_emails === 0) return events

      const n_clicks = randInt(0, n_emails)
      const n_alerts = n_clicks > 0 ? randInt(0, n_clicks) : 0

      const generated = []
      for (let i = 0; i < n_emails; i++) {
        const service = randChoice(SERVICES)
        const eb = gen_email_body(service, true)
        const e = {
          id: fake_email_id(),
          time: nowstr(),
          type: "email_received",
          from: gen_fake_sender(),
          to: randChoice(NAMES) + "@gmail.com",
          subject: gen_subject(service),
          body_preview: eb.body.slice(0, 120),
          service,
          severity: "INFO",
          note: "Email simulé (ne pas envoyer)",
        }
        events.push(e)
        generated.push(e)
      }

      const shuffled = generated.slice().sort(() => 0.5 - Math.random())
      const clicked = shuffled.slice(0, n_clicks)
      clicked.forEach((email) => {
        const clickUrl = gen_email_body(email.service, true).link
        events.push({
          id: `click-${randInt(10000, 99999)}`,
          time: nowstr(),
          type: "user_clicked",
          email_id: email.id,
          user: email.to,
          url: clickUrl,
          severity: "WARN",
          note: "Clic simulé sur le lien",
        })
      })

      clicked.forEach((email) => {
        const rate = Number.parseFloat(params.credential_submit_rate || 0.02)
        if (Math.random() < rate) {
          events.push({
            id: `cred-${randInt(10000, 99999)}`,
            time: nowstr(),
            type: "credential_submit",
            email_id: email.id,
            user: email.to,
            username: email.to.split("@")[0],
            result: randChoice(["success", "invalid", "blocked"]),
            severity: "ALERT",
            note: "Saisie fictive de credentials (simulée)",
          })
        }
      })

      if (clicked.length > 0 && n_alerts > 0) {
        const alerted = clicked.slice(0, n_alerts)
        alerted.forEach((email) => {
          events.push({
            id: `alert-${randInt(10000, 99999)}`,
            time: nowstr(),
            type: "detection_alert",
            source_event: email.id,
            rule: randChoice(["spf_fail", "suspicious_link", "phish_signature_v1"]),
            severity: "ALERT",
            msg: `Alerte détectée pour ${email.subject}`,
          })
        })
      }

      return events
    }

    function renderMetrics() {
      $("emailsCount").textContent = state.events.filter((e) => e.type === "email_received").length
      $("clicksCount").textContent = state.events.filter((e) => e.type === "user_clicked").length
      $("alertsCount").textContent = state.events.filter((e) => e.type === "detection_alert").length
    }

    function renderTable() {
      const tbody = shadow.querySelector("#eventsTable tbody")
      tbody.innerHTML = ""
      const slice = state.events.slice(-50)
      slice.forEach((e, i) => {
        const tr = document.createElement("tr")
        if (e.severity === "INFO") tr.classList.add("info")
        if (e.severity === "WARN") tr.classList.add("warn")
        if (e.severity === "ALERT") tr.classList.add("alert")
        const info =
          e.type === "email_received"
            ? `${e.from} -> ${e.to} | ${e.subject}`
            : e.type === "user_clicked"
              ? `${e.user} clicked ${e.url}`
              : e.type === "credential_submit"
                ? `${e.user} submitted creds (${e.result})`
                : e.type === "detection_alert"
                  ? `${e.rule} : ${e.msg}`
                  : e.msg || ""
        tr.innerHTML = `<td>${state.events.length - slice.length + i + 1}</td><td>${escapeHtml(e.time)}</td><td>${escapeHtml(
          e.type,
        )}</td><td>${escapeHtml(e.severity)}</td><td style="font-family:monospace">${escapeHtml(info)}</td>`
        tbody.appendChild(tr)
      })
    }

    function renderWarnList() {
      const list = state.events.filter((e) => e.severity === "WARN" || e.severity === "ALERT")
      const sel = $("warnSelect")
      sel.innerHTML = ""
      if (list.length === 0) {
        sel.innerHTML = `<option>No warnings/alerts</option>`
        $("eventDetails").textContent = "{ select a warning/alert }"
        $("personBox").style.display = "none"
        return
      }
      list.forEach((e) => {
        const opt = document.createElement("option")
        opt.value = e.id
        let label = `${e.time} | ${e.type} | ${e.id} | ${e.severity}`
        if ((e.type === "user_clicked" || e.type === "credential_submit") && e.user) label += ` | user:${e.user}`
        opt.textContent = label
        sel.appendChild(opt)
      })
      sel.selectedIndex = 0
      showSelectedEventDetails()
    }

    function showSelectedEventDetails() {
      const sel = $("warnSelect")
      if (!sel || sel.options.length === 0) return
      const id = sel.value
      const ev = state.events.find((x) => x.id === id)
      const details = $("eventDetails")
      if (!ev) {
        details.textContent = "{ select a warning/alert }"
        $("personBox").style.display = "none"
        return
      }
      details.textContent = JSON.stringify(ev, null, 2)
      let person = null
      if (ev.type === "user_clicked" || ev.type === "credential_submit") person = ev.user
      else if (ev.type === "detection_alert") {
        const src = ev.source_event
        const m = {}
        state.events.forEach((e) => {
          if (e.type === "email_received") m[e.id] = e.to
        })
        person = m[src] || null
      } else {
        person = ev.user || ev.to || ev.target || null
      }
      const box = $("personBox")
      if (person) {
        box.textContent = `Affected Person: ${person}`
        box.style.display = "inline-block"
      } else {
        box.style.display = "none"
      }
    }

    function notify(text, level = "ok") {
      const n = $("notice")
      n.style.display = "block"
      n.textContent = text
      n.style.background =
        level === "ok" ? "rgba(34,197,94,0.08)" : level === "info" ? "rgba(91,99,255,0.06)" : "rgba(255,193,7,0.08)"
      n.style.color = level === "ok" ? "var(--success)" : level === "info" ? "var(--muted)" : "var(--danger)"
      setTimeout(() => {
        n.style.display = "none"
      }, 3500)
    }

    function renderAll() {
      renderMetrics()
      renderTable()
      renderWarnList()
    }

    // --- Tick avec option "forceAtLeastOne" pour feedback immédiat ---
    function tick(forceAtLeastOne = false) {
      const params = {
        max_emails_per_tick: options.maxEmailsPerTick || 8,
        credential_submit_rate: options.credentialSubmitRate ?? 0.02,
        type: "email",
      }
      if (!state.running) return

      let newEv = gen_phishing_events(params)

      // Garantit au moins 1 événement pour montrer que ça tourne
      if (forceAtLeastOne && newEv.length === 0) {
        newEv = gen_phishing_events({ max_emails_per_tick: 1, credential_submit_rate: 0.0 })
      }

      if (newEv.length) {
        state.events.push(...newEv)
        if (state.events.length > (options.maxEvents || 5000)) state.events = state.events.slice(-3000)
        renderAll()
      }
    }

    function startSim() {
      if (state.running) return
      state.running = true
      state.started = true
      state.events = []
      notify(`Simulation ${$("scenarioName").textContent} started`, "ok")
      if (tickTimer) clearInterval(tickTimer)
      tickTimer = setInterval(() => tick(false), TICK_MS)
      // Tick immédiat pour retour visuel instantané
      tick(true)
      renderAll()
    }

    function pauseSim() {
      state.running = false
      if (tickTimer) clearInterval(tickTimer)
      notify("Simulation paused", "info")
    }

    function resumeSim() {
      if (!state.started) {
        notify("Simulation has not been started yet", "warn")
        return
      }
      state.running = true
      if (tickTimer) clearInterval(tickTimer)
      tickTimer = setInterval(() => tick(false), TICK_MS)
      tick(true)
      notify("Simulation resumed", "ok")
    }

    function clearSim() {
      state.running = false
      state.started = false
      state.events = []
      if (tickTimer) clearInterval(tickTimer)
      renderAll()
      notify("All events cleared!", "ok")
    }

    $("startBtn").addEventListener("click", startSim)
    $("pauseBtn").addEventListener("click", pauseSim)
    $("resumeBtn").addEventListener("click", resumeSim)
    $("clearBtn").addEventListener("click", clearSim)
    $("warnSelect").addEventListener("change", showSelectedEventDetails)

    renderAll()

    // --- Détecteur d'overlay : log si quelque chose recouvre le composant ---
    setTimeout(() => {
      const r = targetEl.getBoundingClientRect()
      const topEl = document.elementFromPoint(r.left + 10, r.top + 10)
      if (topEl && topEl !== targetEl && !targetEl.contains(topEl)) {
        console.warn("[PhishingSimulator] An element is covering the simulator:", topEl)
        notify("A page overlay is covering the simulator (see console).", "warn")
      }
    }, 0)

    // expose minimal controls if caller wants to drive it
    return {
      start: startSim,
      pause: pauseSim,
      resume: resumeSim,
      clear: clearSim,
      getState: () => ({ ...state, events: state.events.slice() }),
    }
  }

  global.PhishingSimulator = { mount }
})(window)
