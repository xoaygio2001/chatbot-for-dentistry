import request from "request";
require('dotenv').config();

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

const GUILE_BOOK_DOCTOR = ['http://surl.li/gmwdf', 'http://surl.li/gmwdq'];

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

    return new Promise(async (resolve, reject) => {

        request({
            "uri": `https://graph.facebook.com/${sender_psid}?fields=first_name,last_name&access_token=${PAGE_ACCESS_TOKEN}`,
            "qs": { "access_token": PAGE_ACCESS_TOKEN },
            "method": "GET",
        }, (err, res, body) => {
            console.log(body)
            if (!err) {
                let response = JSON.parse(body);

                let userName = `${response.first_name} ${response.last_name}`;
                resolve(userName)

            } else {
                console.log('Unable to send message: ' + err)
                reject(err)
            }
        })


    });


}

let handleGetStarted = (sender_psid) => {
    return new Promise(async (resolve, reject) => {
        try {

            let userName = await getUserName(sender_psid);

            let response = { "text": `Xin chào ${userName} đến Fanpage của chúng tôi!` };

            await callSendAPI(sender_psid, response);

            resolve("done")

        } catch (e) {
            reject(e);
        }
    })
}

let handleGetGuide = (sender_psid) => {
    return new Promise(async (resolve, reject) => {
        try {

            await sendPicture(sender_psid, GUILE_BOOK_DOCTOR)

            resolve("done")

        } catch (e) {
            reject(e);
        }
    })
}

let sendPicture = (sender_psid, data) => {
    data.map(async (key, value) => {
        let response = {
            "attachment": {
                "type": "image",
                "payload": {
                    "url": value,
                    "is_reusable": true
                }
            }
        };

        await callSendAPI(sender_psid, response);
    })
}

module.exports = {
    handleGetStarted,
    handleGetGuide
}