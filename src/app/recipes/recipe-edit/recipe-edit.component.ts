import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Recipe } from '../recipe.model';
import { RecipeService } from '../recipe.service';
import { map, Subscription } from 'rxjs';
import * as fromApp from '../../store/app.reducer';
import * as RecipeActions from '../store/recipe.actions';

@Component({
  selector: 'app-recipe-edit',
  templateUrl: './recipe-edit.component.html',
  styleUrls: ['./recipe-edit.component.scss']
})
export class RecipeEditComponent implements OnInit, OnDestroy {
  id: number;
  editMode = false;
  recipeForm: FormGroup;
  employeesDataList: Array<any> 
  submitHours: any;

  private storeSub: Subscription;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private store: Store<fromApp.AppState>) { }

  ngOnInit() {
    this.route.params.subscribe(
      (params: Params) => {
        this.id = +params['id']
        this.editMode = params['id'] != null;
        this.initForm();
      }
    )
  }

  get controls() { // a getter!
    return (<FormArray>this.recipeForm.get('ingredients')).controls;
  }

  onSubmit(){
    const newRecipe = new Recipe(
      this.recipeForm.value['name'],
      this.recipeForm.value['description'],
      this.recipeForm.value['imagePath'],
      this.recipeForm.value['ingredients'])
    if(this.editMode) {
      this.store.dispatch(new RecipeActions.UpdateRecipe({index: this.id, newRecipe: this.recipeForm.value}))
    } else {
      this.store.dispatch(new RecipeActions.AddRecipe(this.recipeForm.value))
    }
    this.onCancel()
  }

  onCancel() {
    this.router.navigate(['../'], {relativeTo: this.route})
  }

  onAddIngredient(){
    (<FormArray>this.recipeForm.get('ingredients')).push(
      new FormGroup({
        'name': new FormControl(null, Validators.required),
        'amount': new FormControl(null, [
        Validators.pattern(/^[1-9]+[0-9]*$/),
        Validators.required
        ])
      })
    )
  }

  onDeleteIngredient(index: number) {
    (<FormArray>this.recipeForm.get('ingredients')).removeAt(index);
  }

  ngOnDestroy() {
    if(this.storeSub) {
      this.storeSub.unsubscribe();
    }
  }

  private initForm() {
    let recipeName = '';
    let recipeImagePath = '';
    let recipeDescription = '';
    let recipeIngredients = new FormArray([]);

    if(this.editMode) {
      // const recipe = this.recipeService.getRecipe(this.id);
      this.storeSub = this.store.select('recipes').pipe(map(recipeState => {
        return recipeState.recipes.find((recipe, index) => {
          return index === this.id;
        })
      })).subscribe(recipe => {
        recipeName = recipe.name;
        recipeImagePath = recipe.imagePath;
        recipeDescription = recipe.description;
        if(recipe['ingredients']){
          for(let ingredient of recipe.ingredients){
            recipeIngredients.push(
              new FormGroup({
                'name': new FormControl(ingredient.name, Validators.required),
                'amount': new FormControl(ingredient.amount, [
                  Validators.required,
                  Validators.pattern(/^[1-9]+[0-9]*$/)
                  ])
              })
            );
          }
        }
      })
    }

    this.recipeForm = new FormGroup({
      'name': new FormControl(recipeName, Validators.required),
      'imagePath': new FormControl(recipeImagePath, Validators.required),
      'description': new FormControl(recipeDescription, Validators.required),
      'ingredients': recipeIngredients
    });
  }
}
