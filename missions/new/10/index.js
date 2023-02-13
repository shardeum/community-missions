const TelegramApi = require('node-telegram-bot-api')
require("dotenv").config();
const bot = new TelegramApi(process.env.BOT_TOKEN, {polling: true})
const ethers = require("ethers")
const network = process.env.NETWORK
const getfaucetval = process.env.GETFAUCETVAL
const timeout = parseInt(process.env.TIMEOUTMINUTE)*60000
//throttles requests if there are more than 200 requests per second
const throttledQueue = require('throttled-queue');
const throttle = throttledQueue(200, 1000);
var db = require('./request/my_sql_connect.js');
bot.setMyCommands([
    {command: '/start', description: 'start'},  
    {command: '/add', description: '/add 0x.... - add wallet'},
    {command: '/my', description: 'your wallet'},
    {command: '/faucet', description: 'faucet'},
  ])
const provider = new ethers.providers.getDefaultProvider(network);
const privateKey = process.env.PRIVATE_KEY
const faucetWallet = new ethers.Wallet(privateKey, provider);

async function main(addr){
    const tx = {
        to: addr,
        value: ethers.utils.parseEther(getfaucetval)
        }
    console.log(faucetWallet.address)
    //getBalance
    const balres = await provider.getBalance(faucetWallet.address)
    .then((balance) => {
    // convert a currency unit from wei to ether
    const balanceInEth = ethers.utils.formatEther(balance)
    console.log(`balance: ${balanceInEth} ETH`)
        if(balanceInEth - getfaucetval < 1){
            return 'faucet_empty'
        }else{
            return 'norm'
        }
    })
    .catch((err) => {return "error"})

    let getbalres = await balres
    console.log("getbalres:")
    console.log(getbalres)

    if(getbalres=='faucet_empty'){
        return "faucet empty"
    }else if(getbalres=='norm'){
        try{
            const txSend = await faucetWallet.sendTransaction(tx)
            console.log(txSend)
            return(`https://explorer-liberty20.shardeum.org/transaction/${txSend.hash}`)
        }catch (err){
            console.log("txSend not responding", err)
            return ("faucet not responding")
        }
    }else{
        return "Couldn't get faucet balance, network problems"
    }
   //return tmp
}


let Captchasession =new Map();
const start = () => {
    bot.on('message', async msg => {
        const text = msg.text;        
       console.log("userid: ",msg.from.id)
        if(text === '/start'){
            console.log("Captchasession:")
            console.log(Captchasession)
            console.log(":Captchasession")
            const sql = `SELECT * FROM shardbot WHERE userid=?`;
            db.query(sql, [msg.from.id],function(err, resp) {
                if(err) {
                    bot.sendMessage(msg.from.id,'failed to retrieve data')             
                    return console.log(err);
                }
                if(resp && resp!=''){
                    return bot.sendMessage(msg.from.id, `Welcome to SHARDEUM Faucet bot!\nFaucet wallet address 0xaEBc62e257f98E8A3F19D0143464F492e7f890e5\nadd your wallet address, \nExample \n\/add 0x359BB95D0A43f4688e948EAE911CDB642eC03fDf`)
                }else{
                    let rand1=Math.round(Math.random()*100)
                    let rand2=Math.round(Math.random()*100)                    
                    Captchasession.set(Math.abs(msg.from.id),rand1+rand2);
                    console.log(Captchasession)
                    return bot.sendMessage(msg.from.id, `Welcome to SHARDEUM Faucet bot!\nFaucet wallet address 0xaEBc62e257f98E8A3F19D0143464F492e7f890e5\npass the captcha\nEnter amounts ${rand1} + ${rand2}`)
                }
            })
            return
        }

        if(((/^[0-9]{2,3}$/gm).test(text))&&(Captchasession.has(msg.from.id))){
            if(text==Captchasession.get(msg.from.id)){
                console.log("Authorized")
                const sql2 = `INSERT INTO shardbot(userid) VALUES (?);`
                db.query(sql2, [msg.from.id],function(err, resp) {
                    if(err) {
                    console.log(err);
                    return bot.sendMessage(msg.from.id,'failed to add data')
                    }
                    Captchasession.delete(Math.abs(msg.from.id)); 
                    return bot.sendMessage(msg.from.id,`You are logged in, add a wallet`)
                    //console.log('Inserted ')
                })
            }else{
                return bot.sendMessage(msg.from.id,`Wrong captcha`)
            }
            return
        }
        
        if(text === '/my'){
            //console.log("нажат my") 
            const sql = `SELECT wallet FROM shardbot WHERE userid=?`;
            db.query(sql, [msg.from.id],function(err, resp) {
                if(err) {
                bot.sendMessage(msg.from.id,'failed to retrieve data')             
                return console.log(err);
                }                    
                if(resp && resp!=''){
                    if(resp[0]['wallet']==null){
                        return bot.sendMessage(msg.from.id,`You have not added a wallet`)
                    }else{
                        return bot.sendMessage(msg.from.id,`Your wallet ${resp[0]['wallet']}`)
                    }
                }else{
                    return bot.sendMessage(msg.from.id,`You have not added a wallet`)
                }
            })
            return
        }
        if((/^\/add\s0x[A-Za-z0-9]{40}$/gm).test(text)){
            const userwallet=text.replace("/add ", "").trim();
            const sql = `SELECT wallet FROM shardbot WHERE userid=?`;
            db.query(sql, [msg.from.id],function(err, resp) {
                if(err) {
                bot.sendMessage(msg.from.id,'failed to retrieve data')             
                return console.log(err);
                }
                console.log(resp)
                //bot.sendMessage(msg.from.id,`ip ${ip} добавлен к юзеру ${msg.from.id}`)
                if(resp && resp!=''){
                    if(resp[0]['wallet']==null){
                        console.log('resp')
                        const sql2 = `UPDATE shardbot SET wallet=? WHERE userid=${msg.from.id}`;
                        db.query(sql2, [userwallet],function(err, resp) {
                            if(err) {
                            console.log(err);
                            return bot.sendMessage(msg.from.id,'failed to retrieve data')
                            }
                            return bot.sendMessage(msg.from.id,`wallet ${userwallet} added to user ${msg.from.id}`)
                            //console.log('Inserted ')
                        })
                    }else{
                        return bot.sendMessage(msg.from.id,`Only one wallet allowed\nYou already have a wallet ${resp[0]['wallet']}`)
                    }
                    
                }else{
                    return bot.sendMessage(msg.from.id,`Pass captcha on command /start`)
                }
            })
            return
        }

      if(text === '/faucet'){
        //console.log("нажат my") 
        const sql = `SELECT wallet,timestamp FROM shardbot WHERE userid=?`;
        db.query(sql, [msg.from.id],async function(err, resp) {
            if(err) {
            bot.sendMessage(msg.from.id,'failed to retrieve data')             
            return console.log(err);
            }
            console.log("resp:")
            console.log(resp)
            if(resp && resp!=''){ 
                console.log('timestamp: ',parseInt(resp[0]['timestamp']))
                console.log('datenow: ',Date.now())
                //cooldown
                let vremya = ((Date.now() - parseInt(resp[0]['timestamp']))>0) ? true : false
                if(vremya && resp[0]['wallet']!=null){
                    throttle(async () => {
                        const tmp = await main(resp[0]['wallet'])
                    const sql2 = `UPDATE shardbot SET timestamp=? WHERE userid=${msg.from.id}`;
                    let time_ = Date.now()+timeout;
                    //console.log(typeof(time_))
                    db.query(sql2,String(time_),async function(err, resp) {
                        if(err) {
                        bot.sendMessage(msg.from.id,'failed to update data')
                        return console.log(err);
                        }
                    })
                    return bot.sendMessage(msg.from.id, tmp);
                    });
                }else if(resp[0]['wallet']==null){
                    return bot.sendMessage(msg.from.id, `wallet not added\nadd your wallet address, \nExample \n\/add 0x359BB95D0A43f4688e948EAE911CDB642eC03fDf`);
                }
                else{
                    return bot.sendMessage(msg.from.id, `Faucet is on cooldown ${Math.round(Date.now() - parseInt(resp[0]['timestamp']))/1000} sec`);
                }
            }else{
                return bot.sendMessage(msg.from.id,`You have not added a wallet`)
            }
        })
        return       
      }

      return bot.sendMessage(msg.from.id, `unknown command or failed captcha`)
      
    })
  }
  
  start()
//main()
