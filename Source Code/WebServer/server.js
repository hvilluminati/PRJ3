const   express = require('express'),
        app = express(),
        port = 8080,
        https = require('https'),
        fs = require('fs'),
        Config = require('node-json-db/dist/lib/JsonDBConfig').Config,
        events = require("events"),
        util = require("util"),
        { exec } = require('child_process');

var     JsonDB = require('node-json-db').JsonDB,
        session = require('express-session'),
        cookieParser = require('cookie-parser'),
        publicDir = require('path').join(__dirname,'/public');

require('log-timestamp');


app.use(express.static(publicDir));
app.use(express.urlencoded());
app.use(cookieParser());
app.use(session({
    secret:'secret',
    resave:false,
    saveUninitialized:false,
    cookie:{
        maxAge: Number.MAX_SAFE_INTEGER
    }
}));
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

const options = {
    key: fs.readFileSync(__dirname + '/localhost-key.pem'),
    cert: fs.readFileSync(__dirname + '/localhost.pem'),
};


var db = new JsonDB(new Config("myDataBase", true, false, "/"));
var user, 
    last = 0,
    tmpUser;


function sendSize(size)
{
    exec('sh ' + (size === 'small' ? 'small.sh' : (size === 'medium' ? 'medium.sh' : 'large.sh')),
    (error, stdout, stderr) => {
        console.log(stdout);
        console.log(stderr);
        if (error !== null) {
            console.log(`exec error: ${error}`);
        }
    });
}


function getDrank(cookie)
{
    var i = 0,
        exi = false,
        sid,
        ssid;

    for (i; i < db.count("/myarray"); i++)
    {
        sid = (db.exists("/myarray[" + i + "]") ? db.getData("/myarray[" + i + "]/sid").trim() : "");
        ssid = (sid != cookie ? db.getData("/myarray[" + i + "]/ssid").trim() : "");
        if (sid == cookie || ssid == cookie) { exi = true; break; }
    }

    (sid == cookie  ? console.log("The order has been recognized by cookie")  : 
    (ssid == cookie ? console.log("The order has been recognized by session") : ""));

    if (exi == true)
    {
        var order = db.getData("/myarray[" + i + "]");
        console.log(order.small.amount);
        if (order.small.amount != 0){
            order.small.amount--;
            sendSize('small');
            console.log("The customer now only has " + order.small.amount + " small beers left");
        } 
        else if (order.medium.amount != 0){
            order.medium.amount--;
            sendSize('medium');
            console.log("The customer now only has " + order.medium.amount + " medium beers left");
        } 
        else if (order.large.amount != 0){
            order.large.amount--;
            sendSize('large');
            console.log("The customer now only has " + order.large.amount + " large beers left");
        }
        else
            console.log("No drinks has been ordered by this customer");

        db.push("/myarray[" + i + "]", order);
    }
}

fs.watch(__dirname + '/qr_read/most_recent_qr', (event, filename) => {
    if (filename && event ==='change') {
        console.log("QR-scanner sent a QR-code");
        fs.readFile(__dirname + '/qr_read/most_recent_qr', 'utf8', (err, data) => {
            if (err) {
                console.error(err);
                return;
            }

            data = data.split(' ').join('+');
            getDrank(data.trim());
        });
    }
});

//__________________________________START PAGE_____________________________________________

app.get('/', function(req, res, next) {
    res.sendFile("/index.html", function(err) {
        if (err) {
            next(err)
        } else {
            console.log('Sent:', "index.html")
        }
    })
})

//__________________________DATABASE AND COOKIE HANDLING___________________________________

app.get('/cookie', function(req, res) {
    if(!req.session.content){
        req.session.count=1;
    }else{
        req.session.content+=1;
    }
    
    let i = 0, 
        exUser,
        str;

    for (i; i <= last; i++)
    {
        str = (db.exists("/myarray[" + i + "]") ? db.getData("/myarray[" + i + "]/sid") : "nop");
        var str2 = (db.exists("/myarray[" + i + "]") ? db.getData("/myarray[" + i + "]/ssid") : "nop");
        if (str == req.cookies["connect.sid"] || str2 == req.sessionID)
        {
            user = db.getData("/myarray[" + i + "]");
            exUser = true;
            console.log("User exists!")
            break;
        }
    }

    user = {
        sid:    req.cookies["connect.sid"]  ,
        ssid:   req.sessionID               ,
        count:  req.session.count           ,
        small:   {
            amount: user.small.amount + (tmpUser.size == "small" ? tmpUser.amount * 1 : 0)
        },
        medium:  {
            amount: user.medium.amount + (tmpUser.size == "medium" ? tmpUser.amount * 1 : 0)
        },
        large:   {
            amount: user.large.amount + (tmpUser.size == "large" ? tmpUser.amount * 1 : 0)
        }
    }

    str = "/myarray[" + (exUser == true ? i : last) + "]";
    db.push(str, user);
    console.log("A new order was made, we now have " + (exUser ? last : (last + 1)) + " orders!");

    res.redirect('/');
})

//_____________________________SEND DATA RQUESTED FROM CLIENT_____________________________

app.get('/data', function(req, res){
    let j = 0;
    for (j; j <= last; j++)
    {
        var sid = (db.exists("/myarray[" + j + "]") ? db.getData("/myarray[" + j + "]/sid") : "nop");
        var ssid = (db.exists("/myarray[" + j + "]") ? db.getData("/myarray[" + j + "]/ssid") : "nop");
        if (sid == req.cookies["connect.sid"] || ssid == req.sessionID)
        {
            res.json(db.getData("/myarray[" + j + "]"));
            break;
        }
    }
});

app.get('/PaymentWeb.html/data', function(req, res){
    let j = 0;
    for (j; j <= last; j++)
    {
        var sid = (db.exists("/myarray[" + j + "]") ? db.getData("/myarray[" + j + "]/sid") : "nop");
        var ssid = (db.exists("/myarray[" + j + "]") ? db.getData("/myarray[" + j + "]/ssid") : "nop");
        if (sid == req.cookies["connect.sid"] || ssid == req.sessionID)
        {
            res.json(db.getData("/myarray[" + j + "]"));
            break;
        }
    }
});

//_____________________________________MAKE ORDER_________________________________________

app.post('/', function(request, response){
    if (!fs.existsSync("/myDataBase") && db.exists("/myarray")) {
        last = db.count("/myarray");
    } else {
        last = 0;
    }

    tmpUser = {
        amount: request.body.amount,
        size:   request.body.size
    }

    user = {
        sid:    0,
        ssid:   0,
        count:  0,
        small:  {
            amount: 0
        },
        medium: {
            amount: 0
        },
        large:  {
            amount: 0
        }
    }

    response.redirect("/cookie");
});

var server = https.createServer(options, app);

server.listen(port, function() {
    console.log(`Example app listening on port ${port}!`)
});