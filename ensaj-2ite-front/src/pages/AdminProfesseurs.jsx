import { useEffect, useState } from 'react';
import api from '../api/axios';
import AdminLayout from '../components/AdminLayout';
import { Trash2, UserPlus, Phone, BookOpen } from 'lucide-react';

export default function AdminProfesseurs() {
    const [professeurs, setProfesseurs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        nom: '', prenom: '', email: '', password: '', specialite: '', telephone: ''
    });

    const fetchProfesseurs = async () => {
        try {
            const response = await api.get('/admin/professeurs');
            setProfesseurs(response.data);
        } catch (err) {
            console.error("Impossible de charger les professeurs", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchProfesseurs(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/professeurs', formData);
            alert("Compte professeur créé avec succès !");
            setFormData({ nom: '', prenom: '', email: '', password: '', specialite: '', telephone: '' });
            fetchProfesseurs();
        } catch (err) {
            alert(err.response?.data?.message || "Erreur lors de la création.");
        }
    };

    const handleDelete = async (id) => {
        if (confirm("Voulez-vous vraiment supprimer ce professeur ? Cela supprimera également les modules qui lui sont affectés.")) {
            try {
                await api.delete(`/admin/users/${id}`);
                fetchProfesseurs();
            } catch (err) {
                alert("Erreur de suppression");
            }
        }
    };

    return (
        <AdminLayout>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Formulaire d'ajout */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
                    <h3 className="text-base font-bold text-ensaj-secondary mb-4 flex items-center gap-2">
                        <UserPlus size={18} className="text-ensaj-primary" />
                        Enregistrer un professeur
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <input type="text" placeholder="Nom" required value={formData.nom} onChange={e => setFormData({...formData, nom: e.target.value})} className="w-full bg-gray-50 p-2.5 text-sm border rounded-xl" />
                            <input type="text" placeholder="Prénom" required value={formData.prenom} onChange={e => setFormData({...formData, prenom: e.target.value})} className="w-full bg-gray-50 p-2.5 text-sm border rounded-xl" />
                        </div>
                        <input type="email" placeholder="Email institutionnel" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-gray-50 p-2.5 text-sm border rounded-xl" />
                        <input type="password" placeholder="Mot de passe temporaire" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-gray-50 p-2.5 text-sm border rounded-xl" />
                        <input type="text" placeholder="Spécialité (ex: Big Data, Réseaux)" value={formData.specialite} onChange={e => setFormData({...formData, specialite: e.target.value})} className="w-full bg-gray-50 p-2.5 text-sm border rounded-xl" />
                        <input type="text" placeholder="Numéro de téléphone" value={formData.telephone} onChange={e => setFormData({...formData, telephone: e.target.value})} className="w-full bg-gray-50 p-2.5 text-sm border rounded-xl" />
                        
                        <button type="submit" className="w-full bg-ensaj-primary text-white text-sm py-2.5 rounded-xl font-semibold hover:bg-opacity-95 transition shadow-md">
                            Ajouter le professeur
                        </button>
                    </form>
                </div>

                {/* Table d'affichage */}
                <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-50">
                        <h3 className="text-base font-bold text-ensaj-secondary">Corps professoral</h3>
                    </div>
                    {loading ? (
                        <div className="p-8 text-center text-gray-500 text-sm">Chargement des données...</div>
                    ) : professeurs.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 text-sm">Aucun professeur enregistré.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-sm">
                                <thead className="bg-gray-50 text-gray-600 font-medium">
                                    <tr>
                                        <th className="p-4">Professeur</th>
                                        <th className="p-4">Spécialité</th>
                                        <th className="p-4">Contact</th>
                                        <th className="p-4 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {professeurs.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50/70 transition">
                                            <td className="p-4">
                                                <div className="font-semibold text-ensaj-secondary">Pr. {user.nom} {user.prenom}</div>
                                                <div className="text-xs text-gray-400">{user.email}</div>
                                            </td>
                                            <td className="p-4">
                                                <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg text-xs font-medium">
                                                    {user.professeur?.specialite || 'Non renseignée'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-gray-500 text-xs flex flex-col gap-1">
                                                <span className="flex items-center gap-1"><Phone size={12} /> {user.professeur?.telephone || '—'}</span>
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