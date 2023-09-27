import request from "request";


require('dotenv').config();

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

const TEXT_PROCESS_BOOKING_APPOINTMENT =
    [
        'Bước 1: Bạn hãy chọn bác sĩ nào mà bạn cảm thấy phù hợp nhất',
        'Bước 2: Bạn hãy chọn thời gian mà bạn sẽ gặp bác sĩ',
        'Bước 3: Bạn hãy điền đầy đủ thông tin của bạn',
        'Bước 4: Sau khi bạn đã đăng ký đặt lịch thì bạn sẽ nhận được một gmail để xác nhận đăng ký thì nhấn vào click here',
        'Bước 5: Sau khi bạn hoàn tất đăng ký thì bạn sẽ nhần được mã số khám bệnh ',
        'Vậy quy trình đăng ký đã xong, chúc bạn một ngày tốt lành!',
    ];

const IMG_PROCESS_BOOKING_APPOINTMENT =
    [
        'https://i.ibb.co/WFCcyPJ/a1.png',
        'https://i.ibb.co/0YTnRhj/a2.png',
        'https://i.ibb.co/NyFGZKR/a3.png',
        'https://i.ibb.co/xL3F2Tr/a4.png',
        'https://i.ibb.co/dr8N0QY/a5.png'
    ];


const TEXT_COST_BOOKING_APPOINTMENT =
    [
        'Giá mỗi lần khám luôn được đặt ở dưới thông tin của bác bác sĩ. Bạn có thể tham khảo'
    ];

const IMG_COST_BOOKING_APPOINTMENT =
    [
        'https://i.ibb.co/fC0QsDt/b1.png'
    ];

const TEXT_CANCEL_APPOINTMENT =
    [
        'Bạn hãy nhấn vào click ở dưới phần hủy',
        'Vậy là bạn đã có hủy thành công',
    ];

const IMG_CANCEL_APPOINTMENT =
    [
        'https://i.ibb.co/x7rCknc/c1.png',
        'https://i.ibb.co/C8KBgp1/c2.png'
    ];

const TEXT_REALIABLE_DOCTOR =
    [
        'Mọi thông tin bác sĩ đã được chúng tôi kiểm chứng.',
        'Và thông tin đánh giá bác sĩ được công khai và do người dùng đánh giá.',
    ];

const IMG_REALIABLE_DOCTOR =
    [
        'https://i.ibb.co/x17qDJM/d1.png',
        'https://i.ibb.co/Lx7bNbd/d2.png'
    ];


let callSendAPI = (sender_psid, response) => {
    return new Promise((resolve, reject) => {
        let request_body = {
            "recipient": {
                "id": sender_psid
            },
            "message": response
        }

        // Send the HTTP request
        request({
            "uri": "https://graph.facebook.com/v2.6/me/messages",
            "qs": { "access_token": PAGE_ACCESS_TOKEN },
            "method": "POST",
            "json": request_body
        }, (err, res, body) => {
            if (!err) {
                console.log('message sent');
                resolve();
            } else {
                console.log('Unable to send message: ' + err);
                reject(err);
            }
        });
    });
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
                                        "title": "Quy trình đặt lịch hẹn",
                                        "payload": "PROCESS_BOOKING_APPOINTMENT"
                                    },
                                    {
                                        "type": "postback",
                                        "title": "Giá cả",
                                        "payload": "COST_BOOKING_APPOINTMENT"
                                    },
                                    {
                                        "type": "postback",
                                        "title": "Hủy lịch hẹn",
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
                                        "title": "Uy tín của bác sĩ",
                                        "payload": "REALIABLE_DOCTOR"
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

let handleGetGuide = async (sender_psid, payload) => {

    switch (payload) {
        case "PROCESS_BOOKING_APPOINTMENT":
            await sendText(sender_psid, TEXT_PROCESS_BOOKING_APPOINTMENT)
            await sendPicture(sender_psid, IMG_PROCESS_BOOKING_APPOINTMENT)
            break;
        case "COST_BOOKING_APPOINTMENT":
            await sendText(sender_psid, TEXT_COST_BOOKING_APPOINTMENT)
            await sendPicture(sender_psid, IMG_COST_BOOKING_APPOINTMENT)
            break;
        case "CANCEL_APPOINTMENT":
            await sendText(sender_psid, TEXT_CANCEL_APPOINTMENT)
            await sendPicture(sender_psid, IMG_CANCEL_APPOINTMENT)
            break;
        case "REALIABLE_DOCTOR":
            await sendText(sender_psid, TEXT_REALIABLE_DOCTOR)
            await sendPicture(sender_psid, IMG_REALIABLE_DOCTOR)
            break;
    }

}

let sendPicture = async (sender_psid, data) => {
    for (const value of data) {
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
    }
}

let sendText = async (sender_psid, data) => {
    for (const value of data) {
        let response = {
            "text": `${value}`
        };
        await callSendAPI(sender_psid, response);
    }
}

module.exports = {
    handleGetStarted,
    handleGetGuide
}