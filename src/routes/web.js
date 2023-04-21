import express from "express";
import chatbotController from "../controllers/chatbotController"

let router = express.Router();

let initWebRoutes = (app) => {
    router.get("/", chatbotController.getHomePage);

    router.get("/webhook", chatbotController.getWebhook);
    router.post("/webhook", chatbotController.postWebhook);
    
    router.post("/setup-profile",chatbotController.setupProfile);

    router.post("/setup-persistent-menu",chatbotController.setupPersistentMenu);
    router.post("/disable-setup-persistent-menu",chatbotController.disableSetUpPersistentMenu);
    


    return app.use("/", router)
};

module.exports = initWebRoutes;