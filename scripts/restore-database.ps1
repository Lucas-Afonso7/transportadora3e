<#
.SYNOPSIS
  Restaura o banco MySQL do Transportadora3E a partir de um backup .sql.

.DESCRIPTION
  ATENCAO: isso APAGA e SUBSTITUI todos os dados atuais do banco pelo
  conteudo do arquivo de backup. Pede confirmacao explicita antes de rodar.
  Nao restaura os comprovantes automaticamente - copie manualmente a pasta
  comprovantes_<timestamp> correspondente de volta para storage/comprovantes
  depois de restaurar o banco.

.EXAMPLE
  .\scripts\restore-database.ps1 -SqlFile ".\backups\transportadora3e_2026-07-15_223000.sql"
#>

param(
    [Parameter(Mandatory = $true)]
    [string]$SqlFile,
    [string]$MysqlPath = "C:\xampp\mysql\bin\mysql.exe"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $SqlFile)) {
    Write-Error "Arquivo nao encontrado: $SqlFile"
    exit 1
}

if (-not (Test-Path $MysqlPath)) {
    Write-Error "mysql.exe nao encontrado em $MysqlPath - ajuste -MysqlPath se necessario."
    exit 1
}

$envPath = Join-Path $PSScriptRoot "..\.env"
$envLine = Get-Content $envPath | Where-Object { $_ -match "^DATABASE_URL=" } | Select-Object -First 1
$databaseUrl = ($envLine -replace "^DATABASE_URL=", "").Trim('"')
if ($databaseUrl -notmatch "^mysql://([^:]*):([^@]*)@([^:]+):(\d+)/(.+)$") {
    Write-Error "Nao consegui interpretar DATABASE_URL"
    exit 1
}
$dbUser = $matches[1]
$dbPass = $matches[2]
$dbHost = $matches[3]
$dbPort = $matches[4]
$dbName = $matches[5]

Write-Host "ATENCAO: isso vai APAGAR todos os dados atuais de '$dbName' e substituir pelo conteudo de:"
Write-Host "  $SqlFile"
Write-Host ""
$confirm = Read-Host "Digite CONFIRMAR (maiusculas) para continuar"
if ($confirm -ne "CONFIRMAR") {
    Write-Host "Cancelado - nada foi alterado."
    exit 0
}

$mysqlArgs = @("-u", $dbUser, "-h", $dbHost, "-P", $dbPort, $dbName)
if ($dbPass) {
    $mysqlArgs = @("-p$dbPass") + $mysqlArgs
}

Get-Content $SqlFile | & $MysqlPath @mysqlArgs

if ($LASTEXITCODE -ne 0) {
    Write-Error "Restauracao falhou (codigo $LASTEXITCODE)."
    exit 1
}

Write-Host "Restauracao concluida."
Write-Host "Se esse backup tinha uma pasta comprovantes_<timestamp> junto, copie o conteudo dela para storage/comprovantes agora."
