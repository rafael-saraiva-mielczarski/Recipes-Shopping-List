import { Injectable } from '@angular/core';

import { Recipe } from './recipe.model';
import { Ingredient } from '../shared/ingredient.model';
import { ShoppingListService } from '../shopping-list/shopping-list.service';
import { Subject } from 'rxjs';

@Injectable()
export class RecipeService {
  recipesChanged = new Subject<Recipe[]>();

  private recipes: Recipe[] = [];
  //   new Recipe(
  //     'Pasta with Tomato Sauce',
  //     'A classic, simple but delicious',
  //     'https://food.fnr.sndimg.com/content/dam/images/food/fullset/2014/4/8/2/FNM_050114-Classic-Red-Sauce-Recipe_s4x3.jpg.rend.hgtvcom.616.462.suffix/1397491331300.jpeg',
  //     [
  //       new Ingredient('Pasta', 1),
  //       new Ingredient('Tomatos', 5)
  //     ]),
  //   new Recipe('Burger',
  //     'Simple cheeseburger',
  //     'https://media.gettyimages.com/photos/cheeseburger-picture-id1159548717?k=20&m=1159548717&s=612x612&w=0&h=kkTPQWBADSwJCxiyzRKOzSPsd4nw_AaXn6p1fKEPq-0=',
  //     [
  //       new Ingredient('Buns', 2),
  //       new Ingredient('Meat', 1),
  //       new Ingredient('Cheese', 2)
  //     ])
  // ];

  constructor(private slService: ShoppingListService) {}

  setRecipes(recipes: Recipe[]) {
    //current recipes will be overwritten by recipes received in the function parameter
    this.recipes = recipes;
    this.recipesChanged.next(this.recipes.slice());
  }

  getRecipes() {
    return this.recipes.slice();
  }

  getRecipe(id: number) {
    return this.recipes[id]
  }

  addIngredientsToShoppingList(ingredients: Ingredient[]) {
    this.slService.addIngredients(ingredients);
  }

  addRecipe(recipe: Recipe) {
    this.recipes.push(recipe);
    this.recipesChanged.next(this.recipes.slice());
  }

  updateRecipe(index: number, newRecipe: Recipe) {
    this.recipes[index] = newRecipe;
    this.recipesChanged.next(this.recipes.slice());
  }

  deleteRecipe(index: number) {
    this.recipes.splice(index, 1);
    this.recipesChanged.next(this.recipes.slice())
  }
}
