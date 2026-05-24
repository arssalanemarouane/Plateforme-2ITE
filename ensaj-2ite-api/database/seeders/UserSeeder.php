<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use App\Models\Filiere;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
{
	Filiere::firstOrCreate(
    ['code' => '2ITE'],
    ['libelle' => 'Ingénierie Informatique et Technologies Émergentes']
    );
	
    // Création du compte Admin principal
    User::create([
        'nom' => 'Admin',
        'prenom' => 'ENSAJ',
        'email' => 'admin@ensaj.ma',
        'password' => Hash::make('admin2ite2026'), // Vous changerez le mot de passe plus tard
        'role' => 'admin',
    ]);
}
}
