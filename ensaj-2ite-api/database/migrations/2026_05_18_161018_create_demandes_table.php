<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('demandes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('etudiant_id')->constrained('etudiants')->onDelete('cascade');
            $table->string('type'); // 'attestation_scolarite', 'releve_notes', 'reclamation'
            $table->string('statut')->default('en_attente'); // 'en_attente', 'termine', 'rejete'
            $table->text('description_etudiant')->nullable();
            $table->text('commentaire_admin')->nullable();
            $table->text('reponse_admin')->nullable();
            
            // 🚀 AJOUTÉE : Colonne pour stocker le chemin du fichier PDF (ex: 'attestations/fichier.pdf')
            $table->string('fichier_path')->nullable(); 
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('demandes');
    }
};