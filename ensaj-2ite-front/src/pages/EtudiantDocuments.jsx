import { useState, useEffect } from 'react';
import api from '../api/axios';
import EtudiantLayout from '../components/EtudiantLayout';
import { Download, BookOpen, Clock, User } from 'lucide-react';

export default function EtudiantDocuments() {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                const res = await api.get('/etudiant/documents', { withCredentials: true });
                setDocuments(res.data);
            } catch (err) {
                console.error("Erreur lors de la récupération des cours:", err);
                setError("Impossible de charger les documents pédagogiques.");
            } finally {
                setLoading(false);
            }
        };

        fetchDocuments();
    }, []);

    // Fonction pour formater la date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <EtudiantLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Cours & Supports Pédagogiques</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Accédez à l'ensemble des cours, TD et TP mis en ligne par vos professeurs pour votre promotion.
                    </p>
                </div>

                {loading ? (
                    <div className="flex h-60 items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100">
                        {error}
                    </div>
                ) : documents.length === 0 ? (
                    <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-12 text-center">
                        <BookOpen className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                        <h3 className="text-sm font-semibold text-slate-700">Aucun document disponible</h3>
                        <p className="text-xs text-slate-400 mt-1">Vos professeurs n'ont pas encore publié de supports pour vos modules.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {documents.map((doc) => (
                            <div key={doc.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition p-5 flex flex-col justify-between space-y-4">
                                <div className="space-y-3">
                                    {/* Badge Type de Document */}
                                    <div className="flex items-center justify-between">
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                                            doc.type === 'cours' ? 'bg-blue-50 text-blue-600' :
                                            doc.type === 'td' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                                        }`}>
                                            {doc.type}
                                        </span>
                                        <span className="text-xs font-mono font-bold text-slate-400">
                                            {doc.module?.code || 'MODULE'}
                                        </span>
                                    </div>

                                    {/* Titre & Module */}
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-base line-clamp-1">{doc.titre}</h3>
                                        <p className="text-xs text-slate-500 font-medium mt-0.5">{doc.module?.nom}</p>
                                    </div>
                                </div>

                                {/* Infos Enseignant & Date */}
                                <div className="pt-3 border-t border-gray-50 space-y-2">
                                    <div className="flex items-center text-xs text-slate-500 gap-2">
                                        <User size={14} className="text-slate-400" />
                                        <span className="truncate">
                                            {doc.module?.professeur?.user 
                                                ? `Prof. ${doc.module.professeur.user.prenom} ${doc.module.professeur.user.nom}`
                                                : 'Professeur ENSAJ'}
                                        </span>
                                    </div>
                                    <div className="flex items-center text-xs text-slate-400 gap-2">
                                        <Clock size={14} />
                                        <span>Publié le {formatDate(doc.created_at)}</span>
                                    </div>
                                </div>

                                {/* 🚀 REPARATION BOUTON : Utilisation de window.open + alignement sur file_path */}
                                <button
                                    onClick={() => {
                                        const filePath = doc.file_path || doc.fichier_path;
                                        window.open(`http://127.0.0.1:8000/storage/${filePath}`, '_blank');
                                    }}
                                    className="w-full mt-2 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs py-2.5 px-4 rounded-xl transition shadow-sm cursor-pointer"
                                >
                                    <Download size={14} />
                                    Télécharger le support
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </EtudiantLayout>
    );
}