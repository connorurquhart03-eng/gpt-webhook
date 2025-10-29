// server.js
const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');

const app = express();
app.use(bodyParser.json());

// Read GPT API key from Render environment variable
const GPT_API_KEY = process.env.GPT_API_KEY;

if (!GPT_API_KEY) {
    console.error("ERROR: GPT_API_KEY environment variable not set!");
    process.exit(1);
}

app.post('/', async (req, res) => {
    console.log('Received request:', JSON.stringify(req.body, null, 2));

    const userQuery = req.body.queryResult?.queryText || "No input";

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GPT_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "gpt-4",
                messages: [{ role: "user", content: userQuery }]
            })
        });

        const data = await response.json();
        console.log('GPT response:', data);

        const gptReply = data.choices?.[0]?.message?.content || "No response from GPT";

        // Send as a custom payload
        res.json({
            fulfillmentMessages: [
                {
                    payload: {
                        message: gptReply
                    }
                }
            ]
        });
    } catch (err) {
        console.error('Error talking to GPT:', err);
        res.json({
            fulfillmentMessages: [
                {
                    payload: {
                        message: "Error talking to GPT"
                    }
                }
            ]
        });
    }
});

// Use dynamic port for Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
