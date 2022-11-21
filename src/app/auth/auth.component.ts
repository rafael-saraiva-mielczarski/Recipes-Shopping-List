import { Component, OnInit } from "@angular/core";
import { NgForm } from "@angular/forms";
import { Router } from "@angular/router";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { AuthService, AuthResponseData } from "./auth.service";
import * as fromApp from '../store/app.reducer'
import * as AuthActions from './store/auth.actions';

@Component({
    selector: 'app-auth',
    templateUrl: './auth.component.html',
    styleUrls: ['./auth.component.scss']
})

export class AuthComponent implements OnInit {
    isLoginMode = true;
    isLoading = false;
    error: string = null;

    constructor(private authService: AuthService,
                private router: Router,
                private store: Store<fromApp.AppState>) {}


    ngOnInit() {
        this.store.select('auth').subscribe(authState => {
            this.isLoading = authState.loading;
            this.error = authState.authError
        })
    }

    onSwitchMode() {
        this.isLoginMode = !this.isLoginMode;
    }

    onSubmit(form: NgForm) {
        const email = form.value.email
        const password = form.value.password

        let authObservable:Observable<AuthResponseData>
        
        this.isLoading = true
        if(this.isLoginMode) {
            this.store.dispatch(new AuthActions.LoginStart({email: email, password: password}));
        } else {
            authObservable = this.authService.signup(email, password);
        }
        // form.reset();

        // authObservable.subscribe(responseData => {
        //     console.log(responseData);
        //     this.isLoading = false;
        //     this.router.navigate(['./recipes']);
        // }, errorMessage => {
        //     console.log(errorMessage);
        //     this.error = errorMessage;
        //     this.isLoading = false
        // });
    }

    onHandleError() {
        this.error = null;
    }
}