// ============================================================
// app.js  –  Ponto de entrada principal do JavaScript
// Aqui importamos e inicializamos todos os módulos do sistema.
// ============================================================

// Importa a função que inicializa tudo relacionado às pastas
// (criação, edição, upload de arquivos, modais, etc.)
import { initModalNovaPasta } from './modules/modalNovaPasta.js';

// Chama a função para colocar tudo em funcionamento assim
// que a página terminar de carregar
initModalNovaPasta();
