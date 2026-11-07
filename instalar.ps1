# =====================================================================
# instalar.ps1 — Arma la tienda completa (Laravel API + Angular)
# Uso:  powershell -ExecutionPolicy Bypass -File .\instalar.ps1 [-DbPassword "clave"]
# =====================================================================
param(
    [string]$DbName     = "tienda",
    [string]$DbUser     = "root",
    [string]$DbPassword = ""
)

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot

function Paso($texto) { Write-Host "`n==> $texto" -ForegroundColor Cyan }

# --- 0. Verificar herramientas --------------------------------------
Paso "Verificando herramientas instaladas"
foreach ($cmd in @("php", "composer", "node", "npm")) {
    if (-not (Get-Command $cmd -ErrorAction SilentlyContinue)) {
        Write-Host "Falta '$cmd'. Instálalo y vuelve a ejecutar el script." -ForegroundColor Red
        exit 1
    }
}

# --- 1. Backend: esqueleto Laravel ----------------------------------
$api = Join-Path $root "tienda-api"
if (-not (Test-Path $api)) {
    Paso "Creando esqueleto Laravel (tarda unos minutos)"
    Set-Location $root
    composer create-project laravel/laravel tienda-api
}

Set-Location $api

Paso "Instalando la API (Sanctum + routes/api.php)"
php artisan install:api --without-migration-prompt

Paso "Copiando código propio del backend"
Copy-Item -Path (Join-Path $root "backend\*") -Destination $api -Recurse -Force

Paso "Configurando MySQL en .env"
$envFile = Join-Path $api ".env"
$envText = Get-Content $envFile -Raw
$envText = $envText -replace "DB_CONNECTION=.*", "DB_CONNECTION=mysql"
$envText = $envText -replace "#\s*DB_", "DB_"                       # descomenta las líneas DB_
$envText = $envText -replace "DB_HOST=.*", "DB_HOST=127.0.0.1"
$envText = $envText -replace "DB_PORT=.*", "DB_PORT=3306"
$envText = $envText -replace "DB_DATABASE=.*", "DB_DATABASE=$DbName"
$envText = $envText -replace "DB_USERNAME=.*", "DB_USERNAME=$DbUser"
$envText = $envText -replace "DB_PASSWORD=.*", "DB_PASSWORD=$DbPassword"
Set-Content -Path $envFile -Value $envText -NoNewline

Paso "Creando tablas y datos de prueba"
php artisan config:clear
php artisan migrate:fresh --seed --force

# --- 2. Frontend: esqueleto Angular ---------------------------------
$web = Join-Path $root "tienda-web"
if (-not (Test-Path $web)) {
    Paso "Creando esqueleto Angular (tarda unos minutos)"
    Set-Location $root
    npx -y @angular/cli new tienda-web --routing --style=scss --ssr=false --skip-git --defaults
}

Paso "Reemplazando src/app con el código propio"
$webApp = Join-Path $web "src\app"
if (Test-Path $webApp) { Remove-Item $webApp -Recurse -Force }
Copy-Item -Path (Join-Path $root "frontend\src\*") -Destination (Join-Path $web "src") -Recurse -Force

# --- 3. Listo -------------------------------------------------------
Set-Location $root
Write-Host "`n✅ Proyecto listo." -ForegroundColor Green
Write-Host "Terminal 1:  cd tienda-api ; php artisan serve"
Write-Host "Terminal 2:  cd tienda-web ; npx ng serve"
Write-Host "Abre http://localhost:4200"
