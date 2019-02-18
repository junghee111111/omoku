var ChatInput = false;

function disableForm(target,BusyDOM){
    target.attr("disabled","disabled");
    target.html(BusyDOM);
}

function reviveForm(target,normalDOM){
    target.removeAttr("disabled");
    target.html(normalDOM);
}

$(document).ready(function(){
//    $( 'html, body' ).animate( { scrollTop : 100 }, 1000 );
});


$("section.lobby .logoWrapper .myinfo").click(function(){
    $(this).find("ul").toggle();
})

$("#startMatch").click(function(){
    $(".startBtnWrapper").animate({
        bottom:0
    },250,function(){
        $("#running").show();
        $(".startBtn").hide();
        $(".startBtnWrapper").animate({
            bottom:65
        },250);
    });
})

$("#running").click(function(){
    $(".startBtnWrapper").animate({
        bottom:0
    },250,function(){
        $("#running").hide();
        $(".startBtn").show();
        $(".startBtnWrapper").animate({
            bottom:65
        },250);
    });
})

$("nav.bottom>ul>li").click(function(){
    $("nav.bottom>ul>li").removeClass("on");
    $(this).addClass("on");
    var seg = $(this).attr("segment");
    $("section.lobby .body .segment").hide();
    $("section.lobby .body .segment."+seg).show();
});

$(".myinfo>ul>li:first-child").click(function(){
    $("section.lobby .body .segment").hide();
    $("section.lobby .body .segment.account").show();
    $("nav.bottom>ul>li").removeClass("on");
    $("nav.bottom>ul>li[segment='account']").addClass("on");
});

$("#Btn_logout").click(function(){
    top.location.href="/auth/logout";
});

$(".storeBoard>ul.menu>li").click(function(){
    var type = $(this).attr("type");
    $(".storeBoard>ul.menu>li").removeClass("on");
    $(this).addClass("on");
    $(".storeBoard>ul.item>li").hide();
    $(".storeBoard>ul.item>li[itemtype='"+type+"']").fadeIn();
});

$("#Btn_showChapInput").click(function(){
    ChatInput = true;
    $(".chatInputBalloon").fadeIn();
    $("#ingameChatBody").focus();
});

$("section.gameBoard").click(function(){
    if(ChatInput){
        ChatInput = false;
        $(".chatInputBalloon").fadeOut();
    }
});
/*
window.onbeforeunload = function (e) {
    e = e || window.event;
  
    // For IE and Firefox prior to version 4
    if (e) {
      e.returnValue = '정말 나가시겠습니까?';
    }
  
    // For others
    return '정말 나가시겠습니까?';
};*/