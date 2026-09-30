// ============================================
// 1. ESTADO DA APLICAÇÃO
// ============================================
let itens = [];

// ============================================
// 2. REFERÊNCIAS DO DOM
// ============================================
const formulario = document.querySelector('form');
const inputNome = document.querySelector('[name="nome-item"]') || document.getElementById('nome-item');
const selectCategoria = document.querySelector('[name="categoria"]') || document.getElementById('categoria');
const selectEstado = document.querySelector('[name="estado"]') || document.getElementById('estado');
const selectDisponibilidade = document.querySelector('[name="disponibilidade"]') || document.getElementById('disponibilidade');
const inputResponsavel = document.querySelector('[name="responsavel"]') || document.getElementById('responsavel');
const textareaDescricao = document.querySelector('[name="descricao"]') || document.getElementById('descricao');
const contadorDescricao = document.querySelector('.contador') || document.getElementById('contador');

const areaMensagem = document.getElementById('mensagem');

const totalEl = document.getElementById('total');
const disponiveisEl = document.getElementById('disponiveis');
const reservadosEl = document.getElementById('reservados');
const doacoesEl = document.getElementById('doacoes');

const inputPesquisa = document.querySelector('input[placeholder*="Nome ou descrição"]');
const selectsFiltro = document.querySelectorAll('.pesquisa-filtros select, [class*="filtro"] select, select');
const filtroCategoria = selectsFiltro[0];
const filtroTipo = selectsFiltro[1];
const filtroSituacao = selectsFiltro[2];

const listaItens = document.querySelector('.itens-cadastrados') || document.getElementById('lista-itens') || document.querySelector('[class*="itens"]');
const quantidadeResultados = document.querySelector('[class*="resultado"]');

const btnCarregarExemplo = document.querySelector('button:nth-of-type(2)');
const btnApagarTudo = document.querySelector('button:nth-of-type(3)');

// ============================================
// 3. LOCAL STORAGE
// ============================================
function carregarItens() {
  const dados = localStorage.getItem('feira-itens');
  itens = dados ? JSON.parse(dados) : [];
}

function salvarItens() {
  localStorage.setItem('feira-itens', JSON.stringify(itens));
}

// ============================================
// 4. CADASTRO E VALIDAÇÃO
// ============================================
function lerDadosFormulario() {
  return {
    nome: inputNome?.value.trim() || '',
    categoria: selectCategoria?.value || '',
    estado: selectEstado?.value || '',
    disponibilidade: selectDisponibilidade?.value || '',
    responsavel: inputResponsavel?.value.trim() || '',
    descricao: textareaDescricao?.value.trim() || ''
  };
}

function validarDados(dados) {
  if (!dados.nome) {
    return { valido: false, mensagem: 'O nome do item é obrigatório.' };
  }
  if (!dados.categoria) {
    return { valido: false, mensagem: 'Selecione uma categoria.' };
  }
  if (!dados.disponibilidade) {
    return { valido: false, mensagem: 'Selecione o tipo de disponibilidade.' };
  }
  if (dados.descricao.length > 180) {
    return { valido: false, mensagem: 'A descrição deve ter no máximo 180 caracteres.' };
  }
  return { valido: true, mensagem: '' };
}

function criarItem(dados) {
  return {
    id: Date.now().toString(36) + Math.random().toString(36).substring(2, 8),
    nome: dados.nome,
    categoria: dados.categoria,
    estado: dados.estado,
    disponibilidade: dados.disponibilidade,
    responsavel: dados.responsavel,
    descricao: dados.descricao,
    status: 'disponivel',
    criadoEm: new Date().toISOString()
  };
}

function normalizarTexto(texto) {
  return texto.trim().toLowerCase().replace(/\s+/g, ' ');
}

function itemJaExiste(novoItem) {
  return itens.some(item =>
    normalizarTexto(item.nome) === normalizarTexto(novoItem.nome) &&
    normalizarTexto(item.categoria) === normalizarTexto(novoItem.categoria) &&
    normalizarTexto(item.descricao || '') === normalizarTexto(novoItem.descricao || '') &&
    item.disponibilidade === novoItem.disponibilidade
  );
}

function adicionarItem(item) {
  itens.push(item);
  salvarItens();
}

function limparFormulario() {
  if (formulario) formulario.reset();
  if (contadorDescricao) contadorDescricao.textContent = '0/180';
}

function mostrarMensagem(texto, tipo = 'sucesso') {
  if (!areaMensagem) {
    alert(texto);
    return;
  }
  areaMensagem.textContent = texto;
  areaMensagem.className = tipo;
  areaMensagem.style.display = 'block';

  setTimeout(() => {
    areaMensagem.style.display = 'none';
  }, 3500);
}

// ============================================
// 5. RENDERIZAÇÃO
// ============================================
function renderizarItens(lista) {
  if (!listaItens) return;

  listaItens.innerHTML = '';

  if (lista.length === 0) {
    listaItens.innerHTML = '<p style="padding: 20px; color: #666;">Nenhum item encontrado.</p>';
    if (quantidadeResultados) quantidadeResultados.textContent = '0 resultado(s)';
    return;
  }

  lista.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card-item';
    card.dataset.id = item.id;

    card.innerHTML = `
      <h3>${item.nome}</h3>
      <p><strong>Categoria:</strong> ${item.categoria}</p>
      <p><strong>Estado:</strong> ${item.estado || '-'}</p>
      <p><strong>Tipo:</strong> ${item.disponibilidade}</p>
      <p><strong>Responsável:</strong> ${item.responsavel || '-'}</p>
      <p><strong>Status:</strong> <span class="status ${item.status}">${item.status}</span></p>
      <p>${item.descricao || ''}</p>
      <div class="acoes">
        ${item.status === 'disponivel'
          ? `<button class="btn-reservar" data-id="${item.id}">Reservar</button>`
          : `<button class="btn-disponibilizar" data-id="${item.id}">Disponibilizar</button>`
        }
        <button class="btn-excluir" data-id="${item.id}">Excluir</button>
      </div>
    `;

    listaItens.appendChild(card);
  });

  if (quantidadeResultados) {
    quantidadeResultados.textContent = `${lista.length} resultado(s)`;
  }
}

function atualizarResumo() {
  const total = itens.length;
  const disponiveis = itens.filter(i => i.status === 'disponivel').length;
  const reservados = itens.filter(i => i.status === 'reservado').length;
  const doacoes = itens.filter(i => {
    const disp = (i.disponibilidade || '').toLowerCase();
    return disp.includes('doação') || disp.includes('doacao');
  }).length;

  if (totalEl) totalEl.textContent = total;
  if (disponiveisEl) disponiveisEl.textContent = disponiveis;
  if (reservadosEl) reservadosEl.textContent = reservados;
  if (doacoesEl) doacoesEl.textContent = doacoes;
}

// ============================================
// 6. PESQUISA E FILTROS
// ============================================
function aplicarFiltros() {
  const texto = (inputPesquisa?.value || '').trim().toLowerCase();
  const cat = filtroCategoria?.value || 'Todas';
  const tipo = filtroTipo?.value || 'Todos';
  const situacao = filtroSituacao?.value || 'Todos';

  let filtrados = [...itens];

  if (texto) {
    filtrados = filtrados.filter(item =>
      item.nome.toLowerCase().includes(texto) ||
      (item.descricao && item.descricao.toLowerCase().includes(texto))
    );
  }

  if (cat && cat !== 'Todas') {
    filtrados = filtrados.filter(item => item.categoria === cat);
  }

  if (tipo && tipo !== 'Todos') {
    filtrados = filtrados.filter(item => item.disponibilidade === tipo);
  }

  if (situacao && situacao !== 'Todos') {
    const statusMap = {
      'Disponíveis': 'disponivel',
      'Reservados': 'reservado'
    };
    const statusFiltro = statusMap[situacao] || situacao.toLowerCase();
    filtrados = filtrados.filter(item => item.status === statusFiltro);
  }

  renderizarItens(filtrados);
}

// ============================================
// 7. INTERAÇÕES
// ============================================
function reservarItem(id) {
  const item = itens.find(i => i.id === id);
  if (item) {
    item.status = 'reservado';
    salvarItens();
    aplicarFiltros();
    atualizarResumo();
    mostrarMensagem('Item reservado com sucesso!');
  }
}

function disponibilizarItem(id) {
  const item = itens.find(i => i.id === id);
  if (item) {
    item.status = 'disponivel';
    salvarItens();
    aplicarFiltros();
    atualizarResumo();
    mostrarMensagem('Item disponibilizado novamente!');
  }
}

function excluirItem(id) {
  if (!confirm('Tem certeza que deseja excluir este item?')) return;

  itens = itens.filter(i => i.id !== id);
  salvarItens();
  aplicarFiltros();
  atualizarResumo();
  mostrarMensagem('Item excluído.', 'erro');
}

// ============================================
// 8. EVENTOS
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  carregarItens();
  renderizarItens(itens);
  atualizarResumo();

  // Cadastro
  if (formulario) {
    formulario.addEventListener('submit', (e) => {
      e.preventDefault();

      const dados = lerDadosFormulario();
      const validacao = validarDados(dados);

      if (!validacao.valido) {
        mostrarMensagem(validacao.mensagem, 'erro');
        return;
      }

      const novoItem = criarItem(dados);

      if (itemJaExiste(novoItem)) {
        mostrarMensagem('Já existe um item idêntico cadastrado.', 'erro');
        return;
      }

      adicionarItem(novoItem);
      limparFormulario();
      aplicarFiltros();
      atualizarResumo();
      mostrarMensagem('Item cadastrado com sucesso!');
    });
  }

  // Contador de caracteres
  if (textareaDescricao) {
    textareaDescricao.addEventListener('input', () => {
      const qtd = textareaDescricao.value.length;
      if (contadorDescricao) {
        contadorDescricao.textContent = `${qtd}/180`;
      }
    });
  }

  // Pesquisa em tempo real
  if (inputPesquisa) {
    inputPesquisa.addEventListener('input', aplicarFiltros);
  }

  // Filtros
  if (filtroCategoria) filtroCategoria.addEventListener('change', aplicarFiltros);
  if (filtroTipo) filtroTipo.addEventListener('change', aplicarFiltros);
  if (filtroSituacao) filtroSituacao.addEventListener('change', aplicarFiltros);

  // Clique nos cards (delegação de eventos)
  if (listaItens) {
    listaItens.addEventListener('click', (e) => {
      const id = e.target.dataset.id;
      if (!id) return;

      if (e.target.classList.contains('btn-reservar')) {
        reservarItem(id);
      }
      if (e.target.classList.contains('btn-disponibilizar')) {
        disponibilizarItem(id);
      }
      if (e.target.classList.contains('btn-excluir')) {
        excluirItem(id);
      }
    });
  }

  // Botão Apagar tudo
  if (btnApagarTudo) {
    btnApagarTudo.addEventListener('click', () => {
      if (confirm('Apagar TODOS os itens? Essa ação não pode ser desfeita.')) {
        itens = [];
        salvarItens();
        aplicarFiltros();
        atualizarResumo();
        mostrarMensagem('Todos os itens foram apagados.', 'erro');
      }
    });
  }

  // Botão Carregar exemplo
  if (btnCarregarExemplo) {
    btnCarregarExemplo.addEventListener('click', () => {
      const exemplos = [
        {
          id: Date.now().toString(36) + 'a',
          nome: 'iPhone 12',
          categoria: 'Celulares',
          estado: 'Bom',
          disponibilidade: 'Venda',
          responsavel: 'Pedro',
          descricao: 'Celular em ótimo estado, com capa e película.',
          status: 'disponivel',
          criadoEm: new Date().toISOString()
        },
        {
          id: Date.now().toString(36) + 'b',
          nome: 'Livro Clean Code',
          categoria: 'Livros',
          estado: 'Ótimo',
          disponibilidade: 'Doação',
          responsavel: 'Ana',
          descricao: 'Livro de programação em português.',
          status: 'disponivel',
          criadoEm: new Date().toISOString()
        }
      ];

      exemplos.forEach(ex => {
        if (!itemJaExiste(ex)) {
          itens.push(ex);
        }
      });

      salvarItens();
      aplicarFiltros();
      atualizarResumo();
      mostrarMensagem('Exemplos carregados!');
    });
  }
});

// Evento de teclado (Escape limpa a pesquisa)
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && inputPesquisa) {
    inputPesquisa.value = '';
    aplicarFiltros();
  }
});