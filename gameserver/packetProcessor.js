var countInMatch = 0;
var usersInMatch = [];
var users = [];
var moment = require("moment");
var roomProcessor = require('./room.js');
var rooms = [];
var db;
var io;
const GOLD_WIN = 300;
const GOLD_LOSE = 350;
const GOLD_PANALTY = 400;
const MULTIPLY = 1;
/*
roomStatus
1 - 가위바위보 상태
    마음대로 퇴장해도 패널티X

2 - 게임 중 상태(카운터 업..)
    마음대로 퇴장하면 패널티..

3 - 게임 끝 상태
    이 때는 두 플레이어에게 승리/패배 확정 창 띄우고 10초뒤에 자동 퇴장 후 방 제거

4 - 플레이어 대기 상태
    두명 중 한 플레이어가 연결 끊어진 상태 -> 10초만 기다리다가 퇴장 후 방 제거
    나머지 한 플레이어도 연결이 끊어진다면 그 플레이어도 패널티
*/

exports = module.exports = function(_io,MATCHINTERVAL,_db,CLEANERINTERVAL){
    db = _db;
    io = _io;
    io.on("connection",function(socket){//연결 수립
        /*
        STATUS 1 : (HANDSHAKING)로그인 중 / 핸드쉐이크 전
        STATUS 2 : (IDLE)인게임 대기 / 핸드쉐이크 후
        STATUS 3 : (MATCHING)랜덤 매치메이킹중
        STATUS 4 : (INGAME)게임중
        */
        var user = {
            "socket":socket,
            "status":1,
            "room":null,
            "ready":false,
            "rsp":null,
            "lastping":moment()
        };
        users.push(user);
        console.log("["+users.length+"] 유저 입장");

        socket.emit("HANDSHAKEREQ");//특정 클라에겐 악수 요청..

        io.emit("COUNTER",users.length);//전체 클라에게 현재 들어온사람 쏘기

        socket.on('CHAT',function(chat){//채팅
            var user = findMyUser(socket);
            try{
                user.lastping = moment();
                var chat = chat.substring(0,40);
                if(user.userinfo!=null&&user!=null){
                    console.log("[채팅] "+user.userinfo.name+" : "+chat);
                    for(var i = 0;i<users.length;i++){
                        if(users[i].status==2
                            ||users[i].status==3){
                            users[i].socket.emit("CHAT",user.userinfo.name+" : "+chat);
                        }
                    }
                }
            }catch(e){
                console.log("[CHAT] ERROR");
            }
        });

        socket.on('HANDSHAKEADDITIONAL',function(userinfo){//핸드쉐이크
            var user = findMyUser(socket);
            try{
                user.lastping = moment();

                //db의 검증 필요함..

                var validateUserinfo = db.query("SELECT * FROM `users` WHERE `id` = ? AND `name` = ? AND `email` = ? AND `created_at` = ? AND `updated_at` = ? AND `wins` = ? AND `loses` = ? AND `gold` = ?",
                [userinfo.id,userinfo.name,userinfo.email,userinfo.created_at,userinfo.updated_at,userinfo.wins,userinfo.loses,userinfo.gold],
                function(error,results,fields){
                    if(error){
                        disconnectPlayer(socket,"0x01/1","데이터베이스 에러",user);
                        return;
                    }
                    if(results[0]==null||userinfo==null){
                        console.log("신원 확인 불가..");
                        disconnectPlayer(socket,"0x01/21","잘못된 유저 정보",user);
                        return;
                    }
                    if(results[0].id==userinfo.id){
                        user.userinfo = userinfo;

                        var userIndex = getUserIndexBySocket(user.socket);
                        if(userIndex==-1){
                            disconnectPlayer(socket,"0x01/22","잘못된 유저 정보 ["+user.userinfo.name+"]",user);
                            return;
                        }

                        users[userIndex] = user;
                        
                        
                        console.log(" ㄴ("+user.userinfo.name+"/"+user.userinfo.id+") 신원 확인 완료.");

                        if(results[0].online==1){
                            //이미 접속중..
                            user.userinfo = null;
                            disconnectPlayer(socket,"0x01/3","이미 접속중인 아이디 입니다. 브라우저의 다른 탭을 확인해 보세요. <a href='/auth/logout'>로그아웃</a>",user);
                            console.log(results[0].name+" 이미 접속중..");
                            return;
                        }
                        
                        socket.emit("ACCEPTED",userinfo);

                        var validateUserinfo = db.query("UPDATE users SET online = '1' WHERE id = ?",
                        [userinfo.id],
                        function(error,results,fields){
                            if(error){
                                disconnectPlayer(socket,"0x01/2","데이터베이스 에러",user);
                                return;
                            }
                            user.status = 2;
                            var welcomeMessage = "[환영] "+moment().format('서버 시각 MMMM Do YYYY, h:mm:ss a');
                            socket.emit("CHAT",welcomeMessage);//환영 메시지
                            
                        });

                    }else{
                        disconnectPlayer(socket,"0x01/2","잘못된 유저 정보",user);
                    }
                });
            }catch(e){
                console.log("[HANDSHAKEADDITIONAL] ERROR");
            }
        });

        socket.on('disconnect',function(reason){//퇴장(HARD QUIT)
            var user = findMyUser(socket);
            try{
                if(user.userinfo){
                    console.log(user.userinfo.name+" 유저가 퇴장을 시도합니다..");
                }else{console.log("[알수없는익명] 유저가 퇴장을 시도합니다..");

                }
                //user.lastping = moment();
                clearPlayer(user);
            }catch(e){
                console.log(e);
            }
        });

        socket.on('MATCHIN',function(reason){//매치 대기열 참여
            var user = findMyUser(socket);
            user.lastping = moment();
            console.log("["+user.userinfo.name+"] 매치 참여");
            user.status=3;
        });

        socket.on('MATCHOUT',function(reason){//매치 대기열 퇴장
            var user = findMyUser(socket);
            user.lastping = moment();
            console.log("["+user.userinfo.name+"] 매치에서 빠짐");
            user.status=2;
        });

        socket.on('ROOMENTER',function(packet){//최초로 게임 룸에 입장시..
            var user = findMyUser(socket);
            user.lastping = moment();
            user.status = 4;
            //room initialize
            var roomObj = {}
            var roomIndex = getRoomIndexByRoomName(user.room);
            console.log(user.room+" 이것으로 "+roomIndex+" 를 찾아냄");
            if(roomIndex>-1){
                console.log("[ROOM@"+rooms[roomIndex].roomID+"] 이미 개설되어 플레이어만 추가. + "+user.userinfo.name);
                roomAlreadyExist = true;
                rooms[roomIndex].players[1] = user;
                rooms[roomIndex].status = 2;
            }else{
                console.log("[ROOM@"+user.room+"] 개설합니다. 개설자 : "+user.userinfo.name);
                //개설된 방이 없다면
                roomObj.roomID = user.room;
                roomObj.players = [];
                roomObj.players[0] = (user);
                roomObj.rspDone = 0;
                roomObj.map = Create2DArray(16);
                roomObj.timePerTurn = 15;
                roomObj.timeTurn = -1;
                roomObj.current = -1;
                roomObj.status = 1;
                rooms.push(roomObj);
                roomIndex = getRoomIndexByRoomName(user.room);
            }
            setTimeout(function(){
                //2초가 지나도록 에네미 정보가 없다면..
                if(!rooms[roomIndex].players[1]||!rooms[roomIndex].players[0]){
                    closeRoom(io,db,roomIndex,"DISCONNECTUNKNOWN");
                    console.error("1.5초가 지나도록 에네미 정보 없어서 파기");
                }
            },1500)
            setTimeout(()=>{
                if(rooms[roomIndex]==undefined){
                    //3초가 지나도록 룸 정보 없으면..
                    closeRoom(io,db,roomIndex,"DISCONNECTUNKNOWN");
                    console.error("2초가 지나도록 룸 정보 없어서 파기");
                }else{
                    if(rooms[roomIndex].players.length==2&&rooms[roomIndex].status==2){
                        //두명 다 들어왔다면..
                        if(rooms[roomIndex].players[0].userinfo.id==0||rooms[roomIndex].players[1].userinfo.id==0){
                            console.error("룸을 만드는데, 둘중에 한명이 정보가 부족합니다..");
                            //둘중에 한명 정보 부족!
                            if(rooms[roomIndex].players[0].userinfo.id==0){
                                disconnectPlayer(rooms[roomIndex].players[0].socket,"0x06/1","플레이어 정보 오류. 새로고침 해주세요.",rooms[roomIndex].players[0]);
                            }
                            if(rooms[roomIndex].players[1].userinfo.id==0){
                                disconnectPlayer(rooms[roomIndex].players[1].socket,"0x06/1","플레이어 정보 오류. 새로고침 해주세요.",rooms[roomIndex].players[1]);
                            }
                            closeRoom(io,db,roomIndex,"DISCONNECTUNKNOWN");
                            return;
                        }else{
                            rooms[roomIndex].status = 3;
                            console.log("[룸서버@"+user.room+"] Room Object에 두명 모두 저장 완료. 가위바위보 시작합니다.");
                            console.log("ㄴ 플레이어 0 : "+rooms[roomIndex].players[0].userinfo.name+"("+rooms[roomIndex].players[0].userinfo.id+")");
                            console.log("ㄴ 플레이어 1 : "+rooms[roomIndex].players[1].userinfo.name+"("+rooms[roomIndex].players[1].userinfo.id+")");
                        }
                        io.to(user.room).emit("RSPSTART");
                    }
                }
            },2000);
            
        });

        socket.on('RSPSELECT',function(packet){//가위바위보 선택
            var user = findMyUser(socket);
            user.lastping = moment();
            var ridx = getRoomIndexByRoomName(user.room);
            var playerIndex = getPlayerInRoomById(ridx,user.userinfo.id);
            if(rooms[ridx]){
                rooms[ridx].rspDone++;
                if(rooms[ridx]==undefined){
                    console.error("아직 Room이 준비되지 않았습니다.");
                    closeRoom(io,db,ridx,"DISCONNECTUNKNOWN");
                    return;
                }
                rooms[ridx].players[playerIndex].rsp = packet;
                console.log("[룸서버@"+user.room+"]"+user.userinfo.name+"님이 "+packet+"선택");
                io.to(user.enemy).emit("RSPENEMYDONE");
                if(rooms[ridx].rspDone==2){
                    var rspResult1 = rooms[ridx].players[0].rsp;
                    var rspResult2 = rooms[ridx].players[1].rsp;
                    var winner = -1;
                    if(rspResult1==rspResult2){
                    }else{
                        //첫번째 플레이어 기준으로..
                        if(rspResult1=="R"){
                            if(rspResult2=="S"){
                                //플레이어 1이 이김
                                winner = 0;
                            }else if(rspResult2=="P"){
                                //플레이어 1이 짐..
                                winner = 1;
                            }
                        }else if(rspResult1=="S"){
                            if(rspResult2=="R"){
                                //플레이어 1이 짐
                                winner = 1;
                            }else if(rspResult2=="P"){
                                //플레이어 1이 이김
                                winner = 0;
                            }
                        }else if(rspResult1=="P"){
                            if(rspResult2=="R"){
                                //플레이어 1이 이김
                                winner = 0;
                            }else if(rspResult2=="S"){
                                //플레이어 1이 짐..
                                winner = 1;
                            }
                        }
                    }
                    if(winner>-1){
                        console.log("[룸서버@"+user.room+"] 가위바위보 ("+rooms[ridx].players[winner].userinfo.name+")님이 이김");
                        io.to(user.room).emit("RSPRESULT",rooms[ridx].players[winner].userinfo.id);
                        setTimeout(function(){
                            if(rooms[ridx]){
                                rooms[ridx].round = 1;
                                rooms[ridx].black = rooms[ridx].players[winner].userinfo.id;
                                rooms[ridx].current = winner;
                                rooms[ridx].timer = 0;
                                rooms[ridx].lastTurnPlayer = rooms[ridx].players[winner].userinfo.id;
                                rooms[ridx].turnTimer = rooms[ridx].timePerTurn;
                                rooms[ridx].turnLeftTime = rooms[ridx].timePerTurn;
                                
                                rooms[ridx].timeManager = setInterval(function(){
                                    if(rooms[ridx]!=null){
                                        rooms[ridx].timer++;
                                    }
                                },1000);

                                rooms[ridx].turnTimer = setInterval(function(){
                                    if(rooms[ridx].turnLeftTime>0){
                                        rooms[ridx].turnLeftTime--;
                                    }
                                    
                                    if(rooms[ridx].turnLeftTime==0){
                                        var blankPoint = getBlankMapPoint(ridx);
                                        var pos = blankPoint.split(",");
                                        processPlace(io,db,ridx,user,Number(pos[0]),Number(pos[1]));
                                    }
                                },1000);

                                io.to(user.room).emit("GAMETURN",{
                                    who:rooms[ridx].players[winner].userinfo.id,
                                    round:rooms[ridx].round,
                                    timer:rooms[ridx].timer,
                                    timePerTurn:rooms[ridx].timePerTurn
                                });
                            }else{
                                console.error("그 사이에 없어진 방..");
                            }
                        },3000);
                    }else{
                        console.log("[룸서버@"+user.room+"] 가위바위보 비김. 재시작..");
                        rooms[ridx].rspDone=0;
                        io.to(user.room).emit("RSPRESULT",-1);
                        setTimeout(function(){
                            io.to(user.room).emit("RSPSTART");
                        },3000);
                    }
                }
            }
        });
        socket.on('PLACE',function(packet){//바둑돌 착수
            var user = findMyUser(socket);
            user.lastping = moment();
            var ridx = getRoomIndexByRoomName(user.room);
            if(rooms[ridx]==undefined){
                console.error("PLACE@룸 정보가 없음!");
                return;
            }

            if(rooms[ridx].map[Number(packet.x)][Number(packet.y)]!="blank"){
                return;
            }

            
            clearInterval(rooms[ridx].turnTimer);
            rooms[ridx].turnTimer = setInterval(function(){
                if(rooms[ridx].turnLeftTime>0){
                    rooms[ridx].turnLeftTime--;
                }
                
                if(rooms[ridx].turnLeftTime==0){
                    var blankPoint = getBlankMapPoint(ridx);
                    var pos = blankPoint.split(",");
                    processPlace(io,db,ridx,user,Number(pos[0]),Number(pos[1]));
                }
            },1000);

            processPlace(io,db,ridx,user,packet.x,packet.y);
        });
        socket.on('GAMECHAT',function(packet){//게임 중 채팅
            var user = findMyUser(socket);
            user.lastping = moment();
            var message = packet.substring(0,20);
            if(user.userinfo!=null&&user!=null){
                console.log("[룸서버@"+user.room+"] [게임채팅 - "+user.userinfo.name+"] "+message);
                io.to(user.room).emit("GAMECHAT",{"message":message,"who":user.userinfo.id});
            }
        });
        socket.on('GAMEQUIT',function(packet){//강제 종료, 페이지 이동 이외의 이유로 사용자 퇴장
            var user = findMyUser(socket);
            user.lastping = moment();
        });
        socket.on('ROOMSOFTQUIT',function(packet){//사용자 룸 강제 퇴장..
            var user = findMyUser(socket);
            user.lastping = moment();

            var ridx = getRoomIndexByRoomName(user.room);
            var playerIndex = getPlayerInRoomById(ridx,user.userinfo.id);
            closeRoom(io,db,ridx,"SOFTQUIT",user.userinfo.id);
        });
        socket.on('CONNECT',function(packet){//친구에게 강제 연결..
            var user = findMyUser(socket);
            var me = packet.me;
            var enemy_name = packet.to;
            try{
                console.log("[게임서버] "+user.userinfo.name+"님이 "+enemy_name+" 에게 1:1 연결 요청..");
                var detected = false;
                for(var i = 0;i<users.length;i++){
                    if(users[i].userinfo.name==enemy_name){
                        detected = true;
                        //찾으면..
                        if(users[i].status!=2){
                            //상대방이 IDLE 상태가 아님
                            console.log("상대방이 IDLE이 아님!");
                            socket.emit("CONNECTRES",{"success":false,"message":"상대방이 게임 중이거나 매치 대기열에 있습니다."});
                        }else if(user.status!=2){
                            //내가 IDLE 상태가 아님
                            console.log("내가 IDLE이 아님!");
                            socket.emit("CONNECTRES",{"success":false,"message":"현재는 연결할 수 없습니다."});
                        }else{
                            console.log(user.userinfo.name+"->"+users[i].userinfo.name+"에게 성공적으로 요청 보냄.");
                            socket.emit("CONNECTRES",{"success":true});
                            io.to(users[i].socket.id).emit("CONNECTREQ",{"who":user.userinfo});
                        }
                    }
                }
                if(!detected){
                    console.log("해당 유저는 접속중이 아님..");
                    socket.emit("CONNECTRES",{"success":false,"message":"해당 유저는 접속 상태가 아닙니다."});
                }
                //해당 친구가 접속중이 아닙니다!
            }catch(e){

            }
        });
        socket.on('CONNECTACCEPT',function(packet){//친구에게 연결 수락..
            var user = findMyUser(socket);
            var enemyIndex = getUserIndexbyId(packet);
            if(users[enemyIndex]!=null){
                console.log(users[enemyIndex].userinfo.name+"님에게 승낙 소식 알림!");
                io.to(users[enemyIndex].socket.id).emit("CONNECTACCEPT");
                setTimeout(()=>{
                    makeRoom(users[enemyIndex],user);
                },1000);
            }
        });
        socket.on('CONNECTREJECT',function(packet){//친구에게 연결 거부..
            var user = findMyUser(socket);
            
            var enemyIndex = getUserIndexbyId(packet);
            console.log("CONNECTREJECT : "+packet+"/"+enemyIndex);
            if(users[enemyIndex]!=null){
                console.log(users[enemyIndex].userinfo.name+"님에게 거부 소식 알림!");
                io.to(users[enemyIndex].socket.id).emit("CONNECTREJECT");
            }
        });
    });

    /*
    * 매치메이커 로직
    */
    setInterval(function(){
        countInMatch = 0;
        usersInMatch = [];
        for(var i = 0;i<users.length;i++){
            if(users[i].status==3){
                countInMatch++;
                usersInMatch.push(users[i]);
                console.log("[매치메이커] "+users[i].userinfo.name+"("+users[i].userinfo.id+") 님이 들어옴.");
            }
        }
        //console.log("[매치메이커] "+usersInMatch.length+"/"+users.length+" 명 매치 대기 감지됨.");
        if(countInMatch<=1){
            //console.log("[매치메이커] "+countInMatch+"명 / 매치 인원 너무 적어서 취소.");
            return;//한명이면 취소
        }
        var rnd1 = -1;
        var rnd2 = -1;
        
        while(rnd1==rnd2){
            rnd1 = Math.round(Math.random()*(usersInMatch.length-1));
            rnd2 = Math.round(Math.random()*(usersInMatch.length-1));
        }
        console.log("[매치메이커] "+usersInMatch[rnd1].userinfo.name+"("+usersInMatch[rnd1].userinfo.id+") VS "+usersInMatch[rnd2].userinfo.name+"("+usersInMatch[rnd2].userinfo.id+")번 매칭..");
        makeRoom(usersInMatch[rnd1],usersInMatch[rnd2]);
    
    }, MATCHINTERVAL);

    /*
    * 유저 클리너 로직
    */
   setInterval(function(){
        //console.log("[USERSYNC] 게임서버 접속자와 DB를 동기화 합니다..");
        var queryWhere = "";
        for(var i = 0;i<users.length;i++){
            if(users[i].userinfo){
                queryWhere += users[i].userinfo.id+",";
            }
        }
        if(users.length>0){
            queryWhere = queryWhere.substr(0,(queryWhere.length-1));//마지막 쉼표 하나 자름..
            var query1 = "UPDATE users SET `online` = '1' WHERE id IN ("+queryWhere+");";
            var query2 = "UPDATE users SET `online` = '0' WHERE id NOT IN ("+queryWhere+");";
            db.query(query1,
            [],
            function(error,results,fields){
                if(error){
                    console.log("[USERSYNC] 에러 1 "+query1+"/"+error);
                    return;
                }
                db.query(query2,
                [],
                function(error,results,fields){
                    if(error){
                        console.log("[USERSYNC] 에러 2 "+query2+"/"+error);
                        return;
                    }
                    //console.log("[USERSYNC] 성공");
                });
            });
        }else{
            db.query("UPDATE users SET online = '0';",[],
            function(error,results,fields){
                if(error){
                    console.log("[USERSYNC] 에러 3 "+query3+"/"+error);
                    return;
                }
                console.log("[USERSYNC] 사람이 없어서 전체 offline 설정");
            });
        }

    }, CLEANERINTERVAL);

}
var rand = function() {
    return Math.random().toString(36).substr(2); // remove `0.`
};

var token = function() {
    return rand() + rand(); // to make it longer
};

function makeRoom(userObj1,userObj2){
    userObj1.status = 4;
    userObj2.status = 4;

    userObj1.enemy = userObj2.socket.id;
    userObj2.enemy = userObj1.socket.id;

    userObj1.socket.emit("MATCHED",userObj2.userinfo);
    userObj2.socket.emit("MATCHED",userObj1.userinfo);
    var room = userObj1.userinfo.id+"VS"+userObj2.userinfo.id+(moment().format("YMDHms"));

    userObj1.room = room;
    userObj2.room = room;

    userObj1.socket.join(room);
    userObj2.socket.join(room);

    console.log("[MAKEROOM] ["+rooms.length+"] "+userObj1.userinfo.name+"("+userObj1.userinfo.id+") VS "+userObj2.userinfo.name+"("+userObj2.userinfo.id+") : 매치 시작!");
}

function getUserIndexbyId(id){
    for(var i=0;i<users.length;i++){
        if(users[i]!=null&&(users[i].userinfo.id == id)){
            return i;
        }
    }
    return -1;
}
function getUserIndexBySocket(socket){
    for(var i=0;i<users.length;i++){
        if(users[i]!=null&&(users[i].socket == socket)){
            return i;
        }
    }
    return -1;
}

function getRoomIndexByRoomName(roomid){
    for(var i=0;i<rooms.length;i++){
        //console.log("["+i+"]"+rooms[i].roomID+"==?["+i+"]"+roomid);
        if(rooms[i]!=null&&(rooms[i].roomID == roomid)){
            return i;
        }
    }
    return -1;
}

function getPlayerInRoomById(roomid,uid){
    if(rooms[roomid]!=null){
        for(var i=0;i<rooms[roomid].players.length;i++){
            if(rooms[roomid].players[i].userinfo.id == uid){
                return i;
            }
        }
    }
    return -1;
}

function getBlankMapPoint(roomid){
    var rows = rooms[roomid].map.length;
    for(var i=1;i<rows;i++){
        for(var j=1;j<rows;j++){
            if(rooms[roomid].map[i][j] == "blank"){
                return i+","+j;
            }
        }
    }
}

function Create2DArray(rows) {
    var arr = [];
    for (var i=0;i<rows+5;i++) {
        arr[i] = new Array(rows);
        arr[i].fill("blank");
    }
    return arr;
}

function checkFiveRow(ridx,stone){
    var check33 = 0;
    var rows = rooms[ridx].map.length;
    for(var i=1;i<rows;i++){
        for(var j=1;j<rows;j++){
            // 가로(→) 방향 체크,
                if(rooms[ridx].map[j][i]==stone
                    &&rooms[ridx].map[j+1][i]==stone
                    &&rooms[ridx].map[j+2][i]==stone
                    &&rooms[ridx].map[j+3][i]==stone
                    &&rooms[ridx].map[j+4][i]==stone)
                    {
                        return [[j,i],[j+1,i],[j+2,i],[j+3,i],[j+4,i]];
                    }
            // 세로(↓) 방향 체크,
            if(rooms[ridx].map[i][j]==stone
                &&rooms[ridx].map[i][j+1]==stone
                &&rooms[ridx].map[i][j+2]==stone
                &&rooms[ridx].map[i][j+3]==stone
                &&rooms[ridx].map[i][j+4]==stone)
                {
                    return [[i,j],[i,j+1],[i,j+2],[i,j+3],[i,j+4]];
                }
            // 대각선(↘) 방향 체크,
            if(rooms[ridx].map[i][j]==stone
                &&rooms[ridx].map[i+1][j+1]==stone
                &&rooms[ridx].map[i+2][j+2]==stone
                &&rooms[ridx].map[i+3][j+3]==stone
                &&rooms[ridx].map[i+4][j+4]==stone)
                {
                    return [[i,j],[i+1,j+1],[i+2,j+2],[i+3,j+3],[i+4,j+4]];
                }
            // 대각선(↙) 방향 체크,
            if(rooms[ridx].map[i][j]==stone
                &&rooms[ridx].map[i+1][j-1]==stone
                &&rooms[ridx].map[i+2][j-2]==stone
                &&rooms[ridx].map[i+3][j-3]==stone
                &&rooms[ridx].map[i+4][j-4]==stone)
                {
                    return [[i,j],[i+1,j-1],[i+2,j-2],[i+3,j-3],[i+4,j-4]];
                }
            /*
            if(stone=="black"){
                //흑은 33 못하므로 33 체크..
                // 가로(→) 방향 체크,
                if(rooms[ridx].map[j][i]==stone
                    &&rooms[ridx].map[j+1][i]==stone
                    &&rooms[ridx].map[j+2][i]==stone)
                    {
                        check33++;
                    }
                // 세로(↓) 방향 체크,
                if(rooms[ridx].map[i][j]==stone
                    &&rooms[ridx].map[i][j+1]==stone
                    &&rooms[ridx].map[i][j+2]==stone)
                    {
                        check33++;
                    }
                // 대각선(↘) 방향 체크,
                if(rooms[ridx].map[i][j]==stone
                    &&rooms[ridx].map[i+1][j+1]==stone
                    &&rooms[ridx].map[i+2][j+2]==stone)
                    {
                        check33++;
                    }
                // 대각선(↙) 방향 체크,
                if(rooms[ridx].map[i][j]==stone
                    &&rooms[ridx].map[i+1][j-1]==stone
                    &&rooms[ridx].map[i+2][j-2]==stone)
                    {
                        check33++;
                    }
            }
            if(check33>1){
                return "E33";
            }*/
        }
    }
    return false;
}

function processPlace(io,db,ridx,user,posX,posY){
    
    console.log("[룸서버@"+user.room+"] "+rooms[ridx].players[rooms[ridx].current].userinfo.name+"님이 x "+posX+" / y "+posY+" 에 착수..");
    

    var stone = "white";
    if(rooms[ridx].players[rooms[ridx].current].userinfo.id==rooms[ridx].black){
        stone = "black";
    }

    rooms[ridx].round++;
    rooms[ridx].map[Number(posX)][Number(posY)] = stone;
    var checkEnd = checkFiveRow(ridx,stone);
    if(checkEnd!=false){
        if(checkEnd=="E33"){
            //33 취소
            io.to(user.socket.id).emit('PLACEERR','33');//착수 에러 패킷
            rooms[ridx].map[Number(posX)][Number(posY)] = "blank";
            return;
        }else{
            //게임 중단 패킷 전송
            io.to(user.room).emit('PLACE',{x:posX,y:posY,stone:stone,who:rooms[ridx].players[rooms[ridx].current].userinfo.id});//착수 패킷
            io.to(user.room).emit('ENDGAME',{testimony:checkEnd,winner:rooms[ridx].players[rooms[ridx].current].userinfo.id});//게임 끝 패킷
            var winner = rooms[ridx].players[rooms[ridx].current].userinfo.id;
            var loser = rooms[ridx].players[theOp(rooms[ridx].current)].userinfo.id;
            
            var QUERY_UPDATE_WINNER_RECORD = 
            db.query("UPDATE users SET `gold` = `gold`+"+gold("WIN")+" , `wins` = `wins`+1 WHERE `id` = '?';",
            [winner],
            function(error,results,fields){
                if(error){
                    console.log(error);
                }

                var QUERY_UPDATE_LOSER_RECORD = 
                db.query("UPDATE users SET `gold` = `gold`-"+gold("LOSE")+" , `loses` = `loses`+1 WHERE `id` = '?';",
                [loser],
                function(error,results,fields){
                    if(error){
                        console.log(error);
                    }

                    var QUERY_CREATE_RECORD_LOG = 
                    db.query("INSERT INTO `records` (`win`,`lose`,`additional`,`created_at`,`updated_at`) VALUES (?,?,?,now(),now())",
                    [winner,loser,'OLD'],
                    function(error,results,fields){
                        if(error){
                            console.log(error);
                        }
                        setTimeout(function(){
                            closeRoom(io,db,ridx);
                            console.log("[룸서버@"+user.room+"] 게임 끝.");
                        },3000);
                    });
                });
            });
            return;
        }
    }

    io.to(user.room).emit('PLACE',{x:posX,y:posY,stone:stone,who:rooms[ridx].players[rooms[ridx].current].userinfo.id});//착수 패킷


    //이제서야 턴 바꿈
    if(rooms[ridx].current==1){
        rooms[ridx].current = 0;
    }else{
        rooms[ridx].current = 1;
    }

    io.to(user.room).emit("GAMETURN",{
        who:rooms[ridx].players[rooms[ridx].current].userinfo.id,
        round:(rooms[ridx].round),
        timer:rooms[ridx].timer,
        timePerTurn:rooms[ridx].timePerTurn
    });//게임 턴 돌리는 패킷
    rooms[ridx].turnLeftTime = rooms[ridx].timePerTurn;
}

function closeRoom(io,db,ridx,reason='ENDGAME',who){
    if(rooms[ridx]){
        console.log("[룸서버@"+rooms[ridx].roomID+"]이 룸을 제거합니다.. 사유 : "+reason);
        if(rooms[ridx].turnTimer) clearInterval(rooms[ridx].turnTimer);
        if(rooms[ridx].timeManager) clearInterval(rooms[ridx].timeManager);
        //방 폭파 및 게임 중단..
        if(rooms[ridx].players[0]!=null) rooms[ridx].players[0].status = 2;
        if(rooms[ridx].players[1]!=null) rooms[ridx].players[1].status = 2;
    }
    
    if(reason=="SOFTQUIT"){
        //범인 -200골드 & 전적 제거..
        var QUERY_PUNISH = db.query("UPDATE users SET `gold` = `gold`-"+gold("PANALTY")+", `loses` = `loses`+1 WHERE id = ?",
        [who],
        function(error,results,fields){
            if(error){
                disconnectPlayer(socket,"0x04/1","데이터베이스 에러",user);
                return;
            }
            //console.log(ridx+":"+reason+":"+who);
            try{
                var criminal = 1;
                if(rooms[ridx].players[0].userinfo.id==who){
                    criminal = 0;
                }
                io.to(rooms[ridx].players[criminal].socket.id).emit("ROOMCLOSED",'DISCONNECTBYME');
                io.to(rooms[ridx].players[theOp(criminal)].socket.id).emit("ROOMCLOSED",'DISCONNECT');

                rooms[ridx].players[0].socket.leave(rooms[ridx].roomID);
                rooms[ridx].players[1].socket.leave(rooms[ridx].roomID);
                delete rooms[ridx];
            }catch(e){
                console.error(e);
            }
        });
        
    }else if(reason=="DISCONNECT"){
        //범인 -200골드 & 전적 제거..
        var QUERY_PUNISH = db.query("UPDATE users SET `gold` = `gold`-"+gold("LOSE")+", `loses` = `loses`+1 WHERE id = ?",
        [who],
        function(error,results,fields){
            if(error){
                disconnectPlayer(socket,"0x04/1","데이터베이스 에러",user);
                return;
            }
            try{
                if(rooms[ridx]==undefined){
                    return;
                }
                io.to(rooms[ridx].roomID).emit("ROOMCLOSED",reason);
                if(rooms[ridx]&&rooms[ridx].players[0]) rooms[ridx].players[0].socket.leave(rooms[ridx].roomID);
                if(rooms[ridx]&&rooms[ridx].players[1]) rooms[ridx].players[1].socket.leave(rooms[ridx].roomID);
                delete rooms[ridx];
            }catch(e){
                console.error(e);
            }
        });
        
    }else{
        try{
            if(rooms[ridx]==undefined){
                return;
            }
            io.to(rooms[ridx].roomID).emit("ROOMCLOSED",reason);
            if(rooms[ridx]&&rooms[ridx].players[0]) rooms[ridx].players[0].socket.leave(rooms[ridx].roomID);
            if(rooms[ridx]&&rooms[ridx].players[1]) rooms[ridx].players[1].socket.leave(rooms[ridx].roomID);
            delete rooms[ridx];
            
        }catch(err){
            console.log(err);
        }
    }
}

function disconnectPlayer(socket,code,msg,user){
    socket.emit("DISCONNECTED",{"code":code,"msg":msg});
    socket.disconnect(true);
    clearPlayer(user);
}

function clearPlayer(user){
    try{
        var hasRoomIndex = getRoomIndexByRoomName(user.room);
        for(var i = 0;i<users.length;i++){
            if(users[i].socket==user.socket){
                var target = i;
                if(users[target].userinfo){
                    var QUERY_SET_USER_OFFLINE = db.query("UPDATE users SET online = '0' WHERE id = ?",
                    [users[target].userinfo.id],
                    function(error,results,fields){
                        if(error){
                            console.log(users[target].userinfo.name+" 유저를 지우지 못했습니다.");
                        }
                        if(hasRoomIndex>-1){
                            closeRoom(io,db,hasRoomIndex,"DISCONNECT",user.userinfo.id);
                        }
                        users.splice(target,1);
                        io.emit("COUNTER",users.length);
                        console.log("["+users.length+"] "+user.userinfo.name+" 유저 스택에서 제거 완료");
                    });
                }else{
                    users.splice(target,1);
                    io.emit("COUNTER",users.length);
                    console.log("["+users.length+"] [알수없는익명] 유저 스택에서 제거 완료");
                }
            }
        }
    }catch(e){
        console.log("지우려고하는 유저가 없음.."+e);
    }
}

function theOp(who){
    if(who==1){
        return 0;
    }else{
        return 1;
    }
}

function gold(act){
    switch(act){
        case "WIN":
            return GOLD_WIN*MULTIPLY;
        break;
        case "LOSE":
            return GOLD_LOSE*MULTIPLY;
        break;
        case "PANALTY":
            return GOLD_PANALTY*MULTIPLY;
        break;
    }
}

function findMyUser(socket){
    for(var i = 0;i<users.length;i++){
        //if(users[i].userinfo) console.log(users[i].userinfo.name+":"+users[i].userinfo.id);
        if(users[i].socket==socket) return users[i];
    }
    return -1;
}
function findMyUserPointer(socket){
    for(var i = 0;i<users.length;i++){
        if(users[i].socket==socket) return i;
    }
    return -1;
}