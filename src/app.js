import express from 'express';
import cors from 'cors';
import apiV1Router from './api/v1/index.js';
import { corsOptions, jsonParser, urlEncodedParser, compression } from './middleware/middleware.js';
import { checkEnvVariables } from './config/config.js';
import { setupWebSocket } from './websocket.js';

checkEnvVariables();

const app = express();

app.use(cors(corsOptions));
app.use(compression()); // Use compression middleware
app.use(jsonParser);
app.use(urlEncodedParser);

app.use('/api/v1', apiV1Router);

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
	console.log(`Server listening on port ${PORT}`);
});

setupWebSocket(server);
