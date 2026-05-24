import { useState, useEffect } from 'react';
import api from '../api/axios';
import ProfesseurLayout from '../components/ProfesseurLayout';
import { BookOpen, Users, ArrowRight, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ProfesseurDashboard() {
    const [modules, setModules] = useState([]);
    const [stats, setStats] = useState({ totalModules: 0, totalClasses: 0, totalDocuments: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // withCredentials garde la session active avec Laravel Sanctum
                const resModules = await api.get('/professeur/modules', { withCredentials: true });
                setModules(resModules.data);

                const resDocs = await api.get('/professeur/documents', { withCredentials: true });

                const classesUniques = [...new Set((resModules.data || []).map(m => m.niveau))];
                
                setStats({
                    totalModules: (resModules.data || []).length,
                    totalClasses: classesUniques.length,
                    totalDocuments: (resDocs.data || []).length
                });
            } catch (err) {
                console.error("Erreur lors du chargement du tableau de bord", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <ProfesseurLayout>
                <div className="flex h-64 w-full items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-900 border-t-transparent"></div>
                </div>
            </ProfesseurLayout>
        );
    }

    return (
        <ProfesseurLayout>
            <div className="max-w-6xl mx-auto space-y-6">
                
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h2 className="text-xl font-bold text-slate-900">Ravi de vous revoir ! 👋</h2>
                    <p className="text-xs text-gray-500 mt-1">Consultez l'état de vos enseignements et communiquez avec vos promotions depuis votre espace personnel.</p>
                </div>

                {/* 📊 CARTES STATS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Layers size={22} /></div>
                        <div>
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Modules attribués</p>
                            <p className="text-xl font-bold text-slate-800 mt-0.5">{stats.totalModules}</p>
                        </div>
                    </div>
                    
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Users size={22} /></div>
                        <div>
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Classes gérées</p>
                            <p className="text-xl font-bold text-slate-800 mt-0.5">{stats.totalClasses}</p>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><BookOpen size={22} /></div>
                        <div>
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Supports partagés</p>
                            <p className="text-xl font-bold text-slate-800 mt-0.5">{stats.totalDocuments}</p>
                        </div>
                    </div>
                </div>

                {/* 📂 LISTE DES MODULES ACTIFS */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-800 mb-4">Mes enseignements actifs (Filière 2ITE)</h3>
                    
                    {modules.length === 0 ? (
                        <p className="text-xs text-gray-400 italic">Aucun module ne vous a encore été attribué par l'administration.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {modules.map(mod => (
                                <div key={mod.id} className="p-4 bg-gray-50/50 border rounded-xl hover:border-slate-300 transition flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start">
                                            <span className="text-[10px] font-bold bg-slate-900 text-white px-2 py-0.5 rounded">
                                                Promotion : {mod.niveau}
                                            </span>
                                            <span className="text-[10px] font-semibold text-gray-400 font-mono">Code: {mod.code}</span>
                                        </div>
                                        <h4 className="text-sm font-bold text-slate-800 mt-2">{mod.nom || mod.libelle}</h4>
                                        <p className="text-xs text-gray-400 mt-0.5">Filière : {mod.filiere?.nom || 'Informatique & Ingénierie'}</p>
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
                                        <Link to="/professeur/notes" className="text-[11px] font-bold text-slate-900 hover:underline flex items-center gap-1">
                                            Évaluer les étudiants <ArrowRight size={12} />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </ProfesseurLayout>
    );
}