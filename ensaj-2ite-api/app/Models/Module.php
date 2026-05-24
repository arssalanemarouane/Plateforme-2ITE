<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Module extends Model
{
    use HasFactory;

    // Ajoute ces lignes pour autoriser l'enregistrement
    protected $fillable = [
        'code',
        'libelle',
        'filiere_id',
        'niveau',
        'professeur_id'
    ];

    public function filiere()
    {
        return $this->belongsTo(Filiere::class);
    }

    public function professeur()
    {
        return $this->belongsTo(Professeur::class);
    }
}