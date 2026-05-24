<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Filiere;
use App\Models\Module;
use Illuminate\Http\Request;

class ModuleController extends Controller
{
    /**
     * Récupérer toutes les filières et tous les modules avec leurs relations.
     */
    public function index()
    {
        return response()->json([
            'filieres' => Filiere::all(),
            'modules' => Module::with(['filiere', 'professeur.user'])->get()
        ], 200);
    }

    /**
     * Ajouter un nouveau module académique.
     */
    public function storeModule(Request $request)
    {
        $request->validate([
            'code' => 'required|string|unique:modules,code',
            'libelle' => 'required|string|max:255',
            'filiere_id' => 'required|exists:filieres,id',
            'niveau' => 'required|in:1A,2A,3A',
            'professeur_id' => 'required|exists:professeurs,id',
        ]);

        $module = Module::create($request->all());

        return response()->json([
            'message' => 'Module créé et affecté avec succès !',
            'module' => $module
        ], 201); 
    }

    /**
     * Supprimer un module académique.
     */
    public function destroy($id)
    {
        try {
            $module = Module::findOrFail($id);
            $module->delete();
            
            return response()->json([
                'message' => 'Module supprimé avec succès'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la suppression',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}