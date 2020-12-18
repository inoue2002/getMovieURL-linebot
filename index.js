"use strict";
// モジュール呼び出し
const crypto = require("crypto");
const line = require("@line/bot-sdk");
let twitter = require("twitter");
var t = new twitter({
  consumer_key: process.env.CONSUMERKEY,
  consumer_secret: process.env.CONSUMERSECRET,
  access_token_key: process.env.TOKENKEY,
  access_token_secret: process.env.TOKENSECRET,
});

// インスタンス生成
const client = new line.Client({ channelAccessToken: process.env.ACCESSTOKEN });

exports.handler = (event, context, callback) => {
  // 署名検証
  const signature = crypto
    .createHmac("sha256", process.env.CHANNELSECRET)
    .update(event.body)
    .digest("base64");
  const checkHeader = (event.headers || {})["X-Line-Signature"];
  const body = JSON.parse(event.body);
  const events = body.events;
  // console.log(events);

  // 署名検証が成功した場合
  if (signature === checkHeader) {
    events.forEach(async (event) => {
      let message;
      switch (event.type) {
        case "message":
          message = await messageFunc(event);
          break;
        case "follow":
          message = { type: "text", text: "動画付きツイートのURLを送りつけてみて。" };
          break;
        case "postback":
          message = await postbackFunc(event);
          break;
      }
      // メッセージを返信
      if (message != undefined) {
        client
          .replyMessage(body.events[0].replyToken, message)
          .then((response) => {
            const lambdaResponse = {
              statusCode: 200,
              headers: { "X-Line-Status": "OK" },
              body: '{"result":"completed"}',
            };
            context.succeed(lambdaResponse);
          })
          .catch((err) => console.log(err));
      }
    });
  }
  // 署名検証に失敗した場合
  else {
    console.log("署名認証エラー");
  }
};

const messageFunc = async function (event) {
  const message = await (() =>
    new Promise((resolve) => {
      let Str = event.message.text;
      let STR = Str.split("?");
      //console.log(STR[0]);
      let str = STR[0];
      let result = str.split("/");
      //console.log(result[5]);
      let TID = result[5];
      t.get("statuses/show/", { id: TID }, function (error, tweet, response) {
        if (!error) {
          //console.log(tweet.extended_entities.media[0].video_info.variants[2].url);
          //console.log(tweet.extended_entities.media[0].media_url_https);
          let mes = {
            type: "video",
            originalContentUrl:
              tweet.extended_entities.media[0].video_info.variants[2].url,
            previewImageUrl: tweet.extended_entities.media[0].media_url_https,
          };
          //console.log(mes);
          resolve(mes);
        } else {
          //console.log("error");
        }
      });
    }))();
  //取得できたらONかOFFかで処理を変える
  if (message !== undefined) {
      //console.log(message);
      return message;
  }
};
const postbackFunc = async function (event) {
  let message;
  message = { type: "text", text: "ポストバックイベントを受け付けました！" };
  return message;
};

