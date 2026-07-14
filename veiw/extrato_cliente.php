<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>Extrato</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet">
  <link rel="icon" href="../image/logo 3e.jpg" type="image/png">
  <style>
    body { 
     background: linear-gradient(135deg, #f8f9fa 0%, #ffe8cc 100%);
    }
  </style>
</head>

<body>

<?php include '../controll/menu.php'; ?>

<div class="container py-5">

  <h2 class="fw-bold mb-4">Extrato de Pagamentos</h2>

  <div class="card shadow-sm">
    <div class="card-body">

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

      <div class="table-responsive">
        <table class="table table-striped align-middle">
          <thead>
            <tr>
              <th>Data</th>
              <th>Pago em</th>
              <th>Descrição</th>
              <th>Valor</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>

            <tr>
              <td>10/01/2026</td>
              <td>14/01/2026</td>
              <td>Frete - São Paulo/Rio</td>
              <td class="fw-bold">R$ 8.900,00</td>
              <td><span class="badge bg-success">Pago</span></td>
            </tr>

            <tr>
              <td>08/01/2026</td>
              <td>11/01/2026</td>
              <td>Frete - Belo Horizonte/Brasília</td>
              <td class="fw-bold">R$ 6.750,00</td>
              <td><span class="badge bg-success">Pago</span></td>
            </tr>

            <tr>
              <td>05/01/2026</td>
              <td>09/01/2026</td>
              <td>Frete - Curitiba/Florianópolis</td>
              <td class="fw-bold">R$ 4.890,00</td>
              <td><span class="badge bg-success">Pago</span></td>
            </tr>

          </tbody>

        </table>
      </div>

      <div class="mt-4 text-end">
        <h5 class="fw-bold">
          Total Pago: 
          <span class="text-success" id="total-pago">
            R$ 0,00
          </span>
        </h5>
      </div>

    </div>
  </div>
</div>

<script>
  document.getElementById('btn-filtrar').addEventListener('click', function () {
  const inicio = document.getElementById('data-inicio').value;
  const fim    = document.getElementById('data-fim').value;

  document.querySelectorAll('#extrato-movimentacao tr').forEach(row => {
    // Pega a data do atributo data-data (formato DD/MM/AAAA)
    const partes = row.dataset.data ? row.dataset.data.split('/') : null;
    if (!partes) return;

    // Converte para AAAA-MM-DD para comparar com o input type="date"
    const dataRow = `${partes[2]}-${partes[1]}-${partes[0]}`;

    const passaInicio = !inicio || dataRow >= inicio;
    const passaFim    = !fim    || dataRow <= fim;

    row.style.display = (passaInicio && passaFim) ? '' : 'none';
  });
});

document.getElementById('btn-limpar-filtro').addEventListener('click', function () {
  document.getElementById('data-inicio').value = '';
  document.getElementById('data-fim').value    = '';
  document.querySelectorAll('#extrato-movimentacao tr').forEach(row => {
    row.style.display = '';
  });
});

function calcularTotalPago() {
  let total = 0;
  document.querySelectorAll('#extrato-movimentacao tr:not([style*="none"])').forEach(row => {
    const valor = parseFloat(row.dataset.valor || 0);
    total += valor;
  });
  document.getElementById('total-pago').textContent =
    'R$ ' + total.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
}
</script>

</body>
</html>