import { useState, useEffect } from 'react';
import api from '../api/axios';
import EtudiantLayout from '../components/EtudiantLayout';
import { Megaphone, FileText, Calendar, Download } from 'lucide-react';

export default function EtudiantAnnonces() {
    const [annonces, setAnnonces] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnnonces = async () => {
            try {
                const res = await api.get('/etudiant/annonces', { withCredentials: true });
                setAnnonces(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                console.error("Erreur lors du chargement des annonces :", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAnnonces();
    }, []);

    // Formater la date proprement
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('fr-FR', {
            day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <EtudiantLayout>
            <div className="space-y-6 max-w-4xl mx-auto">
                {/* En-tête de la page */}
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Megaphone className="text-blue-600" size={24} />
                        Annonces de l'Administration
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Consultez les notes d'informations officielles, alertes de scolarité et documents partagés par l'ENSAJ.
                    </p>
                </div>

                {loading ? (
                    <div className="flex h-64 items-center justify-center bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                    </div>
                ) : annonces.length === 0 ? (
                    <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-16 text-center text-slate-400">
                        Aucune annonce officielle n'est affichée pour le moment.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {annonces.map((annonce) => (
                            <div key={annonce.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4 hover:border-gray-200 transition">
                                <div>
                                    <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                                        <Calendar size={12} /> {formatDate(annonce.created_at)} • Publié par l'administration ({annonce.admin_prenom} {annonce.admin_nom})
                                    </span>
                                    <h3 className="text-base font-bold text-slate-800 mt-1">{annonce.titre}</h3>
                                </div>
                                
                                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                                    {annonce.contenu}
                                </p>

                                {/* Gestion du fichier joint */}
                                {annonce.fichier_path && (
                                    <div className="pt-2">
                                        <a 
                                            href={`http://127.0.0.1:8000/storage/${annonce.fichier_path}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 border border-gray-100 rounded-xl text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 transition cursor-pointer"
                                        >
                                            <FileText size={14} className="text-blue-500" />
                                            Ouvrir la pièce jointe
                                            <Download size={12} className="ml-1 opacity-60" />
                                        </a>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </EtudiantLayout>
    );
}