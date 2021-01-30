const express = require("express");
const bodyParser = require("body-parser");
const { WebhookClient } = require("dialogflow-fulfillment");
const app = express().use(bodyParser.json());
const { GoogleSpreadsheet } = require("google-spreadsheet");
const service = require("./credentials.json");
const doc = new GoogleSpreadsheet(service.api_key);
const dialogflow = require('dialogflow');
// Enables debugging statements from the dialogflow-fulfillment library.
process.env.DEBUG = 'dialogflow:debug';
var port = process.env.PORT || 3000;
const client = new dialogflow.SessionEntityTypesClient({
    keyFilename: "./credentials.json"
});

const productData = [
    // https://dialogflow.com/docs/reference/api-v2/rest/Shared.Types/BatchUpdateEntityTypesResponse#entity
    { value: 'Wall Street', synonyms: ['Wall Street'] },
    { value: 'Fifth Avenue', synonyms: ['Fifth Avenue', '5th Avenue', '5th'] },
    { value: 'Broadway', synonyms: ['Broadway'] },
]

app.get("/", (request, response) => {
    response.send("Hello!");
});

app.post("/webhook", (request, response) => {
    const _agent = new WebhookClient({ request, response });
    // let queryText = request.body.queryResult.queryText;
    console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
    console.log('Dialogflow Request body: ' + JSON.stringify(request.body));



    /** Create a function that will handle our
         * 'City name' intent being matched.
         * @param {agent} agent Passed in by the Dialogflow fulfillment library.
         * @return {null} */
    function category(agent) {
        // Grab the name of the city from the parameters.
        const brand = agent.parameters;
        console.log("inside category")
        // Look up data for this city from our datastore. In a production
        // agent, we could make a database or API call to do this.

    }

    /** Create a function that will handle our
     * 'Trivia answer' intent being matched.
     // * @param {agent} agent Passed in by the Dialogflow fulfillment library. */
    // function checkTriviaAnswer(agent) {
    //   // Grab the name of the city from the context.
    //   const context = agent.context.get('cityname-followup');
    //   const cityName = context.parameters ? context.parameters.city : undefined;

    //   // If we couldn't find the correct context, log an error and inform the
    //   // user. This should not happen if the agent is correctly configured.
    //   if (!context || !cityName) {
    //     console.error('Expected context or parameter was not present');
    //     agent.add(`I'm sorry, I forgot which city we're talking about!`);
    //     agent.add(`Would you like me to ask you about New York, LA, Chicago, or Houston?`);
    //     return;
    //   }
    //   // Grab the name of the street from parameters.
    //   const streetName = agent.parameters['street'];

    //   // Look up data for this city from our datastore. In a production
    //   // agent, we could make a database or API call to do this.
    //   const data = productData[cityName];

    //   // Determine if we got it right!
    //   if (data.trivia.answer === streetName) {
    //     agent.add(`Nice work! You got the answer right. You're truly an expert on ${cityName}.`);
    //     agent.add(`Give me another city and I'll ask you more questions.`);
    //     // Since they got it right, delete the cityname-followup context
    //     // so our agent does not expect to hear any more streets.
    //     agent.context.delete('cityname-followup');
    //   } else {
    //     agent.add(`Oops, ${streetName} isn't the right street! Try another street name...`);
    //   }
    // }




    function Welcome(agent) {
        agent.add(
            "Hi, welcome intent from webhook triggered"
        );
        const data = productData;
        // Create a new SessionEntityTypesClient, which communicates with the SessionEntityTypes API endpoints. 
        const client = new dialogflow.SessionEntityTypesClient({
            keyFilename: "./credentials.json"
        });

        // Combine the session identifier with the name of the EntityType
        // we want to override, which in this case is 'street'. This is
        // according to the template in the docs:
        // https://dialogflow.com/docs/reference/api-v2/rest/v2/projects.agent.sessions.entityTypes#SessionEntityType
        const sessionEntityTypeName = agent.session + '/entityTypes/test';

        // Define our new SessionEntityType.
        const sessionEntityType = {
            name: sessionEntityTypeName,
            // Specify that this SessionEntityType's entities should fully replace
            // any values in the underlying EntityType (street).
            entityOverrideMode: 'ENTITY_OVERRIDE_MODE_OVERRIDE',
            // Add the appropriate streets to this SessionEntityType
            entities: data,
        };

        // Build a request that includes the current session
        // and the SessionEntityType.
        const request = {
            parent: agent.session,
            sessionEntityType: sessionEntityType,
        };

        // Create our new SessionEntityType
        return client
            .createSessionEntityType(request)
            .then((responses) => {
                console.log('Successfully created session entity type:',
                    JSON.stringify(request));
                // Respond to the user and ask this city's trivia question
                agent.add(`Great! Kindly provide varients about ${brand}. i.e size, brand etc`);
            })
            // Handle any errors by apologizing to the user.
            .catch((err) => {
                console.error('Error creating session entitytype: ', err);
                // agent.add(`I'm sorry, I'm having trouble remembering that city.`);
                // agent.add(`Is there a different city you'd like to be quizzed on?`);
            });
    }

    async function check_out(agent) {
        // console.log("request . body is : ", request.body)
        const name = request.body.queryResult.parameters.person.name
        const email = request.body.queryResult.parameters.email
        const number = request.body.queryResult.parameters.phoneNumber
        const address = request.body.queryResult.parameters.address
        // console.log("name is : ", name, "email is : ", email, "number is :", number, "address is : ", address)
        await doc.useServiceAccountAuth({
            client_email: service.client_email,
            private_key: service.private_key,
        });
        await doc.loadInfo(); // loads document properties and worksheets
        console.log(doc.title);
        const sheet = doc.sheetsByIndex[1]; // or use doc.sheetsById[id] or doc.sheetsByTitle[title]

        // const rows = await sheet.getRows(); // can pass in { limit, offset }
        // read/write row values
        // console.log("row is :",rows[0]);
        await sheet.loadCells('A1:E10'); // loads a range of cells
        console.log("cells are :", sheet.cellStats);

        // const sheet = await doc.addSheet({ headerValues: ['name', 'email'] });
        await sheet.addRow({ "Name": name, "Email": email, "Number": number, "Address": address });
        agent.add(
            `Thank you ${name}, your order has been received, we will shortly confirm you the same via email/number `
        );
    }




    // (async function() {
    //     await doc.loadInfo();
    //     const rows = await sheet.getRows(); // can pass in { limit, offset }
    //     // read/write row values
    //     console.log("row is :",rows[0].name);
    //     console.log()
    //   }());




    let intents = new Map();
    intents.set("Default Welcome Intent", Welcome);
    intents.set("check_out", check_out);
    intents.set("category", category);

    _agent.handleRequest(intents);
});

app.listen(port, () => {
    console.log("server running on port " + port);
});