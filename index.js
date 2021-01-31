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

// productData.Quantity.items
// const productData = {
//     'Fruit_Vegetables': {
//         trivia: {
//             question1: 'kindly provide the quantity in KGs',
//         },
//         items: [
//             { value: 'Apple', synonyms: ['apple'] },
//             { value: 'Mango', synonyms: ['mango'] },
//             { value: 'Orange', synonyms: ['Orange'] },
//             { value: 'I want seafood', synonyms: ['Seafood'] },
//         ],
//     },
//     'Deli': {
//         trivia: {
//             question: 'kindly provide the quantity and brand name if any you want',
//             question2: 'kindly provide brand you want',
//         },
//         items: [
//             { value: 'Deli', synonyms: ['Deli'] },
//         ],
//     },
//     'Dairy': {
//         trivia: {
//             question: 'kindly provide the quantity in Pcs',
//         },
//         items: [
//             { value: 'Milk', synonyms: ['Milk'] },
//             { value: 'Yogurt ', synonyms: ['Yogurt'] }],
//     },
//     'Seafood': {
//         trivia: {
//             question: 'kindly provide brand, type, Size, Quantity and Flavor',
//         },
//         items: [
//             { value: 'Fish', synonyms: ['Fish'] },
//             { value: 'Prowns ', synonyms: ['Prowns'] }],
//     },
//     'Meat_Poultry': {
//         trivia: {
//             question: 'kindly provide the quantity',
//         },
//         items: [
//             { value: 'Meat', synonyms: ['meat'] },
//             { value: 'Beef', synonyms: ['Beef'] }
//         ],
//     },
//     'Chocolates': {
//         trivia: {
//             question: 'kindly provide the quantity',
//         },
//         items: [
//             { value: 'Dairy Milk', synonyms: ['Dairy Milk'] },
//             { value: 'Munch ', synonyms: ['Munch'] },
//             { value: 'Crunch', synonyms: ['Crunch'] }],
//     }
// };


let DBdata = {
    beverages: ["beverages", "code", "sting", "dew"],
    Fruit_Vegetables: ["Fruit_Vegetables", "mango", "banana", "orange"],
    Deli: ["Deli"],
    Dairy: ["Dairy", "Milk", "Yougert"]
}

// console.log(Object.values(DBdata))
let data = []
let dum = Object.values(DBdata)
// console.log('dum', dum)
// const h = dum.map((val, i) => {
//     const n = val.map((res) => res)
//     if(n)
//     data.push(n)
//     console.log("n", n)
// }
// )
// console.log('h', data)
let arr=dum.map((item, index) => {
    // console.log(item)
    //     let dus = []
    //    dus = dus.concat(item)
    //     console.log(dus)
    // console.log("item is: ", item, "index is :", index)
    // item.map((singleitem, index) => {
    //     console.log("single item is: ", singleitem, "index is :", index, "item 0 index is: ", item[0])
    // })
    item.map((name, i) => {
        let value = item[i + 1]
        let synonyms = [item[i + 1]]
        if (value)  data.push({
            value: value,
            synonyms: synonyms // synonyms looks like: ["geo fence group", "1", "1st", "first"]
        })
    })
})

console.log("arr : ",data)
// convert each single item into 
function senti(item) {

    //  data
    let dummy = []
    let temp = Object.values(data)
    // dummy = dummy.push(temp)
    //  let dumy = temp.push(temp)
    //  console.log(dumy)
    // temp = temp.push(data)
    // console.log("temp is :", dummy);
    console.log(temp)
}

// console.log("dum is ", dum)
// const productData = [
//     // https://dialogflow.com/docs/reference/api-v2/rest/Shared.Types/BatchUpdateEntityTypesResponse#entity
//     { value: 'fruits and vegitables', synonyms: ['fruits'] },
//     { value: 'Deli ', synonyms: ['Deli'] },
//     { value: 'Eggs', synonyms: ['Eggs'] },
//     { value: 'Dairy', synonyms: ['Dairy'] },
//     { value: 'I want seafood', synonyms: ['Seafood'] },
// ]

app.get("/", (request, response) => {
    response.send("Hello!");
});



app.post("/webhook", (request, response) => {
    const _agent = new WebhookClient({ request, response });
    // let queryText = request.body.queryResult.queryText;
    // console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
    // console.log('Dialogflow Request body: ' + JSON.stringify(request.body));

    const data = DBdata;
    function Welcome(agent) {
        // agent.add(
        //     "Hi, welcome intent from webhook triggered"
        // );
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
        const test = agent.parameters.test;


        let DBdata = {
            beverages: ["beverages", "code", "sting", "dew"],
            Fruit_Vegetables: ["Fruit_Vegetables", "mango", "banana", "orange"],
            Deli: ["Deli"],
            Dairy: ["Milk", "Yougert"]
        }


        // Grab the name of the city from the parameters.
        if (test === "fruits and vegitables")
            agent.add("You have selected fruits, kindly provide the quantity you want")
        else agent.add("kindly select a valid product")
        console.log("brand   is : ", test)
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
        console.log(doc.title);
        const sheet = doc.sheetsByIndex[1];
        await sheet.loadCells('A1:E10'); // loads a range of cells
        console.log("cells are :", sheet.cellStats);

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