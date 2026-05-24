<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmploiTemps extends Model
{
    use HasFactory;
    protected $table = 'emploi_temps';
    protected $fillable = ['niveau', 'image_path', 'updated_by'];

    public function editor() {
        return $this->belongsTo(User::class, 'updated_by');
    }
}