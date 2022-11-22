import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, ofType, Effect } from '@ngrx/effects';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from '../auth.service';
import { User } from '../user.model';
import * as AuthActions from './auth.actions'

export interface AuthResponseData {
    kind: string,
    idToken: string,
    email: string,
    refreshToken: string,
    expiresIn: string,
    localId: string
}

const handleAuthentication = (
    email: string, 
    userId: string, 
    token: string, 
    expiresIn: number
) => {
    const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);
    const user = new User(email, userId, token, expirationDate);
    localStorage.setItem('userData', JSON.stringify(user));
    return new AuthActions.AuthenticateSuccess({
        email: email, 
        userId: userId, 
        token: token, 
        expirationData: expirationDate
    });
}

const handleError = (errorResponse: any) => {
    let errorMessage = 'An Unknow error ocurred'
    if(!errorResponse.error || !errorResponse.error.error) {
        return of(new AuthActions.AuthenticateFail(errorMessage))
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
    return of(new AuthActions.AuthenticateFail(errorMessage))
}

@Injectable()
export class AuthEffects {
    @Effect()
    authSignup = this.actions$.pipe(
        ofType(AuthActions.SIGNUP_START),
        switchMap((signupAction: AuthActions.SignupStart) => {
            return this.http.post<AuthResponseData>('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + environment.firebaseAPIKey, 
            {
                email: signupAction.payload.email, 
                password: signupAction.payload.password, 
                returnSecureToken: true
            } //tap() performs an action without changing the response, runs the code without interrupting
            ).pipe(
                tap((responseData) => {
                    this.authService.setLogoutTimer(+responseData.expiresIn * 1000);
                }),
                map(responseData => {
                    return handleAuthentication(
                        responseData.email, 
                        responseData.localId, 
                        responseData.idToken, 
                        +responseData.expiresIn);
                }),
                catchError(errorResponse => {
                    return handleError(errorResponse); 
                })
            );
        })
    );

    @Effect()
    authLogin = this.actions$.pipe(
        ofType(AuthActions.LOGIN_START),
        switchMap((authData: AuthActions.LoginStart) => {
            return this.http.post<AuthResponseData>('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + environment.firebaseAPIKey,
                {
                    email: authData.payload.email, 
                    password: authData.payload.password, 
                    returnSecureToken: true
                }
            ).pipe(
                tap((responseData) => {
                    this.authService.setLogoutTimer(+responseData.expiresIn * 1000);
                }),
                map(responseData => {
                    return handleAuthentication(
                        responseData.email, 
                        responseData.localId, 
                        responseData.idToken, 
                        +responseData.expiresIn);
                }),
                catchError(errorResponse => {
                   return handleError(errorResponse)
                })
            );
        })
    );

    @Effect({dispatch: false})
    authRedirect = this.actions$.pipe(ofType(AuthActions.AUTHENTICATE_SUCCESS), tap(() => {
        this.router.navigate(['/']);
        })
    );

    @Effect()
    autoLogin = this.actions$.pipe(ofType(AuthActions.AUTO_LOGIN),
        map(() => {
            const userData: {
                email: string,
                id: string,
                _token: string,
                _tokenExpirationDate: string
            } = JSON.parse(localStorage.getItem('userData'));
            if(!userData) {
                return { type: 'Test'};
            }
    
            const loadedUser = new User(userData.email, userData.id, userData._token, new Date(userData._tokenExpirationDate));
            if(loadedUser.token) {
                const expirationDurationTime = new Date(userData._tokenExpirationDate).getTime() - new Date().getTime();
                this.authService.setLogoutTimer(expirationDurationTime)
                return new AuthActions.AuthenticateSuccess({
                    email: loadedUser.email, 
                    userId: loadedUser.id, 
                    token: loadedUser.token,
                    expirationData: new Date(userData._tokenExpirationDate)
                    })
            }
            return { type: 'Test'}
        })
    )

    @Effect({dispatch: false})
    authLogout = this.actions$.pipe(ofType(AuthActions.LOGOUT), 
        tap(() => {
            this.authService.clearLogoutTimer();
            localStorage.removeItem('userData');
            this.router.navigate(['/auth']);
        })
    );

    constructor(private actions$: Actions,
                private http: HttpClient,
                private router: Router,
                private authService: AuthService) {}
}