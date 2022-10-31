import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { RecipeService } from "../recipes/recipe.service";
import { Recipe } from "../recipes/recipe.model";
import { map, take, tap, exhaustMap } from "rxjs";
import { AuthService } from "../auth/auth.service";

@Injectable({providedIn: 'root'})
export class DataStorageService {
    constructor(private http: HttpClient,
                private recipesService: RecipeService,
                private authService: AuthService) {}

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
        return this.authService.user.pipe(
            take(1), 
            exhaustMap(user => {
            return this.http.get<Recipe[]>(
                'https://shop-recipe-efdfa-default-rtdb.firebaseio.com/recipes.json',
                {
                    params: new HttpParams().set('auth', user.token)
                }
                );
            })
            , map(
            recipes => {
                return recipes.map(recipe => {
                    return {
                        ...recipe, 
                        ingredients: recipe.ingredients ? recipe.ingredients : []
                    }
                });
            })
            , tap(
                recipes => {
                    this.recipesService.setRecipes(recipes);
                }
            ));
    }
}