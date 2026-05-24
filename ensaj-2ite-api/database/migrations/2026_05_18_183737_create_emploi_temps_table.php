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
    Schema::create('emploi_temps', function (Blueprint $table) {
        $table->id();
        $table->enum('niveau', ['1A', '2A', '3A'])->unique(); // Un seul emploi par niveau
        $table->string('image_path');
        $table->foreignId('updated_by')->constrained('users'); // Qui a fait la dernière modif
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('emploi_temps');
    }
};
