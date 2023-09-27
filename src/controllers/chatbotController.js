require("dotenv").config();

import request from "request";

import { Configuration, OpenAIApi } from 'openai'

import {
    handleGetStarted,
    handleGetGuide
} from "../services/chatbotService";

import e, { response } from "express";

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

const configuration = new Configuration({
    apiKey: process.env.OPEN_AI_KEY
})

const openai = new OpenAIApi(configuration);

let getHomePage = async (req, res) => {


    return res.render('homepage.ejs')


};

let getWebhook = (req, res) => {

    // Parse the query params
    let mode = req.query["hub.mode"];
    let token = req.query["hub.verify_token"];
    let challenge = req.query["hub.challenge"];

    // Check if a token and mode is in the query string of the request
    if (mode && token) {
        // Check the mode and token sent is correct
        if (mode === "subscribe" && token === VERIFY_TOKEN) {
            // Respond with the challenge token from the request
            console.log("WEBHOOK_VERIFIED");
            res.status(200).send(challenge);
        } else {
            // Respond with '403 Forbidden' if verify tokens do not match
            res.sendStatus(403);
        }
    }
};

let postWebhook = (req, res) => {
    let body = req.body

    // Send a 200 OK response if this is a page webhook

    if (body.object === "page") {

        //iterates
        body.entry.forEach(function (entry) {

            //gets
            let webhook_event = entry.messaging[0];
            console.log(webhook_event);

            //Get the
            let sender_psid = webhook_event.sender.id;
            console.log('Sender PSID: ' + sender_psid);

            //check if the event
            //pass the event
            if (webhook_event.message) {
                handleMessage(sender_psid, webhook_event.message);
            } else if (webhook_event.postback) {
                handlePostback(sender_psid, webhook_event.postback);
            }
        })

        // Returns a '200 OK' response to all requests
        res.status(200).send("EVENT_RECEIVED");

        // Determine which webhooks were triggered and get sender PSIDs and locale, message content and more.

    } else {
        // Return a '404 Not Found' if event is not from a page subscription
        res.sendStatus(404);
    }
};

// Handles messages events
async function handleMessage(sender_psid, received_message) {

    


    let response;

    //check
    if (received_message.text) {
        console.log(received_message.text);

        if (received_message.text != "luandeptrai") {


            let content;
            try {
                const completion = await openai.createChatCompletion({
                    "model": "gpt-3.5-turbo",
                    "messages": [{ "role": "user", "content": `${received_message.text}` }],
                    "max_tokens": 100,
                    "top_p": 1,
                    "temperature": 0.5,
                    "frequency_penalty": 0,
                    "presence_penalty": 0,
                });
                content = completion.data.choices[0].message.content
            }
            catch (error) {
                if (error.response) {
                    console.error(error.response.status, error.response.data);
                    res.status(error.response.status).json(error.response.data);
                } else {
                    console.error(`Error with OpenAI API request: ${error.message}`);
                    res.status(500).json({
                        error: {
                            message: 'An error occurred during your request.',
                        }
                    });
                }
            }


            response = {
                "text": `${content}`
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

}

// Handle messaging_postback events
function handlePostback(sender_psid, received_postback) {
    let response;

    //
    let payload = received_postback.payload;

    if (payload == "RESTART_CHATBOT" || payload == "GET_STARTED") {
        handleGetStarted(sender_psid)
    } else {
        handleGetGuide(sender_psid, payload)
    }

}

// Send reponse messages via the Send API
function callSendAPI(sender_psid, response) {

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
    }
    )

}

let setupProfile = (req, res) => {

    let request_body = {
        "get_started": { "payload": "GET_STARTED" }
        ,
        "whitelisted_domains": ["https://vulkan-chatbot-for-dentistry.onrender.com"]
    }

    //Send the HTTP
    request({
        "uri": `https://graph.facebook.com/v9.0/me/messenger_profile?access_token=${PAGE_ACCESS_TOKEN}`,
        "qs": { "access_token": PAGE_ACCESS_TOKEN },
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        if (!err) {
            console.log('message sent')
        } else {
            console.log('Unable to send message: ' + err)
        }
    }
    )

}

let setupPersistentMenu = (req, res) => {
    let request_body = {
        "persistent_menu": [
            {
                "locale": "default",
                "disabled_surfaces": ["CUSTOMER_CHAT_PLUGIN"],
                "composer_input_disabled": false,
                "call_to_actions": [
                    {
                        "type": "postback",
                        "title": "Hướng dẫn đặt lịch hẹn khám bệnh",
                        "payload": "HOW_TO_BOOKING_DOCTOR"
                    },
                    {
                        "type": "postback",
                        "title": "Khởi động lại bot",
                        "payload": "RESTART_CHATBOT"
                    },
                    {
                        "type": "web_url",
                        "title": "Shop now",
                        "url": "https://www.originalcoastclothing.com/",
                        "webview_height_ratio": "full"
                    }
                ]
            }
        ]
    }

    //Send the HTTP
    request({
        "uri": `https://graph.facebook.com/v9.0/me/messenger_profile?access_token=${PAGE_ACCESS_TOKEN}`,
        "qs": { "access_token": PAGE_ACCESS_TOKEN },
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        if (!err) {
            console.log('persistent menu send')
        } else {
            console.log('persistent menu not send: ' + err)
        }
    }
    )
}

let disableSetUpPersistentMenu = (req, res) => {
    let request_body = {
        "persistent_menu": [
            {
                "locale": "default",
                "disabled_surfaces": ["CUSTOMER_CHAT_PLUGIN"],
                "composer_input_disabled": false,
                "call_to_actions": [
                    {
                        "title": "Đến trang chủ BookingCare",
                        "type": "web_url",
                        "url": "https://www.originalcoastclothing.com/",
                        "webview_height_ratio": "full"
                    },
                    {
                        "title": "Khởi động lại bot",
                        "type": "postback",
                        "payload": "RESTART_CHATBOT"
                    }
                ]

            }
        ]
    }

    //Send the HTTP
    request({
        "uri": `https://graph.facebook.com/v9.0/me/messenger_profile?access_token=${PAGE_ACCESS_TOKEN}`,
        "qs": { "access_token": PAGE_ACCESS_TOKEN },
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        if (!err) {


        } else {
            console.log('disable persistent menu not send: ' + err)
        }
    }
    )
}


module.exports = {
    getHomePage,
    getWebhook,
    postWebhook,
    setupProfile,
    setupPersistentMenu,
    disableSetUpPersistentMenu

}
