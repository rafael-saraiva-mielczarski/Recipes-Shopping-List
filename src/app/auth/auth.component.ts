import { Component, OnDestroy, OnInit } from "@angular/core";
import { NgForm } from "@angular/forms";
import { Router } from "@angular/router";
import { Store } from "@ngrx/store";
import { Subscription } from "rxjs";
import { AuthService } from "./auth.service";
import * as fromApp from '../store/app.reducer'
import * as AuthActions from './store/auth.actions';

@Component({
    selector: 'app-auth',
    templateUrl: './auth.component.html',
    styleUrls: ['./auth.component.scss']
})

export class AuthComponent implements OnInit, OnDestroy {
    isLoginMode = true;
    isLoading = false;
    error: string = null;
    showErrorAlert: any;

    private storeSub: Subscription;

    constructor(private store: Store<fromApp.AppState>) {}


    ngOnInit() {
        this.storeSub = this.store.select('auth').subscribe(authState => {
            this.isLoading = authState.loading;
            this.error = authState.authError;
            if(this.error) {
                this.showErrorAlert(this.error)
            }
        })
    }

    onSwitchMode() {
        this.isLoginMode = !this.isLoginMode;
    }

    onSubmit(form: NgForm) {
        const email = form.value.email
        const password = form.value.password
        
        if(this.isLoginMode) {
            this.store.dispatch(new AuthActions.LoginStart({email: email, password: password}));
        } else {
            this.store.dispatch(new AuthActions.SignupStart({email: email, password: password}))
        }
        form.reset();

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
        this.store.dispatch(new AuthActions.ClearError())
    }

    ngOnDestroy() {
        if(this.storeSub){
            this.storeSub.unsubscribe()
        }    
    }
}