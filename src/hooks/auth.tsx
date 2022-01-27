import React, { createContext, ReactNode, useContext, useState, useEffect } from "react";
import * as AuthSession from 'expo-auth-session';
import * as AppleAuthentication from 'expo-apple-authentication';
import { AsyncStorage } from "react-native";

const { CLIENT_ID } = process.env;
const { REDIRECT_URI } = process.env;

interface AuthProviderProps {
    children: ReactNode;
}

interface User {
    id: string;
    name: string;
    email: string;
    photo?: string;
}

interface IAuthContextData {
    user: User;
    signInWithGoogle(): Promise<void>;
    signInWithApple(): Promise<void>;
}

interface AuthorizationResponse {
    params: {
        access_token: string;
    },
    type: string;
}

const AuthContext = createContext({} as IAuthContextData);

function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User>({} as User);
    const [userStorageLoading, setUserStorageLoading] = useState(true);
    const userStorageKey = "@gofinances:user"

    async function signInWithGoogle() {
        try {
            // parametros de configuracao do google
            const RESPONSE_TYPE = "token";
            const SCOPE = encodeURI("profile email");
            //endpoint de autenticação da google
            const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}`;

            const { type, params } = await AuthSession.startAsync({ authUrl }) as AuthorizationResponse;

            if (type === "success") {
                const response = await fetch(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${params.access_token}`);
                const userInfo = await response.json();
                console.log(userInfo);
                setUser({
                    id: userInfo.id,
                    email: userInfo.email,
                    name: userInfo.given_name,
                    photo: userInfo.picture
                });
            }

        } catch (error: any) {
            throw new Error(error);
        }
    }

    async function signInWithApple() {
        try {
            const credentials = await AppleAuthentication.signInAsync({
                requestedScopes: [
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthentication.AppleAuthenticationScope.EMAIL
                ]
            });
            if (credentials) {
                const userLogged = {
                    id: String(credentials.user),
                    email: credentials.email!,
                    name: credentials.fullName!.givenName!,
                    photo: undefined,
                };

                setUser(userLogged);
                await AsyncStorage.setItem(userStorageKey, JSON.stringify(userLogged));
            }

        } catch (error: any) {
            throw new Error(error);
        }
    }

    useEffect(() => {
        async function loadUserStorageData() {
            const storagedUser = await AsyncStorage.getItem(userStorageKey);
            if (storagedUser) {
                setUser(JSON.parse(storagedUser));
            }
            setUserStorageLoading(false);
        }
        loadUserStorageData();
    }, []);

    return (
        <AuthContext.Provider value={{ user, signInWithGoogle, signInWithApple }}>
            {children}
        </AuthContext.Provider>
    );
}

function useAuth() {
    const context = useContext(AuthContext);
    return context;
}

export { AuthProvider, useAuth }