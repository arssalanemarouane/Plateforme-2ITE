import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import ProfesseurLayout from '../components/ProfesseurLayout';
import { Send, ArrowLeft } from 'lucide-react';

export default function ProfesseurMessages() {
    const { user } = useAuth() || {}; 
    const [niveaux, setNiveaux] = useState([]);
    const [activeTab, setActiveTab] = useState(''); 
    const [etudiants, setEtudiants] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    // Auto-scroll vers le bas quand les messages changent
    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    useEffect(scrollToBottom, [messages]);

    useEffect(() => {
        const init = async () => {
            try {
                const resNiv = await api.get('/professeur/niveaux-autorises');
                setNiveaux(resNiv.data);
                if (resNiv.data.length > 0) setActiveTab(resNiv.data[0]);
            } catch (err) { console.error("Init error:", err); }
        };
        init();
    }, []);

    useEffect(() => {
        if (!activeTab) return;
        api.get(`/professeur/etudiants/${activeTab}`)
           .then(res => { setEtudiants(res.data); setSelectedStudent(null); })
           .catch(err => console.error("Erreur étudiants:", err));
    }, [activeTab]);

    useEffect(() => {
        if (selectedStudent?.user?.id) {
            api.get(`/professeur/chat/${selectedStudent.user.id}`)
               .then(res => setMessages(res.data))
               .catch(err => console.error("Erreur messages:", err));
        }
    }, [selectedStudent]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedStudent?.user?.id) return;

        try {
            await api.post('/professeur/messages/envoyer-prive', {
                receiver_id: selectedStudent.user.id,
                contenu: newMessage
            });
            setNewMessage('');
            // Rechargement immédiat
            const res = await api.get(`/professeur/chat/${selectedStudent.user.id}`);
            setMessages(res.data);
        } catch (err) {
            console.error("Erreur envoi:", err);
            alert("Erreur lors de l'envoi du message.");
        }
    };

    if (!user) return <div>Veuillez vous connecter.</div>;

    return (
        <ProfesseurLayout>
            <div className="grid grid-cols-4 gap-4 h-[600px]">
                <div className="bg-white p-4 rounded-xl border">
                    <p className="text-xs font-bold mb-4">ANNÉES</p>
                    {niveaux.map(niv => (
                        <button key={niv} onClick={() => setActiveTab(niv)} 
                            className={`w-full p-2 mb-2 rounded text-xs font-bold ${activeTab === niv ? 'bg-slate-900 text-white' : 'bg-gray-100'}`}>
                            Année {niv}
                        </button>
                    ))}
                </div>

                <div className="bg-white p-4 rounded-xl border overflow-y-auto">
                    <p className="text-xs font-bold mb-4">ÉTUDIANTS {activeTab}</p>
                    {etudiants.map(etd => (
                        <button key={etd.id} onClick={() => setSelectedStudent(etd)} 
                            className={`w-full p-2 text-left text-xs border-b ${selectedStudent?.id === etd.id ? 'bg-blue-100' : 'hover:bg-blue-50'}`}>
                            {etd.user?.nom} {etd.user?.prenom}
                        </button>
                    ))}
                </div>

                <div className="col-span-2 bg-white rounded-xl border flex flex-col shadow-sm">
                    {selectedStudent ? (
                        <>
                            <div className="p-3 border-b font-bold text-xs flex items-center gap-2">
                                <button onClick={() => setSelectedStudent(null)}><ArrowLeft size={16}/></button>
                                Discussion : {selectedStudent.user?.nom} {selectedStudent.user?.prenom}
                            </div>
                            <div className="flex-1 p-4 overflow-y-auto bg-slate-50">
                                {messages.map(m => (
                                    <div key={m.id} className={`text-xs mb-2 p-2 rounded max-w-[80%] ${m.sender_id === user.id ? 'bg-blue-600 text-white ml-auto' : 'bg-white border'}`}>
                                        {m.contenu}
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                            <form onSubmit={handleSend} className="p-3 border-t flex gap-2">
                                <input value={newMessage} onChange={e => setNewMessage(e.target.value)} className="flex-1 border p-2 text-xs rounded" placeholder="Répondre..." />
                                <button className="bg-slate-900 text-white px-4 rounded"><Send size={14}/></button>
                            </form>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-400 text-xs">Sélectionnez un étudiant pour discuter</div>
                    )}
                </div>
            </div>
        </ProfesseurLayout>
    );
}