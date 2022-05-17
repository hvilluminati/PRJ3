const   express = require('express'),
        app = express(),
        port = 8080,
        fs = require('fs'),
        Config = require('node-json-db/dist/lib/JsonDBConfig').Config;

var     JsonDB = require('node-json-db').JsonDB,
        session = require('express-session'),
        cookieParser = require('cookie-parser'),
        publicDir = require('path').join(__dirname,'/public');

app.use(express.static(publicDir));
app.use(express.urlencoded());
app.use(cookieParser());
app.use(session({
    secret:'secret',
    resave:false,
    saveUninitialized:false,
    cookie:{
        maxAge: (60000 * 60 * 24)
    }
}));
        
var db = new JsonDB(new Config("myDataBase", true, false, "/"));
var user, 
    last = 0,
    tmpUser;

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
        if (str == req.cookies["connect.sid"])
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
    res.send("Hello!"); //replace with your data here
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

app.listen(port, function() {
    console.log(`Example app listening on port ${port}!`)
});