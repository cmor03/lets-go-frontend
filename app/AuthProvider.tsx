import { createContext, ReactNode, useContext, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase";
import Loading from "./loading";

interface AuthContextType {
    user: any;
    loading: boolean;
    error: any; // Replace 'any' with the appropriate error type
}

const AuthContext = createContext<AuthContextType>({user: undefined, loading: false, error: false});
export function useSession() {
    return useContext(AuthContext);
}

interface AuthProviderProps {
    children: ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({children})  => {
    const [user, loading, error] = useAuthState(auth);
    
    return <AuthContext.Provider value={{user: user, loading: loading, error: error}}>
        {children}
    </AuthContext.Provider>
}

export default AuthProvider;