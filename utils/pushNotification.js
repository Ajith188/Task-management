const FCM = require('fcm-node');

const serverKey = ''; 
const fcm = new FCM(serverKey);

const sendPushNotification = (deviceToken,title,body)=>{
    try{
       var message= {
             to : deviceToken,
             notification:{
                title: title,
                body: body
             } 
       }
       fcm.send(message,(err,data)=>{
           if(err){
              console.log("message")
           }
           else{
              console.log("pushNotification",data)
           }
       })
    }
    catch(err){
        console.log("err", err)
    }
}

module.exports = sendPushNotification