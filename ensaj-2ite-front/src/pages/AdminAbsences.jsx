import { useEffect, useState } from 'react';
import api from '../api/axios';
import AdminLayout from '../components/AdminLayout';
import { Calendar, User, BookOpen, Clock, FileText, CheckCircle, XCircle, Trash2, AlertCircle } from 'lucide-react';

export default function AdminAbsences() {
    const [absences, setAbsences] = useState([]);
    const [etudiants, setEtudiants] = useState([]);
    const [allModules, setAllModules] = useState([]); 
    const [filteredModules, setFilteredModules] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // États du formulaire
    const [selectedEtudiant, setSelectedEtudiant] = useState('');
    const [selectedModule, setSelectedModule] = useState('');
    const [dateAbsence, setDateAbsence] = useState('');
    const [heures, setHeures] = useState(2);
    const [justifie, setJustifie] = useState(false);
    const [motif, setMotif] = useState('');

    // Chargement de toutes les données initiales
    const fetchData = async () => {
        try {
            setLoading(true);
            const [resAbsences, resEtudiants, resModules] = await Promise.all([
                api.get('/admin/absences'),
                api.get('/admin/etudiants'),
                api.get('/admin/modules-data')
            ]);
            
            setAbsences(Array.isArray(resAbsences.data) ? resAbsences.data : []);
            setEtudiants(Array.isArray(resEtudiants.data) ? resEtudiants.data : []);
            
            const modulesRaw = resModules.data?.modules ? resModules.data.modules : (Array.isArray(resModules.data) ? resModules.data : []);
            setAllModules(modulesRaw);
        } catch (err) {
            console.error("Erreur lors du chargement des données d'absences :", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Écouteur de changement d'étudiant pour filtrer dynamiquement par niveau (1A, 2A, 3A)
    useEffect(() => {
        if (!selectedEtudiant) {
            setFilteredModules([]);
            setSelectedModule('');
            return;
        }

        const currentStudent = etudiants.find(u => u.etudiant?.id === parseInt(selectedEtudiant));
        const currentNiveau = currentStudent?.etudiant?.niveau; 

        if (currentNiveau) {
            const matches = allModules.filter(m => m.niveau === currentNiveau);
            setFilteredModules(matches);
        } else {
            setFilteredModules([]);
        }

        setSelectedModule('');
    }, [selectedEtudiant, allModules, etudiants]);

    // Envoi du formulaire d'absence corrigé (booléens et IDs typés)
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedEtudiant || !selectedModule || !dateAbsence) {
            alert("Veuillez remplir tous les champs obligatoires.");
            return;
        }

        setSubmitting(true);
        try {
            await api.post('/admin/absences', {
                etudiant_id: parseInt(selectedEtudiant),
                module_id: parseInt(selectedModule),
                date_absence: dateAbsence,
                heures: parseInt(heures),
                justifie: justifie ? 1 : 0, // Force le typage pour MySQL
                motif: justifie ? motif : null
            });
            
            alert("Absence enregistrée avec succès !");
            setDateAbsence('');
            setMotif('');
            setJustifie(false);
            setSelectedModule('');
            fetchData();
        } catch (err) {
            console.error("Détails de l'erreur d'enregistrement :", err.response);
            
            if (err.response?.status === 422 && err.response?.data?.errors) {
                const validationErrors = err.response.data.errors;
                const messages = Object.keys(validationErrors).map(key => `- ${validationErrors[key].join(', ')}`);
                alert("Erreur de saisie formulaire :\n" + messages.join('\n'));
            } else {
                const detailedError = err.response?.data?.error || err.response?.data?.message;
                alert("Erreur d'enregistrement :\n" + (detailedError || "Problème de connexion au serveur."));
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleJustify = async (id, currentStatus) => {
        let comment = null;
        if (!currentStatus) {
            comment = prompt("Veuillez saisir le motif de justification (ex: Certificat médical) :");
            if (comment === null) return; 
        }

        try {
            await api.put(`/admin/absences/${id}/justify`, {
                justifie: !currentStatus ? 1 : 0,
                motif: comment
            });
            fetchData();
        } catch (err) {
            console.error(err);
            alert("Impossible de modifier le statut de justification.");
        }
    };

    const handleDelete = async (id) => {
        if (confirm("Voulez-vous vraiment supprimer cette fiche d'absence ?")) {
            try {
                await api.delete(`/admin/absences/${id}`);
                fetchData();
            } catch (err) {
                console.error(err);
                alert("Erreur lors de la suppression.");
            }
        }
    };

    return (
        <AdminLayout>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                
                {/* Formulaire de signalement */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
                    <h3 className="text-base font-bold text-ensaj-secondary mb-5 flex items-center gap-2">
                        <AlertCircle size={18} className="text-ensaj-primary" />
                        Signaler une Absence
                    </h3>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                                <User size={12} /> Étudiant concerné
                            </label>
                            <select 
                                required
                                value={selectedEtudiant} 
                                onChange={e => setSelectedEtudiant(e.target.value)}
                                className="w-full bg-gray-50 p-2.5 text-sm border rounded-xl outline-none focus:ring-2 focus:ring-ensaj-primary"
                            >
                                <option value="">-- Sélectionner l'étudiant --</option>
                                {etudiants && etudiants.map(u => (
                                    <option key={u.id} value={u.etudiant?.id}>
                                        {u.nom} {u.prenom} (2ITE - {u.etudiant?.niveau || 'N/A'})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                                <BookOpen size={12} /> Module
                            </label>
                            <select 
                                required
                                disabled={!selectedEtudiant}
                                value={selectedModule} 
                                onChange={e => setSelectedModule(e.target.value)}
                                className="w-full bg-gray-50 p-2.5 text-sm border rounded-xl outline-none focus:ring-2 focus:ring-ensaj-primary disabled:opacity-60"
                            >
                                <option value="">
                                    {!selectedEtudiant ? "-- Choisir d'abord un étudiant --" : "-- Sélectionner le module --"}
                                </option>
                                {filteredModules.map(m => (
                                    <option key={m.id} value={m.id}>{m.nom} ({m.code})</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                                    <Calendar size={12} /> Date
                                </label>
                                <input 
                                    type="date" 
                                    required
                                    value={dateAbsence} 
                                    onChange={e => setDateAbsence(e.target.value)}
                                    className="w-full bg-gray-50 p-2.5 text-sm border rounded-xl outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                                    <Clock size={12} /> Durée (Heures)
                                </label>
                                <select 
                                    value={heures} 
                                    onChange={e => setHeures(e.target.value)}
                                    className="w-full bg-gray-50 p-2.5 text-sm border rounded-xl outline-none"
                                >
                                    <option value="1">1 heure</option>
                                    <option value="2">2 heures (Standard)</option>
                                    <option value="4">4 heures (Demi-journée)</option>
                                    <option value="6">6 heures</option>
                                    <option value="8">8 heures (Journée)</option>
                                </select>
                            </div>
                        </div>

                        <div className="pt-2">
                            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
                                <input 
                                    type="checkbox" 
                                    checked={justifie}
                                    onChange={e => setJustifie(e.target.checked)}
                                    className="rounded border-gray-300 text-ensaj-primary focus:ring-ensaj-primary w-4 h-4"
                                />
                                Absence justifiée immédiatement
                            </label>
                        </div>

                        {justifie && (
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                                    <FileText size={12} /> Motif / Pièce justificative
                                </label>
                                <input 
                                    type="text" 
                                    placeholder="Ex: Certificat médical, Billet de scolarité..."
                                    required={justifie}
                                    value={motif} 
                                    onChange={e => setMotif(e.target.value)}
                                    className="w-full bg-gray-50 p-2.5 text-sm border rounded-xl outline-none focus:ring-2 focus:ring-ensaj-primary"
                                />
                            </div>
                        )}

                        <button 
                            type="submit" 
                            disabled={submitting}
                            className="w-full bg-ensaj-primary text-white text-sm py-2.5 rounded-xl font-semibold hover:bg-opacity-95 transition shadow-md disabled:opacity-50"
                        >
                            {submitting ? "Enregistrement..." : "Valider l'absence"}
                        </button>
                    </form>
                </div>

                {/* Registre de consultation */}
                <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-50">
                        <h3 className="text-base font-bold text-ensaj-secondary">Registre Global des Absences (2ITE)</h3>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center text-gray-500 text-sm">Chargement du registre...</div>
                    ) : absences.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 text-sm">Aucune absence recensée pour le moment.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-sm">
                                <thead className="bg-gray-50 text-gray-600 font-medium">
                                    <tr>
                                        <th className="p-4">Étudiant</th>
                                        <th className="p-4">Module</th>
                                        <th className="p-4">Date & Durée</th>
                                        <th className="p-4">Statut</th>
                                        <th className="p-4 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {absences.map((abs) => (
                                        <tr key={abs.id} className="hover:bg-gray-50/70 transition">
                                            <td className="p-4">
                                                <div className="font-semibold text-ensaj-secondary">
                                                    {abs.etudiant?.user ? `${abs.etudiant.user.nom} ${abs.etudiant.user.prenom}` : 'Étudiant supprimé'}
                                                </div>
                                                <div className="text-xs text-gray-400">CNE: {abs.etudiant?.cne || 'N/A'}</div>
                                            </td>
                                            <td className="p-4 text-gray-700 font-medium">
                                                {abs.module ? abs.module.nom : 'Module supprimé'}
                                            </td>
                                            <td className="p-4">
                                                <div className="text-gray-700 font-mono text-xs">
                                                    {abs.date_absence ? new Date(abs.date_absence).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Date invalide'}
                                                </div>
                                                <div className="text-[11px] text-gray-400 font-semibold">{abs.heures} heures d'absence</div>
                                            </td>
                                            <td className="p-4">
                                                {abs.justifie ? (
                                                    <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2.5 py-1 rounded-full text-xs font-semibold" title={abs.motif}>
                                                        <CheckCircle size={12} /> Justifiée
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                                                        <XCircle size={12} /> Non justifiée
                                                    </span>
                                                )}
                                                {abs.justifie && abs.motif && (
                                                    <div className="text-[10px] text-gray-400 mt-1 italic max-w-[150px] truncate" title={abs.motif}>
                                                        Motif : {abs.motif}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button 
                                                        onClick={() => handleToggleJustify(abs.id, abs.justifie)}
                                                        className={`text-xs px-2 py-1 rounded-lg font-medium transition ${abs.justifie ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}
                                                    >
                                                        {abs.justifie ? 'Rendre injustifiée' : 'Justifier'}
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(abs.id)}
                                                        className="text-red-500 hover:bg-red-50 p-2 rounded-xl transition"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
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