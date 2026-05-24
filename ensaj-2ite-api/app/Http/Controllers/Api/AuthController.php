<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    /**
     * Connexion de l'utilisateur et génération du Token.
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // Vérification des identifiants
        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Identifiants incorrects. Veuillez réessayer.'
            ], 401);
        }

        // Génération du token Sanctum
        $token = $user->createToken('auth_token')->plainTextToken;

        // Récupération sécurisée des informations complémentaires selon le rôle
        $profileData = null;
        
        if ($user->role === 'etudiant' && $user->etudiant) {
            $profileData = [
                'cne' => $user->etudiant->cne,
                'niveau' => $user->etudiant->niveau,
                // Sécurité si la filière n'est pas encore créée ou associée
                'filiere' => $user->etudiant->filiere ? $user->etudiant->filiere->code : 'N/A', 
            ];
        } elseif ($user->role === 'professeur' && $user->professeur) {
            $profileData = [
                'specialite' => $user->professeur->specialite,
                'telephone' => $user->professeur->telephone,
            ];
        }

        // IMPORTANT pour ton React : vérifie si ton AuthContext attend 'token' ou 'access_token'
        return response()->json([
            'message' => 'Connexion réussie',
            'token' => $token, // Ajouté pour correspondre à localStorage.getItem('token') dans axios.js
            'access_token' => $token, 
            'token_type' => 'Bearer',
            'user' => [
                'id' => $user->id,
                'nom' => $user->nom,
                'prenom' => $user->prenom,
                'email' => $user->email,
                'role' => $user->role,
                'details' => $profileData
            ]
        ], 200);
    }

    /**
     * Déconnexion (Révocation du Token).
     */
    public function logout(Request $request)
    {
        // Supprime le token actuel utilisé pour la requête
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Déconnexion réussie avec succès.'
        ], 200);
    }

    /**
     * Récupérer le profil de l'utilisateur authentifié.
     */
    public function me(Request $request)
    {
        $user = $request->user();
        
        // Charger les relations dynamiquement sans planter si elles sont nulles
        if ($user->role === 'etudiant') {
            $user->load('etudiant.filiere');
        } elseif ($user->role === 'professeur') {
            $user->load('professeur');
        }

        return response()->json($user);
    }
}