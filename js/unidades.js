// 🔐 Controle de acesso
const role = sessionStorage.getItem("role");
if (role !== "admin") {
  window.location.href = "vagas.html";
}

// 📦 Unidades padrão
const defaultUnidades = [
  { id: 1, nome: "Matriz", observacoes: "" },
  { id: 2, nome: "Unidade Centro", observacoes: "" }
];

// Inicializa localStorage
if (!localStorage.getItem("unidades")) {
  localStorage.setItem("unidades", JSON.stringify(defaultUnidades));
}

let unidades = JSON.parse(localStorage.getItem("unidades"));

// 🎨 Renderização
function renderUnidades() {
  const container = document.getElementById("unidades-container");
  container.innerHTML = "";

  unidades.forEach(unidade => {
    const card = document.createElement("div");
    card.className = "unidade-card";

    card.innerHTML = `
        <p><strong>Unidade:</strong> ${unidade.nome}</p>

        <p><strong>Observações:</strong></p>
        <p>${unidade.observacoes ? unidade.observacoes : "-"}</p>
    `;

    container.appendChild(card);
  });
}

// 🟢 Modal
const modal = document.getElementById("unidade-modal");
const addBtn = document.getElementById("add-unidade-btn");
const salvarBtn = document.getElementById("salvar-unidade");
const cancelarBtn = document.getElementById("cancelar-unidade");

addBtn.onclick = () => {
  document.getElementById("unidade-nome").value = "";
  document.getElementById("unidade-obs").value = "";
  modal.classList.remove("hidden");
};

cancelarBtn.onclick = () => {
  modal.classList.add("hidden");
};

// 💾 Salvar unidade
salvarBtn.onclick = () => {
  const nome = document.getElementById("unidade-nome").value.trim();
  const observacoes = document.getElementById("unidade-obs").value.trim();

  if (nome.length < 6) {
    alert("O nome da unidade deve ter pelo menos 6 caracteres.");
    return;
  }

  const novoId = unidades.length
    ? Math.max(...unidades.map(u => u.id)) + 1
    : 1;

  unidades.push({
    id: novoId,
    nome,
    observacoes
  });

  localStorage.setItem("unidades", JSON.stringify(unidades));
  modal.classList.add("hidden");
  renderUnidades();
};

// Inicialização
renderUnidades();
