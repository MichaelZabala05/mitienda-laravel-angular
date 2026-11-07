# =====================================================================
# actualizar.ps1 - Aplica la version 2 (rediseno) a la tienda existente
#
# Ubicacion esperada:
#   tienda-fullstack\
#     tienda-api\
#     tienda-web\
#     actualizacion-v2\   <- esta carpeta (con este script)
#
# Uso (desde la carpeta actualizacion-v2):
#   powershell -ExecutionPolicy Bypass -File .\actualizar.ps1
#   (opcional) -Proyecto "E:\ruta\a\tienda-fullstack"
#
# IMPORTANTE: deten "ng serve" (Ctrl + C) antes de ejecutarlo.
# No borra pedidos: solo agrega columnas nuevas y actualiza el catalogo.
# =====================================================================
param(
    [string]$Proyecto = (Split-Path $PSScriptRoot -Parent)
)

$ErrorActionPreference = "Stop"
$src = $PSScriptRoot

function Paso($texto) { Write-Host "`n==> $texto" -ForegroundColor Cyan }
function Verificar($mensaje) {
    # Los comandos externos (php, npm) no detienen el script solos: se revisa su codigo de salida
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] $mensaje" -ForegroundColor Red
        exit 1
    }
}

$api = Join-Path $Proyecto "tienda-api"
$web = Join-Path $Proyecto "tienda-web"

if (-not (Test-Path $api) -or -not (Test-Path $web)) {
    Write-Host "[ERROR] No encontre tienda-api y tienda-web en: $Proyecto" -ForegroundColor Red
    Write-Host "Usa: .\actualizar.ps1 -Proyecto 'C:\ruta\a\tienda-fullstack'"
    exit 1
}

# --- Backend ---------------------------------------------------------
Paso "Copiando archivos del backend"
Copy-Item -Path (Join-Path $src "backend\*") -Destination $api -Recurse -Force

Set-Location $api

Paso "Limpiando cache de configuracion"
php artisan config:clear
Verificar "No se pudo limpiar la configuracion"

Paso "Aplicando migraciones nuevas (no borra datos)"
php artisan migrate --force
Verificar "Fallo la migracion. Revisa la conexion a MySQL en tienda-api\.env"

Paso "Actualizando catalogo de productos"
php artisan db:seed --force
Verificar "Fallo el seeder"

# --- Frontend --------------------------------------------------------
Paso "Reemplazando el codigo de Angular"
$webApp = Join-Path $web "src\app"
if (Test-Path $webApp) { Remove-Item $webApp -Recurse -Force }
Copy-Item -Path (Join-Path $src "frontend\src\*") -Destination (Join-Path $web "src") -Recurse -Force

# --- Listo -----------------------------------------------------------
Set-Location $Proyecto
Write-Host "`n[OK] Actualizacion aplicada." -ForegroundColor Green
Write-Host "Terminal 1:  cd tienda-api ; php artisan serve"
Write-Host "Terminal 2:  cd tienda-web ; npx ng serve"
Write-Host "Abre http://localhost:4200  (si ves la version vieja: Ctrl + Shift + R)"
