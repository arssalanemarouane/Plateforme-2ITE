import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import EtudiantLayout from '../components/EtudiantLayout';
import { useAuth } from '../context/AuthContext';
import { Send, User, MessageSquare, GraduationCap, Loader2 } from 'lucide-react';

export default function EtudiantMessages() {
    const { user } = useAuth();
    const [profs, setProfs] = useState([]);
    const [selectedProf, setSelectedProf] = useState(null);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [loadingProfs, setLoadingProfs] = useState(true);
    const [loadingChat, setLoadingChat] = useState(false);
    const [sending, setSending] = useState(false);
    
    const chatEndRef = useRef(null);

    // 1. Charger la liste des profs de son niveau
    useEffect(() => {
        const fetchProfs = async () => {
            try {
                const res = await api.get('/etudiant/mes-professeurs', { withCredentials: true });
                setProfs(res.data);
                if (res.data.length > 0) {
                    setSelectedProf(res.data[0]);
                }
            } catch (err) {
                console.error("Erreur profs:", err);
            } finally {
                setLoadingProfs(false);
            }
        };
        fetchProfs();
    }, []);

    // 2. Charger le chat quand on clique sur un prof
    useEffect(() => {
        if (!selectedProf) return;

        const fetchChat = async () => {
            setLoadingChat(true);
            try {
                const res = await api.get(`/etudiant/chat/${selectedProf.user_id}`, { withCredentials: true });
                setMessages(res.data);
            } catch (err) {
                console.error("Erreur chat:", err);
            } finally {
                setLoadingChat(false);
            }
        };

        fetchChat();
        
        const interval = setInterval(fetchChat, 5000);
        return () => clearInterval(interval);
    }, [selectedProf]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!text.trim() || !selectedProf || sending) return;

        setSending(true);
        try {
            await api.post('/etudiant/send-message', {
                module_id: selectedProf.module_id,
                contenu: text
            }, { withCredentials: true });

            setMessages([...messages, {
                id: Date.now(),
                sender_id: user.id,
                receiver_id: selectedProf.user_id,
                contenu: text,
                created_at: new Date().toISOString()
            }]);
            setText('');
        } catch (err) {
            console.error("Erreur envoi message:", err);
        } finally {
            setSending(false);
        }
    };

    return (
        <EtudiantLayout>
            {/* 🚀 FIX : Ajustement à h-[calc(100vh-14rem)] pour équilibrer la hauteur globale */}
            <div className="max-w-6xl mx-auto h-[calc(100vh-14rem)] flex bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                
                {/* BARRE LATÉRALE GAUCHE : LISTE DES PROFESSEURS */}
                <div className="w-1/3 border-r border-gray-100 flex flex-col bg-slate-50/50">
                    <div className="p-4 border-b border-gray-100 bg-white">
                        <h2 className="font-bold text-slate-800 flex items-center gap-2">
                            <GraduationCap className="text-blue-600" size={18} />
                            Mes Enseignants
                        </h2>
                        <p className="text-xs text-gray-400 mt-0.5">Cliquez sur un professeur pour discuter.</p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {loadingProfs ? (
                            <div className="text-center py-8 text-gray-400 text-xs italic">Chargement...</div>
                        ) : profs.length === 0 ? (
                            <div className="text-center py-8 text-gray-400 text-xs px-4">Aucun enseignant trouvé pour votre niveau.</div>
                        ) : (
                            profs.map((p) => (
                                <button
                                    key={p.user_id}
                                    onClick={() => setSelectedProf(p)}
                                    className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition cursor-pointer ${
                                        selectedProf?.user_id === p.user_id 
                                            ? 'bg-blue-600 text-white shadow-md' 
                                            : 'hover:bg-gray-100 text-slate-700'
                                    }`}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${selectedProf?.user_id === p.user_id ? 'bg-white text-blue-600' : 'bg-slate-200 text-slate-600'}`}>
                                        {p.prenom[0]}{p.nom[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold truncate">Pr. {p.prenom} {p.nom}</p>
                                        <p className={`text-xs truncate ${selectedProf?.user_id === p.user_id ? 'text-blue-100' : 'text-slate-400'}`}>{p.module_nom}</p>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* ZONE DE CHAT DROITE */}
                <div className="flex-1 flex flex-col bg-white">
                    {selectedProf ? (
                        <>
                            <div className="p-4 border-b border-gray-100 bg-slate-50/20">
                                <h3 className="text-sm font-bold text-slate-800">Pr. {selectedProf.prenom} {selectedProf.nom}</h3>
                                <p className="text-[11px] text-gray-400 font-medium">Spécialité : {selectedProf.specialite}</p>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30 space-y-4">
                                {loadingChat ? (
                                    <div className="flex h-full items-center justify-center text-gray-400 text-xs italic gap-2">
                                        <Loader2 size={16} className="animate-spin" /> Synchronisation...
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-400 text-xs gap-1.5 p-8 text-center">
                                        <MessageSquare size={32} className="opacity-30" />
                                        <span>Ouvrez le dialogue avec votre enseignant concernant le cours.</span>
                                    </div>
                                ) : (
                                    messages.map((m) => {
                                        const isMe = m.sender_id === user.id;
                                        return (
                                            <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[70%] p-3 rounded-2xl text-sm ${
                                                    isMe ? 'bg-slate-900 text-white rounded-br-none' : 'bg-white border border-gray-100 text-slate-800 rounded-bl-none'
                                                }`}>
                                                    {m.contenu}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={chatEndRef} />
                            </div>

                            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-100 bg-white flex items-center gap-3">
                                <input
                                    type="text"
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder="Écrire votre message..."
                                    className="flex-1 bg-slate-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white transition"
                                />
                                <button type="submit" disabled={!text.trim() || sending} className="h-10 w-10 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center cursor-pointer">
                                    <Send size={16} />
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-2">
                            <User size={40} className="opacity-20" />
                            <p className="text-sm">Sélectionnez un enseignant pour discuter.</p>
                        </div>
                    )}
                </div>
            </div>
        </EtudiantLayout>
    );
}