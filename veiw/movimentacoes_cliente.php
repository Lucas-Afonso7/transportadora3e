<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>Movimentações</title>
  <link rel="icon" href="../image/logo 3e.jpg" type="image/png">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet">

  <style>
    body { 
      background: linear-gradient(135deg, #f8f9fa 0%, #ffe8cc 100%); 
    }
  </style>
</head>

<body class="bg-light">

  <?php include '../controll/menu.php'; ?>

  <div class="container py-5">

    <h2 class="fw-bold mb-4">Movimentações</h2>

    <div class="card shadow-sm">
      <div class="card-body">

        <div class="d-flex align-items-center gap-2 mb-3">
          <div class="d-flex align-items-center gap-3">

            <div class="d-flex align-items-center gap-1">
              <h6 class="mb-0 fw-bold">Ordenar por:</h6>
              <select class="form-select form-select-sm w-auto" id="ordenacao">
                <option value="recentes">Mais recente</option>
                <option value="antigos">Mais antigo</option>
                <option value="pendentes">Pendentes</option>
                <option value="vencidos">Vencidos</option>
              </select>
            </div>

            <div class="d-flex align-items-center gap-2 flex-wrap">
              <h6 class="mb-0 fw-bold">Filtrar por data:</h6>
              <div class="d-flex align-items-center gap-1">
                <label class="mb-0 text-muted small">De:</label>
                <input type="date" id="data-inicio" class="form-control form-control-sm" style="max-width: 160px;">
              </div>
              <div class="d-flex align-items-center gap-1">
                <label class="mb-0 text-muted small">Até:</label>
                <input type="date" id="data-fim" class="form-control form-control-sm" style="max-width: 160px;">
              </div>
              <button class="btn btn-primary btn-sm" id="btn-filtrar">Filtrar</button>
              <button class="btn btn-outline-secondary btn-sm" id="btn-limpar-filtro">Limpar</button>
            </div>

          </div>
        </div>

        <div class="table-responsive">
          <table class="table table-striped align-middle">
            <thead>
              <tr>
                <th></th>
                <th>Data</th>
                <th>Descrição</th>
                <th>Ação</th>
                <th>Valor</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody id="tabela-movimentos">
              <tr data-id="1" data-valor="3450" data-desc="Frete - BH/Brasília" data-data="15/01/2026">
                <td><input type="checkbox" class="check-item" data-valor="3450" data-id="1"></td>
                <td>15/01/2026</td>
                <td>Frete - BH/Brasília</td>
                <td>
                  <button class="btn btn-danger btn-sm btn-pagar-item" data-id="1">Pagar</button>
                </td>
                <td class="fw-bold">R$ 3.450,00</td>
                <td><span class="badge bg-warning text-dark">Pendente</span></td>
              </tr>

              <tr data-id="2" data-valor="2180" data-desc="Manutenção" data-data="12/01/2026">
                <td><input type="checkbox" class="check-item" data-valor="2180" data-id="2"></td>
                <td>12/01/2026</td>
                <td>Manutenção</td>
                <td>
                  <button class="btn btn-danger btn-sm btn-pagar-item" data-id="2">Pagar</button>
                </td>
                <td class="fw-bold">R$ 2.180,00</td>
                <td><span class="badge bg-danger">Vencido</span></td>
              </tr>
            </tbody>

          </table>
        </div>

        <div class="mt-3 d-none" id="btn-pagar-container">
          <button class="btn btn-success" id="btn-pagar-selecionados">
            Pagar selecionados (<span id="total-selecionado"></span>)
          </button>
        </div>

        <div class="mt-4 text-end">
          <h5 class="fw-bold">
            Total a pagar:
            <span class="text-danger" id="total-geral">R$ 0,00</span>
          </h5>
        </div>

      </div>
    </div>

  </div>

  <!-- ===== MODAL 1: RESUMO DO PAGAMENTO ===== -->
  <div class="modal fade" id="modalResumo" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title fw-bold">Resumo do Pagamento</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">

          <p class="text-muted mb-2">Itens selecionados para pagamento:</p>

          <table class="table table-sm table-bordered mb-3">
            <thead class="table-light">
              <tr>
                <th>Descrição</th>
                <th>Data</th>
                <th class="text-end">Valor</th>
              </tr>
            </thead>
            <tbody id="resumo-itens"></tbody>
            <tfoot>
              <tr class="table-light fw-bold">
                <td colspan="2">Total</td>
                <td class="text-end text-danger" id="resumo-total"></td>
              </tr>
            </tfoot>
          </table>

          <div class="mb-3">
            <label class="form-label fw-bold">Valor que deseja pagar (R$)</label>
            <input type="number" class="form-control" id="input-valor-pagar"
                   placeholder="Ex: 1500.00" min="0" step="0.01">
          </div>

          <div id="info-saldo" class="alert d-none"></div>

        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
          <button class="btn btn-success" id="btn-continuar">Continuar para Pagamento →</button>
        </div>
      </div>
    </div>
  </div>

  <!-- ===== MODAL 2: FORMA DE PAGAMENTO ===== -->
  <div class="modal fade" id="modalPagamento" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title fw-bold">Forma de Pagamento</h5>
          <button type="button" class="btn-close" id="fechar-modal-pagamento"></button>
        </div>
        <div class="modal-body">

          <!-- Resumo do valor -->
          <div class="mb-3 p-3 rounded bg-light border">
            <div class="d-flex justify-content-between">
              <span class="text-muted">Valor a pagar:</span>
              <strong class="text-danger" id="pag-valor-exibir">R$ 0,00</strong>
            </div>
            <div id="pag-saldo-info" class="mt-1 d-none">
              <small id="pag-saldo-texto" class="fw-bold"></small>
            </div>
          </div>

          <!-- Botões de escolha -->
          <p class="fw-bold mb-2">Selecione a forma de pagamento:</p>
          <div class="d-flex gap-3 mb-4">
            <button class="btn btn-outline-primary flex-fill" id="btn-forma-pix"
                    onclick="selecionarForma('pix')">Pix</button>
            <button class="btn btn-outline-secondary flex-fill" id="btn-forma-dinheiro"
                    onclick="selecionarForma('dinheiro')">Dinheiro</button>
          </div>

          <!-- Seção PIX -->
          <div id="secao-pix" class="d-none">

            <div class="text-center mb-3">
              <p class="fw-bold mb-1">Chave Pix:</p>
              <div class="d-flex align-items-center justify-content-center gap-2">
                <span class="fs-5 fw-bold text-primary" id="chave-pix-texto">Transporte3E@empresa.com.br</span>
                <button class="btn btn-sm btn-outline-secondary" onclick="copiarChave()">Copiar</button>
              </div>
            </div>

            <div class="text-center mb-3">
              <p class="fw-bold mb-2">QR Code:</p>
              <img src="../image/qrcode.png"
                   alt="QR Code Pix"
                   style="width:160px; height:160px; border:1px solid #dee2e6; border-radius:8px;">
            </div>

            <div class="mb-3">
              <label class="form-label fw-bold">Anexar comprovante</label>
              <input type="file" class="form-control" id="input-comprovante" accept="image/*,.pdf">
              <div class="form-text">Envie a foto ou PDF do comprovante Pix.</div>
            </div>

            <div id="preview-comprovante" class="d-none text-center mb-2">
              <img id="img-preview" src="" alt="Comprovante"
                   style="max-width:180px; border-radius:8px; border:1px solid #dee2e6;">
            </div>

            <div class="alert alert-info py-2">
              <small>Após anexar o comprovante, clique em <strong>Confirmar Pagamento</strong>.</small>
            </div>

            <div class="d-flex align-items-center gap-2 mb-3">
              <hr class="flex-fill">
              <span class="text-muted small">ou envie o comprovante pelo WhatsApp</span>
              <hr class="flex-fill">
            </div>

            <div class="text-center mb-3">
              <a href="https://wa.me/553195094324" target="_blank">
                (31) 9509-4324
              </a>
            </div>

          </div>

          <!-- Seção DINHEIRO -->
          <div id="secao-dinheiro" class="d-none">
            <div class="alert alert-warning">
              <strong>Pagamento em Dinheiro</strong><br>
              Entre em contato com a <strong>Transporte 3E</strong> para acertar o pagamento presencialmente.<br>
              <span class="text-muted" style="font-size:13px;">
                <a href="https://wa.me/553195094324" target="_blank" class="text-success fw-bold fs-5">
                  (31) 9509-4324
                </a>
              </span>
            </div>
          </div>

        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" id="btn-voltar-resumo">← Voltar</button>
          <button class="btn btn-success d-none" id="btn-confirmar-pix"
                  onclick="confirmarPagamento()">Confirmar Pagamento</button>
          <button class="btn btn-success d-none" id="btn-confirmar-dinheiro"
                  onclick="confirmarPagamento()">Confirmar Contato</button>
        </div>
      </div>
    </div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js"></script>

  <script>

   // ===== ORDENAÇÃO DA TABELA =====
document.getElementById('ordenacao').addEventListener('change', function () {
  const valor = this.value; // pega o tipo de ordenação escolhido
  const tbody = document.getElementById('tabela-movimentos');
  const linhas = Array.from(tbody.querySelectorAll('tr')); // pega todas as linhas

  linhas.sort((a, b) => {
    // se for ordenação por data
    if (valor === 'recentes' || valor === 'antigos') {

      // convertendo data de DD/MM/AAAA pra AAAAMMDD pra conseguir comparar
      const dataA = a.dataset.data ? a.dataset.data.split('/').reverse().join('') : '0';
      const dataB = b.dataset.data ? b.dataset.data.split('/').reverse().join('') : '0';

      // decide se vai ordenar crescente ou decrescente
      return valor === 'recentes'
        ? dataB.localeCompare(dataA)
        : dataA.localeCompare(dataB);
    }

    // se for ordenação por status
    if (valor === 'pendentes' || valor === 'vencidos') {

      // pega o texto do badge (status)
      const statusA = a.querySelector('.badge')?.textContent.toLowerCase() || '';
      const statusB = b.querySelector('.badge')?.textContent.toLowerCase() || '';

      const alvo = valor === 'pendentes' ? 'pendente' : 'vencido';

      // joga o status escolhido pra cima
      if (statusA.includes(alvo) && !statusB.includes(alvo)) return -1;
      if (!statusA.includes(alvo) && statusB.includes(alvo)) return 1;

      return 0;
    }

    return 0;
  });

  // coloca as linhas de volta na tabela já ordenadas
  linhas.forEach(linha => tbody.appendChild(linha));
});


// ===== FILTRO POR DATA =====
document.getElementById('btn-filtrar').addEventListener('click', function () {
  const inicio = document.getElementById('data-inicio').value; // data inicial
  const fim    = document.getElementById('data-fim').value;    // data final

  document.querySelectorAll('#tabela-movimentos tr').forEach(row => {

    // pega a data da linha (DD/MM/AAAA)
    const partes = row.dataset.data ? row.dataset.data.split('/') : null;
    if (!partes) return;

    // transforma pra AAAA-MM-DD pra comparar com input
    const dataRow = `${partes[2]}-${partes[1]}-${partes[0]}`;

    const passaInicio = !inicio || dataRow >= inicio;
    const passaFim    = !fim    || dataRow <= fim;

    // mostra ou esconde a linha
    row.style.display = (passaInicio && passaFim) ? '' : 'none';
  });
});

// limpa o filtro
document.getElementById('btn-limpar-filtro').addEventListener('click', function () {
  document.getElementById('data-inicio').value = '';
  document.getElementById('data-fim').value    = '';

  document.querySelectorAll('#tabela-movimentos tr').forEach(row => {
    row.style.display = ''; // mostra tudo de novo
  });
});


// ===== VARIÁVEIS GLOBAIS =====
let itensSelecionados = []; // aqui vou guardar os itens que o cara escolheu
let valorDigitado = 0; // valor que o cara digitou pra pagar

const modalResumo    = new bootstrap.Modal(document.getElementById('modalResumo'));
const modalPagamento = new bootstrap.Modal(document.getElementById('modalPagamento'));


// ===== FORMATAR VALOR EM REAL =====
function formatBRL(v) {
  return 'R$ ' + parseFloat(v).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}


// ===== ATUALIZAR TOTAIS =====
function atualizarTotais() {

  const checks = document.querySelectorAll('.check-item:checked');
  let total = 0;

  // soma só os selecionados
  checks.forEach(c => {
    total += parseFloat(c.dataset.valor);
  });

  const cont = document.getElementById('btn-pagar-container');

  // mostra ou esconde botão de pagar selecionados
  if (checks.length > 0) {
    cont.classList.remove('d-none');
    document.getElementById('total-selecionado').textContent = formatBRL(total);
  } else {
    cont.classList.add('d-none');
  }

  // soma total geral (tudo)
  let totalGeral = 0;
  document.querySelectorAll('.check-item').forEach(c => {
    totalGeral += parseFloat(c.dataset.valor);
  });

  document.getElementById('total-geral').textContent = formatBRL(totalGeral);
}


// ===== ABRIR MODAL RESUMO =====
function abrirModalResumo(ids) {

  const tbody = document.getElementById('resumo-itens');
  tbody.innerHTML = ''; // limpa tabela

  let total = 0;
  itensSelecionados = []; // limpa array

  ids.forEach(id => {

    const row = document.querySelector(`tr[data-id="${id}"]`);
    if (!row) return;

    const valor = parseFloat(row.dataset.valor);
    const desc  = row.dataset.desc;
    const data  = row.dataset.data;

    total += valor;

    // salva os dados pra mandar pro backend depois
    itensSelecionados.push({ id, valor, desc, data });

    // monta a linha no resumo
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${desc}</td>
      <td>${data}</td>
      <td class="text-end">${formatBRL(valor)}</td>
    `;

    tbody.appendChild(tr);
  });

  document.getElementById('resumo-total').textContent = formatBRL(total);

  // já coloca o valor total no input
  document.getElementById('input-valor-pagar').value = total.toFixed(2);

  document.getElementById('info-saldo').className = 'alert d-none';

  atualizarInfoSaldo(total, total);

  modalResumo.show();
}


// ===== CALCULAR DIFERENÇA DE PAGAMENTO =====
function atualizarInfoSaldo(totalDivida, valorPagar) {

  const info = document.getElementById('info-saldo');

  if (isNaN(valorPagar) || valorPagar <= 0) {
    info.className = 'alert d-none';
    return;
  }

  const diff = valorPagar - totalDivida;

  if (diff > 0.005) {
    info.className = 'alert alert-success';
    info.innerHTML = `Pagando a mais: ${formatBRL(diff)}`;
  } else if (diff < -0.005) {
    info.className = 'alert alert-warning';
    info.innerHTML = `Falta pagar: ${formatBRL(Math.abs(diff))}`;
  } else {
    info.className = 'alert alert-success';
    info.innerHTML = `Valor certinho`;
  }
}


// ===== EVENTOS =====

// quando marca checkbox
document.querySelectorAll('.check-item').forEach(chk => {
  chk.addEventListener('change', atualizarTotais);
});

// botão pagar individual
document.querySelectorAll('.btn-pagar-item').forEach(btn => {
  btn.addEventListener('click', function () {
    abrirModalResumo([this.dataset.id]);
  });
});

// pagar selecionados
document.getElementById('btn-pagar-selecionados').addEventListener('click', function () {
  const ids = Array.from(document.querySelectorAll('.check-item:checked'))
    .map(c => c.dataset.id);

  if (ids.length > 0) abrirModalResumo(ids);
});

// quando digita valor
document.getElementById('input-valor-pagar').addEventListener('input', function () {
  const totalDivida = itensSelecionados.reduce((s, i) => s + i.valor, 0);
  atualizarInfoSaldo(totalDivida, parseFloat(this.value));
});


// ===== IR PRO PAGAMENTO =====
document.getElementById('btn-continuar').addEventListener('click', function () {

  const v = parseFloat(document.getElementById('input-valor-pagar').value);

  if (!v || v <= 0) {
    alert('valor inválido');
    return;
  }

  valorDigitado = v;

  const totalDivida = itensSelecionados.reduce((s, i) => s + i.valor, 0);

  document.getElementById('pag-valor-exibir').textContent = formatBRL(v);

  modalResumo.hide();
  modalPagamento.show();
});


// ===== ESCOLHER FORMA DE PAGAMENTO =====
function selecionarForma(forma) {

  // esconde tudo primeiro
  document.getElementById('secao-pix').classList.add('d-none');
  document.getElementById('secao-dinheiro').classList.add('d-none');

  if (forma === 'pix') {
    document.getElementById('secao-pix').classList.remove('d-none');
  } else {
    document.getElementById('secao-dinheiro').classList.remove('d-none');
  }
}


// ===== PREVIEW DO COMPROVANTE =====
document.getElementById('input-comprovante').addEventListener('change', function () {

  const file = this.files[0];
  const preview = document.getElementById('preview-comprovante');
  const img = document.getElementById('img-preview');

  if (file && file.type.startsWith('image/')) {

    const reader = new FileReader();

    reader.onload = e => {
      img.src = e.target.result;
      preview.classList.remove('d-none');
    };

    reader.readAsDataURL(file);

  } else {
    preview.classList.add('d-none');
  }
});


// ===== COPIAR CHAVE PIX =====
function copiarChave() {
  const chave = document.getElementById('chave-pix-texto').textContent;

  navigator.clipboard.writeText(chave)
    .then(() => alert('copiado'))
    .catch(() => alert(chave));
}


// ===== FINALIZAR =====
function confirmarPagamento() {

  // aqui depois vai chamar backend (fetch)
  // vou mandar:
  // itensSelecionados
  // valorDigitado
  // forma de pagamento
  // comprovante (se tiver)

  modalPagamento.hide();

  alert('pagamento enviado');
}


// inicia os totais
atualizarTotais();

  </script>

</body>
</html>