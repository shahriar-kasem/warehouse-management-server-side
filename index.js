const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { send } = require('express/lib/response');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// JWT
function verifyJWT(req, res, next){
    const authHeader = req.headers.authorization;
    if(!authHeader){
        return res.status(401).send({message: 'unauthorized access'})
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if(err){
            return res.status(403).send({message: 'Forbidden access'});
        }
        req.decoded = decoded;
        next()
    })
} 

const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.txuvn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const itemCollection = client.db('warehouseManagement').collection('items');
        const serviceCollection = client.db('warehouseManagement').collection('service');
        const feedbackCollection = client.db('warehouseManagement').collection('feedback');
        const blogCollection = client.db('warehouseManagement').collection('blog');
        const subscriberCollection = client.db('warehouseManagement').collection('subscribe');

        // auth
        app.post('/login', async(req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1d'
            });
            res.send({accessToken});
        })

        // get
        app.get('/inventory', async(req, res) => {
            const query = {};
            const cursor = itemCollection.find(query);
            const result = await cursor.toArray();
            res.send(result)
        })
        app.get('/myitem', verifyJWT, async(req, res) => {
            const decodedEmail = req.decoded.email;
            const email = req.query.email;
            if(email === decodedEmail){
                const query = {email};
            const cursor = itemCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
            }
            else{
                res.status(403).send({message: 'Forbidden access'});
            }
        })
        app.get('/inventory/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const item = await itemCollection.findOne(query);
            res.send(item)
        })
        app.get('/service', async(req,res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })
        app.get('/service/:id', async(req,res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const service = await serviceCollection.findOne(query);
            res.send(service);
        })
        app.get('/feedback', async(req,res) => {
            const query = {};
            const cursor = feedbackCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })
        app.get('/blog', async(req, res) => {
            const query = {};
            const cursor = blogCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })

        // post
        app.post('/inventory', async(req, res) => {
            const newUser = req.body;  
            const result = await itemCollection.insertOne(newUser);
            res.send(result);
        })
        app.post('/feedback', async(req, res) => {
            const newFeedback = req.body;  
            const result = await feedbackCollection.insertOne(newFeedback);
            res.send(result);
        })
        app.post('/blog', async(req, res) => {
            const newBlog = req.body;
            const result = await blogCollection.insertOne(newBlog)
            res.send(result);
        })
        app.post('/subscribe', async(req, res) => {
            const newSubscriber = req.body;
            const result = await subscriberCollection.insertOne(newSubscriber);
            res.send(result);
        })

        // put
        app.put('/inventory/:id', async(req, res) => {
            const id = req.params.id;
            const updateItem = req.body;
            const filter = {_id: ObjectId(id)};
            const options = { upsert: true};
            const updateDoc = {
                $set: {
                    name: updateItem.name,
                    description: updateItem.description,
                    url: updateItem.url,
                    supplier: updateItem.supplier,
                    price: updateItem.price,
                    quantity: updateItem.quantity
                }
            };
            const result = await itemCollection.updateOne(filter, updateDoc, options);
            res.send(result);
            console.log(result)
        })

        // delete
        app.delete('/inventory/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await itemCollection.deleteOne(query);
            res.send(result);
        })

        console.log('server connected')
    }
    finally {

    }
};

run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello. BBl-warehouse-management-server-side is working!')
})

app.listen(port, () => {
    console.log('App is listening on', port)
})