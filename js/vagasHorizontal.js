// ============================================================
// vagasHorizontal.js
// Lógica da visualização horizontal de vagas
// ============================================================

const HORARIOS = [
  "00:00 as 01:00", "01:00 as 02:00", "02:00 as 03:00", "03:00 as 04:00",
  "04:00 as 05:00", "05:00 as 06:00", "06:00 as 07:00", "07:00 as 08:00",
  "08:00 as 09:00", "09:00 as 10:00", "10:00 as 11:00", "11:00 as 12:00",
  "12:00 as 13:00", "13:00 as 14:00", "14:00 as 15:00", "15:00 as 16:00",
  "16:00 as 17:00", "17:00 as 18:00", "18:00 as 19:00", "19:00 as 20:00",
  "20:00 as 21:00", "21:00 as 22:00", "22:00 as 23:00", "23:00 as 00:00"
];

const DIAS_SEMANA = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"];

const filtroUnidade = document.getElementById("filtro-unidade");
const filtroEspecialidade = document.getElementById("filtro-especialidade");
const tabela = document.getElementById("tabela-horizontal");
const setaEsquerda = document.getElementById("seta-esquerda");
const setaDireita = document.getElementById("seta-direita");
const loadingDiv = document.getElementById("loading-horizontal");

// Estado da visualização
let semanaAtualIndex = 0;
let semanas = [];
let semanasCarregadas = {};
let isLoading = false;

// ---------------------------------------------------------------
// Utilidades de data
// ---------------------------------------------------------------



function parseDateDDMMYYYY(str) {
  const parts = str.split("/");
  return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
}

function formatDateDDMMYYYY(date) {
  const d = date.getDate().toString().padStart(2, "0");
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

function getSemana(startDate) {
  const semana = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    semana.push(d);
  }
  return semana;
}

function getHoje() {
  const h = new Date();
  h.setHours(0, 0, 0, 0);
  return h;
}

// ---------------------------------------------------------------
// Monta todas as semanas possíveis baseado nas vagas filtradas
// ---------------------------------------------------------------
function montarSemanas() {
  const hoje = getHoje();
  const vagas = JSON.parse(localStorage.getItem("vagas")) || [];
  const unidade = filtroUnidade.value;
  const especialidade = filtroEspecialidade.value;

  const vagasFiltradas = vagas.filter(v =>
    v.unidade === unidade && v.especialidade === especialidade
  );

  let dataMinima = null;
  let dataMaxima = null;

  vagasFiltradas.forEach(v => {
    const d = parseDateDDMMYYYY(v.data);
    if (!dataMinima || d < dataMinima) dataMinima = new Date(d);
    if (!dataMaxima || d > dataMaxima) dataMaxima = new Date(d);
  });

  semanas = [];
  semanasCarregadas = {};

  // Calcula semanas antes de hoje
  let semanasAntes = 0;
  if (dataMinima && dataMinima < hoje) {
    semanasAntes = Math.ceil((hoje - dataMinima) / (7 * 24 * 60 * 60 * 1000));
  }

  // Calcula semanas depois de hoje
  let semanasDepois = 0;
  if (dataMaxima) {
    const fimSemanaAtual = new Date(hoje);
    fimSemanaAtual.setDate(fimSemanaAtual.getDate() + 6);
    if (dataMaxima > fimSemanaAtual) {
      semanasDepois = Math.ceil((dataMaxima - fimSemanaAtual) / (7 * 24 * 60 * 60 * 1000));
    }
  }

  const totalSemanas = semanasAntes + 1 + semanasDepois;
  semanaAtualIndex = semanasAntes;

  for (let i = 0; i < totalSemanas; i++) {
    const offset = i - semanasAntes;
    const startDate = new Date(hoje);
    startDate.setDate(startDate.getDate() + (offset * 7));
    semanas.push(getSemana(startDate));
  }

  // Marca apenas a semana atual como carregada
  semanasCarregadas[semanaAtualIndex] = true;
}

// ---------------------------------------------------------------
// Preenche os filtros dinamicamente
// ---------------------------------------------------------------
function preencherFiltros() {
  const vagas = JSON.parse(localStorage.getItem("vagas")) || [];

  const unidades = [...new Set(vagas.map(v => v.unidade))];
  const especialidades = [...new Set(vagas.map(v => v.especialidade))];

  filtroUnidade.innerHTML = "";
  unidades.forEach((u, i) => {
    const option = document.createElement("option");
    option.value = u;
    option.textContent = u;
    if (i === 0) option.selected = true;
    filtroUnidade.appendChild(option);
  });

  filtroEspecialidade.innerHTML = "";
  especialidades.forEach((e, i) => {
    const option = document.createElement("option");
    option.value = e;
    option.textContent = e;
    if (i === 0) option.selected = true;
    filtroEspecialidade.appendChild(option);
  });
}

// ---------------------------------------------------------------
// Renderiza a tabela para uma semana específica
// ---------------------------------------------------------------
function renderTabela(semanaIdx) {
  const vagas = JSON.parse(localStorage.getItem("vagas")) || [];
  const unidade = filtroUnidade.value;
  const especialidade = filtroEspecialidade.value;
  const semana = semanas[semanaIdx];

  const vagasFiltradas = vagas.filter(v =>
    v.unidade === unidade && v.especialidade === especialidade
  );

  // Monta cabeçalho
  const thead = tabela.querySelector("thead tr");
  thead.innerHTML = '<th class="col-horario">Horário</th>';

  semana.forEach(dia => {
    const th = document.createElement("th");
    const nrDia = dia.getDate().toString().padStart(2, "0");
    const nrMes = (dia.getMonth() + 1).toString().padStart(2, "0");
    const nrDiaSemana = DIAS_SEMANA[dia.getDay()];
    th.textContent = `${nrDiaSemana} ${nrDia}/${nrMes}`;
    thead.appendChild(th);
  });

  // Monta corpo
  const tbody = tabela.querySelector("tbody");
  tbody.innerHTML = "";

  HORARIOS.forEach(horario => {
    const tr = document.createElement("tr");

    const tdHorario = document.createElement("td");
    tdHorario.className = "col-horario";
    tdHorario.textContent = horario;
    tr.appendChild(tdHorario);

    semana.forEach(dia => {
        const td = document.createElement("td");
        const diaStr = formatDateDDMMYYYY(dia);

        const vagasDoDiaHorario = vagasFiltradas.filter(v =>
            v.data === diaStr && v.horario === horario
        );

        let valorTexto = "-";

        if (vagasDoDiaHorario.length > 0) {
            const naoPreenchidas = vagasDoDiaHorario.filter(v => !v.preenchida).length;
            valorTexto = naoPreenchidas.toFixed(1);
        }

        td.textContent = valorTexto;
        aplicarCorCelula(td, valorTexto);

        tr.appendChild(td);
    });


    tbody.appendChild(tr);
  });
}

// ---------------------------------------------------------------
// Atualiza estado das setas
// ---------------------------------------------------------------
function atualizarSetas() {
  setaEsquerda.disabled = (semanaAtualIndex <= 0);
  setaDireita.disabled = (semanaAtualIndex >= semanas.length - 1);
}

// ---------------------------------------------------------------
// Simula delay de carregamento
// ---------------------------------------------------------------
function simularCarregamento(callback) {
  isLoading = true;
  loadingDiv.classList.remove("hidden");
  tabela.style.opacity = "0.3";

  setTimeout(() => {
    isLoading = false;
    loadingDiv.classList.add("hidden");
    tabela.style.opacity = "1";
    callback();
  }, 1500);
}

// ---------------------------------------------------------------
// Navegação: seta esquerda
// ---------------------------------------------------------------
setaEsquerda.addEventListener("click", () => {
  if (isLoading || semanaAtualIndex <= 0) return;

  const targetIndex = semanaAtualIndex - 1;

  if (semanasCarregadas[targetIndex]) {
    semanaAtualIndex = targetIndex;
    renderTabela(semanaAtualIndex);
    atualizarSetas();
  } else {
    simularCarregamento(() => {
      semanasCarregadas[targetIndex] = true;
      semanaAtualIndex = targetIndex;
      renderTabela(semanaAtualIndex);
      atualizarSetas();
    });
  }
});

// ---------------------------------------------------------------
// Navegação: seta direita
// ---------------------------------------------------------------
setaDireita.addEventListener("click", () => {
  if (isLoading || semanaAtualIndex >= semanas.length - 1) return;

  const targetIndex = semanaAtualIndex + 1;

  if (semanasCarregadas[targetIndex]) {
    semanaAtualIndex = targetIndex;
    renderTabela(semanaAtualIndex);
    atualizarSetas();
  } else {
    simularCarregamento(() => {
      semanasCarregadas[targetIndex] = true;
      semanaAtualIndex = targetIndex;
      renderTabela(semanaAtualIndex);
      atualizarSetas();
    });
  }
});

// ---------------------------------------------------------------
// Filtros: ao mudar, reinicia a visualização
// ---------------------------------------------------------------
filtroUnidade.addEventListener("change", () => {
  inicializarHorizontal();
});

filtroEspecialidade.addEventListener("change", () => {
  inicializarHorizontal();
});

// ---------------------------------------------------------------
// Inicializa tudo (chamada quando entra na tab ou dados mudam)
// ---------------------------------------------------------------
function inicializarHorizontal() {
  // 🔐 Bloqueia acesso para cliente
  const role = sessionStorage.getItem("role");
  if (role !== "admin") return;

  // Preserva filtros selecionados
  const unidadeSelecionada = filtroUnidade.value;
  const especialidadeSelecionada = filtroEspecialidade.value;

  preencherFiltros();

  if (unidadeSelecionada) filtroUnidade.value = unidadeSelecionada;
  if (especialidadeSelecionada) filtroEspecialidade.value = especialidadeSelecionada;

  montarSemanas();

  // Caso não existam semanas
  if (!semanas.length) {
    tabela.querySelector("tbody").innerHTML =
      "<tr><td colspan='8'>Nenhuma vaga encontrada</td></tr>";
    atualizarSetas();
    return;
  }

  // Encontra a semana atual
  const hoje = getHoje();
  for (let i = 0; i < semanas.length; i++) {
    const inicio = semanas[i][0];
    const fim = semanas[i][6];
    if (hoje >= inicio && hoje <= fim) {
      semanaAtualIndex = i;
      break;
    }
  }

  semanasCarregadas[semanaAtualIndex] = true;

  renderTabela(semanaAtualIndex);
  atualizarSetas();
}
