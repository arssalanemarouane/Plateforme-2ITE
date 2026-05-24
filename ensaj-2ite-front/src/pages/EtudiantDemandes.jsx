import { useState, useEffect } from 'react';
import api from '../api/axios';
import EtudiantLayout from '../components/EtudiantLayout';
import { ClipboardList, Send, FileText, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

export default function EtudiantDemandes() {
    const [demandes, setDemandes] = useState([]);
    const [type, setType] = useState('attestation_scolarite');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState(null);

    const fetchDemandes = async () => {
        try {
            const res = await api.get('/etudiant/demandes', { withCredentials: true });
            setDemandes(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Erreur chargement services:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDemandes();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage(null);
        try {
            await api.post('/etudiant/demandes', {
                type: type,
                description_etudiant: description
            }, { withCredentials: true });
            
            setMessage({ status: 'success', text: 'Demande envoyée avec succès !' });
            setDescription('');
            fetchDemandes(); // Rafraîchit la liste
        } catch (err) {
            setMessage({ status: 'error', text: 'Une erreur est survenue lors de l\'envoi.' });
        } finally {
            setSubmitting(false);
        }
    };

    const getTypeLabel = (t) => {
        if (t === 'attestation_scolarite') return 'Attestation de Scolarité';
        if (t === 'releve_notes') return 'Relevé de Notes Semestriel';
        if (t === 'reclamation') return 'Réclamation / Plainte Pédagogique';
        return t;
    };

    const getStatusBadge = (status) => {
        if (status === 'en_attente') return 'bg-amber-100 text-amber-800 border border-amber-200';
        if (status === 'approuve' || status === 'termine') return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
        return 'bg-red-100 text-red-800 border border-red-200';
    };

    return (
        <EtudiantLayout>
            <div className="max-w-5xl mx-auto space-y-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <ClipboardList className="text-blue-600" size={24} />
                        Secrétariat & Services en ligne
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Commandez vos pièces administratives ou déposez une réclamation directement auprès de la direction de l'ENSAJ.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* FORMULAIRE DE SOUMISSION */}
                    <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-fit">
                        <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Send size={16} className="text-blue-500" /> Nouvelles requêtes
                        </h2>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nature du document / Service</label>
                                <select 
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                    className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition"
                                >
                                    <option value="attestation_scolarite">Attestation de Scolarité</option>
                                    <option value="releve_notes">Relevé de Notes</option>
                                    <option value="reclamation">Déposer une Réclamation</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Commentaires / Justifications (Optionnel)</label>
                                <textarea 
                                    rows="4"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Ex: Pour dossier de stage, erreur de saisie de note sur le module X..."
                                    className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition resize-none"
                                ></textarea>
                            </div>

                            {message && (
                                <div className={`p-3 rounded-xl text-xs font-medium ${message.status === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                                    {message.text}
                                </div>
                            )}

                            <button 
                                type="submit" 
                                disabled={submitting}
                                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-sm transition shadow-sm disabled:opacity-50 cursor-pointer"
                            >
                                {submitting ? <Loader2 size={16} className="animate-spin" /> : 'Transmettre la demande'}
                            </button>
                        </form>
                    </div>

                    {/* SUIVI DES DEMANDES EXPÉDIÉES */}
                    <div className="lg:col-span-2 space-y-4">
                        <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                            <FileText size={18} className="text-blue-500" /> Historique de mes demandes
                        </h2>

                        {loading ? (
                            <div className="bg-white p-12 text-center text-gray-400 text-sm rounded-2xl border border-gray-100">
                                Chargement de l'historique...
                            </div>
                        ) : demandes.length === 0 ? (
                            <div className="bg-white p-12 text-center text-gray-400 text-sm rounded-2xl border border-dashed border-gray-200">
                                Aucune demande en cours ou passée enregistrée sur votre espace.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {demandes.map((d) => (
                                    <div key={d.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="space-y-1 max-w-xl">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-slate-800">{getTypeLabel(d.type)}</span>
                                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide ${getStatusBadge(d.statut)}`}>
                                                    {d.statut === 'en_attente' ? 'En attente' : d.statut === 'rejete' ? 'Rejeté' : 'Prête / Terminé'}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-400 font-mono">Date d'émission : {new Date(d.created_at).toLocaleDateString('fr-FR')}</p>
                                            
                                            {d.description_etudiant && (
                                                <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded-lg mt-1 italic">« {d.description_etudiant} »</p>
                                            )}

                                            {/* Réponse ou motif de l'admin en fonction du statut */}
                                            {d.commentaire_admin && (
                                                <p className="text-xs text-red-600 bg-red-50/50 p-2 rounded-lg mt-1 flex items-center gap-1">
                                                    <AlertCircle size={12} /> **Motif de refus :** {d.commentaire_admin}
                                                </p>
                                            )}
                                            {d.reponse_admin && (
                                                <div className="text-xs text-emerald-700 bg-emerald-50/50 p-2 rounded-lg mt-1 flex items-start gap-1">
                                                    <CheckCircle2 size={12} className="mt-0.5 shrink-0" />
                                                    <div>**Réponse du secrétariat :** {d.reponse_admin}</div>
                                                </div>
                                            )}
                                            {d.fichier_path && (
    <a 
        href={`http://127.0.0.1:8000/storage/${d.fichier_path}`} 
        target="_blank" 
        rel="noopener noreferrer"
        className="mt-3 inline-flex items-center gap-2 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 transition"
    >
        <FileText size={13} /> Télécharger le document signé
    </a>
)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </EtudiantLayout>
    );
}