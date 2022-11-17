import { Action } from "@ngrx/store";
import { Ingredient } from "../../shared/ingredient.model";
import * as ShoppingListActions from "../store/shopping-list.action"

const initialState = {
    ingredients: [
        new Ingredient('Apples', 5),
        new Ingredient('Tomatoes', 10)
    ]
}

export function shoppingListReducer(state = initialState, action: ShoppingListActions.AddIngredient) {
    switch (action.type) {
        //best practice to always use caps
        case ShoppingListActions.ADD_INGREDIENT:
            return {
                //... copies the old state, which should never be touched
                ...state,
                ingredients: [...state.ingredients, action.payload]
            };
        //default sends the initial state
        default:
            return state;
    }
}