<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Auth;
use DB;

class APIController extends Controller
{
    //핑퐁
    public function ping(){
        if(Auth::check()){
            $result = ['success'=>true,'loggedIn'=>true,'User'=>Auth::User()->load('dol.item')];
            return response()->json($result);
        }else{
            $result = ['success'=>true,'loggedIn'=>false];
            return response()->json($result);
        }
    }

    //랭킹쓰~
    public function ranking(){
        $users = DB::table('users')->select("name","wins","loses","gold","online")->orderByRaw('`wins` DESC,(`wins`/(`wins`+`loses`)) DESC')->limit(100)->get();
        return response()->json($users);
    }
}
