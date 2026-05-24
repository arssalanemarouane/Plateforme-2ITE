import { useEffect, useState } from 'react';
import api from '../api/axios';
import EtudiantLayout from '../components/EtudiantLayout';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export default function EtudiantNotes() {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/etudiant/notes')
            .then(res => setNotes(res.data))
            .catch(err => console.error("Erreur lors de la récupération des notes", err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <EtudiantLayout>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 bg-gradient-to-r from-ensaj-primary/5 to-transparent">
                    <h3 className="text-base font-bold text-ensaj-secondary">Mon Bulletin de Notes Électronique</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Mises à jour des notes transmises en temps réel par les enseignants.</p>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-gray-500">Chargement de vos notes...</div>
                ) : notes.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">Aucune note n'a encore été publiée pour votre session actuelle.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead className="bg-gray-50 text-gray-600 font-medium">
                                <tr>
                                    <th className="p-4">Module</th>
                                    <th className="p-4">Enseignant</th>
                                    <th className="p-4 text-center">Session Normale</th>
                                    <th className="p-4 text-center">Rattrapage</th>
                                    <th className="p-4 text-center">Note Finale</th>
                                    <th className="p-4 text-center">Statut</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-gray-700">
                                {notes.map((n) => {
                                    const isValide = n.note_finale >= 12; // Seuil classique ENSAJ Cycle Ingénieur
                                    return (
                                        <tr key={n.id} className="hover:bg-gray-50/40 transition">
                                            <td className="p-4">
                                                <div className="font-bold text-ensaj-secondary">{n.module?.libelle}</div>
                                                <div className="text-xs font-mono text-ensaj-primary">{n.module?.code}</div>
                                            </td>
                                            <td className="p-4 text-xs text-gray-500 font-medium">
                                                Pr. {n.module?.professeur?.user?.nom} {n.module?.professeur?.user?.prenom}
                                            </td>
                                            <td className="p-4 text-center font-medium">{n.note_normal ?? '—'}</td>
                                            <td className="p-4 text-center font-medium text-amber-600">{n.note_rattrapage ?? '—'}</td>
                                            <td className="p-4 text-center font-bold text-ensaj-secondary bg-slate-50/50">{n.note_finale ?? '—'}</td>
                                            <td className="p-4">
                                                <div className="flex items-center justify-center">
                                                    {n.note_finale === null ? (
                                                        <span className="flex items-center gap-1 text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full font-medium">
                                                            <AlertCircle size={14} /> En attente
                                                        </span>
                                                    ) : isValide ? (
                                                        <span className="flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-semibold border border-emerald-100">
                                                            <CheckCircle2 size={14} /> Validé
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1 text-xs text-red-700 bg-red-50 px-2.5 py-1 rounded-full font-semibold border border-red-100">
                                                            <XCircle size={14} /> Rallé / Non Validé
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </EtudiantLayout>
    );
}