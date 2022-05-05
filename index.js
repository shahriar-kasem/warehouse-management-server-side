const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.txuvn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const itemCollection = client.db('warehouseManagement').collection('items');
        const serviceCollection = client.db('warehouseManagement').collection('service');
        const feedbackCollection = client.db('warehouseManagement').collection('feedback');

        // get
        app.get('/inventory', async(req, res) => {
            const query = {};
            const cursor = itemCollection.find(query);
            const result = await cursor.toArray();
            res.send(result)
        })
        app.get('/service', async(req,res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })
        app.get('/feedback', async(req,res) => {
            const query = {};
            const cursor = feedbackCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })
        console.log('server connected')
    }
    finally {

    }
};

run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello. warehouse-management-server-side is working!')
})

app.listen(port, () => {
    console.log('App is listening on', port)
})