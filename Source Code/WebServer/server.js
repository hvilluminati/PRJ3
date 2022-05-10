const express = require('express');
const app = express();
const port = 8080;

var publicDir = require('path').join(__dirname,'/public');
app.use(express.static(publicDir));

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
