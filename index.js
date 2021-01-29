const express = require("express");
const bodyParser = require("body-parser");
const { WebhookClient } = require("dialogflow-fulfillment");
const app = express().use(bodyParser.json());

const { GoogleSpreadsheet } = require("google-spreadsheet");

const doc = new GoogleSpreadsheet(
);

var port = process.env.PORT || 3000;

app.get("/", (request, response) => {
    response.send("Hello!");
});

app.post("/webhook", (request, response) => {
    const _agent = new WebhookClient({ request, response });
    let queryText = request.body.queryResult.queryText;

    
    function Welcome(agent) {
        agent.add(
            "Hi, welcome intent from webhook triggered"
        );
    }

    let intents = new Map();
    intents.set("Default Welcome Intent", Welcome);

    _agent.handleRequest(intents);
});

app.listen(port, () => {
    console.log("server running on port " + port);
});