import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifyUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await api.get('/me');
                    const userData = response.data;

                    // On reconstruit la structure attendue par l'application pour éviter les crashs
                    let details = null;
                    if (userData.role === 'etudiant' && userData.etudiant) {
                        details = {
                            cne: userData.etudiant.cne,
                            niveau: userData.etudiant.niveau,
                            filiere: userData.etudiant.filiere ? userData.etudiant.filiere.code : 'N/A'
                        };
                    } else if (userData.role === 'professeur' && userData.professeur) {
                        details = {
                            specialite: userData.professeur.specialite,
                            telephone: userData.professeur.telephone
                        };
                    }

                    setUser({
                        id: userData.id,
                        nom: userData.nom,
                        prenom: userData.prenom,
                        email: userData.email,
                        role: userData.role,
                        details: details
                    });
                } catch (error) {
                    console.error("Échec de vérification de l'utilisateur:", error);
                    localStorage.removeItem('token');
                    setUser(null);
                }
            }
            setLoading(false);
        };
        verifyUser();
    }, []);

    const login = async (email, password) => {
        // L'intercepteur gère l'affichage des erreurs dans le composant Login via l'alerte
        const response = await api.post('/login', { email, password });
        
        // On accepte 'token' ou 'access_token' selon ce que renvoie le contrôleur
        const token = response.data.token || response.data.access_token;
        const userData = response.data.user;
        
        if (token && userData) {
            localStorage.setItem('token', token);
            setUser(userData);
            return userData;
        } else {
            throw new Error("Structure de réponse invalide");
        }
    };

    const logout = async () => {
        try {
            await api.post('/logout');
        } catch (error) {
            console.error("Erreur lors de la déconnexion:", error);
        } finally {
            localStorage.removeItem('token');
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);