import {
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Form, NgForm } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';

import { Ingredient } from '../../shared/ingredient.model';
import { ShoppingListService } from '../shopping-list.service';
import * as ShoppingListActions from '../store/shopping-list.action'

@Component({
  selector: 'app-shopping-edit',
  templateUrl: './shopping-edit.component.html',
  styleUrls: ['./shopping-edit.component.scss']
})
export class ShoppingEditComponent implements OnInit {
  @ViewChild('f') shoppingListForm: NgForm;
  subscription: Subscription;
  editMode = false;
  editedItemIndex: number;
  editedIngredient: Ingredient;

  constructor(private slService: ShoppingListService, 
              private store: Store<{shoppingList : { ingredient : Ingredient[] } }>) { }

  ngOnInit() {
    this.subscription = this.slService.startedEdit
      .subscribe(
        (index: number) => {
          this.editMode = true;
          this.editedItemIndex = index;
          this.editedIngredient = this.slService.getIngredient(index)
          this.shoppingListForm.setValue({
            name: this.editedIngredient.name,
            amount: this.editedIngredient.amount 
          });
        }
      )
  }

  onAddItem(form: NgForm) {
    const value = form.value
    const newIngredient = new Ingredient(value.name, value.amount);
    if(this.editMode) {
      this.store.dispatch(new ShoppingListActions.UpdateIngredient({index: this.editedItemIndex, ingredient: newIngredient}))
    } else {
      this.store.dispatch(new ShoppingListActions.AddIngredient(newIngredient))
    }
    this.editMode = false;
    form.reset();
  }
  
  onClear() {
    this.shoppingListForm.reset();
    this.editMode = false;
  }

  onDelete() {
    this.store.dispatch(new ShoppingListActions.DeleteIngredient(this.editedItemIndex))
    // this.slService.deleteIngredient(this.editedItemIndex);
    this.onClear();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
