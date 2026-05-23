/**
 * IMS AI Chat Widget — Light Mode
 * Analytics + Insights assistant powered by Ollama / qwen2.5:7b
 */
(function () {
  "use strict";

  // ── Quick suggestions ────────────────────────────────────────────────────
  const SUGGESTIONS = [
    {
      text: "What's my revenue today?",
      icon: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`
    },
    {
      text: "Which products are low on stock?",
      icon: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`
    },
    {
      text: "What's my best-selling product?",
      icon: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`
    },
    {
      text: "Give me a business summary",
      icon: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>`
    },
    {
      text: "Which products aren't selling?",
      icon: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>`
    },
    {
      text: "How much did I earn this week?",
      icon: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`
    },
  ];

  let history  = [];
  let isOpen   = false;
  let isTyping = false;

  // ── CSS ──────────────────────────────────────────────────────────────────
  const style = document.createElement("style");
  style.textContent = `
    /* ── Toggle button ── */
    #ims-chat-btn {
      position: fixed;
      bottom: 28px;
      right: 28px;
      width: 58px;
      height: 58px;
      border-radius: 50%;
      background: #ffffff;
      border: 2px solid #e2e8f0;
      cursor: pointer;
      box-shadow: 0 4px 16px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.06);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9998;
      transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
      padding: 0;
      overflow: hidden;
    }
    #ims-chat-btn:hover {
      transform: scale(1.07);
      box-shadow: 0 6px 24px rgba(16,185,129,0.25), 0 2px 8px rgba(0,0,0,0.08);
      border-color: #10b981;
    }
    #ims-chat-btn .btn-avatar {
      width: 100%; height: 100%;
      object-fit: cover;
      border-radius: 50%;
      transition: opacity 0.2s;
    }
    #ims-chat-btn .btn-close {
      display: none;
      position: absolute;
      inset: 0;
      background: #f1f5f9;
      border-radius: 50%;
      align-items: center;
      justify-content: center;
      color: #64748b;
    }
    #ims-chat-btn.open .btn-avatar { opacity: 0; }
    #ims-chat-btn.open .btn-close  { display: flex; }

    /* ── Unread badge ── */
    #ims-chat-badge {
      position: absolute;
      top: 1px; right: 1px;
      width: 17px; height: 17px;
      border-radius: 50%;
      background: #ef4444;
      color: #fff;
      font-size: 10px;
      font-weight: 700;
      display: none;
      align-items: center;
      justify-content: center;
      border: 2px solid #fff;
    }

    /* ── Panel ── */
    #ims-chat-panel {
      position: fixed;
      bottom: 100px;
      right: 28px;
      width: 380px;
      max-height: 560px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06);
      display: flex;
      flex-direction: column;
      z-index: 9997;
      overflow: hidden;
      transform: translateY(16px) scale(0.97);
      opacity: 0;
      pointer-events: none;
      transition: transform 0.25s cubic-bezier(.34,1.56,.64,1), opacity 0.2s;
    }
    #ims-chat-panel.open {
      transform: translateY(0) scale(1);
      opacity: 1;
      pointer-events: all;
    }

    /* ── Header ── */
    #ims-chat-header {
      padding: 14px 16px 12px;
      background: #fff;
      border-bottom: 1px solid #f1f5f9;
      display: flex;
      align-items: center;
      gap: 11px;
    }
    .ims-chat-hdr-avatar {
      width: 40px; height: 40px;
      border-radius: 50%;
      border: 1.5px solid #e2e8f0;
      overflow: hidden;
      flex-shrink: 0;
      background: #f8fafc;
      padding: 4px;
    }
    .ims-chat-hdr-avatar img {
      width: 100%; height: 100%;
      object-fit: contain;
      border-radius: 50%;
    }
    .ims-chat-hdr-info { flex: 1; }
    .ims-chat-hdr-info strong {
      display: block;
      color: #0f172a;
      font-size: 14px;
      font-weight: 600;
      letter-spacing: -0.01em;
    }
    .ims-chat-hdr-info span {
      font-size: 11px;
      color: #10b981;
      display: flex;
      align-items: center;
      gap: 4px;
      font-weight: 500;
    }
    .ims-online-dot {
      width: 6px; height: 6px;
      border-radius: 50%;
      background: #10b981;
      animation: imsPulse 2s infinite;
    }
    @keyframes imsPulse {
      0%,100% { opacity: 1; }
      50% { opacity: 0.35; }
    }
    #ims-chat-clear {
      background: none;
      border: none;
      cursor: pointer;
      color: #94a3b8;
      padding: 6px;
      border-radius: 8px;
      transition: color 0.2s, background 0.2s;
      display: flex; align-items: center;
    }
    #ims-chat-clear:hover { color: #64748b; background: #f1f5f9; }

    /* ── Messages ── */
    #ims-chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      scroll-behavior: smooth;
      background: #fafbfc;
    }
    #ims-chat-messages::-webkit-scrollbar { width: 4px; }
    #ims-chat-messages::-webkit-scrollbar-track { background: transparent; }
    #ims-chat-messages::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }

    /* ── Welcome screen ── */
    #ims-chat-welcome {
      text-align: center;
      padding: 8px 4px 4px;
    }
    .ims-welcome-avatar {
      width: 62px; height: 62px;
      border-radius: 50%;
      border: 2px solid #e2e8f0;
      background: #f8fafc;
      overflow: hidden;
      padding: 8px;
      margin: 0 auto 13px;
    }
    .ims-welcome-avatar img {
      width: 100%; height: 100%;
      object-fit: contain;
      border-radius: 50%;
    }
    #ims-chat-welcome h4 {
      color: #0f172a;
      font-size: 14px;
      font-weight: 700;
      margin-bottom: 5px;
    }
    #ims-chat-welcome p {
      color: #94a3b8;
      font-size: 12px;
      line-height: 1.55;
      margin-bottom: 16px;
    }
    .ims-suggestions {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      justify-content: center;
    }
    .ims-suggestion-chip {
      display: flex;
      align-items: center;
      gap: 5px;
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      color: #059669;
      font-size: 11px;
      font-weight: 500;
      padding: 5px 11px 5px 9px;
      border-radius: 20px;
      cursor: pointer;
      transition: background 0.18s, border-color 0.18s, transform 0.15s;
      font-family: inherit;
      white-space: nowrap;
    }
    .ims-suggestion-chip svg { flex-shrink: 0; opacity: 0.9; }
    .ims-suggestion-chip:hover {
      background: #dcfce7;
      border-color: #86efac;
      transform: translateY(-1px);
    }

    /* ── Message bubbles ── */
    .ims-msg {
      display: flex;
      gap: 8px;
      max-width: 100%;
      animation: imsMsgIn 0.2s ease;
    }
    @keyframes imsMsgIn {
      from { opacity: 0; transform: translateY(5px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .ims-msg.user { flex-direction: row-reverse; }
    .ims-msg-avatar {
      width: 30px; height: 30px;
      border-radius: 50%;
      flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      margin-top: 2px;
      overflow: hidden;
    }
    .ims-msg.user .ims-msg-avatar {
      background: linear-gradient(135deg, #10b981, #059669);
      color: #fff;
      font-size: 12px;
      font-weight: 700;
    }
    .ims-msg.assistant .ims-msg-avatar {
      background: #f8fafc;
      border: 1.5px solid #e2e8f0;
      padding: 4px;
    }
    .ims-msg.assistant .ims-msg-avatar img {
      width: 100%; height: 100%;
      object-fit: contain;
      border-radius: 50%;
    }
    .ims-msg-bubble {
      max-width: calc(100% - 42px);
      padding: 10px 13px;
      border-radius: 16px;
      font-size: 13px;
      line-height: 1.55;
    }
    .ims-msg.user .ims-msg-bubble {
      background: linear-gradient(135deg, #10b981, #059669);
      color: #fff;
      border-bottom-right-radius: 4px;
      box-shadow: 0 2px 8px rgba(16,185,129,0.25);
    }
    .ims-msg.assistant .ims-msg-bubble {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      color: #334155;
      border-bottom-left-radius: 4px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.04);
    }
    .ims-msg-bubble strong { color: #0f172a; font-weight: 600; }
    .ims-msg.user .ims-msg-bubble strong { color: #fff; }
    .ims-msg-bubble ul {
      list-style: none;
      padding: 0; margin: 6px 0 0;
      display: flex; flex-direction: column; gap: 4px;
    }
    .ims-msg-bubble ul li::before { content: "• "; color: #10b981; font-weight: 700; }
    .ims-msg.user .ims-msg-bubble ul li::before { color: rgba(255,255,255,0.75); }
    .ims-msg-bubble p { margin: 0; }
    .ims-msg-bubble p + p { margin-top: 5px; }

    /* ── Typing indicator ── */
    #ims-typing {
      display: none;
      align-items: center;
      gap: 8px;
      padding: 0 2px;
    }
    #ims-typing.show { display: flex; }
    .ims-typing-avatar {
      width: 30px; height: 30px;
      border-radius: 50%;
      background: #f8fafc;
      border: 1.5px solid #e2e8f0;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      overflow: hidden;
      padding: 4px;
    }
    .ims-typing-avatar img {
      width: 100%; height: 100%;
      object-fit: contain;
      border-radius: 50%;
    }
    .ims-typing-bubble {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      border-bottom-left-radius: 4px;
      padding: 11px 16px;
      display: flex;
      gap: 5px;
      align-items: center;
      box-shadow: 0 1px 4px rgba(0,0,0,0.04);
    }
    .ims-typing-dot {
      width: 6px; height: 6px;
      border-radius: 50%;
      background: #cbd5e1;
      animation: imsTyping 1.4s infinite;
    }
    .ims-typing-dot:nth-child(2) { animation-delay: 0.2s; }
    .ims-typing-dot:nth-child(3) { animation-delay: 0.4s; }
    @keyframes imsTyping {
      0%,80%,100% { transform: scale(1); opacity: 0.5; }
      40% { transform: scale(1.35); opacity: 1; }
    }

    /* ── Footer / input ── */
    #ims-chat-footer {
      padding: 12px 14px;
      border-top: 1px solid #f1f5f9;
      background: #fff;
    }
    #ims-chat-form {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #f8fafc;
      border: 1.5px solid #e2e8f0;
      border-radius: 12px;
      padding: 8px 8px 8px 14px;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    #ims-chat-form:focus-within {
      border-color: #10b981;
      box-shadow: 0 0 0 3px rgba(16,185,129,0.08);
    }
    #ims-chat-input {
      flex: 1;
      background: none;
      border: none;
      outline: none;
      color: #0f172a;
      font-size: 13px;
      font-family: inherit;
      resize: none;
      line-height: 1.4;
      max-height: 80px;
      overflow-y: auto;
    }
    #ims-chat-input::placeholder { color: #94a3b8; }
    #ims-chat-send {
      width: 34px; height: 34px;
      border-radius: 9px;
      background: linear-gradient(135deg, #10b981, #059669);
      border: none;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      transition: opacity 0.2s, transform 0.15s;
      color: #fff;
      box-shadow: 0 2px 6px rgba(16,185,129,0.3);
    }
    #ims-chat-send:hover:not(:disabled) { opacity: 0.9; transform: scale(1.05); }
    #ims-chat-send:disabled { opacity: 0.3; cursor: not-allowed; transform: none; box-shadow: none; }
    .ims-footer-hint {
      text-align: center;
      font-size: 10px;
      color: #cbd5e1;
      margin-top: 8px;
      letter-spacing: 0.01em;
    }

    /* ── Error bubble ── */
    .ims-error-bubble {
      background: #fff7ed !important;
      border-color: #fed7aa !important;
      color: #c2410c !important;
    }
    .ims-error-bubble strong { color: #9a3412 !important; }

    /* ── Info bubble (offline notice) ── */
    .ims-info-bubble {
      background: #f0f9ff !important;
      border-color: #bae6fd !important;
      color: #0369a1 !important;
    }

    @media (max-width: 440px) {
      #ims-chat-panel { width: calc(100vw - 24px); right: 12px; }
    }
  `;
  document.head.appendChild(style);

  // ── Build DOM ────────────────────────────────────────────────────────────
  const btn = document.createElement("button");
  btn.id = "ims-chat-btn";
  btn.title = "IMS Assistant";
  btn.innerHTML = `
    <div id="ims-chat-badge"></div>
    <img class="btn-avatar" src="/app/ai-avatar.png" alt="IMS Assistant" />
    <div class="btn-close">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </div>
  `;

  const panel = document.createElement("div");
  panel.id = "ims-chat-panel";
  panel.innerHTML = `
    <div id="ims-chat-header">
      <div class="ims-chat-hdr-avatar">
        <img src="/app/ai-avatar.png" alt="IMS Assistant" />
      </div>
      <div class="ims-chat-hdr-info">
        <strong>IMS Assistant</strong>
        <span><span class="ims-online-dot"></span>Analytics &amp; Insights</span>
      </div>
      <button id="ims-chat-clear" title="Clear conversation">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
          <path d="M10 11v6M14 11v6"/>
          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
        </svg>
      </button>
    </div>

    <div id="ims-chat-messages">
      <div id="ims-chat-welcome">
        <div class="ims-welcome-avatar">
          <img src="/app/ai-avatar.png" alt="IMS Assistant" />
        </div>
        <h4>Your Inventory Analyst</h4>
        <p>Ask me anything about your stock,<br>sales performance, or revenue trends.</p>
        <div class="ims-suggestions"></div>
      </div>
      <div id="ims-typing">
        <div class="ims-typing-avatar">
          <img src="/app/ai-avatar.png" alt="AI" />
        </div>
        <div class="ims-typing-bubble">
          <div class="ims-typing-dot"></div>
          <div class="ims-typing-dot"></div>
          <div class="ims-typing-dot"></div>
        </div>
      </div>
    </div>

    <div id="ims-chat-footer">
      <form id="ims-chat-form" autocomplete="off">
        <textarea id="ims-chat-input" placeholder="Ask about stock, sales, revenue…" rows="1"></textarea>
        <button type="submit" id="ims-chat-send" title="Send">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </form>
      <div class="ims-footer-hint">Powered by Ollama · Live inventory data</div>
    </div>
  `;

  document.body.appendChild(btn);
  document.body.appendChild(panel);

  // ── Populate suggestion chips ────────────────────────────────────────────
  const sugContainer = panel.querySelector(".ims-suggestions");
  SUGGESTIONS.forEach(({ text, icon }) => {
    const chip = document.createElement("button");
    chip.className = "ims-suggestion-chip";
    chip.type = "button";
    chip.innerHTML = icon + `<span>${text}</span>`;
    chip.addEventListener("click", () => sendMessage(text));
    sugContainer.appendChild(chip);
  });

  // ── DOM refs ─────────────────────────────────────────────────────────────
  const messages = panel.querySelector("#ims-chat-messages");
  const typing   = panel.querySelector("#ims-typing");
  const welcome  = panel.querySelector("#ims-chat-welcome");
  const input    = panel.querySelector("#ims-chat-input");
  const form     = panel.querySelector("#ims-chat-form");
  const sendBtn  = panel.querySelector("#ims-chat-send");
  const clearBtn = panel.querySelector("#ims-chat-clear");
  const badge    = btn.querySelector("#ims-chat-badge");

  // ── Toggle ───────────────────────────────────────────────────────────────
  function togglePanel() {
    isOpen = !isOpen;
    panel.classList.toggle("open", isOpen);
    btn.classList.toggle("open", isOpen);
    if (isOpen) {
      badge.style.display = "none";
      input.focus();
      scrollBottom();
    }
  }
  btn.addEventListener("click", togglePanel);

  // ── Clear ────────────────────────────────────────────────────────────────
  clearBtn.addEventListener("click", () => {
    history = [];
    Array.from(messages.children).forEach((el) => {
      if (el.id !== "ims-chat-welcome" && el.id !== "ims-typing") el.remove();
    });
    welcome.style.display = "block";
    scrollBottom();
  });

  // ── Textarea auto-resize ─────────────────────────────────────────────────
  input.addEventListener("input", () => {
    input.style.height = "auto";
    input.style.height = Math.min(input.scrollHeight, 80) + "px";
  });
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      form.dispatchEvent(new Event("submit"));
    }
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text || isTyping) return;
    sendMessage(text);
  });

  // ── Send ─────────────────────────────────────────────────────────────────
  async function sendMessage(text) {
    if (isTyping) return;
    welcome.style.display = "none";
    appendMessage("user", text);
    history.push({ role: "user", content: text });
    input.value = "";
    input.style.height = "auto";
    setTyping(true);
    scrollBottom();

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: "Bearer " + token } : {}),
        },
        body: JSON.stringify({ message: text, history: history.slice(0, -1) }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const reply = data.reply || "No response.";
      setTyping(false);
      appendMessage("assistant", reply, false, data.offline);
      history.push({ role: "assistant", content: reply });
      if (!isOpen) showBadge();
    } catch (err) {
      setTyping(false);
      const msg = err.message || "";
      const isOffline = msg.includes("Ollama") || msg.includes("locally") || msg.includes("refused");
      appendMessage("assistant", isOffline
        ? "⚠️ AI Assistant requires Ollama running locally.\nStart it with: **ollama serve**"
        : `Something went wrong: ${msg}`,
        !isOffline, isOffline
      );
    }
    scrollBottom();
  }

  // ── Append bubble ─────────────────────────────────────────────────────────
  function appendMessage(role, text, isError = false, isInfo = false) {
    const wrap = document.createElement("div");
    wrap.className = `ims-msg ${role}`;

    const avatarEl = document.createElement("div");
    avatarEl.className = "ims-msg-avatar";
    if (role === "assistant") {
      const img = document.createElement("img");
      img.src = "/app/ai-avatar.png";
      img.alt = "AI";
      avatarEl.appendChild(img);
    } else {
      avatarEl.textContent = "U";
    }

    const bubble = document.createElement("div");
    let cls = "ims-msg-bubble";
    if (isError) cls += " ims-error-bubble";
    if (isInfo)  cls += " ims-info-bubble";
    bubble.className = cls;
    bubble.innerHTML = renderMarkdown(text);

    wrap.appendChild(avatarEl);
    wrap.appendChild(bubble);
    messages.insertBefore(wrap, typing);
  }

  // ── Markdown ──────────────────────────────────────────────────────────────
  function renderMarkdown(text) {
    let t = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    t = t.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    t = t.replace(/__(.+?)__/g, "<strong>$1</strong>");

    const lines = t.split("\n");
    let inList = false;
    const out = [];
    for (const line of lines) {
      const isBullet = /^[-•]\s+/.test(line);
      if (isBullet) {
        if (!inList) { out.push("<ul>"); inList = true; }
        out.push("<li>" + line.replace(/^[-•]\s+/, "") + "</li>");
      } else {
        if (inList) { out.push("</ul>"); inList = false; }
        if (line.trim()) out.push("<p>" + line + "</p>");
      }
    }
    if (inList) out.push("</ul>");
    return out.join("");
  }

  function setTyping(show) {
    isTyping = show;
    typing.classList.toggle("show", show);
    sendBtn.disabled = show;
    if (show) scrollBottom();
  }

  function scrollBottom() {
    setTimeout(() => { messages.scrollTop = messages.scrollHeight; }, 50);
  }

  function showBadge() {
    badge.style.display = "flex";
    badge.textContent = "1";
  }

})();
