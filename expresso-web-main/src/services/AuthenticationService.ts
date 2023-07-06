import { getAuth, signOut, GoogleAuthProvider, signInWithRedirect, getRedirectResult, onAuthStateChanged, User, signInWithPopup, updateProfile } from 'firebase/auth';

import { useEffect, useState } from 'react';

class AuthenticationService {
    static provider = new GoogleAuthProvider();

    static GetUserState() {
        const [loading, setLoading] = useState(true);
        const [user, setUser] = useState<User>();

        // Handle user state changes
        // function onAuthStateChanged(user) {
        //     setUser(user);
        // }

        function getUser() {
            const auth = getAuth();

            const subscriber = onAuthStateChanged(auth, (user) => {
                if (user) {
                    // User is signed in, see docs for a list of available properties
                    // https://firebase.google.com/docs/reference/js/firebase.User
                    setUser(user)
                    // ...
                } else {
                    // User is signed out
                    // ...
                    setUser(undefined)
                }
            });
            setLoading(false)
            return subscriber;
        }

        // useEffect(() => {
        //     const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
        //     return subscriber; // unsubscribe on unmount
        // }, []);

        return { loading, user, getUser, setUser }
    }


    static InitialiseAuth() {
        // GoogleSignin.configure({
        //     webClientId: '804717443647-ku4q9k1jfq4e4vci851mma81vstgbq66.apps.googleusercontent.com',
        // });
    }

    static async SignInWithGoogle() {
        const auth = getAuth();
        await signInWithPopup(auth, this.provider) // for some reason only popup works on iOS Safari
            .then((result) => {
                // This gives you a Google Access Token. You can use it to access the Google API.
                const credential = GoogleAuthProvider.credentialFromResult(result);
                const token = credential?.accessToken;
                // The signed-in user info.
                const user = result.user;
                const displayName = user.providerData[0].displayName
                const auth = getAuth();
                if(auth.currentUser)
                updateProfile(auth.currentUser, {
                    displayName: displayName,
                })
                // IdP data available using getAdditionalUserInfo(result)
                // ...
            }).catch((error) => {
                // Handle Errors here.
                const errorCode = error.code;
                const errorMessage = error.message;
                // The email of the user's account used.
                const email = error.customData.email;
                // The AuthCredential type that was used.
                const credential = GoogleAuthProvider.credentialFromError(error);
                // ...
            });
        // await signInWithRedirect(auth, this.provider)
        //     .then(async () => {
        //         await getRedirectResult(auth)
        //             .then((result) => {
        //                 // This gives you a Google Access Token. You can use it to access Google APIs.
        //                 if (result) {
        //                     const credential = GoogleAuthProvider.credentialFromResult(result);
        //                     const token = credential?.accessToken;

        //                     // The signed-in user info.
        //                     const user = result.user;
        //                     console.log(user)
        //                 }
        //                 // IdP data available using getAdditionalUserInfo(result)
        //                 // ...
        //             }).catch((error) => {
        //                 // Handle Errors here.
        //                 const errorCode = error.code;
        //                 const errorMessage = error.message;
        //                 // The email of the user's account used.
        //                 const email = error.customData.email;
        //                 // The AuthCredential type that was used.
        //                 const credential = GoogleAuthProvider.credentialFromError(error);
        //                 console.log(errorCode, errorMessage)
        //                 // ...
        //             })
        //     })
        //     .catch((error) => {
        //         // Handle Errors here.
        //         const errorCode = error.code;
        //         const errorMessage = error.message;
        //         // The email of the user's account used.
        //         const email = error.customData.email;
        //         // The AuthCredential type that was used.
        //         const credential = GoogleAuthProvider.credentialFromError(error);
        //         console.log(errorCode, errorMessage)
        //         // ...
        //     })
    }

    // static async SignInWithApple() {
    //     try {
    //         // Start the sign-in request
    //         const appleAuthRequestResponse = await appleAuth.performRequest({
    //             requestedOperation: appleAuth.Operation.LOGIN,
    //             requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
    //         })
    //             .catch(error => { return Promise.reject(error) });

    //         // Ensure Apple returned a user identityToken
    //         if (appleAuthRequestResponse === undefined) {
    //             return Promise.reject('Apple Sign-In failed - no identify token returned');
    //         }
    //         // Create a Firebase credential from the response
    //         const { identityToken, nonce } = appleAuthRequestResponse;
    //         const appleCredential = auth.AppleAuthProvider.credential(identityToken, nonce);

    //         // Sign the user in with the credential
    //         return auth().signInWithCredential(appleCredential);
    //     }
    //     catch (error) {
    //         let reason = "";
    //         switch (error.code) {
    //             case appleAuth.Error.CANCELED:
    //                 reason = "Cancelled";
    //                 break;
    //             case appleAuth.Error.FAILED:
    //                 reason = "Failed";
    //                 break;
    //             case appleAuth.Error.INVALID_RESPONSE:
    //                 reason = "Invalid response";
    //                 break;
    //             case appleAuth.Error.NOT_HANDLED:
    //                 reason = "Not handled";
    //                 break;
    //             case appleAuth.Error.UNKNOWN:
    //                 reason = "Unknown";
    //                 break;
    //             default:
    //                 reason = error;
    //                 break;
    //         }
    //         return Promise.reject(reason);
    //     }
    // }

    static async SignOut() {
        const auth = getAuth();
        signOut(auth).then(() => {
            // Sign-out successful.
        }).catch((error) => {
            // An error happened.
            console.log(error)
        });
    }
}

export default AuthenticationService;