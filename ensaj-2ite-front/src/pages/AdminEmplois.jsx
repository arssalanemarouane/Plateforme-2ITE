import { useEffect, useState } from 'react';
import api from '../api/axios';
import AdminLayout from '../components/AdminLayout';
import { Calendar, Upload, ImageIcon } from 'lucide-react';

export default function AdminEmplois() {
    const [emplois, setEmplois] = useState([]);
    const [loading, setLoading] = useState(true);
    const [file, setFile] = useState(null);
    const [selectedLevel, setSelectedLevel] = useState('1A');

    const fetchEmplois = async () => {
        try {
            setLoading(true);
            const response = await api.get('/emplois');
            setEmplois(response.data);
        } catch (err) { 
            console.error("Erreur lors de la récupération des emplois:", err); 
        } finally { 
            setLoading(false); 
        }
    };

    useEffect(() => { fetchEmplois(); }, []);

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return alert("Veuillez sélectionner une image.");

        const data = new FormData();
        data.append('niveau', selectedLevel);
        data.append('image', file);

        try {
            await api.post('/emplois', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert("Upload réussi !");
            setFile(null);
            fetchEmplois();
        } catch (err) {
            console.error("Erreur serveur complète:", err);
            // Extraction intelligente de l'erreur renvoyée par Laravel
            const errorMsg = err.response?.data?.error || err.response?.data?.message || "Erreur de connexion avec l'API.";
            alert("Échec de la publication : " + errorMsg);
        }
    };

    return (
        <AdminLayout>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
                    <h3 className="text-base font-bold text-ensaj-secondary mb-4 flex items-center gap-2">
                        <Upload size={18} className="text-ensaj-primary" />
                        Publier un Emploi
                    </h3>
                    <form onSubmit={handleUpload} className="space-y-4">
                        <select value={selectedLevel} onChange={e => setSelectedLevel(e.target.value)} className="w-full bg-gray-50 p-2.5 text-sm border rounded-xl">
                            <option value="1A">2ITE - 1ère Année</option>
                            <option value="2A">2ITE - 2ème Année</option>
                            <option value="3A">2ITE - 3ème Année</option>
                        </select>
                        <div className="border-2 border-dashed p-6 rounded-xl text-center relative">
                            <ImageIcon className="mx-auto text-gray-400 mb-2" />
                            <span className="text-xs text-gray-500 block truncate">{file ? file.name : "Choisir l'image"}</span>
                            <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
                        </div>
                        <button type="submit" className="w-full bg-ensaj-primary text-white py-3 rounded-xl font-bold">Remplacer l'image</button>
                    </form>
                </div>

                <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-base font-bold text-ensaj-secondary mb-4">Aperçu des Emplois</h3>
                    {loading ? (
                        <div className="text-sm text-gray-500">Chargement des aperçus...</div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            {emplois.map((emp) => (
                                <div key={emp.id} className="border rounded-xl overflow-hidden shadow-sm">
                                    <div className="p-2 bg-gray-50 text-xs font-bold border-b">Niveau {emp.niveau}</div>
                                    {/* Utilisation de 127.0.0.1 pour correspondre à ton instance Axios */}
                                    <img src={`http://127.0.0.1:8000/storage/${emp.image_path}`} className="w-full h-32 object-cover" alt={`Emploi ${emp.niveau}`} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}