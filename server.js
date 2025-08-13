import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API Key - mantenerla en el servidor, no en el cliente
const MEEE_API_KEY = API_CONFIG.MEEE_API_KEY;

// Proxy endpoint para el chat
app.get('/api/chat/:model/:message', async (req, res) => {
    try {
        const { model, message } = req.params;

        // Construir la URL con la API key en el servidor
        const url = `https://meeeapi.vercel.app/chat/${model}/${encodeURIComponent(message)}/key=${MEEE_API_KEY}`;

        console.log(`Proxying request to: ${url.replace(MEEE_API_KEY, '[HIDDEN]')}`);

        const response = await fetch(url);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`API Error: ${response.status} - ${errorText}`);
            return res.status(response.status).json({
                error: `API Error: ${response.status}`,
                message: 'Failed to communicate with AI service'
            });
        }

        const text = await response.text();
        res.type('text/plain').send(text);

    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to process request'
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`Proxy server running on http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
});