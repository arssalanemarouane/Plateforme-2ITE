import { useState, useEffect } from 'react';
import api from '../api/axios';
import ProfesseurLayout from '../components/ProfesseurLayout';
import { Calendar, ImageIcon, AlertCircle } from 'lucide-react';

export default function ProfesseurEmplois() {
    const [emplois, setEmplois] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/professeur/emplois')
            .then(res => {
                setEmplois(Array.isArray(res.data) ? res.data : []);
            })
            .catch(err => {
                console.error("Erreur lors de la récupération des emplois du temps", err);
            })
            .finally(() => setLoading(false));
    }, []);

    return (
        <ProfesseurLayout>
            <div className="max-w-6xl mx-auto space-y-6">
                {/* En-tête de la page */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-2">
                        <Calendar size={22} className="text-slate-900" />
                        Mon Emploi du Temps Pédagogique
                    </h2>
                    <p className="text-sm text-gray-500">
                        Consultez ici les plannings officiels publiés par l'administration pour vos promotions d'affectation.
                    </p>
                </div>

                {/* Contenu principal */}
                {loading ? (
                    <div className="bg-white p-12 rounded-2xl border text-center text-gray-500 text-sm">
                        Chargement de vos emplois du temps personnalisés...
                    </div>
                ) : emplois.length === 0 ? (
                    <div className="bg-white p-12 rounded-2xl border text-center text-gray-400 text-sm italic flex flex-col items-center gap-2">
                        <AlertCircle size={24} className="text-gray-400" />
                        Aucun emploi du temps n'est disponible pour vos niveaux actuels ou aucun module ne vous est attribué.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {emplois.map(emp => (
                            <div key={emp.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between gap-4">
                                <div className="flex justify-between items-center border-b pb-3 border-gray-50">
                                    <span className="font-bold text-slate-800 text-base">Classe : 2ITE - {emp.niveau}</span>
                                    <span className="text-[11px] px-2.5 py-1 bg-slate-100 text-slate-700 font-bold rounded-md">
                                        Filière 2ITE
                                    </span>
                                </div>

                                {/* Conteneur de l'image de l'emploi du temps */}
                                <div className="rounded-xl overflow-hidden border border-gray-100 bg-gray-50 p-2 flex justify-center items-center h-64">
                                    {emp.image_path ? (
                                        <img 
                                            src={`http://127.0.0.1:8000/storage/${emp.image_path}`} 
                                            alt={`Emploi du temps ${emp.niveau}`}
                                            className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = "https://placehold.co/600x400?text=Image+indisponible";
                                            }}
                                        />
                                    ) : (
                                        <div className="text-center text-gray-400 text-xs flex flex-col items-center gap-2">
                                            <ImageIcon size={32} className="text-gray-300" />
                                            Aucun document visuel lié.
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end pt-2">
                                    <a 
                                        href={`http://127.0.0.1:8000/storage/${emp.image_path}`} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                                    >
                                        Ouvrir en plein écran ↗
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </ProfesseurLayout>
    );
}