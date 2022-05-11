const fs = require('fs');
const express = require('express');
const app = express();
const port = 8080;
var JsonDB = require('node-json-db').JsonDB;
const Config = require('node-json-db/dist/lib/JsonDBConfig').Config;
let cookieParser = require('cookie-parser');
const res = require('express/lib/response');

var db = new JsonDB(new Config("myDataBase", true, false, "/"));
var publicDir = require('path').join(__dirname,'/public');
app.use(express.static(publicDir));
app.use(express.urlencoded());
app.use(cookieParser());

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
    if (fs.existsSync("/myDataBase")) {
        let last = db.count("/myarray");
    } else {
        let last = 0;
    }

    let user = {
        amount: request.body.amount,
        size: request.body.size
    }

    response.cookie(last, user)
    
    /*db.push("/myarray[" + last + "]", {
        response.cookie("" + last, user)
    }, true);

    console.log("A new order was made, we now have " + last + " orders!");

    response.redirect("/cookie");*/
});

/*
app.get('/cookie', function(req, res) {

})
*/

app.listen(port, function() {
  console.log(`Example app listening on port ${port}!`)
});