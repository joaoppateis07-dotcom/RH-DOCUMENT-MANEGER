// Mensagens e UX do formulário de login
console.log('teste de console');
const form = document.getElementById('entrar');
const msg  = document.getElementById('msg');
const btn  = document.getElementById('loginBtn');

// Ajusta action do form para suportar MOUNT_PATH (sub-caminho, ex: /rh/login)
if (form) form.action = (window.__BASE || '') + '/login';

// Exibe mensagens conforme query string (falha ou sessão expirada)
const params = new URLSearchParams(window.location.search);
if (params.get('login') === 'failed') {
  msg.textContent = 'Usuário ou senha inválidos. Tente novamente.';
}
if (params.has('unauthorized')) {
  msg.textContent = 'Sessão expirada ou acesso negado. Faça login.';
}

// Evita duplo envio e dá feedback visual
form?.addEventListener('submit', () => {
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Entrando...';
  }
});
