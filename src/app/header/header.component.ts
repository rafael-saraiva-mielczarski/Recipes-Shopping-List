import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription, map } from 'rxjs';
import * as fromApp from '../store/app.reducer';
import * as AuthActions from '../auth/store/auth.actions';
import * as RecipesActions from '../recipes/store/recipe.actions';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit, OnDestroy {
  private userSubscription: Subscription;
  isAuthenticated = false;
  
  constructor(private store: Store<fromApp.AppState>) {}

  ngOnInit() {
      this.userSubscription = this.store.select('auth').pipe(
        map(authUser => {
        return authUser.user;
        })
        ).subscribe(user => {
        if(user) {
          this.isAuthenticated = true
        } else {
          this.isAuthenticated = false
        }
      })
  }
  
  onSaveData() {
    // this.dataStorageService.storeRecipe();
    this.store.dispatch(new RecipesActions.StoreRecipes())
  }

  onGetData() {
    // this.dataStorageService.fetchRecipes().subscribe();
    this.store.dispatch(new RecipesActions.FetchRecipes())
  }

  onLogout() {
    this.store.dispatch(new AuthActions.Logout())
  }

  ngOnDestroy() {
    this.userSubscription.unsubscribe()
  }
}
