import request from "request";
require('dotenv').config();

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

const GUILE_BOOK_DOCTOR = ['http://surl.li/gmwdf', 'http://surl.li/gmwdq'];

const IMG_HOW_ABOUT_BOOKINGCARE = 'http://surl.li/gneut';

const IMG_HOW_ABOUT_DOCTOR = 'http://surl.li/gneve';

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

                let userName = `${response.last_name} ${response.first_name}`;
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

            let response1 = { "text": `Xin chào ${userName}. Bạn cần hỗ trợ gì!` };

            let response2 = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [
                            {
                                "title": "Welcome!",
                                "image_url": "https://raw.githubusercontent.com/fbsamples/original-coast-clothing/main/public/styles/male-work.jpg",
                                "subtitle": "We have the right hat for everyone.",
                                "default_action": {
                                    "type": "web_url",
                                    "url": "https://www.originalcoastclothing.com/",
                                    "webview_height_ratio": "tall"
                                },
                                "buttons": [
                                    {
                                        "type": "web_url",
                                        "url": "https://www.originalcoastclothing.com/",
                                        "title": "View Website"
                                    }, {
                                        "type": "postback",
                                        "title": "Start Chatting",
                                        "payload": "DEVELOPER_DEFINED_PAYLOAD"
                                    }
                                ]
                            },
                            {
                                "title": "Welcome!",
                                "image_url": "https://raw.githubusercontent.com/fbsamples/original-coast-clothing/main/public/styles/male-work.jpg",
                                "subtitle": "We have the right hat for everyone.",
                                "default_action": {
                                    "type": "web_url",
                                    "url": "https://www.originalcoastclothing.com/",
                                    "webview_height_ratio": "tall"
                                },
                                "buttons": [
                                    {
                                        "type": "web_url",
                                        "url": "https://www.originalcoastclothing.com/",
                                        "title": "View Website"
                                    }, {
                                        "type": "postback",
                                        "title": "Start Chatting",
                                        "payload": "DEVELOPER_DEFINED_PAYLOAD"
                                    }
                                ]
                            },
                            {
                                "title": "Welcome!",
                                "image_url": "https://raw.githubusercontent.com/fbsamples/original-coast-clothing/main/public/styles/male-work.jpg",
                                "subtitle": "We have the right hat for everyone.",
                                "default_action": {
                                    "type": "web_url",
                                    "url": "https://www.originalcoastclothing.com/",
                                    "webview_height_ratio": "tall"
                                },
                                "buttons": [
                                    {
                                        "type": "web_url",
                                        "url": "https://www.originalcoastclothing.com/",
                                        "title": "View Website"
                                    }, {
                                        "type": "postback",
                                        "title": "Start Chatting",
                                        "payload": "DEVELOPER_DEFINED_PAYLOAD"
                                    }
                                ]
                            }
                        ]
                    }
                }
            }

            await callSendAPI(sender_psid, response1);
            await callSendAPI(sender_psid, response2);



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