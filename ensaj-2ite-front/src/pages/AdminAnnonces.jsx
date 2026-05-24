import { useEffect, useState } from 'react';
import api from '../api/axios';
import AdminLayout from '../components/AdminLayout';
import { Megaphone, Paperclip, FileText, Calendar, User, Trash2 } from 'lucide-react';

export default function AdminAnnonces() {
    const [annonces, setAnnonces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [titre, setTitre] = useState('');
    const [contenu, setContenu] = useState('');
    const [fichier, setFichier] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // 1. Récupérer les annonces existantes depuis l'API Laravel
    const fetchAnnonces = async () => {
        try {
            setLoading(true);
            const response = await api.get('/annonces');
            setAnnonces(response.data);
        } catch (err) {
            console.error("Impossible de charger les annonces :", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnnonces();
    }, []);

    // 2. Gérer la soumission du formulaire
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        
        const data = new FormData();
        data.append('titre', titre);
        data.append('contenu', contenu);
        if (fichier) data.append('fichier', fichier);

        const token = localStorage.getItem('token');

        try {
            await api.post('/admin/annonces', data, {
                headers: { 
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });
            alert("Annonce diffusée avec succès !");
            setTitre(''); 
            setContenu(''); 
            setFichier(null);
            fetchAnnonces();
        } catch (err) {
            console.error("Erreur serveur détaillée:", err.response);
            const serverMessage = err.response?.data?.error || err.response?.data?.message || "Erreur de connexion.";
            alert("Erreur de publication : " + serverMessage);
        } finally {
            setSubmitting(false);
        }
    };

    // 3. Gérer la suppression d'une annonce
    const handleDelete = async (id) => {
        if (confirm("Voulez-vous vraiment supprimer cette annonce ?")) {
            try {
                await api.delete(`/admin/annonces/${id}`);
                fetchAnnonces();
            } catch (err) {
                console.error("Erreur lors de la suppression :", err.response);
                alert("Impossible de supprimer l'annonce.");
            }
        }
    };

    return (
        <AdminLayout>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                
                {/* Formulaire de publication (À gauche) */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
                    <h3 className="text-base font-bold text-ensaj-secondary mb-5 flex items-center gap-2">
                        <Megaphone size={18} className="text-ensaj-primary" />
                        Publier un Nouvel Avis
                    </h3>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input 
                            type="text" placeholder="Titre de l'annonce" required 
                            value={titre} onChange={e => setTitre(e.target.value)}
                            className="w-full bg-gray-50 p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-ensaj-primary text-sm" 
                        />
                        
                        <textarea 
                            placeholder="Contenu de l'avis..." required rows="5"
                            value={contenu} onChange={e => setContenu(e.target.value)}
                            className="w-full bg-gray-50 p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-ensaj-primary resize-none text-sm"
                        ></textarea>

                        <div className="border-2 border-dashed border-gray-200 p-4 rounded-xl text-center hover:bg-gray-50 transition relative">
                            <Paperclip className="mx-auto text-gray-400 mb-1" size={20} />
                            <span className="text-xs text-gray-500 block truncate">
                                {fichier ? fichier.name : "Joindre un document (PDF, Image...)"}
                            </span>
                            <input 
                                type="file" 
                                onChange={e => setFichier(e.target.files[0])}
                                className="absolute inset-0 opacity-0 cursor-pointer" 
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={submitting}
                            className="w-full bg-ensaj-primary text-white py-2.5 rounded-xl font-semibold text-sm hover:opacity-95 transition disabled:opacity-50 shadow-md"
                        >
                            {submitting ? 'Diffusion en cours...' : "Diffuser l'annonce"}
                        </button>
                    </form>
                </div>

                {/* Liste des annonces publiées (À droite) */}
                <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-base font-bold text-ensaj-secondary mb-5">Annonces & Avis Récents</h3>
                    
                    {loading ? (
                        <div className="text-sm text-gray-500 text-center py-8">Chargement du flux d'avis...</div>
                    ) : annonces.length === 0 ? (
                        <div className="text-sm text-gray-400 text-center py-8">Aucun avis diffusé pour le moment.</div>
                    ) : (
                        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                            {annonces.map((pub) => (
                                <div key={pub.id} className="p-4 border border-gray-100 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition relative group">
                                    
                                    {/* Bouton de suppression en haut à droite */}
                                    <button 
                                        onClick={() => handleDelete(pub.id)}
                                        className="absolute top-4 right-4 text-gray-400 hover:text-red-500 p-1.5 rounded-xl hover:bg-red-50 transition"
                                        title="Supprimer l'annonce"
                                    >
                                        <Trash2 size={16} />
                                    </button>

                                    <div className="pr-8">
                                        <h4 className="font-bold text-ensaj-secondary text-sm">{pub.titre}</h4>
                                        <p className="text-xs text-gray-600 mt-1.5 whitespace-pre-line leading-relaxed">{pub.contenu}</p>
                                    </div>
                                    
                                    {/* Méta-données sous l'annonce */}
                                    <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center gap-y-2 gap-x-4 text-[11px] text-gray-400">
                                        <span className="flex items-center gap-1">
                                            <User size={13} /> {pub.user ? `${pub.user.nom} ${pub.user.prenom}` : 'Administrateur'}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Calendar size={13} /> {new Date(pub.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </span>
                                        
                                        {/* Lien vers la pièce jointe Laravel si présente */}
                                        {pub.fichier_path && (
                                            <a 
                                                href={`http://127.0.0.1:8000/storage/${pub.fichier_path}`} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1 text-ensaj-primary font-semibold hover:underline ml-auto"
                                            >
                                                <FileText size={13} /> Voir la pièce jointe
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </AdminLayout>
    );
}