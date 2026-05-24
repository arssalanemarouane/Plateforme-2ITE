import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import AdminEtudiants from './pages/AdminEtudiants';
import AdminProfesseurs from './pages/AdminProfesseurs';
import AdminModules from './pages/AdminModules';
import AdminEmplois from './pages/AdminEmplois';
import AdminAnnonces from './pages/AdminAnnonces';
import AdminServices from './pages/AdminServices';
import AdminAbsences from './pages/AdminAbsences'; 
import ProfesseurNotes from './pages/ProfesseurNotes';
import ProfesseurEmplois from './pages/ProfesseurEmplois'; 
import ProfesseurDocuments from './pages/ProfesseurDocuments'; 
import ProfesseurMessages from './pages/ProfesseurMessages'; 
import ProfesseurDashboard from './pages/ProfesseurDashboard'; 
import EtudiantNotes from './pages/EtudiantNotes';
import EtudiantDashboard from './pages/EtudiantDashboard';
import EtudiantDocuments from './pages/EtudiantDocuments';
import EtudiantEmploi from './pages/EtudiantEmploi';
import EtudiantAbsences from './pages/EtudiantAbsences'; 
import EtudiantAnnonces from './pages/EtudiantAnnonces'; 
import EtudiantDemandes from './pages/EtudiantDemandes';
// 🚀 CORRECTION : Importation du composant de tchat qui apparaissait sur ta capture d'écran
import EtudiantMessages from './pages/EtudiantMessages'; 

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gray-50">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-ensaj-primary border-t-transparent"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        const defaultPath = user.role === 'admin' ? '/admin/dashboard' : `/${user.role}/dashboard`;
        return <Navigate to={defaultPath} replace />;
    }

    return children;
};

function AppContent() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            
            {/* --- ADMIN ROUTES --- */}
            <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/etudiants" element={<ProtectedRoute allowedRoles={['admin']}><AdminEtudiants /></ProtectedRoute>} />
            <Route path="/admin/professeurs" element={<ProtectedRoute allowedRoles={['admin']}><AdminProfesseurs /></ProtectedRoute>} />
            <Route path="/admin/modules" element={<ProtectedRoute allowedRoles={['admin']}><AdminModules /></ProtectedRoute>} />
            <Route path="/admin/emplois" element={<ProtectedRoute allowedRoles={['admin']}><AdminEmplois /></ProtectedRoute>} />
            <Route path="/admin/annonces" element={<ProtectedRoute allowedRoles={['admin']}><AdminAnnonces /></ProtectedRoute>} />
            <Route path="/admin/services" element={<ProtectedRoute allowedRoles={['admin']}><AdminServices /></ProtectedRoute>} />
            <Route path="/admin/absences" element={<ProtectedRoute allowedRoles={['admin']}><AdminAbsences /></ProtectedRoute>} />

            {/* --- PROFESSEUR ROUTES --- */}
            <Route path="/professeur/dashboard" element={<ProtectedRoute allowedRoles={['professeur']}><ProfesseurDashboard /></ProtectedRoute>} />
            <Route path="/professeur/notes" element={<ProtectedRoute allowedRoles={['professeur']}><ProfesseurNotes /></ProtectedRoute>} />
            <Route path="/professeur/emploi" element={<ProtectedRoute allowedRoles={['professeur']}><ProfesseurEmplois /></ProtectedRoute>} />
            <Route path="/professeur/documents" element={<ProtectedRoute allowedRoles={['professeur']}><ProfesseurDocuments /></ProtectedRoute>} /> 
            <Route path="/professeur/messages" element={<ProtectedRoute allowedRoles={['professeur']}><ProfesseurMessages /></ProtectedRoute>} /> 
            
            {/* --- ETUDIANT ROUTES --- */}
            <Route path="/etudiant/dashboard" element={<ProtectedRoute allowedRoles={['etudiant']}><EtudiantDashboard /></ProtectedRoute>} />
            <Route path="/etudiant/annonces" element={<ProtectedRoute allowedRoles={['etudiant']}><EtudiantAnnonces /></ProtectedRoute>} />
            <Route path="/etudiant/services" element={<ProtectedRoute allowedRoles={['etudiant']}><EtudiantDemandes /></ProtectedRoute>} />
            // 🚀 CORRECTION : Ajout du routage sécurisé pour la page des messages profs
            <Route path="/etudiant/messages" element={<ProtectedRoute allowedRoles={['etudiant']}><EtudiantMessages /></ProtectedRoute>} />
            <Route path="/etudiant/notes" element={<ProtectedRoute allowedRoles={['etudiant']}><EtudiantNotes /></ProtectedRoute>} />
            <Route path="/etudiant/documents" element={<ProtectedRoute allowedRoles={['etudiant']}><EtudiantDocuments /></ProtectedRoute>} />
            <Route path="/etudiant/emploi" element={<ProtectedRoute allowedRoles={['etudiant']}><EtudiantEmploi /></ProtectedRoute>} />
            <Route path="/etudiant/absences" element={<ProtectedRoute allowedRoles={['etudiant']}><EtudiantAbsences /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <Router>
                <AppContent />
            </Router>
        </AuthProvider>
    );
}