// ============================================================
// modalNovaPasta.js  –  Módulo principal das pastas
//
// Responsabilidades deste arquivo:
//  - Abrir e fechar o modal de criação de nova pasta
//  - Validar e enviar os dados da nova pasta para o servidor
//  - Carregar as pastas salvas no banco ao abrir a página
//  - Abrir o modal de detalhes/upload ao clicar em uma pasta
//  - Editar as informações de uma pasta já existente
//  - Adicionar arquivos à pasta e permitir abri-los
// ============================================================
export function initModalNovaPasta() {

    // Lista em memória com todas as pastas carregadas/criadas nesta sessão.
    // Usamos ela para encontrar os dados de uma pasta pelo ID sem ir ao servidor.
    const pastas = [];

    // Guarda qual pasta está aberta no momento (ao clicar numa pasta).
    // Usada ao editar ou exibir as informações no modal de upload.
    let pastaSelecionada = null;

    // ──────────────────────────────────────────────────────────────
    // REFERÊNCIAS DO MODAL "NOVA PASTA" (formulário de criação)
    // ──────────────────────────────────────────────────────────────

    // Botão "+ NOVA PASTA" na topbar – abre o modal de criação
    const btnNovaPasta     = document.getElementById('btnNovaPasta');
    // O modal de criação de pasta (overlay escuro + caixa de formulário)
    const modalNovaPasta   = document.getElementById('modalNovaPasta');
    // Botão "CANCELAR" dentro do modal de criação
    const btnCancelarPasta = document.getElementById('btnCancelarPasta');

    // Abre o modal removendo a classe 'hidden'
    btnNovaPasta.addEventListener('click', () => modalNovaPasta.classList.remove('hidden'));
    // Fecha o modal adicionando a classe 'hidden' de volta
    btnCancelarPasta.addEventListener('click', () => modalNovaPasta.classList.add('hidden'));

    // Botão "CRIAR" – confirma a criação da pasta
    const btnCriarPasta    = document.getElementById('btnCriarPasta');
    // Campo de texto para o nome do funcionário (nome da pasta)
    const NomePasta        = document.getElementById('inputNomePasta');
    // Campo de texto para o CPF do funcionário
    const CpfFFuncionario  = document.getElementById('inputCpfFFuncionario');
    // Select para o cargo do funcionário
    const Cargo            = document.getElementById('selectCargo');
    // Select para o setor do funcionário
    const Setor            = document.getElementById('selectSetor');
    // Container onde os cards das pastas criadas serão exibidos na tela
    const listaPastas      = document.getElementById('listaPastas');

    // ──────────────────────────────────────────────────────────────
    // REFERÊNCIAS DO MODAL "UPLOAD / DETALHES DA PASTA"
    // (abre ao clicar em uma pasta existente)
    // ──────────────────────────────────────────────────────────────

    // O modal completo de detalhes e upload da pasta
    const modalUpload      = document.getElementById('modalUpload');
    // Spans no cabeçalho do modal que exibem as infos da pasta aberta
    const uploadInfoNome   = document.getElementById('uploadInfoNome');
    const uploadInfoCpf    = document.getElementById('uploadInfoCpf');
    const uploadInfoCargo  = document.getElementById('uploadInfoCargo');
    const uploadInfoSetor  = document.getElementById('uploadInfoSetor');
    // Botão azul "Editar" no cabeçalho do modal – mostra/esconde o form de edição
    const btnEditar        = document.getElementById('btnEditar');
    // Formulário de edição (nome, CPF, cargo, setor) – fica oculto até clicar em Editar
    const editFormUpload   = document.getElementById('editFormUpload');
    // Campos do formulário de edição
    const editNome         = document.getElementById('editNome');
    const editCpf          = document.getElementById('editCpf');
    const editCargo        = document.getElementById('editCargo');
    const editSetor        = document.getElementById('editSetor');
    // Botão "SALVAR" no formulário de edição
    const btnSalvarEdicao  = document.getElementById('btnSalvarEdicao');
    // Botão "CANCELAR" no formulário de edição
    const btnCancelarEdicao= document.getElementById('btnCancelarEdicao');
    // Área branca onde os arquivos enviados são listados
    const uploadArea       = document.getElementById('uploadArea');
    // Input de arquivo oculto – ativado pelo texto ou pelo botão Upload+
    const fileInput        = document.getElementById('fileInput');
    // Botão "Upload+" no rodapé do modal – abre o seletor de arquivos
    const btnUploadMais    = document.getElementById('btnUploadMais');
    // Botão "Sair" no rodapé do modal – fecha o modal
    const btnSair          = document.getElementById('btnSair');
    // Div onde os cards dos arquivos adicionados são inseridos
    const listaArquivos    = document.getElementById('listaArquivos');
    // Texto instrucional dentro da área de upload ("Clique em Upload+...")
    const uploadAreaTexto  = document.getElementById('uploadAreaTexto');

    // ──────────────────────────────────────────────────────────────
    // FUNÇÃO: abrirModalPasta
    // Preenche o cabeçalho do modal com os dados da pasta clicada
    // e exibe o modal de upload/detalhes
    // ──────────────────────────────────────────────────────────────
    function abrirModalPasta(dados) {
        // Salva a pasta atual para usar em edição e upload
        pastaSelecionada = dados;

        // Preenche os spans do cabeçalho com as informações da pasta
        uploadInfoNome.textContent  = 'Nome: '   + dados.nome;
        uploadInfoCpf.textContent   = 'CPF: '    + dados.cpf;
        uploadInfoCargo.textContent = 'Cargo: '  + dados.cargo;
        uploadInfoSetor.textContent = 'Setor: '  + dados.setor;

        // Garante que o formulário de edição começa fechado
        editFormUpload.classList.add('hidden');

        // Exibe o modal removendo a classe 'hidden'
        modalUpload.classList.remove('hidden');

        // Carrega os arquivos salvos no servidor para esta pasta
        carregarArquivos(dados.id);
    }

    function fecharModalUpload() {
        modalUpload.classList.add('hidden');
        listaArquivos.innerHTML = '';
        uploadAreaTexto.style.display = '';
        // Os arquivos continuam salvos no servidor; serão recarregados na próxima abertura
    }

    // ──────────────────────────────────────────────────────────────
    // BOTÃO EDITAR – Alterna a visibilidade do formulário de edição.
    // Se estiver oculto: preenche os campos com os dados atuais e exibe.
    // Se estiver visível: apenas esconde novamente.
    // ──────────────────────────────────────────────────────────────
    btnEditar.addEventListener('click', () => {
        if (editFormUpload.classList.contains('hidden')) {
            // Preenche os campos com os dados atuais da pasta selecionada
            editNome.value  = pastaSelecionada.nome;
            editCpf.value   = pastaSelecionada.cpf;
            editCargo.value = pastaSelecionada.cargo;
            editSetor.value = pastaSelecionada.setor;
            editFormUpload.classList.remove('hidden');
        } else {
            // Fecha o formulário de edição sem salvar
            editFormUpload.classList.add('hidden');
        }
    });

    // Cancela a edição e fecha o formulário sem fazer nenhuma alteração
    btnCancelarEdicao.addEventListener('click', () => editFormUpload.classList.add('hidden'));

    // ──────────────────────────────────────────────────────────────
    // BOTÃO SALVAR EDIÇÃO
    // Valida os campos, envia PUT para o servidor e atualiza
    // o card na lista e o cabeçalho do modal com os novos dados
    // ──────────────────────────────────────────────────────────────
    btnSalvarEdicao.addEventListener('click', () => {
        // Validação: nenhum campo pode estar vazio ou sem seleção
        if (editNome.value.trim() === '')  { alert('Preencha o nome');       return; }
        if (editCpf.value.trim() === '')   { alert('Preencha o CPF');        return; }
        if (editCargo.value === '__')      { alert('Selecione um cargo');     return; }
        if (editSetor.value === '__')      { alert('Selecione um setor');     return; }

        // Captura o ID da pasta que está sendo editada
        const id    = pastaSelecionada.id;
        const nome  = editNome.value.trim();
        const cpf   = editCpf.value.trim();
        const cargo = editCargo.value;
        const setor = editSetor.value;

        // Envia a requisição PUT para o servidor atualizar no banco de dados
        fetch('/pastas/' + id, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, cpf, cargo, setor })
        })
        .then(r => r.json())
        .then(() => {
            // Atualiza os dados no array local (sem precisar recarregar a página)
            const idx = pastas.findIndex(p => p.id == id);
            if (idx !== -1) {
                pastas[idx] = { ...pastas[idx], nome, cpf, cargo, setor };
            }
            // Atualiza a variável da pasta atualmente selecionada
            pastaSelecionada = { ...pastaSelecionada, nome, cpf, cargo, setor };

            // Atualiza o texto do card na lista de pastas na tela principal
            const pastaEl = listaPastas.querySelector(`[data-id="${id}"]`);
            if (pastaEl) pastaEl.textContent = nome + ' - ' + cpf + ' - ' + cargo + ' - ' + setor;

            // Atualiza os spans do cabeçalho do modal com os novos valores
            uploadInfoNome.textContent  = 'Nome: '  + nome;
            uploadInfoCpf.textContent   = 'CPF: '   + cpf;
            uploadInfoCargo.textContent = 'Cargo: ' + cargo;
            uploadInfoSetor.textContent = 'Setor: ' + setor;

            // Fecha o formulário de edição após salvar com sucesso
            editFormUpload.classList.add('hidden');
        })
        .catch(err => {
            console.error('Erro ao editar pasta:', err);
            alert('Erro ao salvar. Tente novamente.');
        });
    });

    // ──────────────────────────────────────────────────────────
    // FUNÇÃO: carregarArquivos
    // Busca no servidor todos os arquivos de uma pasta pelo ID
    // e renderiza-os na área de upload do modal.
    // ──────────────────────────────────────────────────────────
    function carregarArquivos(pastaId) {
        fetch('/pastas/' + pastaId + '/arquivos')
            .then(r => r.json())
            .then(arquivos => {
                arquivos.forEach(arq => {
                    // Monta a URL pública do arquivo a partir do nome salvo no disco
                    const url = '/uploads/' + arq.nome_arquivo;
                    renderizarCardArquivo(arq.id, arq.nome_original, url);
                });
            })
            .catch(err => console.error('Erro ao carregar arquivos:', err));
    }

    // ──────────────────────────────────────────────────────────
    // FUNÇÃO: renderizarCardArquivo
    // Cria e insere na tela o card visual de um arquivo.
    // Recebe: id do arquivo no banco, nome original e URL pública.
    // Botões: "Abrir ↗" (nova aba) e "✕" (excluir do servidor).
    // ──────────────────────────────────────────────────────────
    function renderizarCardArquivo(arquivoId, nomeOriginal, url) {
        // Esconde o texto instrucional pois já há ao menos um arquivo
        uploadAreaTexto.style.display = 'none';

        const item = document.createElement('div');
        item.classList.add('arquivo-item');
        item.dataset.arquivoId = arquivoId;

        // Emoji baseado na extensão do arquivo
        const icon = document.createElement('span');
        icon.classList.add('arquivo-icon');
        icon.textContent = getIcone(nomeOriginal);

        // Nome do arquivo
        const nomeEl = document.createElement('span');
        nomeEl.classList.add('arquivo-nome');
        nomeEl.textContent = nomeOriginal;

        // Botão "Abrir ↗" – abre o arquivo em nova aba
        const abrir = document.createElement('span');
        abrir.classList.add('arquivo-abrir');
        abrir.textContent = 'Abrir ↗';
        abrir.addEventListener('click', (e) => {
            e.stopPropagation();
            window.open(url, '_blank');
        });

        // Botão "✕" – exclui o arquivo do servidor e remove o card da tela
        const excluir = document.createElement('span');
        excluir.classList.add('arquivo-excluir');
        excluir.textContent = '✕';
        excluir.title = 'Excluir arquivo';
        excluir.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!confirm('Excluir "' + nomeOriginal + '"?')) return;
            fetch('/pastas/' + pastaSelecionada.id + '/arquivos/' + arquivoId, { method: 'DELETE' })
                .then(r => r.json())
                .then(() => {
                    item.remove();
                    // Se não houver mais arquivos, reexibe o texto instrucional
                    if (listaArquivos.children.length === 0)
                        uploadAreaTexto.style.display = '';
                })
                .catch(err => {
                    console.error('Erro ao excluir arquivo:', err);
                    alert('Não foi possível excluir o arquivo.');
                });
        });

        // Monta o card: ícone + nome + botão abrir + botão excluir
        item.appendChild(icon);
        item.appendChild(nomeEl);
        item.appendChild(abrir);
        item.appendChild(excluir);

        // Clicar em qualquer parte do card também abre o arquivo
        item.addEventListener('click', () => window.open(url, '_blank'));

        listaArquivos.appendChild(item);
    }

    // Botão Upload+ no rodapé – sempre abre o seletor de arquivos,
    // mesmo quando já existem arquivos na lista
    btnUploadMais.addEventListener('click', () => fileInput.click());

    // Clicar no texto instrucional da área vazia também abre o seletor
    uploadAreaTexto.addEventListener('click', () => fileInput.click());

    // EVENTO: seleção de arquivos
    // Disparado quando o usuário escolhe arquivos no seletor do SO.
    // Envia os arquivos para o servidor via FormData (multipart/form-data).
    // O servidor salva em disco e registra no banco de dados.
    fileInput.addEventListener('change', () => {
        const files = Array.from(fileInput.files);
        if (files.length === 0) return;

        // Monta o FormData com todos os arquivos selecionados
        const formData = new FormData();
        files.forEach(f => formData.append('arquivos', f));

        // Envia para o servidor – o browser define o Content-Type automaticamente
        fetch('/pastas/' + pastaSelecionada.id + '/arquivos', {
            method: 'POST',
            body: formData
        })
        .then(r => r.json())
        .then(inseridos => {
            // Para cada arquivo salvo, renderiza o card na lista
            inseridos.forEach(arq => {
                renderizarCardArquivo(arq.id, arq.nome_original, '/uploads/' + arq.nome_arquivo);
            });
        })
        .catch(err => {
            console.error('Erro ao fazer upload:', err);
            alert('Erro ao enviar arquivo. Tente novamente.');
        });

        // Limpa o input para permitir selecionar o mesmo arquivo novamente
        fileInput.value = '';
    });

    // ──────────────────────────────────────────────────────────────
    // FUNÇÃO: getIcone
    // Retorna um emoji adequado para cada tipo de arquivo,
    // baseado na extensão do nome do arquivo.
    // Se a extensão não for reconhecida, retorna 📎 (clipe genérico).
    // ──────────────────────────────────────────────────────────────
    function getIcone(nome) {
        const ext = nome.split('.').pop().toLowerCase(); // Pega a extensão em minúsculo
        const mapa = {
            pdf: '📄', doc: '📝', docx: '📝', xls: '📊', xlsx: '📊',
            ppt: '📋', pptx: '📋', jpg: '🖼️', jpeg: '🖼️', png: '🖼️',
            gif: '🖼️', mp4: '🎬', mp3: '🎵', zip: '🗜️', rar: '🗜️'
        };
        return mapa[ext] || '📎'; // Retorna o ícone correspondente ou clipe genérico
    }

    // Botão "Sair" fecha e limpa o modal
    btnSair.addEventListener('click', fecharModalUpload);

    // Clicar no fundo escuro (backdrop) fora da caixa do modal também fecha
    modalUpload.addEventListener('click', (e) => { if (e.target === modalUpload) fecharModalUpload(); });

    // ──────────────────────────────────────────────────────────────
    // BOTÃO CRIAR PASTA
    // Valida os campos, envia POST para o servidor criar a pasta
    // no banco de dados e adiciona o card na tela
    // ──────────────────────────────────────────────────────────────
    btnCriarPasta.addEventListener('click', () => {
        // Validação: todos os campos são obrigatórios
        if (NomePasta.value.trim() === '')      { alert('Preencha o nome da pasta');       return; }
        if (CpfFFuncionario.value.trim() === '') { alert('Preencha o CPF do funcionário'); return; }
        if (Cargo.value === '__')               { alert('Selecione um cargo');             return; }
        if (Setor.value === '__')               { alert('Selecione um setor');             return; }

        // Captura os valores dos campos
        const nome  = NomePasta.value.trim();
        const cpf   = CpfFFuncionario.value.trim();
        const cargo = Cargo.value;
        const setor = Setor.value;

        // Envia POST para o servidor salvar a nova pasta no banco SQLite
        fetch('/pastas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, cpf, cargo, setor })
        })
        .then(r => r.json())
        .then(data => {
            // Adiciona a nova pasta no array local com o ID gerado pelo banco
            pastas.push(data);

            // Cria e insere o card visual na lista de pastas da tela
            const novaPasta = criarCardPasta(data);
            listaPastas.appendChild(novaPasta);

            // Limpa os campos do formulário para uma próxima criação
            NomePasta.value = '';
            CpfFFuncionario.value = '';
            Cargo.value = '__';
            Setor.value = '__';

            // Fecha o modal de criação
            modalNovaPasta.classList.add('hidden');
        })
        .catch(err => {
            console.error('Erro ao criar pasta:', err);
            alert('Erro ao criar pasta. Tente novamente.');
        });
    });

    // ──────────────────────────────────────────────────────────────
    // FUNÇÃO: criarCardPasta
    // Recebe os dados de uma pasta e cria o elemento HTML (div.pasta)
    // que aparece na tela principal. Ao clicar nele, abre o modal
    // de detalhes/upload da pasta correta.
    // ──────────────────────────────────────────────────────────────
    function criarCardPasta(dados) {
        const el = document.createElement('div');
        // Texto exibido no card: nome, CPF, cargo e setor
        el.textContent = dados.nome + ' - ' + dados.cpf + ' - ' + dados.cargo + ' - ' + dados.setor;
        // Aplica o estilo visual do card
        el.classList.add('pasta');
        // Guarda o ID da pasta no atributo data-id para identificar qual abrir
        el.dataset.id = dados.id;

        el.addEventListener('click', () => {
            const id = el.dataset.id; // Pega o ID desta pasta específica
            const d  = pastas.find(p => p.id == id); // Busca os dados completos no array
            abrirModalPasta(d); // Abre o modal com os dados corretos
        });
        return el;
    }

    // ──────────────────────────────────────────────────────────────
    // FUNÇÃO: carregarPastas
    // Carregada uma única vez ao abrir a página.
    // Busca todas as pastas salvas no banco de dados via GET /pastas
    // e cria os cards na tela para cada uma delas.
    // ──────────────────────────────────────────────────────────────
    function carregarPastas() {
        fetch('/pastas')
            .then(r => r.json())
            .then(data => {
                data.forEach(pasta => {
                    pastas.push(pasta); // Adiciona no array local
                    listaPastas.appendChild(criarCardPasta(pasta)); // Cria o card na tela
                });
            })
            .catch(err => console.error('Erro ao carregar pastas:', err));
    }

    // Inicia o carregamento das pastas assim que o módulo é inicializado
    carregarPastas();
}