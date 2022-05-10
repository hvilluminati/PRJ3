const express = require('express');
const app = express();
const port = 8080;
var JsonDB = require('node-json-db').JsonDB;
const Config = require('node-json-db/dist/lib/JsonDBConfig').Config;

var db = new JsonDB(new Config("myDataBase", true, false, "/"));
var publicDir = require('path').join(__dirname,'/public');
app.use(express.static(publicDir));
app.use(express.urlencoded());

app.get('/', function(req, res, next) {
    res.sendFile("/index.html", function(err) {
        if (err) {
            next(err)
        } else {
            console.log('Sent:', "index.html")
        }
    })
})

app.post('/', function(request, response){
    console.log(request.body.amount);
    console.log(request.body.size);
});

app.get('/', function(req, res, next) {
    res.sendFile("/index.html", function(err) {
        if (err) {
            next(err)
        } else {
            console.log('Sent:', "index.html")
        }
    })
})

app.listen(port, function() {
  console.log(`Example app listening on port ${port}!`)
});