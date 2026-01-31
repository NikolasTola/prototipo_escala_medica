// Mostrar/ocultar senhas
const mostrarSenhasCheckbox = document.getElementById("mostrar-senhas");
const novaSenhaInput = document.getElementById("nova-senha");
const confirmarSenhaInput = document.getElementById("confirmar-senha");

mostrarSenhasCheckbox.addEventListener("change", function() {
  const tipo = this.checked ? "text" : "password";
  novaSenhaInput.type = tipo;
  confirmarSenhaInput.type = tipo;
});

// Validação de senha
function validarSenha(senha) {
  // Mínimo 6 caracteres
  if (senha.length < 6) {
    return "A senha deve ter no mínimo 6 caracteres.";
  }

  // Pelo menos 1 letra minúscula
  if (!/[a-z]/.test(senha)) {
    return "A senha deve conter pelo menos 1 letra minúscula.";
  }

  // Pelo menos 1 letra maiúscula
  if (!/[A-Z]/.test(senha)) {
    return "A senha deve conter pelo menos 1 letra MAIÚSCULA.";
  }

  // Pelo menos 1 número
  if (!/[0-9]/.test(senha)) {
    return "A senha deve conter pelo menos 1 número.";
  }

  return null; // Senha válida
}

function handleTrocarSenha(event) {
  event.preventDefault();

  const novaSenha = novaSenhaInput.value.trim();
  const confirmarSenha = confirmarSenhaInput.value.trim();
  const errorMessage = document.getElementById("error");

  // Limpa mensagem de erro
  errorMessage.textContent = "";

  // Valida se as senhas coincidem
  if (novaSenha !== confirmarSenha) {
    errorMessage.textContent = "As senhas não coincidem.";
    return;
  }

  // Valida formato da senha
  const erroValidacao = validarSenha(novaSenha);
  if (erroValidacao) {
    errorMessage.textContent = erroValidacao;
    return;
  }

  // Recupera o login do usuário da sessão
  const userLogin = sessionStorage.getItem("userLogin");
  if (!userLogin) {
    errorMessage.textContent = "Erro ao identificar usuário. Faça login novamente.";
    return;
  }

  // Atualiza a senha no localStorage
  const users = JSON.parse(localStorage.getItem("users"));
  const userIndex = users.findIndex(u => u.login === userLogin);

  if (userIndex !== -1) {
    users[userIndex].password = novaSenha;
    users[userIndex].primeiroAcesso = false;
    localStorage.setItem("users", JSON.stringify(users));

    // Redireciona para a página de vagas
    window.location.href = "vagas.html";
  } else {
    errorMessage.textContent = "Erro ao atualizar senha. Tente novamente.";
  }
}