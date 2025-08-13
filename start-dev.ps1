# Script de PowerShell para iniciar tanto el servidor proxy como el cliente

Write-Host "🚀 Iniciando servidor proxy..." -ForegroundColor Green

# Verificar si Node.js está instalado
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js detectado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js no encontrado. Por favor instala Node.js primero." -ForegroundColor Red
    exit 1
}

# Instalar dependencias del servidor si no existen
if (!(Test-Path "node_modules")) {
    Write-Host "📦 Instalando dependencias del servidor..." -ForegroundColor Yellow
    npm install express cors node-fetch
}

# Iniciar servidor proxy
Write-Host "🔧 Iniciando servidor proxy en puerto 3001..." -ForegroundColor Cyan
Start-Process -FilePath "node" -ArgumentList "server.js" -WindowStyle Hidden

# Esperar un poco para que el servidor se inicie
Start-Sleep -Seconds 3

Write-Host "🎨 Iniciando cliente de desarrollo..." -ForegroundColor Cyan
npm run dev

Write-Host "✅ Servicios iniciados:" -ForegroundColor Green
Write-Host "   - Servidor proxy: http://localhost:3001" -ForegroundColor White
Write-Host "   - Cliente: http://localhost:5173" -ForegroundColor White