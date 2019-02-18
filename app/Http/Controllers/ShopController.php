<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use DB;
use Auth;
use DateTime;
use App\Item;
use App\Purchase;
use DateInterval;
use Illuminate\support\carbon;

class ShopController extends Controller
{
    public function __construct(){
        //$this->middleware('auth');
    }
    /**
     * Display a listing of the resource.
     * 전체 아이템 목록을 반환합니다.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        //
        $items = DB::table('shop')->get();
        return response()->json($items);
    }

    public function purchaseIndex(){
        if(Auth::check()){
            $purchases = Purchase::with('item')->where([['user_id',Auth::user()->id],['expire_date','>',Carbon::now()]])->get();
            return response()->json($purchases);
        }else{
            return;
        }
    }

    public function purchase(Request $request)
    {
        $response = ["success"=>false,"message"=>"Server is Not Ready.."];

        if(Auth::check()){
            $itemid = $request->get('itemid');
            if(!is_numeric($itemid)){
                return;
            }

            $item = Item::find($itemid);
            $price = $item->price;

            if(Auth::User()->gold>$price){
                //돈이 여유로우면..
                $alreadyPurchase = Purchase::where("user_id",Auth::user()->id)->where("item_id",$item->id)->where("expire_date",">",DB::raw('NOW()'))->count();
                if($alreadyPurchase>0){
                    $response["message"] = "이미 구매한 아이템입니다.";
                }else{
                    DB::table('users')->where('id',Auth::user()->id)->decrement('gold',$price);

                    //purchase 객체 생성
                    $now = new DateTime();
                    $expire_date = $now->add(new DateInterval('P7D'));//7일 더함

                    $purchaseObj = new Purchase;
                    $purchaseObj->user_id = Auth::User()->id;
                    $purchaseObj->item_id = $item->id;
                    $purchaseObj->expire_date = $expire_date;
                    $purchaseObj->save();

                    $response["message"] = null;
                    $response["success"] = true;
                }
            }else{
                //돈이 없음!
                $response["message"] = "골드가 부족합니다!";
            }
        }else{
            $response["message"] = "no permission";
        }

        return response()->json($response);

    }

    public function use(Request $request){
        $this->validate($request,[
            'purchaseid'=>'required|numeric'
        ]);
        $response = ["success"=>false,"message"=>"Server is Not Ready.."];
        if(Auth::check()){
            $pObj = Purchase::with('item')->where([["id",$request->get("purchaseid")],["expire_date",">",Carbon::now()]])->get();
            if(isset($pObj[0])){
                switch($pObj[0]->item->type){
                    case "dol":
                        Auth::User()->dol = $pObj[0]->id;
                    break;
                    case "board":
                        Auth::User()->board = $pObj[0]->id;
                    break;
                }
                Auth::User()->save();
                
                $response['success']="true";
                $response['message']=null;
            }else{
                $response['message'] = "이미 사용기간이 지난 아이템입니다.";
            }
        }
        else
        {
            $response['message'] = "no permission";
        }
        return response()->json($response);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //
    }
}
