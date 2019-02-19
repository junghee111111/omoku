const MATCHINTERVAL = 1000;
const PORT = 7376;

/*ssl server settings*/
var fs = require("fs");
var privatekey = fs.readFileSync('/etc/letsencrypt/live/omoku.net/privkey.pem').toString();
var cert = fs.readFileSync('/etc/letsencrypt/live/omoku.net/cert.pem').toString();
var ca = fs.readFileSync('/etc/letsencrypt/live/omoku.net/fullchain.pem').toString();
var options = {
    key:privatekey,
    cert:cert,
    ca:ca
}

var mysql = require("mysql");
var db = mysql.createPool({
    connectionLimit:200,
    host:'localhost',
    user:'omoku',
    password:'wjdgml11!',
    database:'omoku'
});

var http = require("https").Server(options,app).listen(PORT,function(){
    console.log("listening on *:"+PORT);
});

var io = require("socket.io")(http);
var app,packetProcessor;
var validateUserinfo = db.query("UPDATE users SET online = '0';",[],
function(error,results,fields){
    if(error){
        console.log("DB서버에 연결할 수 없습니다.");
        return;
    }
    console.log("DB서버에 연결 완료..");
    app = require("express")();
    packetProcessor = require('./packetProcessor.js')(io,MATCHINTERVAL,db);
});

