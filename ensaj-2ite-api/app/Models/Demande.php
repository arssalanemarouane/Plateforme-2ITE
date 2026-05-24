<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Demande extends Model
{
    protected $table = 'demandes';

    protected $fillable = [
        'etudiant_id',
        'type',
        'statut',
        'description_etudiant',
        'commentaire_admin',
        'reponse_admin',
        'fichier_path', // 🚀 AJOUTÉE : Indispensable pour l'upload PDF
    ];

    public function etudiant(): BelongsTo
    {
        return $this->belongsTo(Etudiant::class);
    }
}