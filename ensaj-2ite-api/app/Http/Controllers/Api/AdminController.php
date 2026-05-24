<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Etudiant;
use App\Models\Professeur;
use App\Models\Module;
use App\Models\Demande;
use App\Models\Annonce;
use App\Models\Absence;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class AdminController extends Controller
{
    /**
     * Statistiques pour le Dashboard
     */
    public function getStats()
    {
        return response()->json([
            'total_etudiants' => Etudiant::count(),
            'total_professeurs' => Professeur::count(),
            'total_modules' => Module::count(),
            'demandes_en_attente' => Demande::where('statut', 'en_attente')->count(),
        ]);
    }

    /**
     * Gestion des Étudiants
     */
    public function getEtudiants()
    {
        return response()->json(User::where('role', 'etudiant')->with('etudiant.filiere')->get(), 200);
    }

    public function storeEtudiant(Request $request)
    {
        $request->validate([
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'cne' => 'required|string|max:50|unique:etudiants,cne',
            'date_naissance' => 'required|date|before:today', 
            'filiere_id' => 'required|exists:filieres,id',
            'niveau' => 'required|in:1A,2A,3A',
        ]);

        try {
            return DB::transaction(function () use ($request) {
                $user = User::create([
                    'nom' => $request->nom,
                    'prenom' => $request->prenom,
                    'email' => $request->email,
                    'password' => Hash::make($request->password),
                    'role' => 'etudiant',
                ]);

                Etudiant::create([
                    'user_id' => $user->id,
                    'cne' => $request->cne,
                    'date_naissance' => $request->date_naissance,
                    'filiere_id' => $request->filiere_id,
                    'niveau' => $request->niveau,
                ]);

                return response()->json(['message' => 'Étudiant inscrit avec succès !'], 201);
            });
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Une erreur est survenue lors de l\'inscription en base de données.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Gestion des Professeurs
     */
    public function getProfesseurs()
    {
        return response()->json(User::where('role', 'professeur')->with('professeur')->get(), 200);
    }

    public function storeProfesseur(Request $request)
    {
        $request->validate([
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
        ]);

        return DB::transaction(function () use ($request) {
            $user = User::create([
                'nom' => $request->nom,
                'prenom' => $request->prenom,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'professeur',
            ]);

            Professeur::create([
                'user_id' => $user->id,
                'specialite' => $request->specialite ?? 'Informatique',
            ]);

            return response()->json(['message' => 'Compte professeur créé !'], 201);
        });
    }

    /**
     * GESTION DES SERVICES (Attestations & Réclamations)
     */
    public function getAdminServices()
    {
        try {
            return response()->json([
                // Récupère uniquement les demandes en attente pour un affichage propre
                'demandes' => Demande::where('type', '!=', 'reclamation')
                    ->where('statut', 'en_attente')
                    ->with('etudiant.user')
                    ->orderBy('created_at', 'desc')
                    ->get(),
                    
                'reclamations' => Demande::where('type', 'reclamation')
                    ->where('statut', 'en_attente')
                    ->with('etudiant.user')
                    ->orderBy('created_at', 'desc')
                    ->get(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors du chargement des services administratifs.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 🚀 RECTIFIÉ : Validation stable et message automatique généré pour l'étudiant
     */
    public function validerAttestation($id)
    {
        try {
            $demande = Demande::findOrFail($id);
            
            $typeLabel = $demande->type === 'attestation_scolarite' ? 'L\'Attestation de Scolarité' : 'Le Relevé de Notes';

            $demande->update([
                'statut' => 'termine',
                'reponse_admin' => $typeLabel . ' a été généré(e) et validé(e) numériquement par l\'administration de l\'ENSAJ. Vous pouvez venir récupérer l\'original signé auprès du guichet du secrétariat.'
            ]);

            return response()->json(['message' => 'Demande validée et traitée avec succès !'], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la validation du document.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 🚀 RECTIFIÉ : Réponse enregistrée sous reponse_admin et statut mis à jour
     */
    public function repondreReclamation(Request $request, $id)
    {
        $request->validate([
            'reponse' => 'required|string'
        ]);

        try {
            $demande = Demande::findOrFail($id);
            
            $demande->update([
                'reponse_admin' => $request->input('reponse'),
                'statut' => 'termine'
            ]);

            return response()->json(['message' => 'Réponse transmise à l\'étudiant avec succès !'], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de l\'enregistrement de la réponse.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * GESTION DES ANNONCES
     */
    public function storeAnnonce(Request $request)
    {
        $request->validate([
            'titre' => 'required|string|max:255',
            'contenu' => 'required|string',
            'fichier' => 'nullable|file|mimes:pdf,jpg,png,jpeg|max:5120'
        ]);
        
        try {
            $path = $request->hasFile('fichier') ? $request->file('fichier')->store('annonces', 'public') : null;
            $userId = $request->user() ? $request->user()->id : 1;

            $annonce = Annonce::create([
                'titre' => $request->titre,
                'contenu' => $request->contenu,
                'user_id' => $userId,
                'fichier_path' => $path,
                'cible' => $request->cible ?? 'all'
            ]);

            return response()->json(['message' => 'Annonce diffusée sur la plateforme !', 'data' => $annonce], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la création de l\'annonce',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getAnnonces() 
    { 
        return response()->json(Annonce::with('user')->orderBy('created_at', 'desc')->get()); 
    }

    /**
     * Supprimer une annonce définitivement
     */
    public function destroyAnnonce($id)
    {
        try {
            $annonce = Annonce::findOrFail($id);

            if ($annonce->fichier_path && Storage::disk('public')->exists($annonce->fichier_path)) {
                Storage::disk('public')->delete($annonce->fichier_path);
            }

            $annonce->delete();

            return response()->json(['message' => 'Annonce supprimée avec succès !'], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la suppression de l\'annonce.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * SUPPRESSION UTILISATEUR
     */
    public function destroyUser($id)
    {
        $user = User::findOrFail($id);
        $user->delete();
        return response()->json(['message' => 'Utilisateur supprimé définitivement.']);
    }

    /**
     * GESTION DES ABSENCES (Nouvelles fonctionnalités)
     */
    public function getAbsences()
    {
        $absences = Absence::with(['etudiant.user', 'module'])->orderBy('date_absence', 'desc')->get();
        return response()->json($absences, 200);
    }

    public function storeAbsence(Request $request)
    {
        $request->validate([
            'etudiant_id' => 'required|exists:etudiants,id',
            'module_id' => 'required|exists:modules,id',
            'date_absence' => 'required|date|before_or_equal:today',
            'heures' => 'required|integer|min:1|max:8',
            'justifie' => 'required|in:0,1,true,false', 
            'motif' => 'nullable|string|max:255'
        ]);

        try {
            $absence = Absence::create([
                'etudiant_id' => $request->etudiant_id,
                'module_id' => $request->module_id,
                'date_absence' => $request->date_absence,
                'heures' => $request->heures,
                'justifie' => filter_var($request->justifie, FILTER_VALIDATE_BOOLEAN), 
                'motif' => $request->justifie ? $request->motif : null
            ]);

            return response()->json(['message' => 'Absence enregistrée avec succès !', 'data' => $absence], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Une erreur SQL est survenue lors de l\'enregistrement.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function toggleJustifyAbsence(Request $request, $id)
    {
        $request->validate([
            'justifie' => 'required|boolean',
            'motif' => 'nullable|string|max:255'
        ]);

        $absence = Absence::findOrFail($id);
        $absence->update([
            'justifie' => $request->justifie,
            'motif' => $request->justifie ? $request->motif : null
        ]);

        return response()->json(['message' => 'Statut de l\'absence mis à jour !', 'data' => $absence], 200);
    }

    public function destroyAbsence($id)
    {
        $absence = Absence::findOrFail($id);
        $absence->delete();
        return response()->json(['message' => 'Fiche d\'absence supprimée.'], 200);
    }
    public function uploadAttestation(Request $request, $id)
{
    // Validation stricte
    $request->validate(['document' => 'required|file|mimes:pdf|max:5120']);

    $demande = Demande::findOrFail($id);
    
    // Enregistrement du fichier
    $path = $request->file('document')->store('attestations', 'public');

    // Mise à jour de la demande
    $demande->update([
        'statut' => 'termine',
        'reponse_admin' => 'Document officiel généré et disponible en téléchargement.',
        'fichier_path' => $path
    ]);

    return response()->json(['message' => 'Document uploadé avec succès !']);
}
}