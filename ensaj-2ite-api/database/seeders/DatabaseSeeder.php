<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Professeur;
use App\Models\Filiere;
use App\Models\Module;
use App\Models\Etudiant;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // ==========================================
        // 1. FILIÈRE
        // ==========================================
        $filiere = Filiere::create([
            'code' => '2ITE',
            'libelle' => 'Ingénierie Informatique et Technologies de l\'Information',
        ]);

        // ==========================================
        // 2. ADMIN
        // ==========================================
        User::create([
            'nom' => 'Admin',
            'prenom' => 'ENSAJ',
            'email' => 'admin@ensaj.ma',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        // ==========================================
        // 3. LISTE DES PROFESSEURS
        // ==========================================
        $professeursData = [
            ['nom' => 'Alami', 'prenom' => 'Ahmed', 'specialite' => 'Réseaux & Sécurité'],
            ['nom' => 'Bennani', 'prenom' => 'Karim', 'specialite' => 'Data Science'],
            ['nom' => 'Tazi', 'prenom' => 'Omar', 'specialite' => 'Développement Web'],
            ['nom' => 'Mansouri', 'prenom' => 'Yassine', 'specialite' => 'Cloud Computing'],
            ['nom' => 'Chafik', 'prenom' => 'Salma', 'specialite' => 'Intelligence Artificielle'],
            ['nom' => 'El Idrissi', 'prenom' => 'Nadia', 'specialite' => 'Cybersécurité'],
            ['nom' => 'Alaoui', 'prenom' => 'Hicham', 'specialite' => 'Big Data'],
            ['nom' => 'Lahlou', 'prenom' => 'Samir', 'specialite' => 'Programmation Java'],
            ['nom' => 'Fassi', 'prenom' => 'Imane', 'specialite' => 'Laravel & React'],
            ['nom' => 'Amrani', 'prenom' => 'Soufiane', 'specialite' => 'Architecture Logicielle'],
            ['nom' => 'Kabbaj', 'prenom' => 'Rania', 'specialite' => 'Systèmes Embarqués'],
            ['nom' => 'Naciri', 'prenom' => 'Anas', 'specialite' => 'Machine Learning'],
            ['nom' => 'Skalli', 'prenom' => 'Meriem', 'specialite' => 'Administration Linux'],
            ['nom' => 'Bouzidi', 'prenom' => 'Hamza', 'specialite' => 'DevOps'],
            ['nom' => 'Cherkaoui', 'prenom' => 'Yasmine', 'specialite' => 'Mobile Development'],
        ];

        $professeurs = [];

        foreach ($professeursData as $index => $data) {

            $email = strtolower($data['nom']) . '.' . strtolower($data['prenom']) . '@ensaj.ma';

            $user = User::create([
                'nom' => $data['nom'],
                'prenom' => $data['prenom'],
                'email' => $email,
                'password' => Hash::make('password'),
                'role' => 'professeur',
            ]);

            $professeurs[] = Professeur::create([
                'user_id' => $user->id,
                'specialite' => $data['specialite'],
                'telephone' => '06' . rand(10000000, 99999999),
            ]);
        }

        // ==========================================
        // 4. MODULES
        // ==========================================
        $modules = [
            'Bases de données',
            'Bases de données avancées',
            'Programmation C',
            'Programmation C++',
            'Programmation Java',
            'Programmation Python',
            'Programmation Web',
            'Développement Front-End',
            'Développement Back-End',
            'Laravel',
            'ReactJS',
            'NodeJS',
            'Administration Linux',
            'Administration Windows',
            'Cybersécurité',
            'Cloud Computing',
            'Docker & Kubernetes',
            'DevOps',
            'Machine Learning',
            'Deep Learning',
            'Intelligence Artificielle',
            'Data Mining',
            'Big Data',
            'Analyse Numérique',
            'Mathématiques Appliquées',
            'Recherche Opérationnelle',
            'Compilation',
            'Langages Formels',
            'Architecture des Ordinateurs',
            'Systèmes d’Exploitation',
            'Réseaux Informatiques',
            'Sécurité Réseau',
            'Cryptographie',
            'IoT',
            'Systèmes Embarqués',
            'UML & Design Patterns',
            'Qualité Logicielle',
            'Tests Logiciels',
            'Gestion de Projet',
            'Méthodes Agiles',
            'Business Intelligence',
            'Vision par Ordinateur',
            'Traitement d’Images',
            'Traitement du Signal',
            'Programmation Mobile',
            'Flutter',
            'Android',
            'iOS',
            'Communication Digitale',
            'E-commerce',
        ];

        $niveaux = ['1A', '2A', '3A'];

        $moduleIndex = 1;

        foreach ($modules as $moduleName) {

            Module::create([
                'code' => 'M' . str_pad($moduleIndex, 3, '0', STR_PAD_LEFT),
                'libelle' => $moduleName,
                'filiere_id' => $filiere->id,
                'niveau' => $niveaux[array_rand($niveaux)],
                'professeur_id' => $professeurs[array_rand($professeurs)]->id,
            ]);

            $moduleIndex++;
        }

        // ==========================================
        // 5. ÉTUDIANTS
        // ==========================================
        $noms = [
            'El Amrani',
            'Tazi',
            'Mansouri',
            'Chafik',
            'Alaoui',
            'Bennani',
            'Skalli',
            'Kabbaj',
            'Naciri',
            'Fassi',
            'Cherkaoui',
            'Bouzidi',
            'Lahlou',
            'El Idrissi',
            'Amrani',
        ];

        $prenoms = [
            'Youssef',
            'Anas',
            'Imane',
            'Saad',
            'Hamza',
            'Salma',
            'Meriem',
            'Omar',
            'Rania',
            'Nadia',
            'Yasmine',
            'Soufiane',
            'Karim',
            'Ahmed',
            'Hicham',
        ];

        for ($i = 1; $i <= 120; $i++) {

            $nom = $noms[array_rand($noms)];
            $prenom = $prenoms[array_rand($prenoms)];

            $user = User::create([
                'nom' => $nom,
                'prenom' => $prenom,
                'email' => strtolower($prenom . '.' . $nom . $i . '@ensaj.ma'),
                'password' => Hash::make('password'),
                'role' => 'etudiant',
            ]);

            Etudiant::create([
                'user_id' => $user->id,
                'cne' => 'K' . rand(100000000, 999999999),
                'date_naissance' => rand(2002, 2006) . '-0' . rand(1, 9) . '-' . rand(10, 28),
                'filiere_id' => $filiere->id,
                'niveau' => $niveaux[array_rand($niveaux)],
            ]);
        }
    }
}