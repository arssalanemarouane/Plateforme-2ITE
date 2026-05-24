<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// --- IMPORTATION DES CONTRÔLEURS ---
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\ModuleController;
use App\Http\Controllers\Api\ProfesseurController;
use App\Http\Controllers\Api\EtudiantController;
use App\Http\Controllers\Api\EmploiController;

// Routes publiques
Route::post('/login', [AuthController::class, 'login']);

// Routes protégées
Route::middleware('auth:sanctum')->group(function () {
    
    // --- AUTHENTIFICATION ---
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    
    // --- ROUTES MANAGEMENT ADMIN ---
    Route::get('/admin/stats', [AdminController::class, 'getStats']);
    Route::get('/admin/etudiants', [AdminController::class, 'getEtudiants']);
    Route::post('/admin/etudiants', [AdminController::class, 'storeEtudiant']);
    Route::get('/admin/professeurs', [AdminController::class, 'getProfesseurs']);
    Route::post('/admin/professeurs', [AdminController::class, 'storeProfesseur']);
    Route::delete('/admin/users/{id}', [AdminController::class, 'destroyUser']);
    Route::post('/admin/attestations/{id}/upload', [AdminController::class, 'uploadAttestation']);
    
    // --- GESTION DES MODULES ---
    Route::get('/admin/modules-data', [ModuleController::class, 'index']);
    Route::post('/admin/modules', [ModuleController::class, 'storeModule']);
    Route::delete('/admin/modules/{id}', [ModuleController::class, 'destroy']);
    
    // --- GESTION DES EMPLOIS DU TEMPS ---
    Route::get('/emplois', [EmploiController::class, 'index']);
    Route::post('/emplois', [EmploiController::class, 'store']);
    Route::delete('/emplois/{id}', [EmploiController::class, 'destroy']);

    // --- GESTION DES ANNONCES & ABSENCES ---
    Route::post('/admin/annonces', [AdminController::class, 'storeAnnonce']);
    Route::get('/annonces', [AdminController::class, 'getAnnonces']); 
    Route::delete('/admin/annonces/{id}', [AdminController::class, 'destroyAnnonce']);
    Route::get('/admin/absences', [AdminController::class, 'getAbsences']);
    Route::post('/admin/absences', [AdminController::class, 'storeAbsence']);
    Route::put('/admin/absences/{id}/justify', [AdminController::class, 'toggleJustifyAbsence']);
    Route::delete('/admin/absences/{id}', [AdminController::class, 'destroyAbsence']);

    // --- GESTION SERVICES ADMIN ---
    Route::get('/admin/services', [AdminController::class, 'getAdminServices']); 
    Route::post('/admin/attestations/{id}/valider', [AdminController::class, 'validerAttestation']);
    Route::post('/admin/reclamations/{id}/repondre', [AdminController::class, 'repondreReclamation']);

    // --- ROUTES ESPACE PROFESSEUR ---
    Route::get('/professeur/modules', [ProfesseurController::class, 'getMyModules']);
    Route::get('/professeur/modules/{moduleId}/etudiants', [ProfesseurController::class, 'getEtudiantsByModule']);
    Route::post('/professeur/notes', [ProfesseurController::class, 'saveNote']);
    Route::get('/professeur/emplois', [ProfesseurController::class, 'getMyEmploisTemps']);
    
    // GESTION DOCUMENTS PROF
    Route::get('/professeur/documents', [ProfesseurController::class, 'getDocuments']);
    Route::post('/professeur/documents', [ProfesseurController::class, 'uploadDocument']);
    Route::post('/professeur/documents/{id}/update', [ProfesseurController::class, 'updateDocument']);
    Route::delete('/professeur/documents/{id}', [ProfesseurController::class, 'destroyDocument']);
    
    // MESSAGERIE PROFESSEUR (Nouveau)
    Route::get('/professeur/niveaux-autorises', [ProfesseurController::class, 'getNiveauxAutorises']);
    Route::get('/professeur/etudiants/{niveau}', [ProfesseurController::class, 'getEtudiantsByNiveau']);
    Route::get('/professeur/chat/{studentId}', [ProfesseurController::class, 'getChatHistory']);
    Route::post('/professeur/messages/envoyer-classe', [ProfesseurController::class, 'sendMessageToClass']);
    Route::post('/professeur/messages/envoyer-prive', [ProfesseurController::class, 'sendPrivateMessage']);
    Route::get('/professeur/notifications', [ProfesseurController::class, 'getNotifications']);
    Route::put('/professeur/notifications/lire-tout', [ProfesseurController::class, 'markNotificationsAsRead']);

    // --- ROUTES ESPACE ÉTUDIANT ---
    Route::get('/etudiant/notes', [EtudiantController::class, 'getMyNotes']);
    Route::get('/etudiant/documents', [EtudiantController::class, 'getMyDocuments']);
    Route::get('/etudiant/messages/filiere', [EtudiantController::class, 'getClassMessages']);
    Route::post('/etudiant/messages/repondre-prof', [EtudiantController::class, 'sendMessageToProf']);
    Route::get('/etudiant/dashboard-stats', [EtudiantController::class, 'getDashboardStats']);
    Route::get('/etudiant/mon-emploi', [EtudiantController::class, 'getMyEmploi']);
    Route::get('/etudiant/absences', [EtudiantController::class, 'getMyAbsences']);
    Route::get('/etudiant/annonces', [EtudiantController::class, 'getMyAnnonces']);
    Route::get('/etudiant/demandes', [EtudiantController::class, 'getMyDemandes']);
    Route::post('/etudiant/demandes', [EtudiantController::class, 'storeNewDemande']);
    Route::get('/etudiant/mes-professeurs', [EtudiantController::class, 'getMyProfesseurs']);
    Route::get('/etudiant/chat/{profUserId}', [EtudiantController::class, 'getChatHistory']);
    Route::post('/etudiant/send-message', [EtudiantController::class, 'sendMessageToProf']);

}); // Fin middleware sanctum