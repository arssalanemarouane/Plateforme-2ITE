<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Annonce extends Model
{
    protected $fillable = ['titre', 'contenu', 'user_id', 'fichier_path', 'cible'];

    /**
     * Relation avec l'utilisateur (Admin) qui a créé l'annonce
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}