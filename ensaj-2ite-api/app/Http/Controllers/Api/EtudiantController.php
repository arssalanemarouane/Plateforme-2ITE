<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class EtudiantController extends Controller
{
    /**
     * Récupérer les annonces destinées aux étudiants (all ou etudiant)
     * Route: GET /api/etudiant/annonces
     */
    public function getMyAnnonces(Request $request)
    {
        try {
            $user = $request->user();
            
            if (!$user) {
                return response()->json(['message' => 'Non authentifié.'], 401);
            }

            // Récupère les annonces ciblées pour tout le monde ou spécifiquement pour les étudiants
            $annonces = DB::table('annonces')
                ->join('users', 'annonces.user_id', '=', 'users.id') // Pour récupérer le nom de l'admin émetteur
                ->whereIn('annonces.cible', ['all', 'etudiant'])
                ->select(
                    'annonces.id',
                    'annonces.titre',
                    'annonces.contenu',
                    'annonces.fichier_path',
                    'annonces.created_at',
                    'users.nom as admin_nom',
                    'users.prenom as admin_prenom'
                )
                ->orderBy('annonces.created_at', 'desc')
                ->get();

            return response()->json($annonces, 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors du chargement des annonces.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Récupérer les statistiques du tableau de bord (Absences réelles + Synchronisation Emploi)
     */
    public function getDashboardStats(Request $request)
    {
        try {
            $user = $request->user();
            
            // 1. Trouver le profil étudiant via l'user_id
            $etudiant = DB::table('etudiants')->where('user_id', $user->id)->first();

            if (!$etudiant) {
                return response()->json([
                    'total_absences' => 0,
                    'emploi' => null
                ], 200);
            }

            // Utilisation de whereIn pour regrouper les identifiants sans casser le SQL
            $totalAbsences = DB::table('absences')
                ->whereIn('etudiant_id', [$etudiant->id, $etudiant->user_id])
                ->count();

            // Récupération dynamique de l'emploi du temps lié au niveau de l'étudiant
            $emploi = DB::table('emploi_temps')
                ->where('niveau', trim($etudiant->niveau))
                ->first();

            return response()->json([
                'total_absences' => $totalAbsences,
                'emploi' => $emploi
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'total_absences' => 0,
                'emploi' => null,
                'error' => $e->getMessage()
            ], 200);
        }
    }

    /**
     * Récupérer l'historique complet des absences de l'étudiant connecté
     * Route: GET /api/etudiant/absences
     */
    public function getMyAbsences(Request $request)
    {
        try {
            $user = $request->user();
            
            // 1. Trouver le profil étudiant connecté
            $etudiant = DB::table('etudiants')->where('user_id', $user->id)->first();
            
            if (!$etudiant) {
                return response()->json(['message' => 'Profil étudiant introuvable.'], 404);
            }

            // 2. Récupérer les fiches d'absences brutes de l'étudiant
            $rows = DB::table('absences')
                ->whereIn('etudiant_id', [$etudiant->id, $etudiant->user_id])
                ->orderBy('date_absence', 'desc')
                ->get();

            $absencesStructurees = [];

            // 3. SÉCURISATION DES OBJETS : On convertit et on monte le tableau de manière stable
            foreach ($rows as $row) {
                $absenceData = (array) $row; // Sécurise le typage en tableau associatif PHP
                
                $module = DB::table('modules')->where('id', $absenceData['module_id'])->first();
                if ($module) {
                    $absenceData['module_nom'] = $module->nom ?? $module->libelle ?? $module->intitule ?? 'Module';
                    $absenceData['module_code'] = $module->code ?? $module->libelle ?? '—';
                } else {
                    $absenceData['module_nom'] = 'Module non spécifié';
                    $absenceData['module_code'] = '—';
                }
                
                $absencesStructurees[] = $absenceData;
            }

            return response()->json($absencesStructurees, 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur interne du serveur lors du chargement des absences.',
                'error' => $e->getMessage(),
                'line' => $e->getLine()
            ], 500);
        }
    }

    /**
     * Récupérer l'emploi du temps de l'étudiant connecté
     */
    public function getMyEmploi(Request $request)
    {
        try {
            $user = $request->user();
            
            $etudiant = DB::table('etudiants')->where('user_id', $user->id)->first();
            if (!$etudiant) {
                return response()->json(['message' => 'Profil étudiant introuvable.'], 404);
            }

            $cleanNiveau = trim($etudiant->niveau);

            $tableName = 'emploi_temps';
            if (!Schema::hasTable('emploi_temps')) {
                if (Schema::hasTable('emplois')) {
                    $tableName = 'emplois';
                } elseif (Schema::hasTable('emploi_du_temps')) {
                    $tableName = 'emploi_du_temps';
                }
            }

            $emploi = DB::table($tableName)
                ->where('niveau', $cleanNiveau)
                ->first();

            if (!$emploi) {
                $emploi = DB::table($tableName)->first();
            }

            return response()->json($emploi, 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors du chargement de l\'emploi du temps.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Récupérer le bulletin de notes de l'étudiant connecté.
     */
    public function getMyNotes(Request $request)
    {
        try {
            $user = $request->user();
            $etudiant = DB::table('etudiants')->where('user_id', $user->id)->first();

            if (!$etudiant) {
                return response()->json(['message' => 'Profil étudiant introuvable.'], 404);
            }

            $notes = DB::table('notes')
                ->where('etudiant_id', $etudiant->id)
                ->get();

            foreach ($notes as $note) {
                $note->module = DB::table('modules')->where('id', $note->module_id)->first();
                if ($note->module) {
                    $prof = DB::table('professeurs')->where('id', $note->module->professeur_id)->first();
                    if ($prof) {
                        $note->module->professeur = $prof;
                        $note->module->professeur->user = DB::table('users')->where('id', $prof->user_id)->first();
                    }
                }
            }

            return response()->json($notes, 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Erreur', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Récupérer les supports de cours et TD accessibles pour la classe de l'étudiant.
     */
    public function getMyDocuments(Request $request)
    {
        try {
            $user = $request->user();
            $etudiant = DB::table('etudiants')->where('user_id', $user->id)->first();
            
            if (!$etudiant) {
                return response()->json(['message' => 'Profil étudiant introuvable.'], 404);
            }

            $moduleIds = DB::table('modules')
                ->where('filiere_id', $etudiant->filiere_id)
                ->where('niveau', $etudiant->niveau)
                ->pluck('id')
                ->toArray();

            if (empty($moduleIds)) {
                return response()->json([], 200);
            }

            $documents = DB::table('documents')
                ->whereIn('module_id', $moduleIds)
                ->orderBy('created_at', 'desc')
                ->get();

            foreach ($documents as $doc) {
                $doc->module = DB::table('modules')->where('id', $doc->module_id)->first();
                if ($doc->module) {
                    $prof = DB::table('professeurs')->where('id', $doc->module->professeur_id)->first();
                    if ($prof) {
                        $doc->module->professeur = $prof;
                        $doc->module->professeur->user = DB::table('users')->where('id', $prof->user_id)->first();
                    }
                }
            }

            return response()->json($documents, 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Erreur', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Charger le flux de discussion général de la promotion
     */
    public function getClassMessages(Request $request)
    {
        try {
            $user = $request->user();
            $etudiant = DB::table('etudiants')->where('user_id', $user->id)->first();

            if (!$user || !$etudiant) {
                return response()->json(['message' => 'Profil étudiant manquant.'], 404);
            }

            $messages = DB::table('messages')
                ->join('users', 'messages.sender_id', '=', 'users.id')
                ->where('messages.niveau', $etudiant->niveau)
                ->orWhere('messages.receiver_id', $user->id)
                ->select('messages.*', 'users.prenom', 'users.nom', 'users.role')
                ->orderBy('messages.created_at', 'asc')
                ->get();

            return response()->json($messages, 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Erreur', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Répondre ou envoyer un message direct à un enseignant
     */
    public function sendMessageToProf(Request $request)
    {
        $request->validate([
            'module_id' => 'required|exists:modules,id',
            'contenu' => 'required|string',
        ]);

        try {
            $user = $request->user();
            $etudiant = DB::table('etudiants')->where('user_id', $user->id)->first();

            $module = DB::table('modules')->where('id', $request->module_id)->first();
            $professeur = DB::table('professeurs')->where('id', $module->professeur_id)->first();

            if (!$professeur) {
                return response()->json(['message' => 'Aucun professeur assigné à ce cours.'], 404);
            }

            DB::table('messages')->insert([
                'sender_id' => $user->id,
                'receiver_id' => $professeur->user_id,
                'niveau' => $etudiant->niveau,
                'contenu' => $request->contenu,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('notifications')->insert([
                'user_id' => $professeur->user_id,
                'titre' => 'Message Reçu • Espace Étudiant',
                'description' => $user->prenom . ' ' . $user->nom . ' (' . $etudiant->niveau . ') vous a écrit pour le module : ' . $module->code,
                'is_read' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return response()->json(['message' => 'Votre message a été transmis. Enseignant notifié !'], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Erreur', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * =========================================================================
     * 🏛️ MODULE COMPLÉMENTAIRE : SERVICES ADMINISTRATIFS & RÉCLAMATIONS
     * =========================================================================
     */

    /**
     * Récupérer toutes les demandes et réclamations de l'étudiant connecté
     * Route: GET /api/etudiant/demandes
     */
    public function getMyDemandes(Request $request)
    {
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json(['message' => 'Non authentifié.'], 401);
            }

            $etudiant = DB::table('etudiants')->where('user_id', $user->id)->first();
            if (!$etudiant) {
                return response()->json(['message' => 'Profil étudiant introuvable.'], 404);
            }

            $rows = DB::table('demandes')
                ->where('etudiant_id', $etudiant->id)
                ->orderBy('created_at', 'desc')
                ->get();

            $demandesStructurees = [];
            foreach ($rows as $row) {
                $demandesStructurees[] = (array) $row;
            }

            return response()->json($demandesStructurees, 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors du chargement des services.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Soumettre une nouvelle demande ou réclamation
     * Route: POST /api/etudiant/demandes
     */
    public function storeNewDemande(Request $request)
    {
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json(['message' => 'Non authentifié.'], 401);
            }

            $etudiant = DB::table('etudiants')->where('user_id', $user->id)->first();
            if (!$etudiant) {
                return response()->json(['message' => 'Profil étudiant introuvable.'], 404);
            }

            if (!$request->has('type')) {
                return response()->json(['message' => 'Le type de demande est requis.'], 422);
            }

            $insertedId = DB::table('demandes')->insertGetId([
                'etudiant_id'          => $etudiant->id,
                'type'                 => $request->input('type'),
                'statut'               => 'en_attente',
                'description_etudiant' => $request->input('description_etudiant'),
                'commentaire_admin'    => null,
                'reponse_admin'        => null,
                'created_at'           => now(),
                'updated_at'           => now(),
            ]);

            $newDemande = DB::table('demandes')->where('id', $insertedId)->first();

            return response()->json([
                'message' => 'Votre demande a bien été transmise à la direction !',
                'data'    => (array) $newDemande
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de l\'enregistrement de votre requête.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Récupérer la liste des professeurs enseignant dans le niveau de l'étudiant
     * Route: GET /api/etudiant/mes-professeurs
     */
    public function getMyProfesseurs(Request $request)
    {
        try {
            $user = $request->user();
            $etudiant = DB::table('etudiants')->where('user_id', $user->id)->first();

            if (!$etudiant) {
                return response()->json(['message' => 'Profil étudiant introuvable.'], 404);
            }

            // Récupère les profs liés aux modules du niveau de l'étudiant
            $professeurs = DB::table('modules')
                ->join('professeurs', 'modules.professeur_id', '=', 'professeurs.id')
                ->join('users', 'professeurs.user_id', '=', 'users.id')
                ->where('modules.niveau', trim($etudiant->niveau))
                ->select(
                    'users.id as user_id', // Requis pour l'envoi de messages (receiver_id)
                    'users.nom',
                    'users.prenom',
                    'professeurs.specialite',
                    'modules.libelle as module_nom',
                    'modules.id as module_id'
                )
                ->get()
                ->unique('user_id') // Évite les doublons si un prof a plusieurs modules
                ->values();

            return response()->json($professeurs, 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Erreur de chargement des professeurs.', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Récupérer l'historique de discussion privé avec un professeur spécifique
     * Route: GET /api/etudiant/chat/{profUserId}
     */
    public function getChatHistory(Request $request, $profUserId)
    {
        try {
            $user = $request->user();

            // Charge les messages échangés entre cet étudiant et ce prof spécifique
            $messages = DB::table('messages')
                ->where(function($query) use ($user, $profUserId) {
                    $query->where('sender_id', $user->id)->where('receiver_id', $profUserId);
                })
                ->orWhere(function($query) use ($user, $profUserId) {
                    $query->where('sender_id', $profUserId)->where('receiver_id', $user->id);
                })
                ->orderBy('created_at', 'asc')
                ->get();

            return response()->json($messages, 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Erreur de chargement du chat.', 'error' => $e->getMessage()], 500);
        }
    }
}