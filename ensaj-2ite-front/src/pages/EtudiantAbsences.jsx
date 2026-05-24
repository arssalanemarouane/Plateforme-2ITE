import { useState, useEffect } from 'react';
import api from '../api/axios';
import EtudiantLayout from '../components/EtudiantLayout';
import { Clock, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function EtudiantAbsences() {
    const [absences, setAbsences] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAbsences = async () => {
            try {
                // 🚀 APPEL AXIOS SÉCURISÉ + LOG DE CONTRÔLE
                const res = await api.get('/etudiant/absences', { withCredentials: true });
                console.log("Données d'absences reçues du serveur :", res.data);
                
                if (res.data && Array.isArray(res.data)) {
                    setAbsences(res.data);
                } else {
                    setAbsences([]);
                }
            } catch (err) {
                console.error("Erreur lors de la récupération des absences:", err);
                setAbsences([]);
            } finally {
                setLoading(false);
            }
        };

        fetchAbsences();
    }, []);

    // Calculs rapides et ultra-sécurisés pour les fiches du haut
    const totalHeures = absences.reduce((acc, curr) => {
        const h = parseInt(curr.heures, 10);
        return acc + (isNaN(h) ? 0 : h);
    }, 0);

    const nonJustifiees = absences.filter(a => {
        return a.justifie === false || a.justifie === 0 || a.justifie === "0" || a.justifie === "false";
    }).length;

    // Fonction de sécurité pour formater proprement la date
    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        try {
            const d = new Date(dateStr);
            return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('fr-FR', {
                day: 'numeric', month: 'long', year: 'numeric'
            });
        } catch {
            return dateStr;
        }
    };

    return (
        <EtudiantLayout>
            <div className="space-y-6 max-w-5xl mx-auto">
                {/* En-tête de la page */}
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Suivi de mes Absences</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Consultez le statut de vos présences en cours et suivez la validation de vos justificatifs par l'administration.
                    </p>
                </div>

                {loading ? (
                    <div className="flex h-64 items-center justify-center bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                    </div>
                ) : (
                    <>
                        {/* Cartes indicateurs */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                                <div>
                                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total des absences</span>
                                    <h3 className="text-2xl font-black text-slate-800 mt-0.5">{absences.length} fiches</h3>
                                </div>
                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-600"><Clock size={20} /></div>
                            </div>

                            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                                <div>
                                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Volume total perdu</span>
                                    <h3 className="text-2xl font-black text-amber-600 mt-0.5">{totalHeures} heures</h3>
                                </div>
                                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500"><AlertTriangle size={20} /></div>
                            </div>

                            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                                <div>
                                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Non justifiées</span>
                                    <h3 className="text-2xl font-black text-red-600 mt-0.5">{nonJustifiees} séances</h3>
                                </div>
                                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-500"><AlertTriangle size={20} /></div>
                            </div>
                        </div>

                        {/* Rendu dynamique du tableau */}
                        {absences.length === 0 ? (
                            <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-16 text-center">
                                <ShieldCheck className="mx-auto h-12 w-12 text-emerald-400 mb-3" />
                                <h3 className="text-sm font-semibold text-slate-700">Situation parfaitement régulière</h3>
                                <p className="text-xs text-slate-400 mt-1">Félicitations, vous n'avez aucune absence enregistrée sur ce semestre.</p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50 border-b border-gray-100 text-slate-400 font-bold text-xs uppercase tracking-wider">
                                                <th className="py-4 px-6">Date du cours</th>
                                                <th className="py-4 px-6">Module concerné</th>
                                                <th className="py-4 px-6">Volume</th>
                                                <th className="py-4 px-6">Statut de l'absence</th>
                                                <th className="py-4 px-6">Motif / Justification</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50 text-sm text-slate-700">
                                            {absences.map((abs) => {
                                                const isJustified = abs.justifie === true || abs.justifie === 1 || abs.justifie === "1" || abs.justifie === "true";
                                                const nomModule = abs.module_nom || abs.module?.nom || 'Module non spécifié';
                                                const codeModule = abs.module_code || abs.module?.code || '—';

                                                return (
                                                    <tr key={abs.id} className="hover:bg-slate-50/50 transition">
                                                        <td className="py-4 px-6 font-medium whitespace-nowrap">
                                                            {formatDate(abs.date_absence)}
                                                        </td>
                                                        <td className="py-4 px-6">
                                                            <span className="font-semibold text-slate-800">{nomModule}</span>
                                                            <span className="block text-xs text-slate-400 font-mono">{codeModule}</span>
                                                        </td>
                                                        <td className="py-4 px-6 font-mono font-semibold text-slate-600">{abs.heures}h</td>
                                                        <td className="py-4 px-6 whitespace-nowrap">
                                                            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                                                                isJustified ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                                                            }`}>
                                                                {isJustified ? 'Justifiée' : 'Non justifiée'}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-6 text-xs text-slate-500 italic max-w-xs truncate">
                                                            {isJustified ? (abs.motif || 'Accepté par l\'administration') : '—'}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </EtudiantLayout>
    );
}