/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ({

/***/ "./resources/js/ui.js":
/*!****************************!*\
  !*** ./resources/js/ui.js ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports) {

var ChatInput = false;

function disableForm(target, BusyDOM) {
  target.attr("disabled", "disabled");
  target.html(BusyDOM);
}

function reviveForm(target, normalDOM) {
  target.removeAttr("disabled");
  target.html(normalDOM);
}

$(document).ready(function () {//    $( 'html, body' ).animate( { scrollTop : 100 }, 1000 );
});
$("section.lobby .logoWrapper .myinfo").click(function () {
  $(this).find("ul").toggle();
});
$("#startMatch").click(function () {
  $(".startBtnWrapper").animate({
    bottom: 0
  }, 250, function () {
    $("#running").show();
    $(".startBtn").hide();
    $(".startBtnWrapper").animate({
      bottom: 65
    }, 250);
  });
});
$("#running").click(function () {
  $(".startBtnWrapper").animate({
    bottom: 0
  }, 250, function () {
    $("#running").hide();
    $(".startBtn").show();
    $(".startBtnWrapper").animate({
      bottom: 65
    }, 250);
  });
});
$("nav.bottom>ul>li").click(function () {
  $("nav.bottom>ul>li").removeClass("on");
  $(this).addClass("on");
  var seg = $(this).attr("segment");
  $("section.lobby .body .segment").hide();
  $("section.lobby .body .segment." + seg).show();
});
$(".myinfo>ul>li:first-child").click(function () {
  $("section.lobby .body .segment").hide();
  $("section.lobby .body .segment.account").show();
  $("nav.bottom>ul>li").removeClass("on");
  $("nav.bottom>ul>li[segment='account']").addClass("on");
});
$("#Btn_logout").click(function () {
  top.location.href = "/auth/logout";
});
$(".storeBoard>ul.menu>li").click(function () {
  var type = $(this).attr("type");
  $(".storeBoard>ul.menu>li").removeClass("on");
  $(this).addClass("on");
  $(".storeBoard>ul.item>li").hide();
  $(".storeBoard>ul.item>li[itemtype='" + type + "']").fadeIn();
});
$("#Btn_showChapInput").click(function () {
  ChatInput = true;
  $(".chatInputBalloon").fadeIn();
  $("#ingameChatBody").focus();
});
$("section.gameBoard").click(function () {
  if (ChatInput) {
    ChatInput = false;
    $(".chatInputBalloon").fadeOut();
  }
});
$("#loginform button.signup").click(function () {
  $("#loginform").hide();
  $("#registerform").fadeIn();
  /*$("#loginformWrapper").animate({
      'top':"225px"
  },500);*/
});
$("#registerform button.signup.back").click(function () {
  $("#registerform").hide();
  $("#loginform").fadeIn();
  /*$("#loginformWrapper").animate({
      'top':"260px"
  },500);*/
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

/***/ }),

/***/ 2:
/*!**********************************!*\
  !*** multi ./resources/js/ui.js ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! F:\omoku\omoku\resources\js\ui.js */"./resources/js/ui.js");


/***/ })

/******/ });