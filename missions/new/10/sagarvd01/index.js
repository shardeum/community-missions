// require('dotenv').config()
const RateLimiter = require("limiter").RateLimiter;
const limiter = new RateLimiter({ tokensPerInterval: 200, interval: "second" });

async function sendRequest(req, res, next) {
    const remainingRequests = await limiter.removeTokens(1);
    next();
}
const bot = require('./bot');
const express = require('express');
const TOKEN = process.env.token;
const url = 'https://shardeumfaucet.adaptable.app';
bot.setWebHook(`${url}/${TOKEN}`);


// bot.setWebHook(`${url}/bot${TOKEN}`);
const app = express();
app.use(sendRequest);
app.use(express.json());

app.post(`/${TOKEN}`, (req, res) => {
    try{
        bot.processUpdate(req.body);
        res.sendStatus(200);
    }catch(e){
    }
});
app.get('/', (req,res) => {
    res.status(200).send("ok");
})
app.get('/db-backup', function(req, res){
    const file = `${__dirname}/db/users.db`;
    res.download(file); // Set disposition and send it.
});
app.listen(process.env.PORT || 3000, () => {
    console.log(`Express server is listening on ${process.env.port || 3000}`);
});