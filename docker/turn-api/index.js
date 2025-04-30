const express = require('express');
const crypto = require('crypto');
const app = express();

// Importa las variables de entorno:
const TURN_SECRET = process.env.TURN_SECRET;
const TURN_REALM = process.env.TURN_REALM;
const TURN_URI = process.env.TURN_URI;
const TURN_TTL = parseInt(process.env.TURN_TTL) || 3600;
const apiKey = process.env.TURN_REST_API_KEY;

// Middleware: verifica la clave de autorización en la URL
app.use((req, res, next) => {
    // Detalles de logs para depuración
    console.log('Incoming request headers:', req.headers);
    console.log('Incoming request URL:', req.url);
    console.log('Query parameters:', req.query);
    console.log('Request body:', req.body);

    const queryKey = req.query.key;

    if (!queryKey || queryKey !== apiKey) {
        console.log('Authorization failed: invalid query key', queryKey);
        return res.status(401).json({ error: 'Unauthorized' });
    }

    next();
});

// Endpoint: genera credenciales de usuario y contraseña para el servidor TURN
app.get('/turn-rest-api/', (req, res) => {
    const timestamp = Math.floor(Date.now() / 1000) + TURN_TTL;
    const username = `${timestamp}:${TURN_REALM}`;

    const hmac = crypto.createHmac('sha1', TURN_SECRET);
    hmac.update(username);
    const password = hmac.digest('base64');

    const response = {
        username: username,
        password: password,
        ttl: TURN_TTL,
        uris: [TURN_URI]
    };

    res.json(response);
});

// Inicia el servidor en el puerto especificado
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`TURN REST API server running on port: ${PORT}`);
});
