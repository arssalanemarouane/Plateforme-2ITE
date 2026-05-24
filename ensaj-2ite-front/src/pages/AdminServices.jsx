import { useEffect, useState, useRef } from 'react';
import api from '../api/axios';
import AdminLayout from '../components/AdminLayout';
import { FileCheck, MessageSquare, Send, Loader2, Upload } from 'lucide-react';

export default function AdminServices() {
    const [demandes, setDemandes] = useState([]);
    const [reclamations, setReclamations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reponsesText, setReponsesText] = useState({});
    const [actionLoading, setActionLoading] = useState({});
    
    const fileInputRef = useRef(null);
    const [selectedDemandeId, setSelectedDemandeId] = useState(null);

    const loadData = async () => {
        try {
            const res = await api.get('/admin/services', { withCredentials: true });
            setDemandes(res.data.demandes || []);
            setReclamations(res.data.reclamations || []);
        } catch (err) {
            console.error("Erreur chargement:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    // 🏛️ GESTION UPLOAD PDF
    const handleFileUpload = async (e, id) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('document', file);

        setActionLoading(prev => ({ ...prev, [id]: true }));
        try {
            await api.post(`/admin/attestations/${id}/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true
            });
            alert("Document PDF envoyé avec succès !");
            loadData();
        } catch (err) {
            console.error(err);
            alert("Erreur lors de l'upload.");
        } finally {
            setActionLoading(prev => ({ ...prev, [id]: false }));
        }
    };

    // 💬 RÉPONSE AUX RÉCLAMATIONS
    const handleSendReponse = async (id) => {
        const texteReponse = reponsesText[id];
        if (!texteReponse?.trim()) return alert("Saisissez une réponse.");

        setActionLoading(prev => ({ ...prev, [id]: true }));
        try {
            await api.post(`/admin/reclamations/${id}/repondre`, {
                reponse: texteReponse
            }, { withCredentials: true });

            alert("Réponse transmise !");
            // 🚀 CORRECTION : Reset de l'input précis pour cette réclamation
            setReponsesText(prev => ({ ...prev, [id]: '' }));
            loadData();
        } catch (err) {
            alert("Erreur transmission.");
        } finally {
            setActionLoading(prev => ({ ...prev, [id]: false }));
        }
    };

    return (
        <AdminLayout>
            <div className="mb-6">
                <h1 className="text-xl font-bold text-slate-800">Tableau de bord de gestion</h1>
            </div>

            {loading ? (
                <div className="flex h-64 items-center justify-center bg-white rounded-2xl"><Loader2 className="animate-spin text-blue-600" /></div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    
                    {/* ATTESTATIONS */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-5 border-b bg-gray-50 flex items-center gap-2 font-bold"><FileCheck size={20}/> Demandes d'Attestations</div>
                        <div className="divide-y">
                            {demandes.map(d => (
                                <div key={d.id} className="p-4 flex items-center justify-between">
                                    <p className="text-sm font-semibold">{d.etudiant?.user?.nom || 'Étudiant'} {d.etudiant?.user?.prenom}</p>
                                    <button 
                                        onClick={() => { setSelectedDemandeId(d.id); fileInputRef.current.click(); }}
                                        className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-blue-700 transition"
                                    >
                                        <Upload size={12}/> Choisir PDF
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RÉCLAMATIONS */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-4">
                        <div className="font-bold flex items-center gap-2 mb-4"><MessageSquare size={20}/> Réclamations</div>
                        {reclamations.map(r => (
                            <div key={r.id} className="p-3 border rounded-xl bg-amber-50/30">
                                <p className="text-sm font-semibold">{r.etudiant?.user?.nom || 'Étudiant'}:</p>
                                <p className="text-xs text-gray-600 mb-2">{r.description_etudiant}</p>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        placeholder="Répondre..." 
                                        value={reponsesText[r.id] || ''}
                                        onChange={(e) => setReponsesText({...reponsesText, [r.id]: e.target.value})}
                                        className="flex-1 text-xs p-2 border rounded-lg" 
                                    />
                                    <button 
                                        onClick={() => handleSendReponse(r.id)} 
                                        disabled={actionLoading[r.id]}
                                        className="p-2 bg-slate-900 text-white rounded-lg"
                                    >
                                        {actionLoading[r.id] ? <Loader2 size={14} className="animate-spin" /> : <Send size={14}/>}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            <input type="file" ref={fileInputRef} className="hidden" accept=".pdf" onChange={(e) => handleFileUpload(e, selectedDemandeId)} />
        </AdminLayout>
    );
}