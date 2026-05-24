import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogIn, Lock, Mail, GraduationCap } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            const user = await login(email, password);
            
            // Redirection conditionnelle selon le rôle de l'utilisateur
            if (user.role === 'admin') navigate('/admin/dashboard');
            else if (user.role === 'professeur') navigate('/professeur/dashboard');
            else navigate('/etudiant/dashboard');
        } catch (err) {
            console.error("Détail de l'erreur attrapée au Login :", err);
            
            // Détection précise de la cause de l'erreur
            if (!err.response) {
                setError("Impossible de contacter le serveur. Vérifiez que votre API Laravel est lancée sur le port 8000.");
            } else if (err.response.status === 401) {
                setError(err.response.data?.message || "Identifiants incorrects.");
            } else if (err.response.status === 500) {
                setError("Erreur interne du serveur (500). Regardez les logs Laravel (laravel.log) pour voir le bug.");
            } else {
                setError(err.response.data?.message || 'Une erreur inattendue est survenue.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-ensaj-light flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="text-center mb-8">
                    <div className="mx-auto w-16 h-16 bg-ensaj-primary/10 rounded-2xl flex items-center justify-center text-ensaj-primary mb-4">
                        <GraduationCap size={36} />
                    </div>
                    <h2 className="text-2xl font-bold text-ensaj-secondary">Portail Académique 2ITE</h2>
                    <p className="text-sm text-gray-500 mt-1">ÉCOLE NATIONALE DES SCIENCES APPLIQUÉES - EL JADIDA</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 font-medium whitespace-pre-line">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Adresse Email Institutionnelle</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                <Mail size={18} />
                            </span>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="pl-10 w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ensaj-primary focus:bg-white transition"
                                placeholder="nom.prenom@ensaj.ma"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                <Lock size={18} />
                            </span>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="pl-10 w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ensaj-primary focus:bg-white transition"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-ensaj-primary hover:bg-opacity-95 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-ensaj-primary/20 transition disabled:opacity-50"
                    >
                        {submitting ? 'Connexion en cours...' : (
                            <>
                                <LogIn size={18} />
                                Se connecter
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}