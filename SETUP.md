# Configuración Segura del Chat AI
## Problema de Seguridad Solucionado
## Arquitectura

```
Cliente (React) → Servidor Proxy (Node.js) → API de Meee
```

- **Cliente**: Solo envía el mensaje, no conoce la API key
- **Servidor Proxy**: Maneja la API key de forma segura
- **API de Meee**: Recibe la petición con la API key desde el servidor

## Instalación y Uso

### Opción 1: Script Automático (Windows)

```powershell
# Ejecutar el script de PowerShell
.\start-dev.ps1
```

### Opción 2: Manual

1. **Instalar dependencias del servidor:**
```bash
npm install express cors node-fetch
```

2. **Iniciar el servidor proxy:**
```bash
node server.js
```

3. **En otra terminal, iniciar el cliente:**
```bash
npm run dev
```

## URLs

- **Cliente**: http://localhost:5173
- **Servidor Proxy**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## Endpoints del Proxy

- `GET /api/chat/:model/:message` - Envía mensaje al AI
- `GET /health` - Verificar estado del servidor

## Seguridad

✅ **CORS configurado**: Solo permite requests del cliente
✅ **Logs seguros**: La API key se oculta en los logs
✅ **Error handling**: Manejo seguro de errores

## Desarrollo

Para desarrollo, ambos servicios deben estar corriendo:
1. Servidor proxy en puerto 3001
2. Cliente React en puerto 5173

El cliente hace requests a `localhost:3001` que actúa como proxy hacia la API real.