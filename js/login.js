const defaultUsers  = [
  {
    login: "ADMIN",
    password: "Senhaforte@123",
    role: "admin",
    nome: "Administrador",
    unidade: "Matriz"
  },
  {
    login: "CLIENTE",
    password: "Senhaforte@123",
    role: "cliente",
    nome: "Cliente Teste",
    unidade: "Unidade Centro"
  }
];

// Inicializa usuários apenas no primeiro acesso
if (!localStorage.getItem("users")) {
  localStorage.setItem("users", JSON.stringify(defaultUsers));
}

// Sempre carregar do localStorage
const users = JSON.parse(localStorage.getItem("users"));

function handleLogin(event) {
  event.preventDefault();

  const loginInput = document
    .getElementById("login")
    .value
    .trim()
    .toUpperCase();

  const passwordInput = document
    .getElementById("password")
    .value
    .trim();

  const errorMessage = document.getElementById("error");

  const userFound = users.find(
    user =>
      user.login === loginInput &&
      user.password === passwordInput
  );

  if (userFound) {
    // Guarda a role e login na sessão
    sessionStorage.setItem("role", userFound.role);
    sessionStorage.setItem("userLogin", userFound.login);
    localStorage.setItem("userUnidade", userFound.unidade);

    // Verifica se é primeiro acesso
    if (userFound.primeiroAcesso) {
      window.location.href = "trocar-senha.html";
    } else {
      window.location.href = "vagas.html";
    }
  } else {
    errorMessage.textContent = "Login ou senha inválidos.";
  }
}
