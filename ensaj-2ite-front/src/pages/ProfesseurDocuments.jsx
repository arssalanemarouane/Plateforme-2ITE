import { useState, useEffect } from 'react';
import api from '../api/axios';
import ProfesseurLayout from '../components/ProfesseurLayout';
import { FileText, Plus, Trash2, Edit3, Download, X } from 'lucide-react';

export default function ProfesseurDocuments() {
    const [modules, setModules] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // États du Formulaire
    const [titre, setTitre] = useState('');
    const [selectedModule, setSelectedModule] = useState('');
    const [type, setType] = useState('cours');
    const [file, setFile] = useState(null);
    
    // Édition
    const [editingId, setEditingId] = useState(null);

    const fetchData = async () => {
        try {
            const resModules = await api.get('/professeur/modules');
            setModules(resModules.data);
            if (resModules.data.length > 0) setSelectedModule(resModules.data[0].id);

            const resDocs = await api.get('/professeur/documents');
            setDocuments(resDocs.data);
        } catch (err) {
            console.error("Erreur de chargement des données", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('module_id', selectedModule);
        formData.append('titre', titre);
        formData.append('type', type);
        if (file) formData.append('file', file);

        try {
            if (editingId) {
                // Mode Modification
                await api.post(`/professeur/documents/${editingId}/update`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                alert("Document modifié avec succès !");
            } else {
                // Mode Ajout
                if (!file) return alert("Veuillez sélectionner un fichier");
                await api.post('/professeur/documents', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                alert("Document publié avec succès !");
            }
            resetForm();
            fetchData();
        } catch (err) {
            console.error(err);
            alert("Erreur lors de l'enregistrement.");
        }
    };

    const handleEdit = (doc) => {
        setEditingId(doc.id);
        setTitre(doc.titre);
        setSelectedModule(doc.module_id);
        setType(doc.type);
        setFile(null); // Optionnel à remplacer
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Voulez-vous vraiment supprimer ce document ?")) return;
        try {
            await api.delete(`/professeur/documents/${id}`);
            setDocuments(documents.filter(d => d.id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setTitre('');
        setFile(null);
        if (modules.length > 0) setSelectedModule(modules[0].id);
    };

    return (
        <ProfesseurLayout>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* FORMULAIRE DE PUBLICATION / ÉDITION */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 h-fit shadow-sm">
                    <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Plus size={18} />
                        {editingId ? "Modifier le document" : "Publier un nouveau document"}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Titre du document :</label>
                            <input 
                                type="text" value={titre} onChange={e => setTitre(e.target.value)} required placeholder="Ex: TD 2 - Les Triggers"
                                className="w-full px-3 py-2 text-sm bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-slate-800"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Attribuer au module :</label>
                            <select value={selectedModule} onChange={e => setSelectedModule(e.target.value)} className="w-full px-3 py-2 text-sm bg-gray-50 border rounded-xl outline-none">
                                {modules.map(m => <option key={m.id} value={m.id}>{m.code} - {m.nom || m.libelle}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Type de ressource :</label>
                            <select value={type} onChange={e => setType(e.target.value)} className="w-full px-3 py-2 text-sm bg-gray-50 border rounded-xl outline-none">
                                <option value="cours">📚 Cours magistral</option>
                                <option value="td">📝 Travaux Dirigés (TD)</option>
                                <option value="tp">💻 Travaux Pratiques (TP)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Fichier (PDF, DOCX, PPTX, ZIP) :</label>
                            <input 
                                type="file" onChange={e => setFile(e.target.files[0])}
                                className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-800 hover:file:bg-slate-200"
                            />
                            {editingId && <p className="text-[10px] text-amber-600 mt-1">Laissez vide pour conserver le fichier actuel.</p>}
                        </div>
                        <div className="flex gap-2 pt-2">
                            <button type="submit" className="flex-1 bg-slate-900 text-white py-2 rounded-xl text-xs font-bold hover:bg-slate-800 transition">
                                {editingId ? "Sauvegarder" : "Publier"}
                            </button>
                            {editingId && (
                                <button type="button" onClick={resetForm} className="px-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition">
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* LISTE DES DOCUMENTS EXISTANTS */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-base font-bold text-slate-800 mb-4">Mes ressources publiées</h3>
                    {loading ? (
                        <p className="text-center text-sm text-gray-400 py-6">Chargement des fichiers...</p>
                    ) : documents.length === 0 ? (
                        <p className="text-center text-sm text-gray-400 italic py-6">Aucun document publié pour le moment.</p>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {documents.map(doc => (
                                <div key={doc.id} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-slate-50 text-slate-700 rounded-xl"><FileText size={20} /></div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-slate-800">{doc.titre}</h4>
                                            <p className="text-xs text-gray-400 font-medium">
                                                {doc.module?.code} • <span className="uppercase font-bold text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{doc.type}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <a href={`http://127.0.0.1:8000/storage/${doc.file_path}`} target="_blank" rel="noreferrer" className="p-2 text-gray-400 hover:text-slate-800 rounded-lg hover:bg-gray-50 transition"><Download size={16} /></a>
                                        <button onClick={() => handleEdit(doc)} className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-50 transition"><Edit3 size={16} /></button>
                                        <button onClick={() => handleDelete(doc.id)} className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-50 transition"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </ProfesseurLayout>
    );
}