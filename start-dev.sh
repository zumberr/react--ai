#!/bin/bash

# Script para iniciar tanto el servidor proxy como el cliente en desarrollo

echo "🚀 Iniciando servidor proxy..."
# Instalar dependencias del servidor si no existen
if [ ! -d "node_modules_server" ]; then
    echo "📦 Instalando dependencias del servidor..."
    npm install --prefix . express cors node-fetch
fi

# Iniciar servidor proxy en background
node server.js &
SERVER_PID=$!

echo "⏳ Esperando que el servidor proxy esté listo..."
sleep 3

echo "🎨 Iniciando cliente de desarrollo..."
npm run dev &
CLIENT_PID=$!

echo "✅ Ambos servicios iniciados:"
echo "   - Servidor proxy: http://localhost:3001"
echo "   - Cliente: http://localhost:5173"
echo ""
echo "Para detener ambos servicios, presiona Ctrl+C"

# Función para limpiar procesos al salir
cleanup() {
    echo ""
    echo "🛑 Deteniendo servicios..."
    kill $SERVER_PID 2>/dev/null
    kill $CLIENT_PID 2>/dev/null
    exit 0
}

# Capturar Ctrl+C
trap cleanup SIGINT

# Esperar a que terminen los procesos
wait