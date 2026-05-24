import { useEffect, useState } from 'react';
import api from '../api/axios';
import AdminLayout from '../components/AdminLayout';
import { BookOpen, PlusCircle, Trash2 } from 'lucide-react'; // Import unique et propre

export default function AdminModules() {
    const [modules, setModules] = useState([]);
    const [professeurs, setProfesseurs] = useState([]);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        code: '', 
        libelle: '', 
        filiere_id: '1', // Fixé pour 2ITE
        niveau: '1A', 
        professeur_id: ''
    });

    const loadData = async () => {
        try {
            const resData = await api.get('/admin/modules-data');
            const resProfs = await api.get('/admin/professeurs');
            setModules(resData.data.modules);
            setProfesseurs(resProfs.data);
            
            if(resProfs.data.length > 0) {
                setFormData(prev => ({...prev, professeur_id: resProfs.data[0].professeur?.id}));
            }
        } catch (err) {
            console.error("Erreur de chargement", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/modules', formData);
            alert("Module créé avec succès pour la filière 2ITE !");
            setFormData(prev => ({ ...prev, code: '', libelle: '' }));
            loadData();
        } catch (err) {
            alert(err.response?.data?.message || "Erreur de création.");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Voulez-vous vraiment supprimer ce module ?")) {
            try {
                await api.delete(`/admin/modules/${id}`);
                loadData(); // Rafraîchit la liste
            } catch (err) {
                alert("Erreur lors de la suppression");
            }
        }
    };

    return (
        <AdminLayout>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Formulaire d'affectation */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
                    <h3 className="text-base font-bold text-ensaj-secondary mb-4 flex items-center gap-2">
                        <PlusCircle size={18} className="text-ensaj-primary" />
                        Ajouter un Module (2ITE)
                    </h3>

                    <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-xl text-center">
                        <span className="text-xs font-bold text-blue-700 uppercase tracking-widest">Filière : 2ITE</span>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input 
                            type="text" placeholder="Code Module (ex: M14)" required 
                            value={formData.code} 
                            onChange={e => setFormData({...formData, code: e.target.value})} 
                            className="w-full bg-gray-50 p-2.5 text-sm border rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-ensaj-primary transition" 
                        />
                        <input 
                            type="text" placeholder="Nom du module" required 
                            value={formData.libelle} 
                            onChange={e => setFormData({...formData, libelle: e.target.value})} 
                            className="w-full bg-gray-50 p-2.5 text-sm border rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-ensaj-primary transition" 
                        />

                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Niveau d'études</label>
                            <select 
                                value={formData.niveau} 
                                onChange={e => setFormData({...formData, niveau: e.target.value})} 
                                className="w-full bg-gray-50 p-2.5 text-sm border rounded-xl"
                            >
                                <option value="1A">Première Année (1A)</option>
                                <option value="2A">Deuxième Année (2A)</option>
                                <option value="3A">Troisième Année (3A)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Professeur responsable</label>
                            <select 
                                value={formData.professeur_id} 
                                onChange={e => setFormData({...formData, professeur_id: e.target.value})} 
                                className="w-full bg-gray-50 p-2.5 text-sm border rounded-xl"
                            >
                                {professeurs.map(u => (
                                    <option key={u.id} value={u.professeur?.id}>
                                        Pr. {u.nom} {u.prenom}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button type="submit" className="w-full bg-ensaj-primary text-white text-sm py-2.5 rounded-xl font-semibold hover:bg-opacity-95 transition shadow-md">
                            Enregistrer le module
                        </button>
                    </form>
                </div>

                {/* Liste des modules avec bouton SUPPRIMER */}
                <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-50">
                        <h3 className="text-base font-bold text-ensaj-secondary">Plan d'études & Modules 2ITE</h3>
                    </div>
                    {loading ? (
                        <div className="p-8 text-center text-gray-500 text-sm">Chargement...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-sm">
                                <thead className="bg-gray-50 text-gray-600 font-medium">
                                    <tr>
                                        <th className="p-4">Code</th>
                                        <th className="p-4">Libellé</th>
                                        <th className="p-4 text-center">Niveau</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {modules.map((m) => (
                                        <tr key={m.id} className="hover:bg-gray-50/70 transition">
                                            <td className="p-4 font-mono font-bold text-ensaj-primary text-xs">{m.code}</td>
                                            <td className="p-4 font-medium text-ensaj-secondary">{m.libelle}</td>
                                            <td className="p-4 text-center">
                                                <span className="bg-ensaj-primary/10 text-ensaj-primary px-2.5 py-1 rounded-full text-xs font-semibold">{m.niveau}</span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <button 
                                                    onClick={() => handleDelete(m.id)} 
                                                    className="text-red-400 hover:text-red-600 transition p-2 hover:bg-red-50 rounded-lg"
                                                >
                                                    <Trash2 size={18} />
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