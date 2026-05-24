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
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            // L'utilisateur qui doit recevoir la notification (le professeur ici)
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            
            // Titre et description de l'alerte
            $table->string('titre');
            $table->text('description');
            
            // État de lecture (par défaut 'false' = non lu)
            $table->boolean('is_read')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};