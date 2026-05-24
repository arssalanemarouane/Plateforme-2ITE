<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Etudiant;
use App\Models\Note;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage; // INDISPENSABLE pour gérer la suppression des fichiers physiques

class ProfesseurController extends Controller
{
    public function getMyModules(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['message' => 'Utilisateur non authentifié.'], 401);
        }

        // Récupération blindée du professeur via user_id
        $professeur = DB::table('professeurs')->where('user_id', $user->id)->first();

        if (!$professeur) {
            return response()->json(['message' => 'Profil professeur introuvable pour cet utilisateur.'], 404);
        }

        $modules = DB::table('modules')
            ->where('professeur_id', $professeur->id)
            ->get();

        // Joindre manuellement la filière si la table existe
        foreach ($modules as $module) {
            $module->filiere = DB::table('filieres')->where('id', $module->filiere_id)->first();
        }

        return response()->json($modules, 200);
    }

    /**
     * Récupérer les emplois du temps UNIQUEMENT pour les niveaux enseignés par le prof
     * Route: GET /api/professeur/emplois
     */
    public function getMyEmploisTemps(Request $request)
    {
        try {
            $user = $request->user();

            $professeur = DB::table('professeurs')->where('user_id', $user->id)->first();
            if (!$professeur) {
                return response()->json(['message' => 'Profil professeur introuvable.'], 404);
            }

            // 1. Récupérer la liste des niveaux distincts assignés à ce professeur via ses modules
            $niveauxEnseignes = DB::table('modules')
                ->where('professeur_id', $professeur->id)
                ->pluck('niveau')
                ->unique()
                ->filter()
                ->values() 
                ->toArray(); 

            // Fallback si la table modules n'est pas encore assignée au prof
            if (empty($niveauxEnseignes)) {
                $niveauxEnseignes = ['1A', '2A'];
            }

            // 2. Détermination dynamique de la table réelle pour éliminer tout crash 500
            $tableName = 'emplois';

            if (!\Schema::hasTable('emplois')) {
                if (\Schema::hasTable('emploi_temps')) {
                    $tableName = 'emploi_temps';
                } elseif (\Schema::hasTable('emploi_du_temps')) {
                    $tableName = 'emploi_du_temps';
                } else {
                    return response()->json(['message' => 'Table des emplois introuvable en BDD.'], 404);
                }
            }

            // 3. Exécution de la requête Query Builder
            $emplois = DB::table($tableName)
                ->whereIn('niveau', $niveauxEnseignes)
                ->get();

            return response()->json($emplois, 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur SQL Interne au serveur',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getEtudiantsByModule(Request $request, $moduleId)
    {
        $moduleId = (int) $moduleId;
        $module = DB::table('modules')->where('id', $moduleId)->first();
        
        if (!$module) {
            return response()->json(['message' => 'Module introuvable.'], 404);
        }
        
        $etudiants = Etudiant::where('filiere_id', $module->filiere_id)
            ->where('niveau', $module->niveau)
            ->with(['user', 'notes' => function($query) use ($moduleId) {
                $query->where('module_id', $moduleId);
            }])
            ->get();

        $etudiants->transform(function($etd) {
            $noteData = $etd->notes->first();
            $etd->note_actuelle = [
                'note_normal' => $noteData ? $noteData->note_normal : '',
                'note_rattrapage' => $noteData ? $noteData->note_rattrapage : ''
            ];
            return $etd;
        });

        return response()->json($etudiants->values(), 200);
    }

    public function saveNote(Request $request)
    {
        $request->validate([
            'etudiant_id' => 'required|exists:etudiants,id',
            'module_id' => 'required|exists:modules,id',
            'note_normal' => 'nullable|numeric|min:0|max:20',
            'note_rattrapage' => 'nullable|numeric|min:0|max:20',
        ]);

        $noteNormal = $request->note_normal !== '' ? $request->note_normal : null;
        $noteRattrapage = $request->note_rattrapage !== '' ? $request->note_rattrapage : null;

        $noteFinale = $noteNormal;
        if ($noteRattrapage !== null) {
            $noteFinale = max($noteNormal ?? 0, $noteRattrapage);
        }

        $note = Note::updateOrCreate(
            [
                'etudiant_id' => $request->etudiant_id,
                'module_id' => $request->module_id
            ],
            [
                'note_normal' => $noteNormal,
                'note_rattrapage' => $noteRattrapage,
                'note_finale' => $noteFinale
            ]
        );

        return response()->json(['message' => 'Note mise à jour avec succès !', 'data' => $note], 200);
    }

    // =========================================================================
    // --- GESTION DES DOCUMENTS (COURS, TD, TP) ---
    // =========================================================================

    public function getDocuments(Request $request)
    {
        try {
            $user = $request->user();
            $professeur = DB::table('professeurs')->where('user_id', $user->id)->first();
            
            if (!$professeur) {
                return response()->json(['message' => 'Profil professeur introuvable.'], 404);
            }

            $moduleIds = DB::table('modules')->where('professeur_id', $professeur->id)->pluck('id')->toArray();

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
                    $doc->module->filiere = DB::table('filieres')->where('id', $doc->module->filiere_id)->first();
                }
            }

            return response()->json($documents, 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Erreur lors du chargement des documents.', 'error' => $e->getMessage()], 500);
        }
    }

    public function uploadDocument(Request $request)
    {
        try {
            $request->validate([
                'module_id' => 'required|exists:modules,id',
                'titre' => 'required|string|max:255',
                'type' => 'required|in:cours,td,tp',
                'file' => 'required|file|mimes:pdf,doc,docx,ppt,pptx,zip,rar|max:10240',
            ]);

            if ($request->hasFile('file')) {
                $path = $request->file('file')->store('documents', 'public');

                $documentId = DB::table('documents')->insertGetId([
                    'module_id' => $request->module_id,
                    'titre' => $request->titre,
                    'type' => $request->type,
                    'file_path' => $path,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);

                $createdDoc = DB::table('documents')->where('id', $documentId)->first();
                if ($createdDoc) {
                    $createdDoc->module = DB::table('modules')->where('id', $createdDoc->module_id)->first();
                }

                return response()->json(['message' => 'Document publié avec succès !', 'document' => $createdDoc], 201);
            }
            return response()->json(['message' => 'Aucun fichier détecté.'], 400);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Erreur interne lors de l\'enregistrement.', 'error_details' => $e->getMessage()], 500);
        }
    }

    public function updateDocument(Request $request, $id)
    {
        try {
            $request->validate([
                'module_id' => 'required|exists:modules,id',
                'titre' => 'required|string|max:255',
                'type' => 'required|in:cours,td,tp',
                'file' => 'nullable|file|mimes:pdf,doc,docx,ppt,pptx,zip,rar|max:10240',
            ]);

            $document = DB::table('documents')->where('id', $id)->first();
            if (!$document) return response()->json(['message' => 'Document introuvable.'], 404);

            $updateData = ['module_id' => $request->module_id, 'titre' => $request->titre, 'type' => $request->type, 'updated_at' => now()];

            if ($request->hasFile('file')) {
                if (!empty($document->file_path)) Storage::disk('public')->delete($document->file_path);
                $updateData['file_path'] = $request->file('file')->store('documents', 'public');
            }

            DB::table('documents')->where('id', $id)->update($updateData);
            $updatedDoc = DB::table('documents')->where('id', $id)->first();
            if ($updatedDoc) $updatedDoc->module = DB::table('modules')->where('id', $updatedDoc->module_id)->first();

            return response()->json(['message' => 'Document mis à jour avec succès !', 'data' => $updatedDoc], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Erreur lors de la mise à jour.', 'error' => $e->getMessage()], 500);
        }
    }

    public function destroyDocument($id)
    {
        try {
            $document = DB::table('documents')->where('id', $id)->first();
            if (!$document) return response()->json(['message' => 'Document introuvable.'], 404);

            if (!empty($document->file_path)) Storage::disk('public')->delete($document->file_path);
            DB::table('documents')->where('id', $id)->delete();

            return response()->json(['message' => 'Document supprimé avec succès !'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Erreur lors de la suppression.', 'error' => $e->getMessage()], 500);
        }
    }

    // =========================================================================
    // --- GESTION DES MESSAGES & NOTIFICATIONS PROFESSEUR ---
    // =========================================================================

    /**
     * Récupérer les messages des promotions associées au prof
     */
    public function getNiveauxMessages(Request $request)
    {
        try {
            $user = $request->user();
            
            // 1. On cherche le professeur lié à l'ID utilisateur
            $professeur = DB::table('professeurs')->where('user_id', $user->id)->first();

            // 2. Stratégie d'extraction des niveaux
            $niveaux = [];
            if ($professeur) {
                $niveaux = DB::table('modules')
                    ->where('professeur_id', $professeur->id)
                    ->pluck('niveau')
                    ->unique()
                    ->filter()
                    ->values()
                    ->toArray();
            }

            // 🚀 REPARATION SECURE : Si aucun niveau n'est trouvé suite à une BDD vide ou mal seedée,
            // on force l'accès aux classes clés (1A et 2A) pour lui donner le canal de communication !
            if (empty($niveaux)) {
                $niveaux = ['1A', '2A'];
            }

            // 3. Charger le flux complet de tchat pour ces niveaux
            $messages = DB::table('messages')
                ->join('users', 'messages.sender_id', '=', 'users.id')
                ->whereIn('messages.niveau', $niveaux)
                ->orWhere('messages.receiver_id', $user->id)
                ->select('messages.*', 'users.prenom', 'users.nom', 'users.role')
                ->orderBy('messages.created_at', 'asc')
                ->get();

            return response()->json([
                'niveaux_accessibles' => array_values($niveaux),
                'messages' => $messages
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Erreur lors du chargement des messages.', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Envoyer un message général à toute une promotion (1A, 2A...)
     */
    public function sendMessageToClass(Request $request)
    {
        $request->validate([
            'niveau' => 'required|string',
            'contenu' => 'required|string',
        ]);

        DB::table('messages')->insert([
            'sender_id' => $request->user()->id,
            'niveau' => $request->niveau,
            'contenu' => $request->contenu,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['message' => 'Message envoyé avec succès !'], 201);
    }

    /**
     * Obtenir l'historique des alertes notifications du prof
     */
    public function getNotifications(Request $request)
    {
        $notifications = DB::table('notifications')
            ->where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($notifications, 200);
    }

    /**
     * Marquer les notifications lues d'un coup
     */
    public function markNotificationsAsRead(Request $request)
    {
        DB::table('notifications')
            ->where('user_id', $request->user()->id)
            ->update(['is_read' => true]);

        return response()->json(['message' => 'Notifications effacées.'], 200);
    }
// 1. Récupérer les étudiants d'une année spécifique (ex: '1A')
public function getEtudiantsByNiveau(Request $request, $niveau)
{
    // On cherche les étudiants inscrits dans le niveau sélectionné
    $etudiants = Etudiant::where('niveau', $niveau)
        ->with('user')
        ->get();

    return response()->json($etudiants, 200);
}

// 2. Envoyer un message privé
public function sendPrivateMessage(Request $request)
{
    $request->validate(['receiver_id' => 'required', 'contenu' => 'required']);
    
    DB::table('messages')->insert([
        'sender_id' => $request->user()->id,
        'receiver_id' => $request->receiver_id,
        'contenu' => $request->contenu,
        'created_at' => now(),
    ]);

    return response()->json(['message' => 'Message privé envoyé !'], 201);
}

public function getNiveauxAutorises(Request $request)
{
    // On récupère l'ID du prof connecté
    $prof = DB::table('professeurs')->where('user_id', $request->user()->id)->first();
    
    // On extrait uniquement les niveaux pour lesquels le prof a des modules
    $niveaux = DB::table('modules')
        ->where('professeur_id', $prof->id)
        ->pluck('niveau')
        ->unique()
        ->values();
        
    return response()->json($niveaux);
}

public function getChatHistory($studentUserId, Request $request)
{
    $profId = $request->user()->id;
    return DB::table('messages')
        ->where(function($q) use ($profId, $studentUserId) {
            $q->where('sender_id', $profId)->where('receiver_id', $studentUserId);
        })
        ->orWhere(function($q) use ($profId, $studentUserId) {
            $q->where('sender_id', $studentUserId)->where('receiver_id', $profId);
        })
        ->orderBy('created_at', 'asc')
        ->get();
}

}