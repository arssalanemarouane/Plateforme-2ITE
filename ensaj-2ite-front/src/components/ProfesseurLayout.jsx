import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { FileSpreadsheet, LogOut, LayoutDashboard, Calendar, BookOpen, MessageSquare } from 'lucide-react'; // <-- AJOUT DE MESSAGESQUARE

export default function ProfesseurLayout({ children }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Configuration des onglets de navigation du professeur
    const menuItems = [
        { path: '/professeur/dashboard', name: 'Mon Espace', icon: <LayoutDashboard size={20} /> },
        { path: '/professeur/notes', name: 'Saisie des Notes', icon: <FileSpreadsheet size={20} /> },
        { path: '/professeur/emploi', name: 'Emploi du temps', icon: <Calendar size={20} /> },
        { path: '/professeur/documents', name: 'Cours & Documents', icon: <BookOpen size={20} /> }, 
        { path: '/professeur/messages', name: 'Messagerie & Alertes', icon: <MessageSquare size={20} /> }, // <-- ONGLER MESSAGERIE RAJOUTÉ
    ];

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-ensaj-light flex">
            {/* Sidebar Enseignant */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between fixed h-full z-10">
                <div>
                    <div className="p-6 border-b border-slate-800 text-center">
                        <h1 className="text-xl font-bold tracking-wider">ENSAJ 2ITE</h1>
                        <span className="text-xs text-amber-400 font-semibold uppercase tracking-widest">Espace Professeur</span>
                    </div>
                    <nav className="p-4 space-y-2">
                        {menuItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${
                                        isActive 
                                            ? 'bg-ensaj-primary text-white shadow-lg' 
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
                        <p className="text-sm font-semibold truncate text-white">Pr. {user?.prenom} {user?.nom}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                    </div>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition font-medium text-sm">
                        <LogOut size={18} />
                        Déconnexion
                    </button>
                </div>
            </aside>

            {/* Contenu principal */}
            <main className="flex-1 pl-64 min-h-screen flex flex-col">
                <header className="bg-white h-16 border-b border-gray-100 flex items-center justify-between px-8">
                    <h2 className="text-lg font-semibold text-ensaj-secondary">Gestion Pédagogique 2ITE</h2>
                </header>
                <div className="p-8 flex-1">
                    {children}
                </div>
            </main>
        </div>
    );
}