import React from "react"

import IngredientsList from "./IngredientsList"
import ClaudeRecipe from "./ClaudeRecipe"

import { getRecipeFromMistral } from "../ai"


export default function Main() {
    // console.log(import.meta.env.VITE_HF_ACCESS_TOKEN)
    
    const [ingredients, setIngredients] = React.useState( [])
    const [recipe, setRecipe] = React.useState("")
    const recipeSection = React.useRef(null)
    
     React.useEffect(() => {
        if (recipe !== "" && recipeSection.current !== null) {
            // recipeSection.current.scrollIntoView({behavior: "smooth"})
            const yCoord = recipeSection.current.getBoundingClientRect().top + window.scrollY
            window.scroll({
                top: yCoord,
                behavior: "smooth"
            })
        }
    }, [recipe])

    
    async function getRecipe() {
        const recipeMarkdown = await getRecipeFromMistral(ingredients)
        setRecipe(recipeMarkdown)
    }

    
    function addIngredient(formData) {
        const newIngredient = formData.get("ingredient")
        setIngredients(prevIngredients => [...prevIngredients, newIngredient ])
    }


    return (
        
        <main>
            <form action={addIngredient} className="add-ingredient-form">
                <input
                    type="text"
                    placeholder="например, картофель"
                    aria-label="Add ingredient"
                    name="ingredient"
                />
                <button>Добавить ингредиент</button>
            </form>
            {ingredients.length > 0 && 
                <IngredientsList
                    ref={recipeSection}
                    ingredients={ingredients}
                    getRecipe={getRecipe}
                />}

            {recipe && <ClaudeRecipe recipe={ recipe} />}
        </main>
    )
}