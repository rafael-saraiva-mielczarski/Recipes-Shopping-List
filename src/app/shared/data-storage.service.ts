import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { RecipeService } from "../recipes/recipe.service";
import { Recipe } from "../recipes/recipe.model";
import { map, tap} from "rxjs";
import { Store } from "@ngrx/store";
import * as fromApp from '../store/app.reducer';
import * as RecipesActions from '../recipes/store/recipe.actions';

@Injectable({providedIn: 'root'})
export class DataStorageService {
    constructor(private http: HttpClient,
                private recipesService: RecipeService,
                private store: Store<fromApp.AppState>) {}

    storeRecipe() {
        const recipes = this.recipesService.getRecipes()
        
        this.http.put('https://shop-recipe-efdfa-default-rtdb.firebaseio.com/recipes.json', recipes).subscribe(resposnse => {
            console.log(resposnse);
        });
    }

    fetchRecipes() {
        //the <> describes the type of response will get, so in the setRecipes, the response can be understood by TS
        //if the recipe submitted has no ingredients, it will by default be set to an empty array, via the map operator
        //take() only takes 1 value from the observanble, in this case only gets the current user when data is fetched
        return this.http.get<Recipe[]>(
            'https://shop-recipe-efdfa-default-rtdb.firebaseio.com/recipes.json',)
            .pipe(
                map(recipes => {
                  return recipes.map(recipe => {
                    return {
                      ...recipe,
                      ingredients: recipe.ingredients ? recipe.ingredients : []
                    };
                  });
                }),
                tap(recipes => {
                  // this.recipeService.setRecipes(recipes);
                  this.store.dispatch(new RecipesActions.SetRecipes(recipes));
                })
              );
    }
}