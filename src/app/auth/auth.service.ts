import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { catchError, throwError, tap, BehaviorSubject } from "rxjs";
import { User } from "./user.model";
import { environment } from "src/environments/environment";
import { Store } from "@ngrx/store";
import * as fromApp from '../store/app.reducer';
import * as AuthActions from './store/auth.actions'
import { Action } from "rxjs/internal/scheduler/Action";

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
    // user = new BehaviorSubject<User>(null);
    private tokenExpirationTimer: any;
    
    constructor(private http: HttpClient, 
                private router: Router,
                private store: Store<fromApp.AppState>) {}
    
    signup(email: string, password: string) {
        return this.http.post<AuthResponseData>('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + environment.firebaseAPIKey, 
            {
                email: email, 
                password: password, 
                returnSecureToken: true
            } //tap() performs an action without changing the response, runs the code without interrupting
        ).pipe(catchError(this.handleError), tap(responseData => {
            this.handleUserAuth(responseData.email, responseData.localId, responseData.idToken, +responseData.expiresIn);
        }));
    }

    login(email: string, password: string) {
        return this.http.post<AuthResponseData>('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + environment.firebaseAPIKey,
            {
                email: email, 
                password: password, 
                returnSecureToken: true
            }
        ).pipe(
            catchError(this.handleError), 
                tap(responseData => {
                    this.handleUserAuth(
                        responseData.email, 
                        responseData.localId, 
                        responseData.idToken, 
                        +responseData.expiresIn
                        );
                    }
                )
        );
    }

    //keeps user logged in whenever page refreshes via LS
    autoLogin() {
        const userData: {
            email: string,
            id: string,
            _token: string,
            _tokenExpirationDate: string
        } = JSON.parse(localStorage.getItem('userData'));
        if(!userData) {
            return;
        }

        const loadedUser = new User(userData.email, userData.id, userData._token, new Date(userData._tokenExpirationDate));
        if(loadedUser.token) {
            this.store.dispatch(
                new AuthActions.AuthenticateSuccess({
                    email: loadedUser.email, 
                    userId: loadedUser.id, 
                    token: loadedUser.token,
                    expirationData: new Date(userData._tokenExpirationDate)
                    })
                )
            const expirationDurationTime = new Date(userData._tokenExpirationDate).getTime() - new Date().getTime();
            this.autoLogout(expirationDurationTime);
        }
    }

    logout() {
        // this.user.next(null);
        this.store.dispatch(new AuthActions.Logout())
        this.router.navigate(['/auth']);
        localStorage.removeItem('userData');
        if(this.tokenExpirationTimer) {
            clearTimeout(this.tokenExpirationTimer);
        }
        this.tokenExpirationTimer = null;
    }

    autoLogout(expirationTime: number) {
        this.tokenExpirationTimer = setTimeout(() => {
            this.logout();
        }, expirationTime);
    }

    private handleUserAuth(
        email: string, 
        userId: string, 
        token: string, 
        expiresIn: number
        ) {
        const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);
        const user = new User(email, userId, token, expirationDate);
        // console.log(user);
        // this.user.next(user);
        this.store.dispatch(
            new AuthActions.AuthenticateSuccess({
                email: email, 
                userId: userId, 
                token: token, 
                expirationData: expirationDate
            })
        )
        this.autoLogout(expiresIn * 1000);
        localStorage.setItem('userData', JSON.stringify(user))
        }
    

    private handleError(errorResponse: HttpErrorResponse) {
        let errorMessage = 'An Unknow error ocurred'
            if(!errorResponse.error || !errorResponse.error.error) {
                return throwError(errorMessage);
            }
            switch (errorResponse.error.error.message) {
                case 'EMAIL_EXISTS':
                    errorMessage = 'This email has already been registered'
                    break;
                case 'EMAIL_NOT_FOUND':
                    errorMessage = 'This email has not been found'
                    break;
                case 'INVALID_PASSWORD':
                    errorMessage = 'The password you have inserted is incorrect'
                    break;
                case 'USER_DISABLED':
                    errorMessage = 'This account has been disabled'
                    break;
            }
            return throwError(errorMessage);
    }
}