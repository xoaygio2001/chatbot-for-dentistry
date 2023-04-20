import request from "request";
require('dotenv').config();

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

let callSendAPI = (sender_psid, response) => {
    let request_body = {
        "recipient": {
            "id": sender_psid
        },
        "message": response
    }

    //Send the HTTP

    request({
        "uri": "https://graph.facebook.com/v2.6/me/messages",
        "qs": { "access_token": PAGE_ACCESS_TOKEN },
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        if (!err) {
            console.log('message sent')
        } else {
            console.log('Unable to send message: ' + err)
        }
    })
}

let getUserName = (sender_psid) => {

    let userName;

    request({
        "uri": `https://graph.facebook.com/${sender_psid}?fields=first_name,last_name,profile_pic&access_token=${PAGE_ACCESS_TOKEN}`,
        "qs": { "access_token": PAGE_ACCESS_TOKEN },
        "method": "POST",
    }, (err, res, body) => {
        console.log(body)
        if (!err) {
            let response = JSON.parse(res);

            userName = `${response.first_name} ${response.last_name}`;

            console.log('message sent')
        } else {
            console.log('Unable to send message: ' + err)
        }
    })

    return userName;
}

let handleMessage = (sender_psid, received_message) => {
    return new Promise(async (resolve, reject) => {
        try {

            let response;

            //check
            if (received_message.text) {
                console.log(received_message.text);

                if (received_message.text != "luandeptrai") {
                    response = {
                        "text": `You just sending me "${received_message.text}". Get Out My Way!`
                    }
                } else {
                    response = {
                        "text": `Luân đẹp trai là dĩ nhiên rồi! Em yêu anh ấy <3`
                    }
                }

            } else if (received_message.attachments) {
                let attachment_url = received_message.attachments[0].payload.url;

                response = {
                    "attachment": {
                        "type": "image",
                        "payload": {
                            "url": "https://omnitos.com/wp-content/uploads/2021/04/4ee1ad2ffbb00866fb7c55c61786e95d.jpg",
                            "is_reusable": true
                        }
                    }
                }
            }

            //send the response

            callSendAPI(sender_psid, response);

            resolve('done');

        } catch (e) {
            reject(e);
        }
    })
}

let handlePostback = (sender_psid, received_postback) => {
    return new Promise(async (resolve, reject) => {
        try {

            let response;

            //
            let payload = received_postback.payload;

            //
            if (payload === 'yes') {
                response = { 'text': "thank!" }
            } else if (payload === 'no') {
                response = { 'text': "Oops, try sending orther image." }
            } else if (payload === "GET_STARTED") {
                response = { "text": "Ok. Xin chao chung ban den day!" }
            }

            //
            callSendAPI(sender_psid, response);

            resolve("done");

        } catch (e) {
            reject(e)
        }
    })
}

let handleGetStarted = (sender_psid, payload) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response;
            switch(payload) {
                case "GET_STARTED":
                    response = { "text": "Ok. Xin chao chung ban den day!" }
                  break;
                case y:
                  // code block
                  break;
              }

        } catch(e) {

        }
    })
}

module.exports = {
    handleMessage,
    handlePostback

}