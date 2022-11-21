import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, ofType, Effect } from '@ngrx/effects';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import * as AuthActions from './auth.actions'

export interface AuthResponseData {
    kind: string,
    idToken: string,
    email: string,
    refreshToken: string,
    expiresIn: string,
    localId: string
}

@Injectable()
export class AuthEffects {
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
                map(responseData => {
                    const expirationDate = new Date(new Date().getTime() + +responseData.expiresIn * 1000);
                    return new AuthActions.AuthenticateSuccess({
                        email: responseData.email, 
                        userId: responseData.localId, 
                        token: responseData.idToken, 
                        expirationData: expirationDate
                        })
                    }),
                catchError(errorResponse => {
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
                })
            );
        })
    );

    @Effect({dispatch: false})
    authSuccess = this.actions$.pipe(ofType(AuthActions.AUTHENTICATE_SUCCESS), 
        tap(() => {
            this.router.navigate(['/']);
        })
    );

    constructor(private actions$: Actions,
                private http: HttpClient,
                private router: Router) {}
}