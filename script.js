/* ========= CONFIG: API & Custom Avatar ========= */
const API_KEY = "AIzaSyBv0GKJnkOVz5owVRDFOGfrzTXRASJRaIE"; // ganti pake api lu, kalo ga ad biarin aja
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"; // ganti pake url api lu, kalo ga ad biarin aja

/* ========= Custom Avatar ========= */
const AI_AVATAR   = "https://files.catbox.moe/41izsc.jpeg";
const USER_AVATAR = "https://files.catbox.moe/87uwsp.png";

/* ========= ELEMENTS ========= */
const sidebar = document.getElementById("sidebar");
const openSidebarBtn = document.getElementById("openSidebar");
const closeSidebarBtn = document.getElementById("closeSidebar");

const messagesEl = document.getElementById("messages");
const inputEl = document.getElementById("input");
const sendBtn = document.getElementById("send");

const btnNewChat = document.getElementById("btnNewChat");
const btnDeleteAll = document.getElementById("btnDeleteAll");
const historyEl = document.getElementById("history");

const btnTheme = document.getElementById("btnTheme");
const btnReset = document.getElementById("btnReset");

/* ========= Modal ========= */
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const modalBody = document.getElementById("modalBody");
const modalInputWrap = document.getElementById("modalInputWrap");
const modalInput = document.getElementById("modalInput");
const modalCancel = document.getElementById("modalCancel");
const modalOk = document.getElementById("modalOk");

/* ========= STATE ========= */
let chats = JSON.parse(localStorage.getItem("kalzz_chats") || "[]");
let currentId = Number(localStorage.getItem("kalzz_current")) || null;

/* ========= UTIL ========= */
const saveChats = () => localStorage.setItem("kalzz_chats", JSON.stringify(chats));
const saveCurrent = () => localStorage.setItem("kalzz_current", String(currentId));

function newChat(title = "") {
  const obj = { id: Date.now(), title: title || timeLabel(), messages: [] };
  chats.unshift(obj);
  currentId = obj.id;
  saveChats(); saveCurrent();
  renderHistory();
  renderChat();
}

function timeLabel() {
  const d = new Date();
  return `Obrolan ${String(d.getHours()).padStart(2,"0")}.${String(d.getMinutes()).padStart(2,"0")}.${String(d.getSeconds()).padStart(2,"0")}`;
}

function getCurrentChat() {
  return chats.find(c => c.id === currentId);
}

function ensureCurrent() {
  if (!currentId || !getCurrentChat()) {
    if (chats.length === 0) newChat();
    else currentId = chats[0].id;
  }
}

function escapeHTML(str="") {
  return str.replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
}

/* ========= SIDEBAR ========= */
openSidebarBtn.addEventListener("click", () => sidebar.classList.add("open"));
closeSidebarBtn.addEventListener("click", () => sidebar.classList.remove("open"));

btnNewChat.addEventListener("click", () => {
  newChat();
  sidebar.classList.remove("open");
});

btnDeleteAll.addEventListener("click", () =>{
  showModal({ 
    title: "Hapus Semua Obrolan", 
    body: "Tindakan ini tidak bisa dibatalkan. Yakin ingin menghapus semua?", 
    input:false,
    danger:true, 
    onOk:()=>{
      chats = []; currentId = null;
      saveChats(); saveCurrent();
      ensureCurrent(); renderHistory(); renderChat();
    }
  });
});


/* ========= THEME ========= */
const applyTheme = (t) => {
  document.body.classList.remove("theme-blue","theme-light");
  document.body.classList.add(t);
  localStorage.setItem("kalzz_theme", t);
  btnTheme.innerHTML = t === "theme-blue"
    ? '<i class="fa-regular fa-moon"></i>'
    : '<i class="fa-regular fa-sun"></i>';
};
applyTheme(localStorage.getItem("kalzz_theme") || "theme-blue");
btnTheme.addEventListener("click", () => {
  const next = document.body.classList.contains("theme-blue") ? "theme-light" : "theme-blue";
  applyTheme(next);
});
btnReset.addEventListener("click", () => location.reload());

/* ========= HISTORY RENDER ========= */
function renderHistory() {
  historyEl.innerHTML = "";
  chats.forEach(c => {
    const item = document.createElement("div");
    item.className = "chat-item" + (c.id === currentId ? " active" : "");
    item.innerHTML = `
      <div class="label" title="${escapeHTML(c.title)}">${escapeHTML(c.title)}</div>
      <div class="mini">
        <button class="icon pen" title="Ganti nama"><i class="fa-solid fa-pen-to-square"></i></button>
        <button class="icon del" title="Hapus"><i class="fa-solid fa-trash"></i></button>
      </div>
    `;
    item.addEventListener("click", (e) => {
      if (e.target.closest(".mini")) return;
      currentId = c.id; saveCurrent();
      renderHistory(); renderChat();
      sidebar.classList.remove("open");
    });
    item.querySelector(".pen").addEventListener("click", () => {
      showModal({
        title: "Ganti Nama Obrolan",
        body: "Masukkan nama baru untuk obrolan ini.",
        input: c.title,
        onOk: (val) => {
          c.title = val || c.title;
          saveChats();
          renderHistory();
        }
      });
    });
    item.querySelector(".del").addEventListener("click", () => {
      showModal({
        title: "Hapus Obrolan",
        body: `Hapus "${escapeHTML(c.title)}"?`,
        input: false,
        danger: true,
        onOk: () => {
          chats = chats.filter(x => x.id !== c.id);
          if (currentId === c.id) currentId = chats[0]?.id || null;
          saveChats(); saveCurrent(); renderHistory(); renderChat();
        }
      });
    });

    historyEl.appendChild(item);
  });
}

/* ========= CHAT RENDER ========= */
function messageHTML(role, text) {
  const avatar = role === "ai" ? AI_AVATAR : USER_AVATAR;
  return `
    <div class="msg ${role}">
      <div class="avatar"><img src="${escapeHTML(avatar)}" alt="${role}"/></div>
      <div class="bubble"><p>${escapeHTML(text)}</p></div>
    </div>
  `;
}

function renderChat() {
  ensureCurrent();
  const chat = getCurrentChat();
  messagesEl.innerHTML = "";

  if (!chat || chat.messages.length === 0) {
    messagesEl.insertAdjacentHTML("beforeend", messageHTML("ai",
      "Halo! Saya adalah Lanzz AI.\nAda yang bisa saya bantu?"));
  } else {
    chat.messages.forEach(m => {
      messagesEl.insertAdjacentHTML("beforeend", messageHTML(m.role, m.content));
    });
  }
  scrollToBottom();
}
function scrollToBottom(){ messagesEl.scrollTop = messagesEl.scrollHeight; }

/* ========= INPUT / SEND ========= */
inputEl.addEventListener("input", () => {
  inputEl.style.height = "auto";
  inputEl.style.height = Math.min(inputEl.scrollHeight, 160) + "px";
  sendBtn.disabled = inputEl.value.trim() === "";
});

inputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

sendBtn.addEventListener("click", sendMessage);

async function sendMessage() {
  const text = inputEl.value.trim();
  if (!text) return;

  ensureCurrent();
  const chat = getCurrentChat();

  // user msg
  messagesEl.insertAdjacentHTML("beforeend", messageHTML("user", text));
  chat.messages.push({ role: "user", content: text });
  saveChats();
  inputEl.value = ""; inputEl.dispatchEvent(new Event("input"));
  scrollToBottom();

  // loading bubble
  const tmp = document.createElement("div");
  tmp.className = "msg ai";
  tmp.innerHTML = `
    <div class="avatar"><img src="${escapeHTML(AI_AVATAR)}" alt="ai"/></div>
    <div class="bubble"><p>...</p></div>
  `;
  messagesEl.appendChild(tmp);
  scrollToBottom();

  try {
    const res = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text }]}],
        generationConfig: { temperature: 0.8, topP: 0.95, maxOutputTokens: 1024 }
      })
    });

    const data = await res.json();
    const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Maaf, aku gak dapat jawaban sekarang.";
    tmp.querySelector(".bubble p").textContent = "";
    await typeWriter(tmp.querySelector(".bubble p"), aiText, 12);

    chat.messages.push({ role: "ai", content: aiText });
    saveChats();
    renderHistory();
    scrollToBottom();
  } catch (err) {
    tmp.querySelector(".bubble p").textContent = "⚠️ Gagal terhubung ke server.";
  }
}

/* ========= Typewriter ========= */
function typeWriter(targetNode, text, speed = 18) {
  return new Promise((resolve) => {
    let i = 0;
    const tick = () => {
      targetNode.textContent = text.slice(0, i += 2);
      if (i < text.length) setTimeout(tick, speed);
      else resolve();
    };
    tick();
  });
}

/* ========= Security ========= */
document.addEventListener("contextmenu", e => e.preventDefault());

document.addEventListener("keydown", e => {
  if (
    e.key === "F12" || 
    (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J" || e.key === "C")) || 
    (e.ctrlKey && e.key.toLowerCase() === "u")
  ) {
    e.preventDefault();
    window.location.href = "warning.html"; 
  }
});

let devtoolsOpen = false;
const threshold = 160;

setInterval(() => {
  if (
    window.outerWidth - window.innerWidth > threshold ||
    window.outerHeight - window.innerHeight > threshold
  ) {
    if (!devtoolsOpen) {
      devtoolsOpen = true;
      window.location.href = "warning.html";
    }
  } else {
    devtoolsOpen = false;
  }
}, 500);

/* ========= Contacts Developer ========= */
document.getElementById("btnContact").addEventListener("click", () => {
      window.open("https://t.me/kayzzleothexiter", "_blank"); 
    });

/* ========= Modal Helper ========= */
let modalResolve = null;
function showModal({title, body, input="", danger=false, onOk}) {
  modalTitle.textContent = title || "Konfirmasi";
  modalBody.innerHTML = body || "";
  modalInputWrap.classList.toggle("hidden", input === false);
  if (input !== false) {
    modalInput.value = typeof input === "string" ? input : "";
    setTimeout(()=>modalInput.focus(), 40);
  }
  modalOk.classList.toggle("danger", !!danger);
  modal.classList.add("show");

  modalResolve = (val) => { if (onOk) onOk(val); modal.classList.remove("show"); };
}
modalCancel.addEventListener("click", () => modal.classList.remove("show"));
modalOk.addEventListener("click", () => {
  const val = modalInputWrap.classList.contains("hidden") ? true : modalInput.value.trim();
  modalResolve && modalResolve(val);
});
modal.addEventListener("click", (e) => { if (e.target === modal) modal.classList.remove("show"); });

/* ========= Toast ========= */
function toast(text){
  const el = document.createElement("div");
  el.textContent = text;
  Object.assign(el.style,{
    position:"fixed",left:"50%",bottom:"70px",transform:"translateX(-50%)",
    background:"rgba(0,0,0,.6)",color:"#fff",padding:"10px 14px",borderRadius:"10px",
    zIndex:80,backdropFilter:"blur(6px)"
  });
  document.body.appendChild(el);
  setTimeout(()=>{ el.style.opacity="0"; el.style.transition="opacity .3s"; },1600);
  setTimeout(()=> el.remove(), 2000);
}

/* ========= INIT ========= */
(function init(){
  ensureCurrent();
  renderHistory();
  renderChat();
})();