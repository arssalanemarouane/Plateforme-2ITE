<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    use HasFactory;

    protected $fillable = ['module_id', 'titre', 'type', 'file_path'];

    public function module()
    {
        return $this->belongsTo(Module::class);
    }
}