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
    Schema::create('filieres', function (Blueprint $table) {
        $table->id();
        $table->string('code')->unique(); // ex: 2ITE, GIND, etc.
        $table->string('libelle');       // ex: Ingénierie Informatique et Technologies Émergentes
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('filieres');
    }
};
