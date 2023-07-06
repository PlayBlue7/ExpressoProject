import auth from '@react-native-firebase/auth';

import {
    GoogleSignin,
    statusCodes,
} from '@react-native-google-signin/google-signin'

import { useState } from 'react';

import { appleAuth } from '@invertase/react-native-apple-authentication';

class AuthenticationService {
    
    static GetUserState() {
        const [loading, setLoading] = useState(true);
        const [user, setUser] = useState();

        function getUser() {
            const subscriber = auth().onAuthStateChanged((user) => {
                setUser(user);
                if(loading) 
                    setLoading(false);
            });
            return subscriber;
        }

        return {loading, user, getUser}
    }


    static InitialiseAuth() {
        GoogleSignin.configure({
            webClientId: '', // redacted for personal privacy
        });
    }

    static async SignInWithGoogle() {
        try {
            // Check if your device supports Google Play
            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
            // Get the users ID token
            const { idToken } = await GoogleSignin.signIn();

            // Create a Google credential with the token
            const googleCredential = auth.GoogleAuthProvider.credential(idToken);

            // Sign-in the user with the credential
            return auth().signInWithCredential(googleCredential);
        }
        catch (error) {
            let reason = "";
            switch (error.code) {
                case statusCodes.SIGN_IN_CANCELLED:
                    reason = "Cancelled";
                    break;
                case statusCodes.IN_PROGRESS:
                    reason = "Operation in progress";
                    break;
                case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
                    reason = "Play Services unavailable";
                    break;
                default:
                    reason = error.code;
                    break;
            }
            return Promise.reject(reason);
        }
    }

    static async SignInWithApple() {
        try {
            // Start the sign-in request
            const appleAuthRequestResponse = await appleAuth.performRequest({
                requestedOperation: appleAuth.Operation.LOGIN,
                requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
            })
                .catch(error => { return Promise.reject(error) });

            // Ensure Apple returned a user identityToken
            if (appleAuthRequestResponse === undefined) {
                return Promise.reject('Apple Sign-In failed - no identify token returned');
            }
            // Create a Firebase credential from the response
            const { identityToken, nonce } = appleAuthRequestResponse;
            const appleCredential = auth.AppleAuthProvider.credential(identityToken, nonce);

            // Sign the user in with the credential
            return auth().signInWithCredential(appleCredential);
        }
        catch (error) {
            let reason = "";
            switch (error.code) {
                case appleAuth.Error.CANCELED:
                    reason = "Cancelled";
                    break;
                case appleAuth.Error.FAILED:
                    reason = "Failed";
                    break;
                case appleAuth.Error.INVALID_RESPONSE:
                    reason = "Invalid response";
                    break;
                case appleAuth.Error.NOT_HANDLED:
                    reason = "Not handled";
                    break;
                case appleAuth.Error.UNKNOWN:
                    reason = "Unknown";
                    break;
                default:
                    reason = error;
                    break;
            }
            return Promise.reject(reason);
        }
    }

    static async SignOut() {
        return auth().signOut();
    }
}

export default AuthenticationService;