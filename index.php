<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta name="author" content="Muhamad Nauval Azhar">
	<meta name="viewport" content="width=device-width,initial-scale=1">
	<meta name="description" content="This is a login page template based on Bootstrap 5">
	<title>Autenticação</title>
	<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-BmbxuPwQa2lc/FVzBcNJ7UAyJxM6wuqIj61tLrc4wSX0szH/Ev+nYRRuWlolflfl" crossorigin="anonymous">
  <link rel="icon" href="image/logo 3e.jpg" type="image/png">
  <style>
    body { 
     background: linear-gradient(135deg, #f8f9fa 0%, #ffe8cc 100%); 
    }
  </style>
</head>

<body>
	<section>
		<div class="container h-100">
			<div class="row justify-content-sm-center h-100">
				<div class="col-xxl-4 col-xl-5 col-lg-5 col-md-7 col-sm-9">
					<div class=" my-2 text-center">
						<img src="image/logo 3e.jpg" alt="logo" width="300">
					</div>
					<div class="card shadow-lg">
						<div class="card-body p-5">
							<h1 class="fs-4 card-title fw-bold mb-4">AUTENTICAÇÃO</h1>
							<form method="POST"  action="veiw/tela1_cliente.php" class="needs-validation" novalidate="" autocomplete="off">
								<div class="mb-3">
									<label class="mb-2 text-muted" for="email">CPF/CNPJ</label>
									<input id="email" type="email" class="form-control" name="doc" value="" required >
								</div>

								<div class="mb-3">
									<div class="mb-2 w-100">
										<label class="text-muted" for="password">SENHA</label>
									</div>
									<input id="password" type="password" class="form-control" name="pass" required>
								</div>

								<div class="d-flex align-items-center">
									<button type="submit" class="btn btn-primary ms-auto">
										ENTRAR
									</button>
								</div>
							</form>
						</div>
						
					</div>
				</div>
			</div>
		</div>
	</section>
</body>
</html>