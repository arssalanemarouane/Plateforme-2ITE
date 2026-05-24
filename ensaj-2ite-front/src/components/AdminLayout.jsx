import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
    Users, GraduationCap, LayoutDashboard, BookOpen, 
    Calendar, LogOut, Megaphone, Briefcase, AlertTriangle 
} from 'lucide-react';

export default function AdminLayout({ children }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { path: '/admin/dashboard', name: "Vue d'ensemble", icon: <LayoutDashboard size={20} /> },
        { path: '/admin/etudiants', name: 'Gestion Étudiants', icon: <GraduationCap size={20} /> },
        { path: '/admin/professeurs', name: 'Gestion Professeurs', icon: <Users size={20} /> },
        { path: '/admin/modules', name: 'Filières & Modules', icon: <BookOpen size={20} /> },
        { path: '/admin/emplois', name: 'Emplois du temps', icon: <Calendar size={20} /> },
        { path: '/admin/annonces', name: 'Annonces & Avis', icon: <Megaphone size={20} /> },
        { path: '/admin/services', name: 'Services & Réclames', icon: <Briefcase size={20} /> },
        { path: '/admin/absences', name: 'Gestion Absences', icon: <AlertTriangle size={20} /> },
    ];

    const handleLogout = async () => { 
        await logout(); 
        navigate('/login'); 
    };

    return (
        <div className="min-h-screen bg-ensaj-light flex">
            {/* SIDEBAR FIXED */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between fixed h-full z-10">
                {/* Zone haute avec scroll si débordement d'onglets */}
                <div className="flex-1 flex flex-col min-h-0">
                    <div className="p-6 border-b border-slate-800 text-center flex-shrink-0">
                        <h1 className="text-xl font-bold">ENSAJ - 2ITE</h1>
                        <span className="text-xs text-ensaj-accent font-medium uppercase tracking-widest">Espace Admin</span>
                    </div>
                    
                    {/* Navigation scrollable individuellement */}
                    <nav className="p-4 space-y-2 overflow-y-auto flex-1 custom-scrollbar">
                        {menuItems.map((item) => (
                            <Link 
                                key={item.path} 
                                to={item.path} 
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${
                                    location.pathname === item.path 
                                        ? 'bg-ensaj-primary text-white shadow-lg' 
                                        : 'text-gray-400 hover:bg-slate-800 hover:text-white'
                                }`}
                            >
                                {item.icon} {item.name}
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* Zone basse fixe (Infos + Déconnexion) */}
                <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex-shrink-0">
                    <div className="mb-3 px-2">
                        <p className="text-sm font-semibold truncate text-white">{user?.prenom} {user?.nom}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <button 
                        onClick={handleLogout} 
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition font-medium text-sm"
                    >
                        <LogOut size={18} /> Déconnecter
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 pl-64 min-h-screen flex flex-col">
                <header className="bg-white h-16 border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-0">
                    <h2 className="text-lg font-semibold text-ensaj-secondary">Tableau de bord de gestion</h2>
                    <div className="text-sm bg-ensaj-light px-4 py-1.5 rounded-full font-medium text-gray-600">Année Universitaire : 2025/2026</div>
                </header>
                <div className="p-8 flex-1">{children}</div>
            </main>
        </div>
    );
}