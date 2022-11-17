import { Action } from "@ngrx/store";
import { Ingredient } from "../../shared/ingredient.model";
import * as ShoppingListActions from "../store/shopping-list.action"

const initialState = {
    ingredients: [
        new Ingredient('Apples', 5),
        new Ingredient('Tomatoes', 10)
    ]
}

export function shoppingListReducer(state = initialState, action: ShoppingListActions.ShoppingListActions) {
    switch (action.type) {
        //best practice to always use caps
        case ShoppingListActions.ADD_INGREDIENT:
            return {
                //... copies the old state, which should never be touched
                ...state,
                ingredients: [...state.ingredients, action.payload]
            };
        //default sends the initial state
        case ShoppingListActions.ADD_INGREDIENTS:
            return {
                ...state,
                ingredients: [...state.ingredients, ...action.payload]
                //use the ... so that it doesn't create a nested array
            };
        case ShoppingListActions.UPDATE_INGREDIENT:
            const ingredient = state.ingredients[action.payload.index];
            const updatedIngredient = {
                //copy the ingredient 
                ...ingredient,
                //overwrite only the especific part you want
                ...action.payload.ingredient
            }
            const updatedIngredients = [...state.ingredients];
            updatedIngredients[action.payload.index] = updatedIngredient;
            return {
                ...state,
                ingredients: updatedIngredients
            };
        case ShoppingListActions.DELETE_INGREDIENT:
            return {
                ...state,
                ingredients: state.ingredients.filter((ingredient, ingredientIndex) => {
                    return ingredientIndex !== action.payload;
                })
            };
        default:
            return state;
    }
}