<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EmploiTemps;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class EmploiController extends Controller
{
    /**
     * Enregistrer ou mettre à jour un emploi du temps (Espace Admin)
     */
    public function store(Request $request)
    {
        $request->validate([
            'niveau' => 'required|in:1A,2A,3A',
            'image' => 'required|image|mimes:jpeg,png,jpg|max:5120',
        ]);

        try {
            // 🚀 ALIGNEMENT STRICT : Recherche via le Query Builder pour éviter les écarts de modèle
            $emploi = DB::table('emploi_temps')->where('niveau', $request->niveau)->first();

            if ($request->hasFile('image')) {
                // Stockage physique dans public/storage/emplois
                $path = $request->file('image')->store('emplois', 'public');
                
                // Récupération sécurisée de l'ID de l'admin connecté
                $userId = Auth::id() ?? 1;

                if ($emploi) {
                    // Nettoyage de l'ancienne image physique si elle existe
                    if ($emploi->image_path && Storage::disk('public')->exists($emploi->image_path)) {
                        Storage::disk('public')->delete($emploi->image_path);
                    }

                    // Mise à jour de la ligne existante
                    DB::table('emploi_temps')
                        ->where('id', $emploi->id)
                        ->update([
                            'image_path' => $path,
                            'updated_by' => $userId,
                            'updated_at' => now()
                        ]);
                        
                    $result = DB::table('emploi_temps')->where('id', $emploi->id)->first();
                } else {
                    // Création d'une nouvelle fiche pour ce niveau
                    $id = DB::table('emploi_temps')->insertGetId([
                        'niveau' => $request->niveau,
                        'image_path' => $path,
                        'updated_by' => $userId,
                        'created_at' => now(),
                        'updated_at' => now()
                    ]);
                    
                    $result = DB::table('emploi_temps')->where('id', $id)->first();
                }

                return response()->json(['message' => 'Emploi du temps mis à jour avec succès !', 'data' => $result], 200);
            }
            
            return response()->json(['message' => 'Aucun fichier détecté'], 400);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de l\'enregistrement de l\'emploi du temps.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Récupérer tous les emplois du temps (Espace Admin)
     */
    public function index()
    {
        try {
            $emplois = DB::table('emploi_temps')->get();
            return response()->json($emplois, 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Erreur de chargement', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Supprimer un emploi du temps proprement
     */
    public function destroy($id)
    {
        try {
            $emploi = DB::table('emploi_temps')->where('id', $id)->first();

            if (!$emploi) {
                return response()->json(['message' => 'Emploi du temps introuvable.'], 404);
            }

            // Nettoyage du fichier image physique sur le serveur
            if ($emploi->image_path && Storage::disk('public')->exists($emploi->image_path)) {
                Storage::disk('public')->delete($emploi->image_path);
            }

            DB::table('emploi_temps')->where('id', $id)->delete();

            return response()->json(['message' => 'Emploi du temps supprimé avec succès !'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Erreur lors de la suppression.', 'error' => $e->getMessage()], 500);
        }
    }
}