// ============================================================
// APP: ponto de entrada
// ============================================================
import { login, logout, aoMudarSessao } from './auth/auth.js';
import { inicializarTema, ativarSincronizacaoDeTema } from './ui/theme.js';
import { inicializarDashboard } from './ui/dashboard.js';
import { inicializarContas } from './ui/contas.js';
import { inicializarReceitas } from './ui/receitas.js';
import { inicializarInvestimentos } from './ui/investimentos.js';
import { inicializarMetas } from './ui/metas.js';
import { inicializarConfiguracoes } from './ui/configuracoes.js';
import { registrarVista, inicializarNavegacao } from './ui/router.js';

const telaLogin = document.getElementById('tela-login');
const telaApp = document.getElementById('tela-app');
const formLogin = document.getElementById('form-login');
const alertaLogin = document.getElementById('alerta-login');
const botaoEntrar = document.getElementById('botao-entrar');
const botaoEntrarTexto = document.getElementById('botao-entrar-texto');
const botaoSair = document.getElementById('botao-sair');

inicializarTema();

let appJaInicializado = false;

registrarVista('dashboard', document.getElementById('vista-dashboard'), () => inicializarDashboard());
registrarVista('contas', document.getElementById('vista-contas'), () => inicializarContas());
registrarVista('receitas', document.getElementById('vista-receitas'), () => inicializarReceitas());
registrarVista('investimentos', document.getElementById('vista-investimentos'), () => inicializarInvestimentos());
registrarVista('metas', document.getElementById('vista-metas'), () => inicializarMetas());
registrarVista('configuracoes', document.getElementById('vista-configuracoes'), () => inicializarConfiguracoes());

// Alterna a tela visível conforme o estado de autenticação.
aoMudarSessao((sessao) => {
  if (sessao) {
    telaLogin.classList.add('oculto');
    telaApp.classList.remove('oculto');
    if (!appJaInicializado) {
      appJaInicializado = true;
      inicializarNavegacao('dashboard');
      ativarSincronizacaoDeTema();
    }
  } else {
    telaApp.classList.add('oculto');
    telaLogin.classList.remove('oculto');
    appJaInicializado = false;
  }
});

formLogin.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  esconderAlerta();

  const email = document.getElementById('input-email').value;
  const senha = document.getElementById('input-senha').value;

  definirCarregando(true);
  const resultado = await login(email, senha);
  definirCarregando(false);

  if (!resultado.sucesso) {
    mostrarAlerta(resultado.erro);
  }
  // Sucesso: aoMudarSessao() já cuida da troca de tela.
});

botaoSair?.addEventListener('click', () => logout());

function definirCarregando(carregando) {
  botaoEntrar.disabled = carregando;
  botaoEntrarTexto.textContent = carregando ? 'Entrando…' : 'Entrar';
}

function mostrarAlerta(mensagem) {
  alertaLogin.textContent = mensagem;
  alertaLogin.classList.remove('oculto');
}

function esconderAlerta() {
  alertaLogin.classList.add('oculto');
  alertaLogin.textContent = '';
}
