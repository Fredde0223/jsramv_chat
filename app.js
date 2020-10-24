const mongo = require("mongodb").MongoClient;
const dsn = "mongodb://localhost:27017/chatlog";

const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());

const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const server = require('http').createServer(app);
const io = require('socket.io')(server);

io.on('connection', function (socket) {
    console.info("User connected");

    socket.on('send message', function (body) {
        io.emit('message', body);

        addToCollection(dsn, "msghistory", body.body);
    });
});

app.get("/", async (request, response) => {
    try {
        let res = await findInCollection(dsn, "msghistory", {}, {}, 0);

        console.log(res);
        response.json(res);
    } catch (err) {
        console.log(err);
        response.json(err);
    }
});

server.listen(3000);

async function findInCollection(dsn, colName, criteria, projection, limit) {
    const client  = await mongo.connect(dsn);
    const db = await client.db();
    const col = await db.collection(colName);
    const res = await col.find(criteria, projection).limit(limit).toArray();

    await client.close();

    return res;
}

async function addToCollection(dsn, colName, message) {
    const client  = await mongo.connect(dsn);
    const db = await client.db();
    const col = await db.collection(colName);

    await col.insertOne( { msg: message } );

    await client.close();
}
