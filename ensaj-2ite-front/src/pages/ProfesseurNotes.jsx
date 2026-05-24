import { useEffect, useState } from 'react';
import api from '../api/axios';
import ProfesseurLayout from '../components/ProfesseurLayout';
import { Save, CheckCircle, AlertTriangle } from 'lucide-react';

export default function ProfesseurNotes() {
    const [modules, setModules] = useState([]);
    const [selectedModule, setSelectedModule] = useState('');
    const [etudiants, setEtudiants] = useState([]);
    const [loadingEtudiants, setLoadingEtudiants] = useState(false);
    const [notesInputs, setNotesInputs] = useState({}); 
    const [successMessage, setSuccessMessage] = useState('');
    const [savingId, setSavingId] = useState(null); 

    // 1. Charger les modules attribués à ce professeur
    useEffect(() => {
        api.get('/professeur/modules')
            .then(res => {
                const modulesData = Array.isArray(res.data) ? res.data : [];
                setModules(modulesData);
                if (modulesData.length > 0) {
                    setSelectedModule(modulesData[0].id.toString());
                }
            })
            .catch(err => console.error("Erreur de chargement des modules", err));
    }, []);

    // 2. Charger la liste des étudiants dès que le module sélectionné change
    useEffect(() => {
        if (!selectedModule) return;
        
        setLoadingEtudiants(true);
        api.get(`/professeur/modules/${selectedModule}/etudiants`)
            .then(res => {
                // On s'assure de récupérer un tableau
                const etudiantsList = Array.isArray(res.data) ? res.data : [];
                setEtudiants(etudiantsList);
                
                const initialInputs = {};
                etudiantsList.forEach(etd => {
                    initialInputs[etd.id] = {
                        note_normal: etd.note_actuelle?.note_normal ?? '',
                        note_rattrapage: etd.note_actuelle?.note_rattrapage ?? ''
                    };
                });
                setNotesInputs(initialInputs);
            })
            .catch(err => {
                console.error("Erreur de chargement des étudiants", err);
                setEtudiants([]);
            })
            .finally(() => setLoadingEtudiants(false));
    }, [selectedModule]);

    const handleInputChange = (etudiantId, field, value) => {
        setNotesInputs(prev => ({
            ...prev,
            [etudiantId]: {
                ...(prev[etudiantId] || { note_normal: '', note_rattrapage: '' }),
                [field]: value
            }
        }));
    };

    const handleSaveNote = async (etudiantId) => {
        setSuccessMessage('');
        const currentInput = notesInputs[etudiantId] || { note_normal: '', note_rattrapage: '' };
        const { note_normal, note_rattrapage } = currentInput;

        const validate = (val) => {
            if (val === '') return true;
            const num = parseFloat(val);
            return !isNaN(num) && num >= 0 && num <= 20;
        };

        if (!validate(note_normal) || !validate(note_rattrapage)) {
            alert("Les notes doivent être comprises entre 0 et 20.");
            return;
        }

        try {
            setSavingId(etudiantId);
            await api.post('/professeur/notes', {
                etudiant_id: etudiantId,
                module_id: parseInt(selectedModule),
                note_normal: note_normal === '' ? null : parseFloat(note_normal),
                note_rattrapage: note_rattrapage === '' ? null : parseFloat(note_rattrapage)
            });
            
            setSuccessMessage('Note mise à jour avec succès.');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error(err);
            alert("Erreur lors de l'enregistrement de la note.");
        } finally {
            setSavingId(null);
        }
    };

    return (
        <ProfesseurLayout>
            {/* Sélection du Module */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Sélectionnez le module à évaluer :</label>
                <select
                    value={selectedModule}
                    onChange={e => setSelectedModule(e.target.value)}
                    className="max-w-md w-full bg-gray-50 px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-800 transition font-medium text-slate-700"
                >
                    <option value="">-- Choisir un cours --</option>
                    {modules.map(m => (
                        <option key={m.id} value={m.id}>
                            {m.code} - {m.libelle || m.nom} ({m.filiere?.code ?? '2ITE'} - {m.niveau})
                        </option>
                    ))}
                </select>
            </div>

            {/* Notification de succès */}
            {successMessage && (
                <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 flex items-center gap-2 text-sm font-medium">
                    <CheckCircle size={18} />
                    {successMessage}
                </div>
            )}

            {/* Tableau d'évaluation */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {loadingEtudiants ? (
                    <div className="p-12 text-center text-gray-500 text-sm">Chargement de la liste de la classe...</div>
                ) : !selectedModule ? (
                    <div className="p-12 text-center text-gray-400 text-sm italic">Veuillez sélectionner un module ci-dessus.</div>
                ) : etudiants.length === 0 ? (
                    <div className="p-12 text-center text-gray-500 text-sm flex flex-col items-center gap-2">
                        <AlertTriangle size={20} className="text-gray-400" />
                        Aucun étudiant inscrit dans cette classe pour le moment.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead className="bg-gray-50 text-gray-600 font-medium">
                                <tr>
                                    <th className="p-4">Nom & Prénom</th>
                                    <th className="p-4">CNE</th>
                                    <th className="p-4 text-center">Session Normale</th>
                                    <th className="p-4 text-center">Session Rattrapage</th>
                                    <th className="p-4 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {etudiants.map((etd) => (
                                    <tr key={etd.id} className="hover:bg-gray-50/50 transition">
                                        <td className="p-4 font-semibold text-slate-800">
                                            {etd.user?.nom} {etd.user?.prenom}
                                        </td>
                                        <td className="p-4 text-gray-400 font-mono text-xs">{etd.cne}</td>
                                        <td className="p-4 text-center">
                                            <input
                                                type="number"
                                                step="0.25"
                                                min="0"
                                                max="20"
                                                placeholder="-- / 20"
                                                value={notesInputs[etd.id]?.note_normal ?? ''}
                                                onChange={e => handleInputChange(etd.id, 'note_normal', e.target.value)}
                                                className="w-24 px-2.5 py-1.5 border border-gray-200 bg-gray-50 rounded-lg text-sm text-center focus:bg-white focus:ring-2 focus:ring-slate-800 outline-none font-bold text-slate-800"
                                            />
                                        </td>
                                        <td className="p-4 text-center">
                                            <input
                                                type="number"
                                                step="0.25"
                                                min="0"
                                                max="20"
                                                placeholder="-- / 20"
                                                value={notesInputs[etd.id]?.note_rattrapage ?? ''}
                                                onChange={e => handleInputChange(etd.id, 'note_rattrapage', e.target.value)}
                                                className="w-24 px-2.5 py-1.5 border border-gray-200 bg-gray-50 rounded-lg text-sm text-center focus:bg-white focus:ring-2 focus:ring-slate-800 outline-none font-bold text-red-600"
                                            />
                                        </td>
                                        <td className="p-4 text-center">
                                            <button
                                                onClick={() => handleSaveNote(etd.id)}
                                                disabled={savingId === etd.id}
                                                className="inline-flex items-center gap-1.5 bg-slate-900 text-white px-3 py-1.5 rounded-lg font-medium text-xs hover:bg-slate-800 transition shadow-sm disabled:opacity-50 w-[110px] justify-center"
                                            >
                                                <Save size={14} />
                                                {savingId === etd.id ? "Sauvegarde..." : "Enregistrer"}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </ProfesseurLayout>
    );
}