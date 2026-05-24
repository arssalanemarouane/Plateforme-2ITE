import { useEffect, useState } from 'react';
import api from '../api/axios';
import { BookOpen, Save, FileSignature, AlertCircle, CheckCircle } from 'lucide-react';

export default function SaisieNotes() {
    const [modules, setModules] = useState([]);
    const [selectedModule, setSelectedModule] = useState('');
    const [etudiants, setEtudiants] = useState([]);
    const [notesSaisies, setNotesSaisies] = useState({}); // Stocke les notes tapées sous la forme { etudiant_id: note }
    const [loadingModules, setLoadingModules] = useState(true);
    const [loadingEtudiants, setLoadingEtudiants] = useState(false);
    const [saving, setSaving] = useState(false);

    // 1. Récupérer les modules du professeur connecté
    useEffect(() => {
        const fetchModules = async () => {
            try {
                setLoadingModules(true);
                const res = await api.get('/prof/modules');
                setModules(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                console.error("Erreur modules prof :", err);
            } finally {
                setLoadingModules(false);
            }
        };
        fetchModules();
    }, []);

    // 2. Charger les étudiants et leurs notes existantes quand le module change
    useEffect(() => {
        if (!selectedModule) {
            setEtudiants([]);
            setNotesSaisies({});
            return;
        }

        const fetchEtudiantsEtNotes = async () => {
            try {
                setLoadingEtudiants(true);
                const res = await api.get(`/prof/modules/${selectedModule}/etudiants`);
                const list = res.data?.etudiants || [];
                setEtudiants(list);

                // Pré-remplir le formulaire avec les notes déjà enregistrées en base de données s'il y en a
                const initialNotes = {};
                list.forEach(etd => {
                    if (etd.notes && etd.notes.length > 0) {
                        initialNotes[etd.id] = etd.notes[0].note;
                    } else {
                        initialNotes[etd.id] = ''; // Vide si pas encore de note
                    }
                });
                setNotesSaisies(initialNotes);
            } catch (err) {
                console.error("Erreur chargement élèves/notes :", err);
            } finally {
                setLoadingEtudiants(false);
            }
        };
        fetchEtudiantsEtNotes();
    }, [selectedModule]);

    // 3. Gérer le changement d'une note dans le tableau
    const handleNoteChange = (etudiantId, value) => {
        setNotesSaisies(prev => ({
            ...prev,
            [etudiantId]: value
        }));
    };

    // 4. Soumettre toutes les notes au backend Laravel
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Préparer les données au format attendu par Laravel [ {etudiant_id: X, note: Y}, ... ]
        const notesPayload = Object.keys(notesSaisies)
            .filter(id => notesSaisies[id] !== '') // On n'envoie pas les champs laissés vides
            .map(id => {
                const parsedNote = parseFloat(notesSaisies[id]);
                if (isNaN(parsedNote) || parsedNote < 0 || parsedNote > 20) {
                    alert("Toutes les notes saisies doivent être comprises entre 0 et 20.");
                    throw new Error("Validation locale échouée");
                }
                return {
                    etudiant_id: parseInt(id),
                    note: parsedNote
                };
            });

        if (notesPayload.length === 0) {
            alert("Aucune note n'a été modifiée.");
            return;
        }

        try {
            setSaving(true);
            await api.post(`/prof/modules/${selectedModule}/notes`, { notes: notesPayload });
            alert("Notes pédagogiques enregistrées et synchronisées avec succès !");
        } catch (err) {
            console.error(err);
            alert("Une erreur est survenue lors de la sauvegarde des notes.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Zone de sélection du module */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <BookOpen size={18} className="text-ensaj-primary" />
                    Sélectionnez le module pour la saisie des notes :
                </label>
                <select
                    value={selectedModule}
                    onChange={e => setSelectedModule(e.target.value)}
                    className="w-full max-w-md bg-gray-50 p-2.5 text-sm border rounded-xl outline-none focus:ring-2 focus:ring-ensaj-primary transition"
                >
                    <option value="">-- Sélectionner le module --</option>
                    {modules.map(m => (
                        <option key={m.id} value={m.id}>{m.nom} ({m.niveau})</option>
                    ))}
                </select>
            </div>

            {/* Formulaire de saisie sous forme de tableau */}
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                    <h3 className="text-base font-bold text-ensaj-secondary flex items-center gap-2">
                        <FileSignature size={18} className="text-ensaj-primary" />
                        Grille d'évaluation des compétences
                    </h3>
                    {selectedModule && etudiants.length > 0 && (
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-ensaj-primary text-white text-sm px-4 py-2 rounded-xl font-semibold flex items-center gap-2 hover:bg-opacity-95 transition shadow-sm disabled:opacity-50"
                        >
                            <Save size={16} />
                            {saving ? "Sauvegarde..." : "Enregistrer les notes"}
                        </button>
                    )}
                </div>

                {loadingEtudiants ? (
                    <div className="p-12 text-center text-gray-500 text-sm">Chargement des fiches étudiants...</div>
                ) : !selectedModule ? (
                    <div className="p-12 text-center text-gray-400 text-sm italic">
                        Veuillez choisir un module pour ouvrir la grille des notes.
                    </div>
                ) : etudiants.length === 0 ? (
                    <div className="p-12 text-center text-gray-500 text-sm flex flex-col items-center gap-2">
                        <AlertCircle size={22} className="text-gray-300" />
                        Aucun étudiant n'est rattaché à ce niveau de module actuellement.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead className="bg-gray-50 text-gray-600 font-medium">
                                <tr>
                                    <th className="p-4">CNE</th>
                                    <th className="p-4">Nom complet</th>
                                    <th className="p-4">Classe</th>
                                    <th className="p-4 w-40 text-center">Note / 20</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {etudiants.map(etd => (
                                    <tr key={etd.id} className="hover:bg-gray-50/50 transition">
                                        <td className="p-4 font-mono text-xs text-gray-400">{etd.cne}</td>
                                        <td className="p-4 font-semibold text-ensaj-secondary">
                                            {etd.user?.nom} {etd.user?.prenom}
                                        </td>
                                        <td className="p-4">
                                            <span className="bg-ensaj-light text-gray-700 text-xs px-2.5 py-1 rounded-md font-medium">
                                                2ITE - {etd.niveau}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <input
                                                    type="number"
                                                    step="0.25"
                                                    min="0"
                                                    max="20"
                                                    placeholder="--.--"
                                                    value={notesSaisies[etd.id] !== undefined ? notesSaisies[etd.id] : ''}
                                                    onChange={e => handleNoteChange(etd.id, e.target.value)}
                                                    className="w-20 text-center bg-gray-50 border p-1.5 rounded-xl font-mono font-bold text-ensaj-secondary focus:ring-2 focus:ring-ensaj-primary outline-none text-sm"
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </form>
        </div>
    );
}