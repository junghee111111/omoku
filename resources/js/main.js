const PRODUCTION = true;
var gSTATUS;
var socket;
var UI_loginForm,UI_LoginSubmitBtnNormalDOM,UI_LoginSubmitBtn;
var UI_RegisterForm,UI_RegisterSubmitBtnNormalDOM,UI_RegisterSubmitBtn;
var auth;
var room;
var enemy;
var rspselection = null;
var globalTurnTimer;
var globalTurnTimeLeft;
var globalElapsedTime = 0;
var globalElapsedTimer;
var debug = false;
var selectX,selectY;
var placable = false;
var disconnectReason = false;
var Timeout_hideMyGameChat,Timeout_hideEnemyGameChat;
var Timeout_hideInvite = [];
var SELECTED_ITEM = -1;
var proccessPurchasesData;
var orientation_detected = 0;
const GOLD_WIN = 300;
const GOLD_LOSE = 350;
const GOLD_PANALTY = 400;
const MULTIPLY = 1;

/*UI Function*/
function disableForm(target,BusyDOM){
    target.attr("disabled","disabled");
    target.html(BusyDOM);
}

function reviveForm(target,normalDOM){
    target.removeAttr("disabled");
    target.html(normalDOM);
}

function showToast(message,icon="fa-spinner",spin=true,double=false,opacity=0.5){
    $(".overlay").show();
    $(".overlay>.Toast").show();
    $(".overlay>.Toast>span").html(message);
    //Class processing
    $(".overlay>.Toast").removeClass("double");
    $(".overlay>.Toast>i").removeClass();
    $(".overlay>.Toast>i").addClass("fa");
    $(".overlay>.Toast>i").addClass(icon);
    if(double){
        $(".overlay>.Toast").addClass("double");
    }
    spin ? $(".overlay>.Toast>i").addClass("spin") : "";
    $(".overlay").css("background-color","rgba(0,0,0,"+opacity+")");
}

function showModal(type='1',message,callback=function(){hideModal();},icon="fas fa-question-circle",spin=false,opacity=0.5){
    $(".overlay").css("background-color","rgba(0,0,0,"+opacity+")");
    $(".overlay").show();
    $(".overlay>.Modal").show();
    $(".overlay>.Modal>span").html(message);
    if(type=='1'){
        $("#ModalInput").show();
        $("#Btn_ModalCancel").show();
        $("#ModalInput").attr("type","text");
    }else if(type=='2'){
        $("#ModalInput").hide();
        $("#ModalInput").val("");
        $("#Btn_ModalCancel").show();
        $("#ModalInput").attr("type","text");
    }else if(type=='3'){
        if(icon=="fas fa-question-circle"){
            icon = "fas fa-exclamation-circle"
        }
        $("#ModalInput").hide();
        $("#ModalInput").val("");
        $("#Btn_ModalCancel").hide();
        $("#ModalInput").attr("type","text");
    }else if(type=='4'){
        $("#ModalInput").show();
        $("#Btn_ModalCancel").show();
        $("#ModalInput").attr("type","password");
    }

    //Class processing
    $(".overlay>.Modal>i").removeClass();
    $(".overlay>.Modal>i").addClass(icon);
    spin ? $(".overlay>.Modal>i").addClass("spin") : "";

    $('#Btn_ModalCancel').off('click');
    $("#Btn_ModalCancel").click(function(){
        hideModal();
    });
    $('#Btn_ModalOk').off('click');
    $("#Btn_ModalOk").click(callback);
    
}
function hideModal(){
    $(".overlay>.Modal>span").html("");
    $(".overlay>.Modal").hide();
    $(".overlay").hide();
}
function hideToast(){
    $(".overlay>.Toast>span").html("");
    $(".overlay>.Toast").hide();
    $(".overlay").hide();
}
function myTurnNotify(message="  회원님 차례입니다.",short=false,forever=false){
    $(".gameAction").show();
    $("#myturnNotifier").find("span").html(message);
    if(short){
        $("#myturnNotifier").css("width","70%");
    }else{
        $("#myturnNotifier").css("width","90%");
    }
    $("#myturnNotifier").css("bottom","-70px");
    
    $("#myturnNotifier").stop().animate({
        "bottom":'0px'
    },300);
    if(!forever){
        $("#myturnNotifier").delay(1000).animate({"bottom":"-70px"},300,function(){
        });
    }
}

function intervene(c){
    var wrapper = $(".ingame>.intervene");
    var obj = wrapper.children("."+c);
    var height = obj.attr("omoku-height");
    wrapper.show();
    obj.css("display","block");
    obj.css("height","0px");
    obj.css("margin-top","0px");
    obj.animate({
        height:height+"px",
        marginTop:"-"+(height/2)+"px"
    },200);
}
function interveneClose(){
    var wrapper = $(".ingame>.intervene");
    $(".ingame>.intervene>.dialog").hide();
    wrapper.hide();
}

function refreshPingData(data){
    if(data.loggedIn){
        auth = data;
        
        console.log(auth);
        $("*[omoku-data='name']").html(data.User.name);
        $("*[omoku-data='wins']").html(data.User.wins);
        $("*[omoku-data='loses']").html(data.User.loses);
        $("*[omoku-data='gold']").html(data.User.gold);
        $("*[omoku-data='winAll']").html(data.User.wins+data.User.loses);
        $("*[omoku-data='winRate']").html(calcWinRate(data.User.wins,data.User.loses));
    }
}

/*UI Function END*/

/* 커스텀 AJAX 매니저 */

function mAjax(act,url,type="GET",data={},dataType='json'){
    this.act = act;
    this.url = url;
    this.type = type;
    this.data = data;
    this.dataType = dataType;
    this._bs,this._e,this._s;
    this._c = function(jqXHR,textStatus){
        //after success & error
        console.log("["+act+"] -AJAX END- "+textStatus);
    }
}
mAjax.prototype.run = function(){
    console.log("[mAjax RUN] : "+this.act);
    //if not set, allocate default debug functions
    if(!this._bs){
        this._bs = function(jqXhr,settings){
            console.log("AJAX is about to run!");
        }
    }
    if(!this._e){
        this._e = function(jqXHR,textStatus,errorThrown){
            //after success & error
            console.log("AJAX ERROR! ("+errorThrown+") "+textStatus+"\n"+jqXHR);
        }
    }
    if(!this._s){
        this._s = function(data,textStatus,jqXHR){
            console.log("AJAX Data received! ("+textStatus+")"+data);
        }
    }
    $.ajaxSetup({
        headers:{
            'X-CSRF-TOKEN' : $("input[name='_token']").val()
        }
    })
    $.ajax({
        url:this.url,
        type:this.type,
        data:this.data,
        dataType:this.dataType,
        complete:this._c,
        beforeSend:this._bs,
        error:this._e,
        success:this._s
    })
}

/* custom Ajax manager end. */


/* 자체 API를 이용한 AJAX 통신 함수 정리*/

function AJAX_API_PING(_s=function(data){refreshPingData(data)}){
    var pingAjax = new mAjax('API@PING','/api/ping');
    pingAjax._s = _s;
    pingAjax.run();
}

function AJAX_API_RANKING(_s){
    var rankingAjax = new mAjax('API@RANKING','/api/ranking');
    rankingAjax._s = _s;
    rankingAjax.run();
}

function AJAX_SHOP_INDEX(_s){
    var itemAjax = new mAjax('SHOP@INDEX','/shop');
    itemAjax._s = _s;
    itemAjax.run();
}
function AJAX_BUY_ITEM(_s,itemid){
    var runner = new mAjax('SHOP@PURCHASE','/shop/purchase','post',{"itemid":itemid});
    runner._s = _s;
    runner.run();
}
function AJAX_PURCHASE_LIST(_s){
    var runner = new mAjax('SHOP@PURCHASEINDEX','/shop/purchase');
    runner._s = _s;
    runner.run();
}
function AJAX_USE_ITEM(_s,purchaseid){
    var runner = new mAjax('SHOP@USE','/shop/use','POST',{"purchaseid":purchaseid});
    runner._s = _s;
    runner.run();
}

jQuery(document).ready(function(){
    gSTATUS = 1;
    if(!debug){
        showToast("Initializing..");
        //main init
        UI_loginForm = $("#loginform");
        UI_LoginSubmitBtn = UI_loginForm.find("button[type='submit']");
        UI_LoginSubmitBtnNormalDOM = UI_LoginSubmitBtn.html();
        UI_RegisterForm = $("#registerform");
        UI_RegisterSubmitBtn = UI_RegisterForm.find("button[type='submit']");
        UI_RegisterSubmitBtnNormalDOM = UI_RegisterSubmitBtn.html();
        
        proccessPurchasesData = ((data)=>{
            var DOM = '';
            if(data){
                data.forEach(item => {
                    DOM += '<li itemid="'+item.item_id+'" itemname="'+item.item.item_name+'" price="'+item.item.price+'" itemtype="'+item.item.type+'">';
                    DOM += '<div class="imageHolder">';
                    if(item.item.type=="dol"){
                        DOM += '<img src="/img/'+item.item.type+'/'+item.item.image+'.black.png"/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br/>';
                        DOM += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<img src="/img/'+item.item.type+'/'+item.item.image+'.white.png"/>';
                    }
                    DOM += '</div>';
                    DOM += '<h1>'+item.item.item_name+'</h1>';
                    DOM += '<p>'+moment(item.expire_date).diff(moment(),'days')+'일 남음</p>';
                    DOM += '<button class="Btn_useItem" purchaseid="'+item.id+'">';
                    if(item.item.type=="dol"){
                        console.log(auth.User.dol);
                        if(auth.User.dol&&(auth.User.dol.id==item.id)){//purchase id 임
                            DOM += '<span class="fa fa-check"></span>&nbsp;착용중';
                        }else{
                            DOM += '<span class="fas fa-mitten"></span>&nbsp;착용하기';
                        }
                    }
                    DOM += '</button>';
                    DOM += '</li>';
                });
            }
            $(".inventory>ul.purchaseList").html(DOM);
            $(".inventory>ul.purchaseList>li").show();
            $("button.Btn_useItem").click(function(){
                callUseItem($(this).attr("purchaseid"),$(this).parent().attr("itemtype"));
            })
        });

        var afterPing = function(data,textStatus,jqXHR){
            if(data.loggedIn){
                procAfterLoginChecked(data);
                refreshPingData(data);
            }else{
                //$("section.login").fadeIn();
                procAfterLoginChecked(data);
                doOnOrientationChange();
            }
        };
        AJAX_API_PING(afterPing);

        //ajax login
        const loginFormSettings = {
            dataType:'json',
            success:procLoginSuccess,
            beforeSubmit:procLoginBeforeSubmit,
            error:procAjaxError
        }
        UI_loginForm.ajaxForm(loginFormSettings);

        //ajax register
        const registerFormSettings = {
            dataType:'json',
            success:procRegisterSuccess,
            beforeSubmit:procRegisterBeforeSubmit,
            error:procRegisterError,
            headers:{
                'X-CSRF-TOKEN' : $("input[name='_token']").val()
            }
        }
        UI_RegisterForm.ajaxForm(registerFormSettings);
    }
});

function procLoginSuccess(data){
    if(data.success){
        top.location.href="/";
    }else{
        var m = "";
        if(data.message=="E01"){
            m = "닉네임/비밀번호가 등록된 정보와 다릅니다.";
        }else{
            m = "알 수 없는 에러";
        }
        alert(m);
        reviveForm(UI_LoginSubmitBtn,UI_LoginSubmitBtnNormalDOM);
        return false;
    }
}

function procLoginBeforeSubmit(){
    var name = $("#loginform input[type='text']").val();
    var password = $("#loginform input[type='password']").val();

    disableForm(UI_LoginSubmitBtn,"요청 중..");

    if(!name||!password){
        alert("닉네임과 비밀번호를 모두 입력하세요.");
        reviveForm(UI_LoginSubmitBtn,UI_LoginSubmitBtnNormalDOM);
        return false;
    }
}

function procRegisterSuccess(data){
    if(data.success){
        top.location.href="/";
    }else{
        reviveForm(UI_RegisterSubmitBtn,UI_RegisterSubmitBtnNormalDOM);
        return false;
    }
}

function procRegisterBeforeSubmit(){
    disableForm(UI_RegisterSubmitBtn,"요청 중..");
}

function procRegisterError(error){
    var stack;
    stack = "서버 에러 발생 : ["+error.status+"]"+error.statusText;
    if(error.responseText.message){
        stack += "\n"+error.responseText.message;
    }
    console.log("Server Side ERROR Detected!");
    console.log("상태코드 : "+error.status);
    console.log("상태메세지 : "+error.statusText);
    console.log("응답메시지 : "+error.responseText);
    reviveForm(UI_RegisterSubmitBtn,UI_RegisterSubmitBtnNormalDOM);
    if(error.status=='422'){
        var message = "아래 사항을 수정해 주세요!\n-"
        var errObj = JSON.parse(error.responseText);
        if(errObj.errors.email){
            if(errObj.errors.email.includes("validation.unique")){
                message += "\n이미 가입된 이메일입니다.";
            }
        }
        if(errObj.errors.name){
            if(errObj.errors.name.includes("validation.unique")){
                message += "\n해당 닉네임은 이미 사용되고 있습니다.";
            }
            if(errObj.errors.name.includes("validation.max.string")){
                message += "\n닉네임이 너무 깁니다. (6자 이하)";
            }
        }
        if(errObj.errors.password){
            if(errObj.errors.password.includes("validation.min.string")){
                message += "\n비밀번호가 너무 짧습니다. (8자 이상)";
            }
            if(errObj.errors.password.includes("validation.confirmed")){
                message += "\n비밀번호와 비밀번호 확인이 일치하지 않습니다.";
            }
        }
        alert(message);
    }else{
        alert(stack);
    }
}


function procAjaxError(error){
    var stack;
    stack = "서버 에러 발생 : ["+error.status+"]"+error.statusText;
    if(error.responseText.message){
        stack += "\n"+error.responseText.message;
    }
    alert(stack);
    reviveForm(UI_LoginSubmitBtn,UI_LoginSubmitBtnNormalDOM);
    console.log("Server Side ERROR Detected!");
    console.log("상태코드 : "+error.status);
    console.log("상태메세지 : "+error.statusText);
    console.log("응답메시지 : "+error.responseText);
}

function connection_refused(e){
    console.log("CONNECTION FAILED");
    showToast("게임 서버에 연결할 수 없습니다.<br/>"+e,"fa-ban",false,true);
}

function procAfterLoginChecked(data){
    showToast("게임 서버 접속 허가 대기 중..");
    try{
        if(PRODUCTION){
            socket = io("https://www.omoku.net:7376",connection_refused);
        }else{
            socket = io("//localhost:7376",connection_refused);
        }
        auth = data;
        if(auth.loggedIn==true){
            $("*[omoku-data='name']").html(auth.User.name);
        }
        allocatePacketProcessor();
    }catch(e){
        connection_refused();
    }
    
    
}

function allocatePacketProcessor(){
    /*
    PAKCET PROCESSING VIA OPCODE
    */
    socket.on('connect_error',function(err){
        connection_refused(err);
    })
    socket.on('disconnect',function(packet){
        //HANDSHAKE PACKET
        console.log("Socket connection has been closed..");
        $("section.login").hide();
        $("section.lobby").hide();
        $("section.ingame").hide();
        if(!disconnectReason){
            showToast("연결이 끊어져 재접속 시도 중..<br/>이유 : "+packet+"<br/><a href='/'>여기를 눌러 강제 재접속</a>","fa-spinner",true,true)
        }
    });

    socket.on('reconnect',function(packet){
        //HANDSHAKE PACKET
        console.log("Reconnected!");
        hideToast();
        $("section.lobby").show();
    });

    socket.on('HANDSHAKEREQ',function(packet){
        //HANDSHAKE PACKET
        console.log("SERVER REQUEST HANDSHAKE..");
        showToast("게임 서버 인증 정보 요구..");
        socket.emit('HANDSHAKEADDITIONAL',auth.User);
    });

    socket.on('ACCEPTED',function(packet){
        //ACCEPTED PACKET
        console.log("GAME SERVER ACCEPTED!");
        hideToast();
        $("section.lobby").fadeIn();
        gSTATUS = 2;
    });

    socket.on('COUNTER',function(packet){
        //COUNTER PACKET
        console.log("COUNTER PACKET ARRIVED : "+packet);
        $("*[omoku-data='counter']").html(packet.all);
        $("*[omoku-data='counter/wait']").html(packet.wait);
        $("*[omoku-data='counter/matching']").html(packet.matching);
        $("*[omoku-data='counter/ingame']").html(packet.ingame);
        var DOM = "";
        for(var i = 0;i<packet.users.length;i++){
            var status = "";
            if(packet.users[i].status=="1"){
                status = "비회원";
            }else if(packet.users[i].status=="2"){
                status = "대기";
            }else if(packet.users[i].status=="3"){
                status = "매칭중";
            }else if(packet.users[i].status=="4"){
                status = "게임중";
            }
            DOM += "<li class='status"+packet.users[i].status+"'>"+packet.users[i].name+"<small>"+status+"</small></li>";
        }
        $("#currentList").html(DOM);
    });

    socket.on('CHAT',function(packet){
        //CHAT PACKET
        console.log("CHAT PACKET ARRIVED : "+packet);
        $("textarea#chatContents").append("\n"+packet);
        $("textarea#chatContents").scrollTop(100000);
    });

    socket.on('CONNECTRES',function(packet){
        if(packet.success){
            hideToast();
            showToast("친구를 찾았습니다! 수락을 기다리는 중..");
        }else{
            hideToast();
            showModal("3",packet.message);
        }
        AJAX_API_PING();
    });

    socket.on('CONNECTREQ',function(packet){
        var DOM = '<div class="inviteBlock" who="'+packet.who.id+'"><em class="fas fa-handshake"></em><strong>';
        DOM += packet.who.name
        DOM += '</strong> 님의 초대<br><button class="accept" who="'+packet.who.id+'">수락</button><button class="reject" who="'+packet.who.id+'">거절</button></div>';
        $(".inviteListWrapper").append(DOM);
        Timeout_hideInvite[Number(packet.who.id)] = setTimeout(function(){
            $(".inviteBlock[who='"+packet.who.id+"']").fadeOut();
            rejectConnect(packet.who.id);
        },5000);
        AJAX_API_PING();
    });

    socket.on('CONNECTACCEPT',function(packet){
        hideToast();
        showToast("연결 수락됨.. 게임을 곧 시작합니다!");
        AJAX_API_PING();
    });

    socket.on('CONNECTREJECT',function(packet){
        hideToast();
        showModal("3",'상대방이 연결을 거부했습니다.');
    });

    socket.on('MATCHED',function(packet){
        console.log("ENEMY MATCHED!");
        AJAX_API_PING();
        //FINDOP PACKET
        
        enemy = packet;
        console.log(enemy);
        $(".startBtnWrapper").fadeOut(150,function(){
            $(".startBtn").hide();
            $("#running").hide();
            $("#matched").show();
            $(".startBtnWrapper").fadeIn(250);
            setTimeout(function(){
                $(".startBtn").show();
                $("#matched").hide();
            },4000)
        });
        $("*[omoku-data='enemy-name']").html(enemy.name);
        $("*[omoku-data='enemy-winAll']").html(enemy.wins+enemy.loses);
        $("*[omoku-data='enemy-wins']").html(enemy.wins);
        $("*[omoku-data='enemy-loses']").html(enemy.loses);
        $("*[omoku-data='enemy-winRate']").html(calcWinRate(enemy.wins,enemy.loses));
        $(".board>button").removeClass("on");//바둑판 청소..
        setTimeout(function(){
            showToast(enemy.name+"님과 게임을 시작합니다.","fa-check",false);
        },1000);
        setTimeout(function(){
            $("section.lobby").fadeOut();
            hideToast();
            intervene("ready");
            $("section.ingame").fadeIn(500,function(){
                socket.emit('ROOMENTER');
            });
        },2000);
    });

    socket.on('RSPSTART',function(packet){
        console.log("RSPGAME START");
        intervene("rsp");

        //UI 초기화
        var h1 = "가위바위보 승자가 흑돌을 쥡니다.";
        var h2 = '오목은 흑돌이 선공입니다.<br/><i omoku-data="rsptimer">7</i>&nbsp;초안에 선택해주세요.';
        $(".dialog.quitWarning>.forcequit").show();
        $(".rspdone").removeClass("fa-hand-rock");
        $(".rspdone").removeClass("fa-hand-scissors");
        $(".rspdone").removeClass("fa-hand-paper");
        $(".rspdone").removeClass("fas");
        $(".rspdone").addClass("fa");
        $(".rspdone").addClass("fa-check");
        $(".rspdone").hide();
        $(".rsprotate").show();
        $(".mybutton.selected").removeClass("selected");
        $(".mybutton").show();
        $(".dialog.rsp .timer").css("width","100%");
        $(".dialog.rsp h1[omoku-data='title']").html(h1);
        $(".dialog.rsp h2").html(h2);
        //생각하는 애니메이션
        var rspAnim = 1;
        var rspTimeLeft = 7;
        var rspAnimInterval = setInterval(function(){
            $(".rsprotate").removeClass("fa-hand-rock");
            $(".rsprotate").removeClass("fa-hand-scissors");
            $(".rsprotate").removeClass("fa-hand-papaer");
            if(rspAnim==1){
                $(".rsprotate").addClass("fa-hand-rock");
            }else if(rspAnim==2){
                $(".rsprotate").addClass("fa-hand-scissors");
            }else{
                $(".rsprotate").addClass("fa-hand-paper");
            }
            rspAnim++;
            if(rspAnim==4){
                rspAnim = 1;
            }
        },100);
        var countdownInterval = setInterval(function(){
            if(rspTimeLeft>0){
                rspTimeLeft--;
                $("i[omoku-data='rsptimer']").html(rspTimeLeft);
            }else{
                clearInterval(countdownInterval);
            }
        },1000);
        $(".intervene>.rsp>.timer").stop().animate({
            width:'0%'
        },7000,'linear',function(){
            clearInterval(rspAnimInterval);
            clearInterval(countdownInterval);
            $(".rsprotate").hide();
            $(".rspdone").fadeIn();
            if(!rspselection){
                //아직도 선택 안했나?
                var rand = Math.floor(Math.random()*3)+1;
                var selection = "R";
                if(rand==2){
                    selection = "S"
                }else if(rand==3){
                    selection = "P";
                }
                $(".rspbutton.mybutton").hide();
                $(".mybutton[omoku-rspdata='"+selection+"']").fadeIn();
                $(".mybutton[omoku-rspdata='"+selection+"']").addClass("selected");
                socket.emit("RSPSELECT",selection);
                //강제 선택 후 패킷 전송
            }
        });
    });

    socket.on('RSPENEMYDONE',function(packet){
        console.log("RSPGAME ENEMY HAS SELECTED");
        //가위바위보 상대방 선택.. 애니메이션.
        $(".rsprotate").hide();
        $(".rspdone").fadeIn();
    });

    socket.on('RSPRESULT',function(packet){
        AJAX_API_PING();
        $(".intervene>.rsp>.timer").stop();
        console.log("RSPGAME RESULT PACKET / WINNER : "+packet);
        var h1,h2;
        if(packet==-1){
            h1="무승부입니다!";
            h2="가위바위보를 곧 다시 실시합니다..";
            $(".dialog.rsp>div>.rspdone").removeClass("fa-check");
            $(".dialog.rsp>div>.rspdone").removeClass("fa");
            $(".dialog.rsp>div>.rspdone").addClass("fas");
            if(rspselection=="R"){
                $(".dialog.rsp>div>.rspdone").addClass("fa-hand-rock");
            }else if(rspselection=="S"){
                $(".dialog.rsp>div>.rspdone").addClass("fa-hand-scissors");
            }else{
                $(".dialog.rsp>div>.rspdone").addClass("fa-hand-paper");
            }
        }else{
            if(packet==auth.User.id){
                //내가 이김
                h1 = auth.User.name+"님의 승리!";
                h2 = auth.User.name+"님이 선공합니다.";
                $(".dialog.rsp>div>.rspdone").removeClass("fa-check");
                $(".dialog.rsp>div>.rspdone").removeClass("fa");
                $(".dialog.rsp>div>.rspdone").addClass("fas");
                if(rspselection=="R"){
                    $(".dialog.rsp>div>.rspdone").addClass("fa-hand-scissors");
                }else if(rspselection=="S"){
                    $(".dialog.rsp>div>.rspdone").addClass("fa-hand-paper");
                }else{
                    $(".dialog.rsp>div>.rspdone").addClass("fa-hand-rock");
                }
            }else{
                //남이 이김
                h1 = enemy.name+"님의 승리!";
                h2 = enemy.name+"님이 선공합니다.";
                $(".dialog.rsp>div>.rspdone").removeClass("fa-check");
                $(".dialog.rsp>div>.rspdone").removeClass("fa");
                $(".dialog.rsp>div>.rspdone").addClass("fas");
                if(rspselection=="R"){
                    $(".dialog.rsp>div>.rspdone").addClass("fa-hand-paper");
                }else if(rspselection=="S"){
                    $(".dialog.rsp>div>.rspdone").addClass("fa-hand-rock");
                }else{
                    $(".dialog.rsp>div>.rspdone").addClass("fa-hand-scissors");
                }
            }
        }
        $(".dialog.rsp>h1[omoku-data='title']").html(h1);
        $(".dialog.rsp>h2").html(h2);

    });

    socket.on('GAMETURN',function(packet){
        AJAX_API_PING();
        interveneClose();
        //게임 턴 시작!
        console.log("GAMETURN .. "+packet.round+" 라운드 / "+packet.who+"의 턴/ "+packet.timer+"초 경과");

        globalElapsedTime = packet.timer;
        globalTurnTimeLeft = packet.timePerTurn;

        $("*[omoku-data='state']").html(secondsConvert(globalElapsedTime));
        $("*[omoku-data='phase']").html(packet.round+"번째 착수");
        
        
        if(globalTurnTimer!=null){
            clearInterval(globalTurnTimer);
        }
        if(!globalElapsedTimer){
            globalElapsedTimer = setInterval(function(){
                globalElapsedTime++;
                $("*[omoku-data='state']").html(secondsConvert(globalElapsedTime));
            },1000);
        }
        
        $("*[omoku-data='turn-time-left']").html(" 15초 남음");
        globalTurnTimer = setInterval(function(){
            if(globalTurnTimeLeft>0){
                globalTurnTimeLeft--;
                if(globalTurnTimeLeft==10&&placable){
                    myTurnNotify("10초 남았습니다.",true);
                }
                if(globalTurnTimeLeft==5&&placable){
                    myTurnNotify("5초 남았습니다.",true);
                }
                $("*[omoku-data='turn-time-left']").html(" "+globalTurnTimeLeft+"초 남음");
            }else{
                $("*[omoku-data='turn-time-left']").html(" 아무곳이나 착수합니다.");
            }
        },1000);
        if(packet.who==auth.User.id){
            //나인가?
            placable = true;
            myTurnNotify();
            $("*[omoku-data='turn']").html(auth.User.name+" 차례");
            $("section.ingame .ingameBar.me").removeClass("off");
            $("section.ingame .ingameBar.me").addClass("on");
            $("section.ingame .ingameBar.enemy").removeClass("on");
            $("section.ingame .ingameBar.enemy").addClass("off");
            $("section.ingame .ingameBar.me small.turn").show();
            $("section.ingame .ingameBar.enemy small.turn").hide();
        }else{
            placable = false;
            //내가 아니면..
            $("*[omoku-data='turn']").html(enemy.name+" 차례");
            $("section.ingame .ingameBar.me").removeClass("on");
            $("section.ingame .ingameBar.me").addClass("off");
            $("section.ingame .ingameBar.enemy").removeClass("off");
            $("section.ingame .ingameBar.enemy").addClass("on");
            $("section.ingame .ingameBar.me small.turn").hide();
            $("section.ingame .ingameBar.enemy small.turn").show();
            $(".gameAction>#placeApplier").hide();
        }
    });

    socket.on('PLACE',function(packet){
        //착수
        console.log("PLACE .. 누가 ? "+packet.who+" X : "+packet.x+" /  Y : "+packet.y+" 돌 : "+packet.stone);
        clearInterval(globalTurnTimer);
        var c = "pos"+packet.x+"-"+packet.y;
        $(".board>button").removeClass("on");
        
        $(".board>button."+c).addClass("on");
        $(".board>button."+c).addClass(packet.stone);
        if(packet.who==auth.User.id){
            //내가 놓는것인가?
            $("aside.gameAction>#placeApplier").fadeOut();
            if(auth.User.dol){
                $(".board>button."+c).addClass(auth.User.dol.item.image);
            }
        }else{
            //적이 놓은것인가?
            if(enemy.dol){
                $(".board>button."+c).addClass(enemy.dol.item.image);
            }else{

            }
        }
    });

    socket.on('PLACEERR',function(packet){
        //착수
        console.log("PLACEERR .. "+packet);
        if(packet=="33"){
            $("aside.gameAction>#placeApplier").fadeOut();
            myTurnNotify("흑은 33을 둘 수 없습니다.",true);
            placable = true;
        }
    });

    socket.on('ENDGAME',function(packet){
        var winner;
        var win = false;
        placable = false;
        clearInterval(globalElapsedTimer);
        clearInterval(globalTurnTimer);
        if(packet.winner==auth.User.id){
            winner = auth.User.name;
            win = true;
        }else{
            winner = enemy.name;
        }
        myTurnNotify(winner+"님이 이겼습니다!",false,true);

        for(var i=0;i<packet.testimony.length;i++){
            y = packet.testimony[i][0];
            x = packet.testimony[i][1];
            var indicator = "pos"+y+"-"+x;
            $("button[pos='"+indicator+"']").addClass("on");
        }
        setTimeout(function(){
            intervene("endgame");
            var h1 = "패배했습니다.";
            h2 = '<i class="gold fa fa-dot-circle">&nbsp;'+GOLD_LOSE+'골드</i>를 잃었습니다!<br/>잠시 뒤 자동 퇴장합니다.';
            if(win){
                h1 = "승리했습니다!";
                h2 = '<i class="gold fa fa-dot-circle">&nbsp;'+GOLD_WIN+'골드</i>를 얻었습니다!<br/>잠시 뒤 자동 퇴장합니다.';
            }
            $(".dialog.endgame>h1[omoku-data='title']").html(h1);
            $(".dialog.endgame>h2").html(h2);
        },2000);
    });

    socket.on('ROOMCLOSED',function(packet){
        var AJAX_API_PING_s = function(data){
            refreshPingData(data)
        };
        AJAX_API_PING(AJAX_API_PING_s);
        placable = false;
        //룸 데이터 정리..
        clearInterval(globalElapsedTimer);
        clearInterval(globalTurnTimer);
        room = null;
        enemy = null;
        rspselection = null;
        globalTurnTimeLeft = 0;
        globalElapsedTime = 0;
        $("section.gameBoard>.board>button").removeClass("white");
        $("section.gameBoard>.board>button").removeClass("black");
        $("section.gameBoard>.board>button").removeClass("on");
        $(".board>button").removeClass (function (index, css) {
            return (css.match (/(^|\s)dol\S+/g) || []).join(' ');
        });

        setTimeout(function(){
            interveneClose();
            $(".runningBtn.matched").hide();
            $(".startBtn").show();
            showToast("방을 퇴장하는 중입니다..");
            $("section.ingame").fadeOut(300,function(){
                $("section.lobby").fadeIn(300,function(){
                    hideToast();
                    if(packet=="ENDGAME"){
                        console.log("ROOMCLOSED 패킷 : 정상적인 게임 종료로 인한 퇴장..");
                    }else if(packet=="DISCONNECT"){
                        console.log("ROOMCLOSED 패킷 : 상대방의 비정상적 연결 끊김으로 강제퇴장..");
                        alert("상대방과의 연결이 끊어졌습니다.\n상대방에겐 "+GOLD_PANALTY+"골드 차감의 패널티를 부여했습니다.\n\n게임에 불편을 끼쳐 죄송합니다.");
                    }else if(packet=="DISCONNECTBYME"){
                        console.log("ROOMCLOSED 패킷 : 상대방의 비정상적 연결 끊김으로 강제퇴장..");
                        alert("게임 중 퇴장 패널티로 "+GOLD_PANALTY+"골드 차감되었습니다.");
                    }else if(packet=="DISCONNECTUNKNOWN"){
                        console.log("ROOMCLOSED 패킷 : 상대방의 비정상적 연결 끊김으로 강제퇴장..");
                        alert("상대방이 응답하지 않습니다.");
                    }
                });
            });
        },500);
    });

    socket.on('DISCONNECTED',function(packet){
        disconnectReason = true;
        placable = false;
        //룸 데이터 정리..
        clearInterval(globalElapsedTimer);
        clearInterval(globalTurnTimer);
        room = null;
        enemy = null;
        rspselection = null;
        globalTurnTimeLeft = 0;
        globalElapsedTime = 0;
        $("section.gameBoard>.board>button").removeClass("white");
        $("section.gameBoard>.board>button").removeClass("black");
        $("section.gameBoard>.board>button").removeClass("on");
        interveneClose();
        $(".runningBtn.matched").hide();
        $("section.login").hide();
        $("section.lobby").hide();
        $("section.ingame").hide();
        showToast("에러코드 "+packet.code+"<br/>"+packet.msg,"fa-ban",false,true);
    });
    socket.on('GAMECHAT',function(packet){
        //CHAT PACKET
        console.log("GAME CHAT PACKET ARRIVED : "+packet);
        if(auth.User.id==packet.who){
            $(".me .chatBalloon").html(packet.message);
            $(".me .chatBalloon").show();
            $(".me .chatBalloon").css("bottom","80px");
            $(".me .chatBalloon").animate({
                bottom:'60px'
            },200,function(){
                clearTimeout(Timeout_hideMyGameChat);
                Timeout_hideMyGameChat = setTimeout(function(){
                    $(".me .chatBalloon").fadeOut();
                },3000);
            });
        }else{
            $(".enemy .chatBalloon").html(packet.message);
            $(".enemy .chatBalloon").show();
            $(".enemy .chatBalloon").css("top","40px");
            $(".enemy .chatBalloon").animate({
                top:'60px'
            },200,function(){
                clearTimeout(Timeout_hideEnemyGameChat);
                Timeout_hideEnemyGameChat = setTimeout(function(){
                    $(".enemy .chatBalloon").fadeOut();
                },3000);
            });
        }
    });
}

$("#chatInput").keypress(function(event){
    if(event.keyCode==13){
        var chat = $(this).val();
        chat = chat.substring(0,40);
        socket.emit('CHAT',chat);
        $(this).val("");
        $(this).focus();
    }
});

$("#ingameChatBody").keypress(function(event){
    if(event.keyCode==13){
        sendIngameChat($(this).val());
    }
});

$("#chatSubmit").click(function(){
    sendIngameChat($("#ingameChatBody").val());
});
$("#connectFriend").click(function(){
    hideToast();
    var afterConnect = function(){
        var enemy = $("#ModalInput").val();
        hideModal();
        showToast("연결 요청 중..");
        socket.emit("CONNECT",{"me":auth.User.id,"to":enemy});
    }
    showModal(1,"연결할 친구의 닉네임을 입력해주세요.",afterConnect,"fa fa-user-friends");
});

$("#Btn_changeName").click(function(){
    var processChangeName = function(){
        var data = $("#ModalInput").val().trim();
        var _token = $(".Modal input[name='_token']").val();
        if(data==""){
            return;
        }
        var majax = new mAjax('Auth@changeName','/auth/changeName','post',{"name":data,"token":_token},'json');
        majax._s = function(response){
            if(response.success){
                showModal("3","닉네임이 변경되었습니다!",function(){hideModal();},"fa fa-check");
                AJAX_API_PING();
            }else{
                showModal("3",response.msg,function(){hideModal();},"fa fa-ban");
            }
        }
        majax.run();
    }
    
    showModal(1,"바꿀 닉네임을 입력하세요.(6자이내)",processChangeName);
});
$("#Btn_changePasswd").click(function(){
    var processChangePwd = function(){
        var data = $("#ModalInput").val().trim();
        var _token = $(".Modal input[name='_token']").val();
        if(data==""){
            return;
        }
        var majax = new mAjax('Auth@changePassword','/auth/changePassword','post',{"password":data},'json');
        majax._s = function(response){
            if(response.success){
                showModal("3","비밀번호가 변경되었습니다!",function(){hideModal();},"fa fa-check");
                AJAX_API_PING();
            }else{
                showModal("3",response.msg,function(){hideModal();},"fa fa-ban");
            }
        }
        majax._e = function(response){
            alert("비밀번호 변경중 오류가 발생했습니다.\n비밀번호가 8자 이상인지 확인해보세요.");
        }
        majax.run();
    }
    showModal(4,"바꿀 비밀번호를 입력하세요.",processChangePwd,"fas fa-key");
});
$("#Btn_removeUser").click(function(){
    var proccessRemoveUser = function(){
        var data = $("#ModalInput").val().trim();
        var _token = $(".Modal input[name='_token']").val();
        if(data==""){
            return;
        }
        var majax = new mAjax('Auth@removeAccount','/auth/removeAccount','post',{"allow":data},'json');
        majax._s = function(response){
            if(response.success){
                alert("탈퇴처리 되었습니다.\n이용해 주셔서 감사합니다!");
                socket.close();
                top.location.href="/auth/logout";
            }else{
                showModal("3",response.msg,function(){hideModal();},"fa fa-ban");
            }
        }
        majax.run();
    }

    showModal(1,"회원탈퇴 후 복구는 불가능합니다.<br/>탈퇴하려면 <em class=\"colorRed\">계정탈퇴동의</em> 라고 정확히 입력해주세요.",proccessRemoveUser,"fa fa-user-slash");
});
$("#startMatch").click(function(){
    socket.emit('MATCHIN');
});
$("#running").click(function(){
    socket.emit('MATCHOUT');
});
$(".rspbutton.mybutton").click(function(){
    var data = $(this).attr("omoku-rspdata");
    rspselection = data;
    $(".rspbutton.mybutton").hide();
    $(this).fadeIn();
    $(this).addClass("selected");
    //$(".intervene>.rsp>.timer").stop();
    socket.emit("RSPSELECT",data);
});
function secondsConvert(seconds){
    var minutes = Math.floor(seconds/60);
    var pureSeconds = seconds%60;
    var minutesStr,secondsStr = "00";
    if(minutes!=0&&minutes<10){
        minutesStr = "0"+minutes;
    }else if(minutes>=10){
        minutesStr = minutes;
    }
    if(pureSeconds!=0&&pureSeconds<10){
        secondsStr = "0"+pureSeconds;
    }else if(pureSeconds!=0&&pureSeconds>=10){
        secondsStr = pureSeconds;
    }
    var final = minutes+":"+pureSeconds;
    return final;
}

$("section.gameBoard>.board>button").each(function(i,obj){
    var pos = $(this).attr("pos");
    pos = pos.split('pos');
    var posNew = pos[1];
    pos = posNew.split("-");
    var initX = 20;
    var initY = 20;
    var unitX = 12;
    var unitY = 12;
    var posX = pos[0];
    var posY = pos[1];
    //첫째항 -1 공차 2
    var calcX = initX+(-1+(2*(posX-1)))*unitX;
    var calcY = initY+(-1+(2*(posY-1)))*unitY;
    $(this).css("left",calcX+"px");
    $(this).css("top",calcY+"px");
});
$("section.gameBoard>.board>button").click(function(){
    $("section.gameBoard>.board>button").removeClass("on");
    var white = $(this).hasClass("white");
    var black = $(this).hasClass("black");
    if(placable&&(!white&&!black)){
        $("*[omoku-data='placeBtn']").find("i").removeClass("fa-spinner");
        $("*[omoku-data='placeBtn']").find("i").removeClass("spin");
        $("*[omoku-data='placeBtn']").find("i").addClass("fa-check");
        $("*[omoku-data='placeBtn']").find("span").html("&nbsp;착수");    
        var pos = $(this).attr("pos");
        pos = pos.split('pos');
        var posNew = pos[1];
        pos = posNew.split("-");
        selectX = pos[0];
        selectY = pos[1];
        $(this).addClass("on");
        $(".gameAction>#placeApplier").hide();
        $(".gameAction>#placeApplier").fadeIn();
    }
});
$("*[omoku-data='placeBtn']").click(function(){
    placable = false;
    socket.emit('PLACE',{x:selectX,y:selectY});
    $(this).find("i").removeClass("fa-check");
    $(this).find("i").addClass("fa-spinner");
    $(this).find("i").addClass("spin");
    $(this).find("span").html("착수중..");
});

$("section.ingame>section.ingameBar.enemy>em.fa-arrow-left").click(function(){
    intervene("quitWarning");
});

$(".dialog.quitWarning>.forcequit").click(function(){
    $(this).hide();
    if(confirm("정말 나가시겠습니까?")){
        socket.emit("ROOMSOFTQUIT");
    }else{
        $(this).show();
    }
});

$(".dialog.quitWarning>.cancel").click(function(){
    interveneClose();
});

$("nav.bottom>ul>li").click(function(){
    var seg = $(this).attr("segment");
    if(seg=="ranking"){
        //랭킹 세그먼트 요청
        var processRankingData = ((data)=>{
            var DOM = '<ul class="ranker head"><li class="no">순위</li><li class="nick">닉네임</li><li class="wins">승</li><li class="loses">패</li><li class="winrate">승률</li><li class="online">접속</li></ul>';
            var rank = 1;
            data.forEach(user => {
                var onlineDOM;
                if(user.online=="1"){
                    onlineDOM = '<em class="fas fa-circle" style="color:limegreen"></em>';
                }else{
                    onlineDOM = '<em class="fas fa-circle" style="color:gray"></em>';
                }
                DOM += '<ul class="ranker"><li class="no">'+rank+'</li><li class="nick">'+user.name+'</li><li class="wins">'+user.wins+'</li><li class="loses">'+user.loses+'</li><li class="winrate">'+calcWinRate(user.wins,user.loses)+'%</li><li class="online">'+onlineDOM+'</li></ul>';
                rank++;
            });
            $(".rankBoard").html(DOM);
        });
        AJAX_API_RANKING(processRankingData);
    }else if(seg=="store"){
        //상점 세그먼트 요청
        var processItemsData = ((data)=>{
            var DOM = '';
            data.forEach(item => {
                DOM += '<li itemid="'+item.id+'" itemname="'+item.item_name+'" price="'+item.price+'" itemtype="'+item.type+'">';
                DOM += '<div class="imageHolder">';
                if(item.type=="dol"){
                    DOM += '<img src="/img/'+item.type+'/'+item.image+'.black.png"/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br/>';
                    DOM += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<img src="/img/'+item.type+'/'+item.image+'.white.png"/>';
                }
                DOM += '</div>';
                DOM += '<h1>'+item.item_name+'</h1>';
                DOM += '<p>'+item.item_desc+'</p>';
                DOM += '<button class="Btn_buyItem" itemid="'+item.id+'"><em class="fa fa-dot-circle gold">&nbsp;'+item.price+'</em> (7일)</button>';
                DOM += '</li>';
            });
            $(".storeBoard>ul.item").html(DOM);
            $(".storeBoard>ul.item>li[itemtype='dol']").show();
            $("button.Btn_buyItem").click(function(){
                callBuyItem($(this).attr("itemid"));
            })
        });
        $("ul.menu>li").removeClass("on");
        $("ul.menu>li[type='dol']").addClass("on");
        AJAX_SHOP_INDEX(processItemsData);
    }else if(seg=="account"){
        //상점 세그먼트 요청
        AJAX_PURCHASE_LIST(proccessPurchasesData);
    }
});

$(document).on("click","button.accept",function(){
    acceptConnect($(this).attr("who"));
})

$(document).on("click","button.reject",function(){
    rejectConnect($(this).attr("who"));
})



function calcWinRate(wins,loses){
    if((wins+loses)==0) return 0;
    return Math.round((wins/(wins+loses))*100);
}

function sendIngameChat(message){
    var message = message.substring(0,20);
    socket.emit('GAMECHAT',message);
    $("#ingameChatBody").val("");
    $("#ingameChatBody").focus();
}

function callBuyItem(itemid){
    var itemname = $("li[itemid='"+itemid+"']").attr('itemname');
    var itemprice = $("li[itemid='"+itemid+"']").attr('price');
    SELECTED_ITEM = itemid;
    var triggerBuyItem = function(){
        var afterBuy = function(response){
            if(response.success){
                showModal(3,"구매를 완료했습니다. 우측 하단 계정 탭의 인벤토리에서 착용해주세요.");
                AJAX_API_PING();
            }else{
                showModal(3,response.message);
            }
        }
        AJAX_BUY_ITEM(afterBuy,SELECTED_ITEM);
    }
    showModal(2,itemname+" - <em class='gold fa fa-dot-circle'>&nbsp;"+itemprice+"</em><br/>정말 구매하시겠어요?",triggerBuyItem,"fa fa-shopping-cart");
}
function callUseItem(purchaseid,type){
    var afterBuy = function(response){
        if(response.success){
            showModal(3,"착용했습니다.");
            AJAX_API_PING();
            $("li[itemtype='"+type+"'] button").html('<span class="fas fa-mitten"></span>&nbsp;착용하기');
            $("button[purchaseid='"+purchaseid+"']").html('<span class="fa fa-check"></span>&nbsp;착용중');
        }else{
            showModal(3,response.message);
        }
    }
    AJAX_USE_ITEM(afterBuy,purchaseid);
}

function acceptConnect(userid){
    clearInterval(Timeout_hideInvite[userid]);
    $(".inviteListWrapper").html("");
    socket.emit("CONNECTACCEPT",userid);
    $(".startBtn").hide();
    $("#matched").fadeIn();
    showToast("곧 게임을 진행합니다..");
}

function rejectConnect(userid){
    clearInterval(Timeout_hideInvite[userid]);
    $(".inviteBlock[who='"+userid+"']").remove();
    socket.emit("CONNECTREJECT",userid);
}

/*
for smooth touch controls..
*/
document.addEventListener("touchmove",function(event){
    //하나의 finger만 작동
    if(event.touches.length==1){
        var touch = event.touches[0];
        /*
        var style = touch.target.style;
        style.position = "absolute";
        style.left = touch.pageX+" px";
        style.top = touch.pageY+" px";*/
        var left = $("section.gameBoard>.board").offset().left;
        var unitX = 12;
        var unitY = 12;
        //console.log("X : "+(touch.pageX-left)+" / Y : "+touch.pageY);
    }
},false);

/*휴대폰 방향 체크 */
function doOnOrientationChange() {
    console.log(window.orientation+"/"+orientation_detected);
    if(window.orientation==90||window.orientation==-90){
        alert("폰을 세로 방향으로 잡아주세요!");
        //showToast("&nbsp;폰을 90도 돌려 세로 방향으로 잡아주세요!","fa-mobile-alt",true,false,1);
    }
    orientation_detected++;
}

window.addEventListener('orientationchange', doOnOrientationChange);
doOnOrientationChange();