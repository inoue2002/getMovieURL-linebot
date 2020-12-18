# 動画ツイート、動画ダウンロードLINEBot【Lambda】

LINEBotに動画を含んだツイートURL送信すると動画をダウンロードして送ってくれるLINEBotです。
Lambdaで実装しています。

# 環境変数の解説

```
//Twitter developerのconsumerKey
consumer_key: process.env.CONSUMERKEY,
//Twitter developerのconsumerSecret
consumer_secret: process.env.CONSUMERSECRET,
//LINEBotのaccessToken
access_token_key: process.env.TOKENKEY,
//LINEBotのシークレット
access_token_secret: process.env.TOKENSECRET,
```