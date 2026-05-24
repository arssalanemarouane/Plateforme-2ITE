<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Absence extends Model
{
    protected $fillable = [
        'etudiant_id',
        'module_id',
        'date_absence',
        'heures',
        'justifie',
        'motif'
    ];

    /**
     * Relation avec l'étudiant concerné
     */
    public function etudiant(): BelongsTo
    {
        return $this->belongsTo(Etudiant::class);
    }

    /**
     * Relation avec le module associé
     */
    public function module(): BelongsTo
    {
        return $this->belongsTo(Module::class);
    }
}