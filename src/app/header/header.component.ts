import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { DataStorageService } from '../shared/data-storage.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit, OnDestroy {
  private userSubscription: Subscription;
  isAuthenticated = false;
  
  constructor(private dataStorageService: DataStorageService,
              private authService: AuthService) {}

  ngOnInit() {
      this.userSubscription = this.authService.user.subscribe(user => {
        if(user) {
          this.isAuthenticated = true
        } else {
          this.isAuthenticated = false
        }
      })
  }
  
  onSaveData() {
    this.dataStorageService.storeRecipe();
  }

  onGetData() {
    this.dataStorageService.fetchRecipes().subscribe();
  }

  onLogout() {
    this.authService.logout()
  }

  ngOnDestroy() {
    this.userSubscription.unsubscribe()
  }
}
