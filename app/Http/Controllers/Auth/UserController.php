<?php

namespace App\Http\Controllers\Auth;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Auth;
use DB;

class UserController extends Controller
{
    //
    public function changeName(Request $request)
    {
        //
        $cost = 500;
        $response = ["success"=>false,"msg"=>"Server is Not Ready.."];

        if(Auth::check()){
            if(Auth::user()->gold<$cost){
                $response["msg"] = "골드가 부족합니다.";
            }else{
                $clearname = mb_substr($request->name,0,6);
                DB::table('users')->where('id',Auth::user()->id)->decrement('gold',500,['name'=>$clearname]);
                $response["success"] = true;
                $response["msg"] = null;
            }
        }else{
            $response["msg"] = "권한이 없습니다!";
        }
        return response()->json($response);
    }

    public function changePassword(Request $request)
    {
        //
        $response = ["success"=>false,"msg"=>"Server is Not Ready.."];
        $validatedData = $request->validate([
            'password' => 'required|string|min:8',
        ]);

        if(Auth::check()){
            $userObj = Auth::user();
            $userObj->password = bcrypt($request->get('password'));
            $userObj->save();
            $response["success"] = true;
            $response["msg"] = null;
        }else{
            $response["msg"] = "권한이 없습니다!";
        }
        return response()->json($response);
    }
    public function removeAccount(Request $request)
    {
        //
        $response = ["success"=>false,"msg"=>"Server is Not Ready.."];
        

        if(Auth::check()){
            if($request->get('allow')=="계정탈퇴동의"){
                $userObj = Auth::user();
                $userObj->remove = 1;
                $userObj->save();
                $response["success"] = true;
                $response["msg"] = null;
            }else{
                $response["msg"] = "탈퇴 확인 문구를 정확히 입력해주세요.";
            }
            
        }else{
            $response["msg"] = "권한이 없습니다!";
        }
        return response()->json($response);
    }
}
