<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Professeur extends Model
{
    protected $fillable = ['user_id', 'specialite', 'telephone'];

public function user()
{
    return $this->belongsTo(User::class);
}
}
