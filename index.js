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


// (async function () {
//     await doc.useServiceAccountAuth({
//         client_email: service.client_email,
//         private_key: service.private_key,
//     });
//     await doc.loadInfo(); // loads document properties and worksheets

//     const sheet = doc.sheetsByIndex[0];
//     const rows = await sheet.getRows(); // can pass in { limit, offset }

//     console.log("row is : ", rows)
// }());




let DBdata = {
    beverages: ["code", "sting", "dew", "coke"],
    Butter_Margarine: ["mango", "banana", "orange"],

}
// console.log("DBdata", DBdata)
const data = Object.entries(DBdata)
// console.log("data", data)

var entityData = []
data.map((item, index) => {

    let value = item[0]
    let synonyms = item[1]

    entityData.push({
        value: value,
        synonyms: synonyms // synonyms looks like: ["geo fence group", "1", "1st", "first"]
    })
})
// console.log("entityData is ", entityData)


app.get("/", (request, response) => {
    response.send("Hello!");
});

app.post("/webhook", (request, response) => {
    const _agent = new WebhookClient({ request, response });
    function Welcome(agent) {

        const sessionEntityTypeName = agent.session + '/entityTypes/product';

        // Define our new SessionEntityType.
        const sessionEntityType = {
            name: sessionEntityTypeName,
            entityOverrideMode: 'ENTITY_OVERRIDE_MODE_OVERRIDE',
            entities: entityData,
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
                const dum = request.sessionEntityType.entities
                agent.add(`Hi, I am your grocery assistant, how may i help you today - 1) Store Hours 2) Order food 3) Restaurent Info`);
            })
            // Handle any errors by apologizing to the user.
            .catch((err) => {
                console.error('Error creating session entitytype: ', err);
                agent.add(`I'm sorry, I can't get it .`);
            });
    }

    /** Create a function that will handle our
     * 'City name' intent being matched.
     * @param {agent} agent Passed in by the Dialogflow fulfillment library.
     * @return {null} */


    async function WelcomCustom(agent) {

        console.log("Actual product selected by user: ", agent.request_.body.queryResult.outputContexts[0].parameters["product.original"])
        // console.log("complete query text by user : ", agent.request_.body.queryResult.queryText)
        const actualProduct = agent.request_.body.queryResult.outputContexts[0].parameters["product.original"]
        const product = agent.parameters.product;
        const varient = agent.parameters.varient;
        var contextProduct = await agent.context.get("product") ? agent.context.get("product").parameters.product : null
        contextProduct = await agent.context.get("product") ? agent.context.get("product").parameters.product : null


        if (product === "beverages" && !varient) {
            console.log("1st condition product is : ", product, "varient is : ", varient)
            agent.context.set({ name: 'product', lifespan: 5, parameters: { product: product, varient: varient } });
            // const product = agent.context.get("product")
            // product = product.parameters.product
            return agent.add(`You have selected ${actualProduct} from ${product}, kindly confirm you want 300 Ml drink or 500 Ml ? `)
        } else if (contextProduct === "beverages" && varient) {
            agent.context.get("product")
            console.log("2nd condition product is : ", contextProduct, "varient is : ", varient)
            return (
                agent.add(`Your order of  ${contextProduct} for ${varient} has been received, you will shorly receive confirmation email/msg.`),
                agent.add(`Would you like to add any thing else in the chart ?`))
        }
        else if (product === "fruit_vegetables") {
            console.log("Fruit_Vegetables question here")
            return agent.add("Kindly confirm you want 300 gram 500 grams")
        }
        else if (product === "fruit_vegetables") {
            console.log("Fruit_Vegetables question here")
            return agent.add("Kindly confirm you want 300 gram 500 grams")
        }
        else if (product === "deli") {
            console.log("Deli question here")
            return agent.add("Deli question here")
        }
        else if (product === "dairy") {
            console.log("Dairy question here")
            return agent.add("Dairy question here")
        }
        else {
            console.log("else question here")
            return agent.add("else question here")
        }
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

        const sheet = doc.sheetsByIndex[1];
        await sheet.loadCells('A1:E10'); // loads a range of cells

        await sheet.addRow({ "Name": name, "Email": email, "Number": number, "Address": address });
        agent.add(
            `Thank you ${name}, your order has been received, we will shortly confirm you the same via email/number `
        );
    }

    let intents = new Map();
    intents.set("Default Welcome Intent", Welcome);
    intents.set("check_out", check_out);
    intents.set("Default Welcome Intent - custom", WelcomCustom);

    _agent.handleRequest(intents);
});

app.listen(port, () => {
    console.log("server running on port " + port);
});