import { useEffect, useState } from 'react';
import api from '../api/axios';
import EtudiantLayout from '../components/EtudiantLayout';
import { useAuth } from '../context/AuthContext';
import { Award, CheckCircle, Clock, Calendar, Download } from 'lucide-react';

export default function EtudiantDashboard() {
    const { user } = useAuth();
    const [notes, setNotes] = useState([]);
    const [absencesCount, setAbsencesCount] = useState('00');
    const [emploiImg, setEmploiImg] = useState(null); 
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // On appelle les deux routes spécifiques à l'étudiant connecté
                const [resNotes, resStats] = await Promise.all([
                    api.get('/etudiant/notes', { withCredentials: true }),
                    api.get('/etudiant/dashboard-stats', { withCredentials: true })
                ]);

                setNotes(resNotes.data);

                // Compteur d'absences
                const totalAbs = resStats.data.total_absences;
                setAbsencesCount(totalAbs < 10 ? `0${totalAbs}` : totalAbs);

                // Récupération de l'emploi du temps envoyé par le filtrage Backend
                const emploiData = resStats.data.emploi;
                if (emploiData) {
                    // Sécurité : On prend la première colonne qui contient une valeur textuelle
                    const path = emploiData.image_path || empleoData.file_path || emploiData.fichier_path;
                    if (path) {
                        setEmploiImg(`http://127.0.0.1:8000/storage/${path}`);
                    }
                }
                
            } catch (err) {
                console.error("Erreur lors du chargement du tableau de bord :", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Calculs de statistiques du bulletin
    const totalModules = notes.length;
    const modulesValides = notes.filter(n => parseFloat(n.note_finale) >= 12).length;
    const notesPubliees = notes.filter(n => n.note_finale !== null && n.note_finale !== '');
    
    const moyenneGenerale = notesPubliees.length > 0
        ? (notesPubliees.reduce((acc, curr) => acc + parseFloat(curr.note_finale), 0) / notesPubliees.length).toFixed(2)
        : null;

    return (
        <EtudiantLayout>
            {/* Bannière de bienvenue */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 text-white shadow-xl mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Ravi de vous revoir, {user?.prenom} ! 👋</h1>
                    <p className="text-slate-300 text-sm mt-1.5">Consultez vos dernières mises à jour académiques pour la filière informatique 2ITE.</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 text-xs font-medium uppercase tracking-wider">
                    {user?.etudiant?.niveau || '2ITE'} Cycle Ingénieur
                </div>
            </div>

            {loading ? (
                <div className="text-center p-12 text-gray-400 font-medium italic">
                    Chargement de vos indicateurs en cours...
                </div>
            ) : (
                <>
                    {/* Cartes de statistiques */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                            <div>
                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Moyenne Générale</span>
                                <h3 className="text-2xl font-black text-slate-800 mt-1">{moyenneGenerale ? `${moyenneGenerale} / 20` : '—'}</h3>
                            </div>
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600"><Award size={24} /></div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                            <div>
                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Modules Validés</span>
                                <h3 className="text-2xl font-black text-emerald-600 mt-1">{modulesValides} <span className="text-gray-300 text-base font-normal">/ {totalModules}</span></h3>
                            </div>
                            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500"><CheckCircle size={24} /></div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                            <div>
                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Absences Signalées</span>
                                <h3 className="text-2xl font-black text-amber-600 mt-1">{absencesCount}</h3>
                            </div>
                            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500"><Clock size={24} /></div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
                        {/* Section Dernières Notes */}
                        <div className="xl:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
                            <h4 className="text-base font-bold text-slate-800 mb-4">Dernières notes</h4>
                            {notesPubliees.length === 0 ? (
                                <p className="text-sm text-gray-400 italic">Aucune note saisie à ce jour.</p>
                            ) : (
                                <div className="space-y-3">
                                    {notesPubliees.slice(0, 3).map(n => (
                                        <div key={n.id} className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl">
                                            <div className="max-w-[70%]">
                                                <p className="text-sm font-semibold text-gray-800 truncate">{n.module?.nom || n.module?.libelle || 'Module'}</p>
                                                <p className="text-xs text-gray-400 truncate">Pr. {n.module?.professeur?.user?.nom || 'Enseignant'}</p>
                                            </div>
                                            <span className={`text-sm font-bold px-3 py-1 rounded-lg ${parseFloat(n.note_finale) >= 12 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                                                {n.note_finale}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Section Emploi du Temps Filtré */}
                        <div className="xl:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
                                    <Calendar size={18} className="text-blue-600" />
                                    Emploi du temps actuel
                                </h4>
                                {emploiImg && (
                                    <button 
                                        onClick={() => window.open(emploiImg, '_blank')} 
                                        className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                                    >
                                        <Download size={14} /> Agrandir / Télécharger
                                    </button>
                                )}
                            </div>

                            {emploiImg ? (
                                <div className="rounded-xl overflow-hidden border border-gray-100 bg-gray-50 p-2">
                                    <img 
                                        src={emploiImg} 
                                        alt="Mon Emploi du Temps Académique" 
                                        className="w-full h-auto object-contain max-h-[400px] mx-auto rounded-lg shadow-sm" 
                                    />
                                </div>
                            ) : (
                                <div className="py-20 flex flex-col items-center justify-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                    <Calendar size={40} className="text-gray-300 mb-2" />
                                    <p className="text-gray-400 text-sm">Aucun emploi du temps n'a encore été publié pour votre année d'études.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </EtudiantLayout>
    );
}