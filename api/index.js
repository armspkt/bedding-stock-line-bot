const express = require("express");
const line = require("@line/bot-sdk");
const axios = require("axios");
const qs = require("qs");

const config = {
  channelAccessToken: "xxx", // add your channel access token
  channelSecret: "xxx", // add your channel secret
};

const APPS_SCRIPT_URL = "xxx"; // add your google app script url

const app = express();

app.get("/api", (req, res) => res.send("Hello World!"));

app.post("/api/webhook", line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

const client = new line.Client(config);
async function handleEvent(event) {
  console.log("event", event);
  if (event.type !== "message" || event.message.type !== "text") {
    return Promise.resolve(null);
  }

  try {
    const data = await axios.post(
      APPS_SCRIPT_URL,
      qs.stringify({
        text: event.message.text,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    console.log(data.data);

    return client.replyMessage(event.replyToken, {
      type: "text",
      text: data.data.message,
    });
  } catch (err) {
    console.error(err);

    return client.replyMessage(event.replyToken, {
      type: "text",
      text: "กรุณาลองใหม่อีกครั้งค่ะ",
    });
  }
}

module.exports = app;
