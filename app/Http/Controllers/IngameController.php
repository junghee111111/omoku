<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class IngameController extends Controller
{
    public function index(){
        return view("inGame");
    }
    public function debug(){
        return view("ingamedebug");
    }
}
