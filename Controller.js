const express=require('express');
const cors=require('cors');
const bodyParser=require('body-parser');
const {Expo} = require('expo-server-sdk');
const exphbs  = require('express-handlebars');

const app=express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json);
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
let token=models.Token;
let expo = new Expo();

//Grava o token no banco
app.post('/token',async(req,res)=>{
    let response=await token.findOne({
        where:{token:req.body.token}
    });
    if(response == null){
        token.create({
            token: req.body.token,
            createdAt: new Date(),
            updatedAt: new Date()
        });
    }
});

//View de envio de mensagens
app.get('/',async (req,res)=>{
    let response=await token.findAll({
        raw:true
    });
     res.render('mensagem',{users:response});
 });

app.post('/notifications',async (req,res)=>{
    let messages = [];
    let somePushTokens=[];

    if(req.body.recipient == ""){
        let response=await token.findAll({
            raw: true
        });
        response.map((elem,ind,obj)=>{
            somePushTokens.push(elem.token);
        });
    }else{
        somePushTokens.push(req.body.recipient);
    }

    let response=await token.findAll({
        raw: true
    });
    response.map((elem,ind,obj)=>{
       somePushTokens.push(elem.token);
    });

    for (let pushToken of somePushTokens) {

        if (!Expo.isExpoPushToken(pushToken)) {
            console.error(`Push token ${pushToken} is not a valid Expo push token`);
            continue;
        }

        messages.push({
            to: pushToken,
            sound: 'default',
            title: req.body.title,
            body: req.body.message
        });
    }
    let chunks = expo.chunkPushNotifications(messages);
    let tickets = [];
    (async () => {
        for (let chunk of chunks) {
            try {
                let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
                console.log(ticketChunk);
                tickets.push(...ticketChunk);
            } catch (error) {
                console.error(error);
            }
        }
    })();
    let receiptIds = [];
    for (let ticket of tickets) {
        if (ticket.id) {
            receiptIds.push(ticket.id);
        }
    }

    let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
    (async () => {
        for (let chunk of receiptIdChunks) {
            try {
                let receipts = await expo.getPushNotificationReceiptsAsync(chunk);
                console.log(receipts);

                for (let receiptId in receipts) {
                    let { status, message, details } = receipts[receiptId];
                    if (status === 'ok') {
                        continue;
                    } else if (status === 'error') {
                        console.error(
                            `There was an error sending a notification: ${message}`
                        );
                        if (details && details.error) {
                            console.error(`The error code is ${details.error}`);
                        }
                    }
                }
            } catch (error) {
                console.error(error);
            }
        }
    })();
});

let port=process.env.PORT || 3000;
app.listen(port,(req,res)=>{
    console.log('Servidor Rodando');
});