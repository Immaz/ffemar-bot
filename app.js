const express = require('express')
const bodyParser = require('body-parser')
const app = express()
app.use(bodyParser.text());


// ---BINANCE
// const { Spot } = require('@binance/connector')

// const apiKey = 'JnXRg42XLD43nEpOOixX5202ynziwSIlaDu6Ymt5eE64sp5IpOOImIA85RyV4PMP'
// const apiSecret = '8uBtP4uGjMWgiLkQ5QZUbw6Hqq5tIaNcLeZjmCE8LmLMA8zmEsVvbqNHJlITeV6t'
// const client = new Spot(apiKey, apiSecret)
// app.post("/webhook", async function(req, res){
  
//   account = client.account().then(response => console.log(response.data));
//     res.send(account);

// });.
const { RestClientV5 } = require('bybit-api');

const client = new RestClientV5({
    key: 'uPUVLSYxOY1FLPNhjU',
    secret: 'mw1QxiwdmELJea3v2DnUVsebtNJjOGgwMNVl',
});

app.get('/', function (req, res) {
  res.send('Hello World')
});

//from trading view

async function quantity(price, capital, ticker){
const response = await client.getInstrumentsInfo({
  category: "spot",
  symbol : ticker,

}).then(response => {
  list = response.result.list[0]
  minOrderQty = list.lotSizeFilter.minOrderQty;
  qty = (capital / price) - ((capital / price) % minOrderQty);
  return Number(qty).toFixed(2);
});
return response
}


async function getAmount(){

 return  amount = await client.getWalletBalance({
    accountType: "CONTRACT",
    coin: "USDT"
  
  }).then(res => {
    amount = Number(res.result.list[0].coin[0].equity).toFixed(2);
    return amount;
  }
    ).catch(err => console.log(err));

}

async function takeProfits(symbol, tpPrice, total, percentage){

  const qty = total*(percentage/100);

  client
  .setTradingStop({
      category: 'linear',
      symbol: symbol,
      takeProfit: tpPrice,
      tpTriggerBy: 'MarkPrice',
      tpslMode: 'Partial',
      tpSize: String(qty),
      positionIdx: 0,
  })
  .then((response) => {
      console.log(response);
  })
  .catch((error) => {
      console.error(error);
  });

}


async function createOrder(data){

  var amount = await getAmount();
  var qty = String(Math.floor(amount / data.price));

  client
  .submitOrder(
    {
    category: "linear",
      symbol: String(data.symbol),
      side: String(data.direction),
      orderType: "Market",
      timeInForce: "GTC",
      qty: qty,
      takeProfit: String(data.takeprofit),
      stopLoss: String(data.stoploss),
      orderFilter: "Stop Order",
  }
  )
  .then((response) => {
    console.log(response);
    takeProfits(data.symbol, data.tp1, qty, data.tpqty1);
    takeProfits(data.symbol, data.tp2, qty, data.tpqty2);
    takeProfits(data.symbol, data.tp3, qty, data.tpqty3);
  })
  .catch((error) => {
      console.error(error, qty);
  });
  
  }
app.post("/webhook/createOrder", async function (req, res){

  var data = JSON.parse(req.body);
  createOrder(data);


});

app.listen(3000)
console.log("App is listening on port 3000");

// 13-sept-23