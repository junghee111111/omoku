<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Record extends Model
{
    //
    //
    protected $table = 'records';
    protected $fillable = [
        
    ];

    public function winner(){
        return $this->hasOne(User::class,'id','win');
    }

    public function loser(){
        return $this->hasOne(User::class,'id','lose');
    }
}
