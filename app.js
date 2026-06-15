import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import {
  getFirestore, collection, addDoc, getDocs, doc,
  updateDoc, deleteDoc, query, orderBy, where, onSnapshot
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

// ▼ PREENCHA COM SUAS CREDENCIAIS DO FIREBASE ▼
const firebaseConfig = {
  apiKey:            "SUA_API_KEY",
  authDomain:        "SEU_PROJECT.firebaseapp.com",
  projectId:         "SEU_PROJECT_ID",
  storageBucket:     "SEU_PROJECT.appspot.com",
  messagingSenderId: "SEU_SENDER_ID",
  appId:             "SEU_APP_ID"
};
// ▲ FIM DAS CREDENCIAIS ▲

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);
const col = collection(db, "contatos");

// ── Estado ──────────────────────────────────────────────────────────────────
let editandoId  = null;
let unsubscribe = null;

// ── Utilidades ───────────────────────────────────────────────────────────────
function exibirMensagem(texto, tipo = "ok") {
  const el = document.getElementById("msg");
  el.textContent  = texto;
  el.className    = tipo === "ok" ? "msg-ok" : "msg-err";
  el.style.display = "block";
  setTimeout(() => { el.style.display = "none"; }, 3500);
}

function formatarData(iso) {
  if (!iso) return "";
  const [a, m, d] = iso.split("-");
  return `${d}/${m}/${a}`;
}

// ── Renderização ─────────────────────────────────────────────────────────────
function renderizarLinhas(docs) {
  const tbody = document.getElementById("tbody");
  tbody.innerHTML = "";

  if (docs.length === 0) {
    tbody.innerHTML = '<tr id="empty-row"><td colspan="6">Nenhum contato encontrado.</td></tr>';
    return;
  }

  docs.forEach((snap, idx) => {
    const d  = snap.data();
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${idx + 1}</td>
      <td>${d.nome      || ""}</td>
      <td>${d.telefone  || ""}</td>
      <td>${d.email     || ""}</td>
      <td>${formatarData(d.dtContato)}</td>
      <td class="actions">
        <button class="btn-icon" title="Editar"  data-id="${snap.id}" data-acao="editar">✏️</button>
        <button class="btn-icon" title="Excluir" data-id="${snap.id}" data-acao="excluir">🗑️</button>
      </td>`;
    tbody.appendChild(tr);
  });
}

// ── Listener em tempo real ────────────────────────────────────────────────────
function escutarTodos() {
  if (unsubscribe) unsubscribe();
  const q = query(col, orderBy("nome"));
  unsubscribe = onSnapshot(q, snap => {
    renderizarLinhas(snap.docs);
  }, err => {
    console.error(err);
    exibirMensagem("Erro ao carregar contatos.", "err");
  });
}

// ── Formulário ────────────────────────────────────────────────────────────────
function mostrarFormulario() {
  editandoId = null;
  document.getElementById("inp-nome").value  = "";
  document.getElementById("inp-fone").value  = "";
  document.getElementById("inp-email").value = "";
  document.getElementById("inp-data").value  = "";
  const fs = document.getElementById("form-section");
  fs.style.display = "block";
  fs.querySelector("h2").textContent = "Novo Contato";
  document.getElementById("inp-nome").focus();
}

function cancelar() {
  editandoId = null;
  document.getElementById("form-section").style.display = "none";
}

async function salvar() {
  const nome      = document.getElementById("inp-nome").value.trim();
  const telefone  = document.getElementById("inp-fone").value.trim();
  const email     = document.getElementById("inp-email").value.trim();
  const dtContato = document.getElementById("inp-data").value;

  if (!nome) { exibirMensagem("O campo Nome é obrigatório.", "err"); return; }

  const dados = { nome, telefone, email, dtContato };

  try {
    if (editandoId) {
      await updateDoc(doc(db, "contatos", editandoId), dados);
      exibirMensagem("Contato atualizado com sucesso!");
    } else {
      await addDoc(col, dados);
      exibirMensagem("Contato salvo com sucesso!");
    }
    cancelar();
  } catch (e) {
    console.error(e);
    exibirMensagem("Erro ao salvar contato: " + e.message, "err");
  }
}

// ── Busca ─────────────────────────────────────────────────────────────────────
async function buscar() {
  const termo = document.getElementById("input-busca").value.trim();

  if (unsubscribe) { unsubscribe(); unsubscribe = null; }

  if (!termo) { escutarTodos(); return; }

  try {
    const q    = query(col, where("nome", ">=", termo), where("nome", "<=", termo + "\uf8ff"));
    const snap = await getDocs(q);
    renderizarLinhas(snap.docs);
  } catch (e) {
    console.error(e);
    exibirMensagem("Erro na busca: " + e.message, "err");
  }
}

// ── Editar ────────────────────────────────────────────────────────────────────
async function editar(id) {
  try {
    const snap  = await getDocs(query(col));
    const found = snap.docs.find(d => d.id === id);
    if (!found) return;
    const d = found.data();

    editandoId = id;
    document.getElementById("inp-nome").value  = d.nome      || "";
    document.getElementById("inp-fone").value  = d.telefone  || "";
    document.getElementById("inp-email").value = d.email     || "";
    document.getElementById("inp-data").value  = d.dtContato || "";

    const fs = document.getElementById("form-section");
    fs.style.display = "block";
    fs.querySelector("h2").textContent = "Editar Contato";
    document.getElementById("inp-nome").focus();
  } catch (e) {
    exibirMensagem("Erro ao carregar contato: " + e.message, "err");
  }
}

// ── Excluir ───────────────────────────────────────────────────────────────────
async function excluir(id) {
  if (!confirm("Deseja mesmo excluir este contato?")) return;
  try {
    await deleteDoc(doc(db, "contatos", id));
    exibirMensagem("Contato excluído.");
  } catch (e) {
    exibirMensagem("Erro ao excluir: " + e.message, "err");
  }
}

// ── Eventos ───────────────────────────────────────────────────────────────────
document.getElementById("btn-novo").addEventListener("click", mostrarFormulario);
document.getElementById("btn-buscar").addEventListener("click", buscar);
document.getElementById("btn-salvar").addEventListener("click", salvar);
document.getElementById("btn-cancelar").addEventListener("click", cancelar);

// Delegação de eventos para os botões da tabela
document.getElementById("tbody").addEventListener("click", e => {
  const btn = e.target.closest("button[data-acao]");
  if (!btn) return;
  const { id, acao } = btn.dataset;
  if (acao === "editar")  editar(id);
  if (acao === "excluir") excluir(id);
});

// ── Inicialização ─────────────────────────────────────────────────────────────
escutarTodos();
