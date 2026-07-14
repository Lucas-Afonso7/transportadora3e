<?php 
//$doc = $_POST['doc']; 
//$pass = $_POST['pass']; 
//echo $doc, "-" .$pass; 
?>

<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Dashboard</title>
  <link rel="icon" href="../image/logo 3e.jpg" type="image/png">

  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  
  <style>
    body { 
     background: linear-gradient(135deg, #f8f9fa 0%, #ffe8cc 100%); 
    }
  </style>

</head>

<body>

<?php include '../controll/menu.php'; ?>

<div class="container py-5">

  <div class="mb-5">
    <h1 class="fw-bold">Gestão de Pagamentos</h1>
    <p class="text-muted">Acompanhe suas contas a pagar e receber em tempo real</p>
  </div>

  <div class="row g-4 mb-5">

    <div class="col-md-3">
      <div class="card shadow-sm border-0">
        <div class="card-body">
          <i class="fas fa-file-invoice-dollar text-primary fs-3 mb-3"></i>
          <h6 class="text-muted">A Pagar</h6>
          <h4 class="fw-bold" id="card-a-pagar"></h4>
        </div>
      </div>
    </div>

    <div class="col-md-3">
      <div class="card shadow-sm border-0">
        <div class="card-body">
          <i class="fas fa-exclamation-triangle text-danger fs-3 mb-3"></i>
          <h6 class="text-muted">Vencidos</h6>
          <h4 class="fw-bold" id="card-vencidos"></h4>
        </div>
      </div>
    </div>

    <div class="col-md-3">
      <div class="card shadow-sm border-0">
        <div class="card-body">
          <i class="fas fa-clock text-warning fs-3 mb-3"></i>
          <h6 class="text-muted">7 Dias para Vencer</h6>
          <h4 class="fw-bold" id="card-vencendo"></h4>
        </div>
      </div>
    </div>

    <div class="col-md-3">
      <div class="card shadow-sm border-0">
        <div class="card-body">
          <i class="fas fa-check-circle text-success fs-3 mb-3"></i>
          <h6 class="text-muted">Pagos</h6>
          <h4 class="fw-bold" id="card-pagos"></h4>
        </div>
      </div>
    </div>

  </div>

  <div class="card shadow-sm border-0">
    <div class="card-body">

      <div class="d-flex justify-content-between align-items-center mb-4">
        <h5 class="fw-bold mb-0">
          <i class="fas fa-exchange-alt text-primary me-2"></i>
          Últimas Movimentações
        </h5>

        <a href="movimentacoes_cliente.php" class="btn btn-primary">
          Ver Mais
        </a>
      </div>

      <div class="table-responsive">
        <table class="table align-middle">
          <thead class="text-muted">
            <tr>
              <th>Data</th>
              <th>Descrição</th>
              <th>Ação</th>
              <th>Valor</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>

  <tr>
    <td>15/01/2026</td>
    <td>Frete - Belo Horizonte/Brasília</td>
    <td>
      <form method="POST" action="pagar.php">
        <input type="hidden" name="id" value="1">
        <button type="submit" class="btn btn-danger btn-sm">
          Pagar
        </button>
      </form>
    </td>
    <td class="fw-bold">R$ 3.450,00</td>
    <td><span class="badge bg-warning text-dark">Pendente</span></td>
  </tr>

  <tr>
    <td>12/01/2026</td>
    <td>Frete - Belo Horizonte/Brasília</td>
    <td>
      <form method="POST" action="pagar.php">
        <input type="hidden" name="id" value="2">
        <button type="submit" class="btn btn-danger btn-sm">
          Pagar
        </button>
      </form>
    </td>
    <td class="fw-bold">R$ 2.180,00</td>
    <td><span class="badge bg-danger">Vencido</span></td>
  </tr>

  <tr>
    <td>10/01/2026</td>
    <td>Frete - Belo Horizonte/Brasília</td>
    <td>
      <form method="POST" action="pagar.php">
        <input type="hidden" name="id" value="3">
        <button type="submit" class="btn btn-danger btn-sm">
          Pagar
        </button>
      </form>
    </td>
    <td class="fw-bold">R$ 5.200,00</td>
    <td><span class="badge bg-warning text-dark">Pendente</span></td>
  </tr>

</tbody>


        </table>
      </div>

    </div>
  </div>


<div class="card shadow-sm border-0 mt-5">
  <div class="card-body">

    <div class="row text-center justify-content-center align-items-center">

      <!-- Empresa -->
      <div class="col-md-3 d-flex justify-content-center">
        <img src="../image/logo 3e.jpg" alt="Transporte 3E" class="w-50 h-40">
      </div>

      <!-- Contato -->
      <div class="col-md-4 mb-3 text-center">
        <h6 class="fw-bold">Contato</h6>
        <p class="mb-1">
          <i class="fas fa-phone text-primary me-2"></i> (31) 995094324
        </p>
        <p class="mb-1">
          <i class="fas fa-envelope text-primary me-2"></i> contato@transporte3e.com.br
        </p>
        <p class="mb-1">
          <i class="fas fa-map-marker-alt text-primary me-2"></i> Ibirité - MG
        </p>
      </div>

      <!-- Redes sociais -->
      <div class="col-md-4 mb-3 text-center">
        <h6 class="fw-bold">Redes Sociais</h6>
        <a href="https://www.instagram.com/transporte3e/" class="text-dark me-3 fs-5">
          <i class="fab fa-instagram"></i>
        </a>
        <a href="https://wa.me/5531995094324" class="text-dark me-3 fs-5">
          <i class="fab fa-whatsapp"></i>
        </a>
        <a href="https://transporte3e.com.br/" class="text-dark fs-5">
          <i class="fas fa-globe"></i>
        </a>
      </div>
    </div>
  </div>
</div>
</div>
</body>
</html>