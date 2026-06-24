const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const twilio = require('twilio');

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const AccessToken = twilio.jwt.AccessToken;
const VoiceGrant = AccessToken.VoiceGrant;

// Tu clave API secreta generada en Twilio Console > API Keys
const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
const twilioApiKey = process.env.TWILIO_API_KEY;
const twilioApiSecret = process.env.TWILIO_API_SECRET;
const twilioCallerId = (process.env.TWILIO_CALLER_ID || '').replace(/\s+/g, ''); // Fix spaces

// App TwiML (Generada en TwiML Apps en Twilio Console)
const twimlAppSid = process.env.TWILIO_TWIML_APP_SID; 

app.get('/token', (req, res) => {
    if (!twilioAccountSid || !twilioApiKey || !twilioApiSecret || !twimlAppSid) {
        return res.status(500).json({ error: "Faltan variables de entorno de Twilio." });
    }

    // Identificador único para este cliente
    const identity = 'sarg_user_' + Math.floor(Math.random() * 10000);

    const voiceGrant = new VoiceGrant({
        outgoingApplicationSid: twimlAppSid,
        incomingAllow: true,
    });

    const token = new AccessToken(
        twilioAccountSid,
        twilioApiKey,
        twilioApiSecret,
        { identity: identity }
    );
    token.addGrant(voiceGrant);

    res.json({ token: token.toJwt(), identity });
});

// Twilio consultará este endpoint cuando hagamos una llamada saliente
app.post('/voice', (req, res) => {
    const VoiceResponse = twilio.twiml.VoiceResponse;
    const response = new VoiceResponse();
    // Limite de 5 minutos (300s) para ahorrar saldo de Twilio
    const dial = response.dial({ callerId: twilioCallerId, timeLimit: 300 });

    // phoneNumber o client
    const to = req.body.To;

    if (to) {
        if (/^[\d\+\-\(\) ]+$/.test(to)) {
            // Es un número de teléfono normal
            dial.number(to);
        } else {
            // Es otro cliente SIP o Twilio Client
            dial.client(to);
        }
    } else {
        response.say("Gracias por usar SARG VoIP. No se especificó un destino.");
    }

    res.set('Content-Type', 'text/xml');
    res.send(response.toString());
});

app.post('/gemini', async (req, res) => {
    try {
        const { systemPrompt, userPrompt, jsonMode } = req.body;
        
        // Proxy the request from the backend to hide the external API
        const response = await fetch('https://text.pollinations.ai/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                jsonMode: jsonMode,
                seed: Math.floor(Math.random() * 1000000)
            })
        });
        
        if (!response.ok) throw new Error('API Error');
        const text = await response.text();
        res.send(text);
    } catch (e) {
        console.error("Backend Proxy Error:", e);
        res.status(500).json({ error: "Backend proxy failed to connect to AI" });
    }
});

const PORT = process.env.PORT || 3001;

// Global error handler so the server doesn't crash
app.use((err, req, res, next) => {
    console.error('[SARG Twilio Error]', err);
    res.status(500).send('Error interno');
});

app.listen(PORT, () => {
    console.log(`[SARG Twilio Backend] Servidor escuchando en http://localhost:${PORT}`);
    console.log(`---------------------------------------------------------------`);
    console.log(`Asegúrate de configurar ngrok u otro túnel apuntando al puerto ${PORT}`);
    console.log(`y pon esa URL en tu TwiML App en la consola de Twilio para '/voice'.`);
});
