import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Award, BookOpen, LogOut, LayoutDashboard, Calendar, Clock, Megaphone, ClipboardList, MessageSquare } from 'lucide-react';

export default function EtudiantLayout({ children }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { path: '/etudiant/dashboard', name: 'Mon Tableau de bord', icon: <LayoutDashboard size={20} /> },
        { path: '/etudiant/annonces', name: 'Annonces Admin', icon: <Megaphone size={20} /> },
        { path: '/etudiant/services', name: 'Demandes & Certifs', icon: <ClipboardList size={20} /> },
        { path: '/etudiant/messages', name: 'Contacter mes Profs', icon: <MessageSquare size={20} /> },
        { path: '/etudiant/notes', name: 'Mes Notes / Résultats', icon: <Award size={20} /> },
        { path: '/etudiant/documents', name: 'Cours & TD en ligne', icon: <BookOpen size={20} /> },
        { path: '/etudiant/emploi', name: 'Mon Emploi du temps', icon: <Calendar size={20} /> },
        { path: '/etudiant/absences', name: 'Mes Absences', icon: <Clock size={20} /> },
    ];

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar Étudiant */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between fixed h-full z-10">
                <div>
                    <div className="p-6 border-b border-slate-800 text-center">
                        <h1 className="text-xl font-bold tracking-wider">ENSAJ 2ITE</h1>
                        <span className="text-xs text-amber-400 font-semibold uppercase tracking-widest">Espace Étudiant</span>
                    </div>
                    {/* 🚀 FIX : max-h et overflow-y-auto empêchent le menu de pousser le bouton déconnexion */}
                    <nav className="p-4 space-y-2 max-h-[calc(100vh-16rem)] overflow-y-auto scrollbar-none">
                        {menuItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${
                                        isActive 
                                            ? 'bg-blue-600 text-white shadow-lg' 
                                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                    }`}
                                >
                                    {item.icon}
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="p-4 border-t border-slate-800 bg-slate-950/50">
                    <div className="mb-3 px-2">
                        <p className="text-sm font-semibold truncate text-white">{user?.prenom} {user?.nom}</p>
                        <p className="text-xs text-slate-500 uppercase font-mono tracking-wider">
                            Filière : 2ITE
                        </p>
                    </div>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition font-medium text-sm cursor-pointer">
                        <LogOut size={18} />
                        Déconnexion
                    </button>
                </div>
            </aside>

            {/* Contenu de la page */}
            <main className="flex-1 pl-64 min-h-screen flex flex-col">
                <header className="bg-white h-16 border-b border-gray-100 flex items-center justify-between px-8">
                    <h2 className="text-lg font-semibold text-slate-800">Portail Pédagogique Étudiant</h2>
                    <div className="text-xs bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full font-mono font-semibold">
                        Mon Espace Réseau
                    </div>
                </header>
                <div className="p-8 flex-1">
                    {children}
                </div>
            </main>
        </div>
    );
}