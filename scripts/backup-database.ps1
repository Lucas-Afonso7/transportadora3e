<#
.SYNOPSIS
  Faz backup do banco MySQL do Transportadora3E e dos comprovantes enviados.

.DESCRIPTION
  Le DATABASE_URL do .env, roda mysqldump, e copia a pasta storage/comprovantes
  (arquivos reais de comprovante, tao importantes de nao perder quanto o banco
  em si) para dentro de backups/, tudo com o mesmo timestamp.

.EXAMPLE
  .\scripts\backup-database.ps1
  npm run db:backup
#>

param(
    [string]$MysqlDumpPath = "C:\xampp\mysql\bin\mysqldump.exe",
    [string]$OutputDir = (Join-Path $PSScriptRoot "..\backups")
)

$ErrorActionPreference = "Stop"

$envPath = Join-Path $PSScriptRoot "..\.env"
if (-not (Test-Path $envPath)) {
    Write-Error ".env nao encontrado em $envPath - configure DATABASE_URL antes de rodar o backup."
    exit 1
}

$envLine = Get-Content $envPath | Where-Object { $_ -match "^DATABASE_URL=" } | Select-Object -First 1
if (-not $envLine) {
    Write-Error "DATABASE_URL nao encontrada no .env"
    exit 1
}
$databaseUrl = ($envLine -replace "^DATABASE_URL=", "").Trim('"')

if ($databaseUrl -notmatch "^mysql://([^:]*):([^@]*)@([^:]+):(\d+)/(.+)$") {
    Write-Error "Nao consegui interpretar DATABASE_URL: $databaseUrl"
    exit 1
}
$dbUser = $matches[1]
$dbPass = $matches[2]
$dbHost = $matches[3]
$dbPort = $matches[4]
$dbName = $matches[5]

if (-not (Test-Path $MysqlDumpPath)) {
    Write-Error "mysqldump nao encontrado em $MysqlDumpPath - ajuste o parametro -MysqlDumpPath se seu XAMPP estiver em outro caminho."
    exit 1
}

if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir | Out-Null
}

$timestamp = Get-Date -Format "yyyy-MM-dd_HHmmss"
$sqlFile = Join-Path $OutputDir "$dbName`_$timestamp.sql"

Write-Host "Fazendo backup do banco '$dbName' para $sqlFile..."

# --single-transaction: tira o dump sem travar as tabelas InnoDB enquanto o
# app continua rodando (nao precisa parar o site para fazer backup).
$dumpArgs = @(
    "-u", $dbUser,
    "-h", $dbHost,
    "-P", $dbPort,
    "--single-transaction",
    "--routines",
    "--triggers",
    $dbName
)
# -p precisa vir colado na senha (sem espaco); so adiciona se houver senha,
# senao o mysqldump entende "-p" sozinho como "pedir senha interativamente",
# o que trava um script automatizado.
if ($dbPass) {
    $dumpArgs = @("-p$dbPass") + $dumpArgs
}

& $MysqlDumpPath @dumpArgs | Out-File -FilePath $sqlFile -Encoding utf8

if ($LASTEXITCODE -ne 0) {
    Write-Error "mysqldump falhou (codigo $LASTEXITCODE) - o arquivo $sqlFile pode estar incompleto, apague-o antes de tentar de novo."
    exit 1
}

$sqlSize = (Get-Item $sqlFile).Length
if ($sqlSize -lt 100) {
    Write-Warning "O arquivo de backup ficou muito pequeno ($sqlSize bytes) - confira se nao deu algum erro silencioso."
}

# Comprovantes sao a evidencia real de pagamento PIX. Perder isso e tao
# grave quanto perder a linha do banco que aponta para eles.
$storageDir = Join-Path $PSScriptRoot "..\storage\comprovantes"
if (Test-Path $storageDir) {
    $filesBackupDir = Join-Path $OutputDir "comprovantes_$timestamp"
    Copy-Item -Path $storageDir -Destination $filesBackupDir -Recurse
    Write-Host "Comprovantes copiados para $filesBackupDir"
} else {
    Write-Host "Nenhum comprovante em disco ainda (pasta storage/comprovantes vazia ou inexistente) - ok."
}

Write-Host ""
Write-Host "Backup concluido: $sqlFile"
Write-Host "Guarde uma copia desse backup fora desta maquina de vez em quando (pendrive, nuvem) - um backup que so existe no mesmo HD do banco nao protege contra o HD falhar."
