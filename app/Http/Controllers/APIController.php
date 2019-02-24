<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Auth;
use DB;
use Illuminate\support\carbon;
use App\User;
use App\Purchase;

class APIController extends Controller
{
    //핑퐁
    public function ping(){
        if(Auth::check()){
            if(Auth::User()->dol>0){
                $dol = Purchase::find(Auth::User()->dol);
                $expire = $dol->expire_date;
                if(Carbon::parse($expire)->lt(Carbon::now())){
                    $expired_user = Auth::User();
                    $expired_user->dol = 0;
                    $expired_user->save();
                }
            }
            $result = ['success'=>true,'loggedIn'=>true,'User'=>Auth::User()->load('dol.item')];
            return response()->json($result);
        }else{
            $result = ['success'=>true,'loggedIn'=>false];
            return response()->json($result);
        }
    }

    //랭킹쓰~
    public function ranking(){
        $users = DB::table('users')->select("name","wins","loses","gold","online")->orderByRaw('`wins` DESC,(`wins`/(`wins`+`loses`)) DESC')->limit(20)->get();
        return response()->json($users);
    }
}
