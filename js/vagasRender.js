const container = document.getElementById("vagas-container");
const modal = document.getElementById("modal");
const confirmDeleteBtn = document.getElementById("confirm-delete");
const cancelDeleteBtn = document.getElementById("cancel-delete");

const addModal = document.getElementById("add-modal");
const userRole = sessionStorage.getItem("role");
const addBtn = document.getElementById("add-vaga-btn");

const closeAddModal = document.getElementById("close-add-modal");
const cancelVaga = document.getElementById("cancel-vaga");
const submitVaga = document.getElementById("submit-vaga");
const userUnidade = localStorage.getItem("userUnidade");

const filtroListaUnidade = document.getElementById("filtro-lista-unidade");
const filtroListaEspecialidade = document.getElementById("filtro-lista-especialidade");
const filtroListaCriticidade = document.getElementById("filtro-lista-criticidade");


let cardIdToDelete = null;

// Lista de horários para o modal de nova vaga
const HORARIOS_MODAL = [
  "00:00 as 01:00", "01:00 as 02:00", "02:00 as 03:00", "03:00 as 04:00",
  "04:00 as 05:00", "05:00 as 06:00", "06:00 as 07:00", "07:00 as 08:00",
  "08:00 as 09:00", "09:00 as 10:00", "10:00 as 11:00", "11:00 as 12:00",
  "12:00 as 13:00", "13:00 as 14:00", "14:00 as 15:00", "15:00 as 16:00",
  "16:00 as 17:00", "17:00 as 18:00", "18:00 as 19:00", "19:00 as 20:00",
  "20:00 as 21:00", "21:00 as 22:00", "22:00 as 23:00", "23:00 as 00:00"
];

const defaultVagas = [
  {
    card_id: 1,
    especialidade: "Desenvolvedor Front-end",
    unidade: "Unidade Centro",
    criticidade: "Alta",
    data: "31/01/2026",
    horario: "08:00 as 09:00",
    preenchida: false
  },
  {
    card_id: 2,
    especialidade: "Desenvolvedor Front-end",
    unidade: "Unidade Centro",
    criticidade: "Alta",
    data: "31/01/2026",
    horario: "08:00 as 09:00",
    preenchida: false
  },
  {
    card_id: 3,
    especialidade: "Desenvolvedor Front-end",
    unidade: "Unidade Centro",
    criticidade: "Média",
    data: "01/02/2026",
    horario: "10:00 as 11:00",
    preenchida: false
  },
  {
    card_id: 4,
    especialidade: "Analista de Dados",
    unidade: "Unidade Sul",
    criticidade: "Média",
    data: "02/02/2026",
    horario: "14:00 as 15:00",
    preenchida: false
  },
  {
    card_id: 5,
    especialidade: "Analista de Dados",
    unidade: "Unidade Sul",
    criticidade: "Média",
    data: "02/02/2026",
    horario: "14:00 as 15:00",
    preenchida: true
  }
];

function preencherDropdownUnidadesVaga() {
  const select = document.getElementById("nova-unidade");
  const unidades = JSON.parse(localStorage.getItem("unidades")) || [];
  const role = sessionStorage.getItem("role");
  const unidadeUsuario = sessionStorage.getItem("unidade");

  select.innerHTML = "";

  // ADMIN → lista todas
  if (role === "admin") {
    unidades.forEach(u => {
      const option = document.createElement("option");
      option.value = u.nome;
      option.textContent = u.nome;
      select.appendChild(option);
    });
  } 
  // CLIENTE → unidade fixa
  else {
    const option = document.createElement("option");
    option.value = unidadeUsuario;
    option.textContent = unidadeUsuario;
    select.appendChild(option);

    select.disabled = true;
  }
}


// Inicializa vagas apenas no primeiro acesso
if (!localStorage.getItem("vagas")) {
  localStorage.setItem("vagas", JSON.stringify(defaultVagas));
}

// Sempre carregar do localStorage
let vagas = JSON.parse(localStorage.getItem("vagas"));

// Preenche o dropdown de horários no modal
function preencherDropdownHorarios() {
  const select = document.getElementById("novo-horario");
  select.innerHTML = "";
  HORARIOS_MODAL.forEach(h => {
    const option = document.createElement("option");
    option.value = h;
    option.textContent = h;
    select.appendChild(option);
  });
}

preencherDropdownHorarios();

document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const tab = btn.dataset.tab;

    if (tab === "horizontal") {
      inicializarHorizontal();
    }
  });
});


// Abre modal de nova vaga
addBtn.onclick = () => {
  const unidadeInput = document.getElementById("nova-unidade");

  if (userRole !== "admin") {
    unidadeInput.value = userUnidade;
    unidadeInput.disabled = true;
  } else {
    unidadeInput.disabled = false;
    unidadeInput.value = "";
  }
  preencherDropdownUnidadesVaga();
  addModal.classList.remove("hidden");
};

function preencherFiltrosLista() {
  const unidades = [...new Set(vagas.map(v => v.unidade))];
  const especialidades = [...new Set(vagas.map(v => v.especialidade))];
  const criticidades = [...new Set(vagas.map(v => v.criticidade))];

  // Limpa
  filtroListaUnidade.innerHTML = `<option value="">Todas</option>`;
  filtroListaEspecialidade.innerHTML = `<option value="">Todas</option>`;
  filtroListaCriticidade.innerHTML = `<option value="">Todas</option>`;

  unidades.forEach(u => {
    const opt = document.createElement("option");
    opt.value = u;
    opt.textContent = u;
    filtroListaUnidade.appendChild(opt);
  });

  especialidades.forEach(e => {
    const opt = document.createElement("option");
    opt.value = e;
    opt.textContent = e;
    filtroListaEspecialidade.appendChild(opt);
  });

  criticidades.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    filtroListaCriticidade.appendChild(opt);
  });

  // Cliente → unidade travada
  if (userRole !== "admin") {
    filtroListaUnidade.value = userUnidade;
    filtroListaUnidade.disabled = true;
  }
}


function closeAddVagaModal() {
  addModal.classList.add("hidden");
}

closeAddModal.onclick = closeAddVagaModal;
cancelVaga.onclick = closeAddVagaModal;

submitVaga.onclick = () => {
  const especialidade = document.getElementById("nova-especialidade").value.trim();
  const unidade =
  userRole === "admin"
    ? document.getElementById("nova-unidade").value.trim()
    : localStorage.getItem("userUnidade");

  const criticidade = document.getElementById("nova-criticidade").value.trim();
  const data = document.getElementById("nova-data").value;
  const horario = document.getElementById("novo-horario").value;

  if (!especialidade || !unidade || !criticidade || !data || !horario) {
    alert("Preencha todos os campos.");
    return;
  }

  const novoId = vagas.length
    ? Math.max(...vagas.map(v => v.card_id)) + 1
    : 1;

  vagas.push({
    card_id: novoId,
    especialidade,
    unidade,
    criticidade,
    data: data.split("-").reverse().join("/"),
    horario,
    preenchida: false
  });

  localStorage.setItem("vagas", JSON.stringify(vagas));
  closeAddVagaModal();
  preencherFiltrosLista();
  renderVagas();

  inicializarHorizontal();
};

// Renderiza lista de vagas (tab Lista)
function renderVagas() {
  container.innerHTML = "";

  const unidadeFiltro = filtroListaUnidade.value;
  const especialidadeFiltro = filtroListaEspecialidade.value;
  const criticidadeFiltro = filtroListaCriticidade.value;

  vagas
    .filter(vaga => {
      // Regra de unidade por role
      if (userRole !== "admin" && vaga.unidade !== userUnidade) {
        return false;
      }

      if (unidadeFiltro && vaga.unidade !== unidadeFiltro) return false;
      if (especialidadeFiltro && vaga.especialidade !== especialidadeFiltro) return false;
      if (criticidadeFiltro && vaga.criticidade !== criticidadeFiltro) return false;

      return true;
    })
    .forEach(vaga => {


    const card = document.createElement("div");
    card.className = "vaga-card";

    if (vaga.preenchida) {
      card.classList.add("vaga-preenchida");
    }


    card.innerHTML = `
      ${userRole === "admin" ? `
        <button class="delete-btn" onclick="openModal(${vaga.card_id})">X</button>
      ` : ""}

      ${vaga.preenchida ? `
        <div class="vaga-badge-preenchida">Vaga Preenchida</div>
      ` : ""}

      <p><strong>Especialidade:</strong> ${vaga.especialidade}</p>
      <p><strong>Unidade:</strong> ${vaga.unidade}</p>
      <p><strong>Criticidade:</strong> ${vaga.criticidade}</p>
      <p><strong>Data:</strong> ${vaga.data}</p>
      <p><strong>Horário:</strong> ${vaga.horario}</p>

      ${userRole === "admin" ? `
        <button 
          class="action-btn ${vaga.preenchida ? "btn-liberar" : "btn-preencher"}"
          onclick="toggleVaga(${vaga.card_id})"
        >
          ${vaga.preenchida ? "Liberar vaga" : "Preencher vaga"}
        </button>
      ` : ""}

    `;

    container.appendChild(card);
  });
}

[filtroListaUnidade, filtroListaEspecialidade, filtroListaCriticidade]
  .forEach(filtro => {
    filtro.addEventListener("change", renderVagas);
  });


function toggleVaga(cardId) {
  if (userRole !== "admin") return;

  const vaga = vagas.find(v => v.card_id === cardId);
  if (vaga) {
    vaga.preenchida = !vaga.preenchida;
    localStorage.setItem("vagas", JSON.stringify(vagas));
    renderVagas();

    // Atualiza a tabela horizontal
    if (typeof inicializarHorizontal === "function") {
      inicializarHorizontal();
    }
  }
}

function aplicarCorCelula(td, valor) {
  if (valor === "0.0") {
    td.style.backgroundColor = "#8ce084";
  } else if (valor === "-") {
    td.style.backgroundColor = "#bbbdbb";
  } else {
    td.style.backgroundColor = "#f26d6d";
  }
}

function openModal(cardId) {
  cardIdToDelete = cardId;
  modal.classList.remove("hidden");
}

confirmDeleteBtn.onclick = () => {
  vagas = vagas.filter(v => v.card_id !== cardIdToDelete);
  localStorage.setItem("vagas", JSON.stringify(vagas));
  modal.classList.add("hidden");
  preencherFiltrosLista();
  renderVagas();

  // Atualiza a tabela horizontal
  if (typeof inicializarHorizontal === "function") {
    inicializarHorizontal();
  }
};

cancelDeleteBtn.onclick = () => {
  modal.classList.add("hidden");
  cardIdToDelete = null;
};

// Sistema de tabs
const tabBtns = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");

tabBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    tabBtns.forEach(b => b.classList.remove("active"));
    tabContents.forEach(c => c.classList.add("hidden"));

    btn.classList.add("active");
    const tab = btn.dataset.tab;
    document.getElementById("tab-" + tab).classList.remove("hidden");

    // Quando entrar na tab horizontal, inicializa
    if (tab === "horizontal" && typeof inicializarHorizontal === "function") {
      inicializarHorizontal();
    }
  });
});

preencherFiltrosLista();
renderVagas();