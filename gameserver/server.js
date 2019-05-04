const MATCHINTERVAL = 1000;
const CLEANERINTERVAL = 1000;
const PORT = 7376;
const PRODUCTION = false;
/*ssl server settings*/

var fs = require("fs");
var mysql = require("mysql");
var db;
if(PRODUCTION){
    var privatekey = fs.readFileSync('/etc/letsencrypt/live/omoku.net/privkey.pem').toString();
    var cert = fs.readFileSync('/etc/letsencrypt/live/omoku.net/cert.pem').toString();
    var ca = fs.readFileSync('/etc/letsencrypt/live/omoku.net/fullchain.pem').toString();

    var options = {
        key:privatekey,
        cert:cert,
        ca:ca
    }
    db = mysql.createPool({
        connectionLimit:200,
        host:'localhost',
        user:'omoku',
        password:'wjdgml11!',
        database:'omoku'
    });
}else{
    db = mysql.createPool({
        connectionLimit:200,
        host:'localhost',
        user:'root',
        password:'wang0321!',
        database:'omoku'
    });
}
var socketOption = {
    pingInterval: 2000,
    pingTimeout: 4000,
}

var app = require("express")();

if(PRODUCTION){
var http = require("https").createServer(options,app).listen(PORT,function(){
    console.log("HTTPS Server listening on *:"+PORT);
});
}else{
var http = require("http").Server(app).listen(
PORT,function(){
console.log("HTTP Server listening on "+PORT);
}
);
}
var io = require("socket.io")(http,socketOption);
var app,packetProcessor;
var validateUserinfo = db.query("UPDATE users SET online = '0';",[],
function(error,results,fields){
    if(error){
        console.log("DB서버에 연결할 수 없습니다.");
        return;
    }
    console.log("DB서버에 연결 완료..");
    packetProcessor = require('./packetProcessor.js')(io,MATCHINTERVAL,db,CLEANERINTERVAL);
});

