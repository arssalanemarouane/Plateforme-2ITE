import { useState, useEffect } from 'react';
import api from '../api/axios';
import EtudiantLayout from '../components/EtudiantLayout';
import { Calendar } from 'lucide-react';

export default function EtudiantEmploi() {
    const [emploiImg, setEmploiImg] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEmploi = async () => {
            try {
                const res = await api.get('/etudiant/mon-emploi', { withCredentials: true });
                const emploiData = res.data;
                
                if (emploiData) {
                    let filePath = emploiData.image_path || emploiData.path || emploiData.file_path || emploiData.image;
                    
                    if (filePath) {
                        if (filePath.startsWith('/')) {
                            filePath = filePath.substring(1);
                        }
                        if (filePath.startsWith('storage/')) {
                            filePath = filePath.replace('storage/', '');
                        }
                        
                        setEmploiImg(`http://127.0.0.1:8000/storage/${filePath}`);
                    }
                }
            } catch (err) {
                console.error("Erreur lors du chargement de l'emploi du temps:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchEmploi();
    }, []);

    const handleDownload = () => {
        if (emploiImg) {
            window.open(emploiImg, '_blank');
        }
    };

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex h-64 items-center justify-center bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                </div>
            );
        }

        if (emploiImg) {
            return (
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex justify-center items-center">
                    <img
                        src={emploiImg}
                        alt="Mon emploi du temps"
                        className="max-w-full h-auto object-contain rounded-xl shadow-inner border border-gray-100 max-h-[550px]"
                        onError={(e) => {
                            e.target.onerror = null; 
                            e.target.src = "https://placehold.co/600x400?text=Erreur+de+chargement+de+l%27image";
                        }}
                    />
                </div>
            );
        }

        return (
            <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-16 text-center">
                <Calendar className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                <h3 className="text-sm font-semibold text-slate-700">Aucun planning disponible</h3>
                <p className="text-xs text-slate-400 mt-1">L'administration n'a pas encore mis en ligne l'emploi du temps correspondant à votre niveau.</p>
            </div>
        );
    };

    return (
        <EtudiantLayout>
            <div className="space-y-6 max-w-5xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Mon Emploi du Temps</h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Consultez le planning officiel de vos cours pour votre année d'études.
                        </p>
                    </div>
                    
                    {/* 🚀 BOUTON PURIFIÉ : Strictement aucun composant d'icône ici */}
                    <button
                        onClick={handleDownload}
                        disabled={loading || !emploiImg}
                        className={`text-white font-medium text-xs px-6 py-2.5 rounded-xl transition shadow-sm font-semibold ${
                            emploiImg ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer' : 'bg-gray-400 cursor-not-allowed'
                        }`}
                    >
                        Plein écran
                    </button>
                </div>

                {renderContent()}
            </div>
        </EtudiantLayout>
    );
}