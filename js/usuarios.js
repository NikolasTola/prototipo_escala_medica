// Redireciona se não for admin
const userRole = sessionStorage.getItem("role");
if (userRole !== "admin") {
    window.location.href = "index.html";
}

const container = document.getElementById("usuarios-container");
const novoUsuarioBtn = document.getElementById("novo-usuario-btn");
const addUserModal = document.getElementById("add-user-modal");
const senhaModal = document.getElementById("senha-modal");
const closeAddUserModal = document.getElementById("close-add-user-modal");
const cancelUser = document.getElementById("cancel-user");
const submitUser = document.getElementById("submit-user");
const copiarSenhaBtn = document.getElementById("copiar-senha-btn");
const fecharSenhaModal = document.getElementById("fechar-senha-modal");

let senhaGerada = "";

const deleteUserModal = document.getElementById("delete-user-modal");
const closeDeleteModal = document.getElementById("close-delete-modal");
const confirmDeleteUser = document.getElementById("confirm-delete-user");
const cancelDeleteUser = document.getElementById("cancel-delete-user");

let userLoginToDelete = null;

// Função para gerar senha aleatória
function gerarSenhaAleatoria() {
  const minusculas = "abcdefghijklmnopqrstuvwxyz";
  const maiusculas = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numeros = "0123456789";
  const caracteres = minusculas + maiusculas + numeros;

  let senha = "";
  
  // Garante pelo menos 1 de cada tipo
  senha += minusculas[Math.floor(Math.random() * minusculas.length)];
  senha += maiusculas[Math.floor(Math.random() * maiusculas.length)];
  senha += numeros[Math.floor(Math.random() * numeros.length)];

  // Completa com mais 5 caracteres aleatórios (total de 8)
  for (let i = 0; i < 5; i++) {
    senha += caracteres[Math.floor(Math.random() * caracteres.length)];
  }

  // Embaralha a senha
  return senha.split('').sort(() => Math.random() - 0.5).join('');
}

// Abre modal de confirmação de exclusão
function openDeleteModal(login) {
  userLoginToDelete = login;
  deleteUserModal.classList.remove("hidden");
}

function preencherUnidadesUsuario() {
  const select = document.getElementById("user-unidade");
  const unidades = JSON.parse(localStorage.getItem("unidades")) || [];

  select.innerHTML = "";

  unidades.forEach(u => {
    const option = document.createElement("option");
    option.value = u.nome;
    option.textContent = u.nome;
    select.appendChild(option);
  });
}


// Fecha modal de exclusão
function closeDeleteModalFunc() {
  deleteUserModal.classList.add("hidden");
  userLoginToDelete = null;
}

closeDeleteModal.onclick = closeDeleteModalFunc;
cancelDeleteUser.onclick = closeDeleteModalFunc;

// Confirma exclusão do usuário
confirmDeleteUser.onclick = () => {
  if (!userLoginToDelete) return;

  const users = JSON.parse(localStorage.getItem("users")) || [];
  const updatedUsers = users.filter(u => u.login !== userLoginToDelete);
  
  localStorage.setItem("users", JSON.stringify(updatedUsers));
  
  closeDeleteModalFunc();
  renderUsuarios();
};

// Renderiza lista de usuários
function renderUsuarios() {
  const users = JSON.parse(localStorage.getItem("users")) || [];
  container.innerHTML = "";

  if (users.length === 0) {
    container.innerHTML = "<p style='text-align: center;'>Nenhum usuário cadastrado.</p>";
    return;
  }

  users.forEach(user => {
    const card = document.createElement("div");
    card.className = "usuario-card";

    let deleteButtonHTML = "";

    // NÃO exibe botão se for admin
    if (user.role !== "admin") {
      deleteButtonHTML = `
        <button class="delete-user-btn" onclick="openDeleteModal('${user.login}')">
          Excluir usuário
        </button>
      `;
    }

    card.innerHTML = `
      ${deleteButtonHTML}

      <div>
        <p><strong>Nome:</strong></p>
        <p>${user.nome}</p>
      </div>

      <div>
        <p><strong>Unidade:</strong></p>
        <p>${user.unidade}</p>
      </div>

      <div>
        <p><strong>Login:</strong></p>
        <p>${user.login}</p>
      </div>
    `;


    container.appendChild(card);
  });
}

// Abre modal de novo usuário
novoUsuarioBtn.onclick = () => {
  addUserModal.classList.remove("hidden");
};

// Fecha modal de cadastro
function closeAddUserModalFunc() {
  addUserModal.classList.add("hidden");
  document.getElementById("novo-nome").value = "";
  document.getElementById("nova-unidade-user").value = "";
  document.getElementById("novo-login").value = "";
}

closeAddUserModal.onclick = closeAddUserModalFunc;
cancelUser.onclick = closeAddUserModalFunc;

// Cadastra novo usuário
submitUser.onclick = () => {
  const nome = document.getElementById("novo-nome").value.trim();
  const unidade = document.getElementById("nova-unidade-user").value.trim();
  const login = document.getElementById("novo-login").value.trim().toUpperCase();
  

  if (!nome || !unidade || !login) {
    alert("Preencha todos os campos.");
    return;
  }

  const users = JSON.parse(localStorage.getItem("users")) || [];

  // Verifica se login já existe
  if (users.find(u => u.login === login)) {
    alert("Este login já está em uso. Escolha outro.");
    return;
  }

  // Gera senha aleatória
  senhaGerada = gerarSenhaAleatoria();

  // Cria novo usuário
    const novoUsuario = {
    login: login,
    password: senhaGerada,
    role: "cliente",
    nome: nome,
    unidade: document.getElementById("user-unidade").value,
    primeiroAcesso: true
    };

  users.push(novoUsuario);
  localStorage.setItem("users", JSON.stringify(users));

  // Fecha modal de cadastro
  closeAddUserModalFunc();

  // Atualiza lista
  renderUsuarios();

  // Exibe modal de senha
  document.getElementById("senha-display").textContent = senhaGerada;
  senhaModal.classList.remove("hidden");
};

// Copiar senha para área de transferência
copiarSenhaBtn.onclick = () => {
  navigator.clipboard.writeText(senhaGerada).then(() => {
    copiarSenhaBtn.textContent = "Senha Copiada!";
    setTimeout(() => {
      copiarSenhaBtn.textContent = "Copiar Senha";
    }, 2000);
  }).catch(() => {
    alert("Erro ao copiar. Copie manualmente: " + senhaGerada);
  });
};

// Fecha modal de senha
fecharSenhaModal.onclick = () => {
  senhaModal.classList.add("hidden");
  senhaGerada = "";
};

// Renderiza ao carregar
renderUsuarios();
preencherUnidadesUsuario();