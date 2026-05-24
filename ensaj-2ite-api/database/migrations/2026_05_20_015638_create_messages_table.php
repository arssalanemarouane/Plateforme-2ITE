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
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            // L'expéditeur du message (Prof ou Étudiant)
            $table->foreignId('sender_id')->constrained('users')->onDelete('cascade');
            
            // Le niveau cible ('1A', '2A') pour les messages de groupe du prof
            $table->string('niveau')->nullable();
            
            // Le destinataire direct si c'est un message privé (optionnel)
            $table->foreignId('receiver_id')->nullable()->constrained('users')->onDelete('cascade');
            
            // Le corps du message
            $table->text('contenu');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};