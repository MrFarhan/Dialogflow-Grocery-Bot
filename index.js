const express = require("express");
const bodyParser = require("body-parser");
const app = express().use(bodyParser.json());
const { WebhookClient } = require("dialogflow-fulfillment");
const serverless = require("serverless-http");
const { GoogleSpreadsheet } = require("google-spreadsheet");

const creds = require("./client_secret.json");
const doc = new GoogleSpreadsheet(
);

app.get("/", (request, response) => {
    response.send("Hello!");
});

app.post("/webhook", (request, response) => {
    const agent = new WebhookClient({ request, response });
    let queryText = request.body.queryResult.queryText;

    
    function Welcome(agent) {
        if (agent.originalRequest.source === "GOOGLE_TELEPHONY") {
            console.log("Welcome intent for dialogflow telephony is triggered");
            return agent.add(
                "Hi, this is a conversational survey. It'll just take a minute. Do you subscribe to any on-demand video streaming services?"
            );
        }
        agent.add(
            "Hi, this is a Conversational Survey. It'll just take a minute"
        );
        agent.add("Do you subscribe to any on-demand video streaming services?");
    }

    let intents = new Map();
    intents.set("Default Welcome Intent", Welcome);

    agent.handleRequest(intents);
});

// app.listen(3000, () => {
//     console.log("server running on port " + 3000);
// });

module.exports.handler = serverless(app);