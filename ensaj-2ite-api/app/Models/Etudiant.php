<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Etudiant extends Model
{
    protected $fillable = ['user_id', 'cne', 'date_naissance', 'filiere_id', 'niveau'];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function filiere()
    {
        return $this->belongsTo(Filiere::class, 'filiere_id');
    }

    // AJOUT DE LA RELATION MANQUANTE :
    public function notes()
    {
        return $this->hasMany(Note::class, 'etudiant_id');
    }
}