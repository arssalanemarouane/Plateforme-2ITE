import { useEffect, useState } from 'react';
import api from '../api/axios';
import AdminLayout from '../components/AdminLayout';
import { Users, GraduationCap, BookOpen, Activity } from 'lucide-react';

export default function AdminDashboard() {
    const [stats, setStats] = useState({ total_etudiants: 0, total_professeurs: 0, total_modules: 0 });

    useEffect(() => {
        api.get('/admin/stats').then(res => setStats(res.data)).catch(e => console.log(e));
    }, []);

    const cards = [
        { title: 'Étudiants inscrits', count: stats.total_etudiants, icon: <GraduationCap size={28}/>, color: 'bg-blue-500' },
        { title: 'Corps professoral', count: stats.total_professeurs, icon: <Users size={28}/>, color: 'bg-emerald-500' },
        { title: 'Modules actifs', count: stats.total_modules, icon: <BookOpen size={28}/>, color: 'bg-amber-500' },
    ];

    return (
        <AdminLayout>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {cards.map((card, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5">
                        <div className={`${card.color} text-white p-4 rounded-xl shadow-lg`}>
                            {card.icon}
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">{card.title}</p>
                            <p className="text-2xl font-bold text-ensaj-secondary">{card.count}</p>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="mt-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-ensaj-secondary flex items-center gap-2">
                    <Activity size={20} className="text-ensaj-primary" />
                    Activités récentes de la filière 2ITE
                </h3>
                <p className="text-gray-400 text-sm mt-4 italic">Aucune activité récente à afficher pour le moment.</p>
            </div>
        </AdminLayout>
    );
}