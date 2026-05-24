import { useEffect, useState } from 'react';
import api from '../api/axios';
import AdminLayout from '../components/AdminLayout';
import { Trash2, UserPlus, ShieldAlert } from 'lucide-react';

export default function AdminEtudiants() {
    const [etudiants, setEtudiants] = useState([]);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        nom: '', prenom: '', email: '', password: '', cne: '', date_naissance: '', filiere_id: '1', niveau: '1A'
    });

    const fetchEtudiants = async () => {
        try {
            const response = await api.get('/admin/etudiants');
            setEtudiants(response.data);
        } catch (err) {
            console.error("Impossible de charger les étudiants", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchEtudiants(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/etudiants', formData);
            alert("Étudiant créé avec succès !");
            setFormData({ nom: '', prenom: '', email: '', password: '', cne: '', date_naissance: '', filiere_id: '1', niveau: '1A' });
            fetchEtudiants();
        } catch (err) {
            console.error("Détails de l'erreur de saisie :", err.response);
            
            // Si Laravel renvoie des erreurs de validation spécifiques (Statut 422)
            if (err.response?.status === 422 && err.response?.data?.errors) {
                const validationErrors = err.response.data.errors;
                const messages = Object.keys(validationErrors).map(key => `- ${validationErrors[key].join(', ')}`);
                alert("Erreur de validation :\n" + messages.join('\n'));
            } else {
                alert(err.response?.data?.message || "Erreur de saisie ou problème serveur.");
            }
        }
    };

    const handleDelete = async (id) => {
        if(confirm("Voulez-vous vraiment supprimer cet étudiant ?")) {
            try {
                await api.delete(`/admin/users/${id}`);
                fetchEtudiants();
            } catch (err) {
                alert("Erreur de suppression");
            }
        }
    };

    return (
        <AdminLayout>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Formulaire d'inscription */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
                    <h3 className="text-base font-bold text-ensaj-secondary mb-4 flex items-center gap-2">
                        <UserPlus size={18} className="text-ensaj-primary" />
                        Inscrire un nouvel étudiant
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <input type="text" placeholder="Nom" required value={formData.nom} onChange={e => setFormData({...formData, nom: e.target.value})} className="w-full bg-gray-50 p-2.5 text-sm border rounded-xl" />
                            <input type="text" placeholder="Prénom" required value={formData.prenom} onChange={e => setFormData({...formData, prenom: e.target.value})} className="w-full bg-gray-50 p-2.5 text-sm border rounded-xl" />
                        </div>
                        <input type="email" placeholder="Email institutionnel" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-gray-50 p-2.5 text-sm border rounded-xl" />
                        <input type="password" placeholder="Mot de passe temporaire" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-gray-50 p-2.5 text-sm border rounded-xl" />
                        <input type="text" placeholder="CNE / Massar" required value={formData.cne} onChange={e => setFormData({...formData, cne: e.target.value})} className="w-full bg-gray-50 p-2.5 text-sm border rounded-xl" />
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Date de naissance</label>
                            <input type="date" required value={formData.date_naissance} onChange={e => setFormData({...formData, date_naissance: e.target.value})} className="w-full bg-gray-50 p-2.5 text-sm border rounded-xl" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Niveau d'études (Cycle Ingénieur)</label>
                            <select value={formData.niveau} onChange={e => setFormData({...formData, niveau: e.target.value})} className="w-full bg-gray-50 p-2.5 text-sm border rounded-xl">
                                <option value="1A">2ITE - Première Année (1A)</option>
                                <option value="2A">2ITE - Deuxième Année (2A)</option>
                                <option value="3A">2ITE - Troisième Année (3A)</option>
                            </select>
                        </div>
                        <button type="submit" className="w-full bg-ensaj-primary text-white text-sm py-2.5 rounded-xl font-semibold hover:bg-opacity-95 transition shadow-md">
                            Ajouter l'étudiant
                        </button>
                    </form>
                </div>

                {/* Table de consultation des étudiants */}
                <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-50">
                        <h3 className="text-base font-bold text-ensaj-secondary">Liste des étudiants inscrits</h3>
                    </div>
                    {loading ? (
                        <div className="p-8 text-center text-gray-500 text-sm">Chargement des données...</div>
                    ) : etudiants.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 text-sm">Aucun étudiant inscrit pour le moment.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-sm">
                                <thead className="bg-gray-50 text-gray-600 font-medium">
                                    <tr>
                                        <th className="p-4">Nom complet</th>
                                        <th className="p-4">CNE</th>
                                        <th className="p-4">Classe</th>
                                        <th className="p-4 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {etudiants.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50/70 transition">
                                            <td className="p-4">
                                                <div className="font-semibold text-ensaj-secondary">{user.nom} {user.prenom}</div>
                                                <div className="text-xs text-gray-400">{user.email}</div>
                                            </td>
                                            <td className="p-4 text-gray-600 font-mono text-xs">{user.etudiant?.cne}</td>
                                            <td className="p-4">
                                                <span className="bg-ensaj-primary/10 text-ensaj-primary px-2.5 py-1 rounded-full text-xs font-semibold">
                                                    2ITE - {user.etudiant?.niveau}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <button onClick={() => handleDelete(user.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-xl transition inline-block">
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}