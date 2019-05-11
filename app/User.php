<?php

namespace App;

use Illuminate\Notifications\Notifiable;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable
{
    use Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name','wins','loses','gold','dol','board','online','remove','id','email','password'
    ];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [
        'password', 'remember_token',
    ];

    public function dol(){
        return $this->hasOne(Purchase::class,'id','dol');
    }
    public function board(){
        return $this->hasOne(Purchase::class,'id','board');
    }
    public function records(){
        return Record::where('win',$this->id)->orWHere('lose',$this->id)->limit(10)->get();
    }
}
