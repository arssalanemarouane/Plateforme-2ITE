<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('absences', function (Blueprint $table) {
            $table->id();
            
            // Clés étrangères (Assure-toi que les tables 'etudiants' et 'modules' existent déjà)
            $table->foreignId('etudiant_id')->constrained('etudiants')->onDelete('cascade');
            $table->foreignId('module_id')->constrained('modules')->onDelete('cascade');
            
            // Détails de l'absence
            $table->date('date_absence');
            $table->integer('heures')->default(2); // Volume horaire de l'absence (ex: 2h ou 4h)
            
            // Justification
            $table->boolean('justifie')->default(false);
            $table->string('motif')->nullable(); // Optionnel, requis uniquement si justifie = true
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('absences');
    }
};