import { Injectable } from "@angular/core";
import { Store } from "@ngrx/store";
import * as fromApp from '../store/app.reducer';
import * as AuthActions from './store/auth.actions'

export interface AuthResponseData {
    kind: string,
    idToken: string,
    email: string,
    refreshToken: string,
    expiresIn: string,
    localId: string
}

@Injectable({providedIn: 'root'})
export class AuthService {
    private tokenExpirationTimer: any;
    
    constructor(private store: Store<fromApp.AppState>) {}
    
    // signup(email: string, password: string) {
    //     return this.http.post<AuthResponseData>('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + environment.firebaseAPIKey, 
    //         {
    //             email: email, 
    //             password: password, 
    //             returnSecureToken: true
    //         } //tap() performs an action without changing the response, runs the code without interrupting
    //     ).pipe(catchError(this.handleError), tap(responseData => {
    //         this.handleUserAuth(responseData.email, responseData.localId, responseData.idToken, +responseData.expiresIn);
    //     }));
    // }

    // login(email: string, password: string) {
    //     return this.http.post<AuthResponseData>('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + environment.firebaseAPIKey,
    //         {
    //             email: email, 
    //             password: password, 
    //             returnSecureToken: true
    //         }
    //     ).pipe(
    //         catchError(this.handleError), 
    //             tap(responseData => {
    //                 this.handleUserAuth(
    //                     responseData.email, 
    //                     responseData.localId, 
    //                     responseData.idToken, 
    //                     +responseData.expiresIn
    //                     );
    //                 }
    //             )
    //     );
    // }

    //keeps user logged in whenever page refreshes via LS
    // autoLogin() {
    //     const userData: {
    //         email: string,
    //         id: string,
    //         _token: string,
    //         _tokenExpirationDate: string
    //     } = JSON.parse(localStorage.getItem('userData'));
    //     if(!userData) {
    //         return;
    //     }

    //     const loadedUser = new User(userData.email, userData.id, userData._token, new Date(userData._tokenExpirationDate));
    //     if(loadedUser.token) {
    //         this.store.dispatch(
    //             new AuthActions.AuthenticateSuccess({
    //                 email: loadedUser.email, 
    //                 userId: loadedUser.id, 
    //                 token: loadedUser.token,
    //                 expirationData: new Date(userData._tokenExpirationDate)
    //                 })
    //             )
    //         const expirationDurationTime = new Date(userData._tokenExpirationDate).getTime() - new Date().getTime();
    //         this.autoLogout(expirationDurationTime);
    //     }
    // }

    setLogoutTimer(expirationTime: number) {
        this.tokenExpirationTimer = setTimeout(() => {
            this.store.dispatch(new AuthActions.Logout());
        }, expirationTime);
    }

    clearLogoutTimer() {
        if (this.tokenExpirationTimer) {
            clearTimeout(this.tokenExpirationTimer);
            this.tokenExpirationTimer = null;
        }
    }
}