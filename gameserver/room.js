var moment = require("moment");


module.exports = function(io){
    io.on("connection",function(socket){
        //패킷.. 클라->서버
        
        //패킷..
        /*
        socket.on('RSPSELECTED',function(packet){//가위바위보 선택
        });
        socket.on('PLACE',function(packet){//바둑돌 착수
        });
        socket.on('CHAT',function(packet){//게임 중 채팅
        });
        socket.on('FORCEQUIT',function(packet){//두명 다 룸에서 퇴장 + 이유
        });
        socket.on('WAITRETURN',function(packet){//한명 나가서 돌아오길 기다리는 패킷을 나머지 한명에게 보냄.
        });*/
    });
}
exports = module.exports;