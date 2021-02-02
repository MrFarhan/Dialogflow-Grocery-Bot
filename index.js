const express = require("express");
const bodyParser = require("body-parser");
const { WebhookClient } = require("dialogflow-fulfillment");
const app = express().use(bodyParser.json());
const { GoogleSpreadsheet } = require("google-spreadsheet");
const service = require("./credentials.json");
const doc = new GoogleSpreadsheet(service.api_key);
const dialogflow = require('dialogflow');
process.env.DEBUG = 'dialogflow:debug';
var port = process.env.PORT || 3000;
const client = new dialogflow.SessionEntityTypesClient({
    keyFilename: "./credentials.json"
});


let DBdata = {
    beverages: ["code", "sting", "dew"],
    fruit_vegetables: ["mango", "banana", "orange"],
    deli: ["deli"],
    dairy: ["Yougert", "milk"]
}

let userUterense = "Dairy"
userUterense = userUterense.toLowerCase()
console.log(userUterense)

Object.entries(DBdata).map((item) => {
    item.map((val1, index) => {
        if (index) {
            val1.map((val) => {
                if (userUterense === val) {
                    if (item[0] === "beverages") {
                        console.log("beverage question here")
                    }
                    else if (item[0] === "fruit_vegetables") {
                        console.log("Fruit_Vegetables question here")
                    }
                    else if (item[0] === "deli") {
                        console.log("Deli question here")
                    }
                    else if (item[0] === "dairy") {
                        console.log("Dairy question here")
                    }

                }
            })
        }
    })
})


app.get("/", (request, response) => {
    response.send("Hello!");
});

app.post("/webhook", (request, response) => {
    const _agent = new WebhookClient({ request, response });
    function Welcome(agent) {

        const sessionEntityTypeName = agent.session + '/entityTypes/test';

        // Define our new SessionEntityType.
        const sessionEntityType = {
            name: sessionEntityTypeName,
            entityOverrideMode: 'ENTITY_OVERRIDE_MODE_OVERRIDE',
            entities: data,
        };

        // Build a request that includes the current session and the SessionEntityType.
        const request = {
            parent: agent.session,
            sessionEntityType: sessionEntityType,
        };

        // Create our new SessionEntityType
        return client
            .createSessionEntityType(request)
            .then((responses) => {
                var entityqueryresult = JSON.stringify(request)
                // console.log("responses is", request.sessionEntityType.entities[0][0].trivia) 
                // console.log("responses is", responses[0]) //getting entities from here
                // console.log('Successfully created session entities :',
                //     JSON.stringify(request));
                // Respond to the user and ask this city's trivia question
                agent.add(`Hi, welcome intent from webhook triggered`);
            })
            // Handle any errors by apologizing to the user.
            .catch((err) => {
                console.error('Error creating session entitytype: ', err);
                agent.add(`I'm sorry, I can't get it .`);
                // agent.add(`Is there a different city you'd like to be quizzed on?`);
            });
    }

    /** Create a function that will handle our
     * 'City name' intent being matched.
     * @param {agent} agent Passed in by the Dialogflow fulfillment library.
     * @return {null} */


    function category(agent) {
        const agentParams = agent.parameters.brand;
        // condition to ask question 
        if (agentParams === "Meat_Poultry")
            agent.add("You have selected fruits, kindly provide the quantity you want")
        else agent.add("kindly select a valid product")
        console.log("brand is : ", agentParams)
    }

    /** Create a function that will handle our
     * 'Trivia answer' intent being matched.
     // * @param {agent} agent Passed in by the Dialogflow fulfillment library. */



    async function check_out(agent) {
        const name = request.body.queryResult.parameters.person.name
        const email = request.body.queryResult.parameters.email
        const number = request.body.queryResult.parameters.phoneNumber
        const address = request.body.queryResult.parameters.address

        await doc.useServiceAccountAuth({
            client_email: service.client_email,
            private_key: service.private_key,
        });

        await doc.loadInfo(); // loads document properties and worksheets
        // console.log(doc.title);

        const sheet = doc.sheetsByIndex[1];
        await sheet.loadCells('A1:E10'); // loads a range of cells
        // console.log("cells are :", sheet.cellStats);

        await sheet.addRow({ "Name": name, "Email": email, "Number": number, "Address": address });
        agent.add(
            `Thank you ${name}, your order has been received, we will shortly confirm you the same via email/number `
        );
    }

    let intents = new Map();
    intents.set("Default Welcome Intent", Welcome);
    intents.set("check_out", check_out);
    intents.set("category", category);

    _agent.handleRequest(intents);
});

app.listen(port, () => {
    console.log("server running on port " + port);
});