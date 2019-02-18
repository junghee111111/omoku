<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Purchase extends Model
{
    //
    protected $table = 'purchases';
    protected $fillable = [
        'user_id','item_id','expire_date'
    ];

    public function item(){
        return $this->hasOne(Item::class,'id','item_id');
    }
}
