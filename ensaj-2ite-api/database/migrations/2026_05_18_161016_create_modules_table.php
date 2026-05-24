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
    Schema::create('modules', function (Blueprint $table) {
        $table->id();
        $table->string('code')->unique(); // ex: M12 (Bases de données)
        $table->string('libelle');
        $table->foreignId('filiere_id')->constrained()->onDelete('cascade');
        $table->enum('niveau', ['1A', '2A', '3A']);
        $table->foreignId('professeur_id')->constrained('professeurs')->onDelete('cascade');
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('modules');
    }
};
