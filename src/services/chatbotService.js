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
                                "title": "CÁC VẤN ĐỀ CHUNG VỀ BOOKINGCARE",
                                "image_url": IMG_HOW_ABOUT_BOOKINGCARE,
                                "subtitle": "Nhấn vào nút bên dưới để thao tác",
                                // "default_action": {
                                //     "type": "web_url",
                                //     "url": "https://www.originalcoastclothing.com/",
                                //     "webview_height_ratio": "tall"
                                // },
                                "buttons": [
                                    {
                                        "type": "postback",
                                        "title": "Quy trình đặt lịch hẹn khám bệnh như thế nào",
                                        "payload": "PROCESS_BOOKING_APPOINTMENT"
                                    }, 
                                    {
                                        "type": "postback",
                                        "title": "Giá cả có phải chăng không",
                                        "payload": "COST_BOOKING_APPOINTMENT"
                                    },
                                    {
                                        "type": "postback",
                                        "title": "Tôi đặt lịch hẹn nhằm thì làm thế nào để hủy",
                                        "payload": "CANCEL_APPOINTMENT"
                                    }

                                ]
                            },
                            {
                                "title": "CÁC VẤN ĐỀ CHUNG VỀ BÁC SĨ!",
                                "image_url": IMG_HOW_ABOUT_DOCTOR,
                                "subtitle": "Nhấn vào nút bên dưới để thao tác.",
                                // "default_action": {
                                //     "type": "web_url",
                                //     "url": "https://www.originalcoastclothing.com/",
                                //     "webview_height_ratio": "tall"
                                // },
                                "buttons": [
                                    {
                                        "type": "postback",
                                        "title": "Bác sĩ có uy tín không",
                                        "payload": "REALIABLE_DOCTOR"
                                    }, {
                                        "type": "postback",
                                        "title": "Tôi muốn góp ý cho bác sĩ đã khám cho tôi thì làm như thế nào",
                                        "payload": "FEEDBACK_FOR_DOCTOR"
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