export default function IngredientsList(props) {
     const ingredientsListItems = props.ingredients.map(ingredient => (
        <li key={ingredient}>{ingredient}</li>
    ))
    return (
         <section>
            <h2>Ингредиенты под рукой:</h2>
            <ul className="ingredients-list" aria-live="polite">{ingredientsListItems}</ul>
            {props.ingredients.length > 3 && <div className="get-recipe-container">
                <div ref={props.ref}>
                    <h3>Готовы получить рецепт?</h3>
                    <p>Генерируем рецепт из вашего списка ингредиентов</p>
                </div>
                <button onClick={props.getRecipe}>Получить рецепт</button>
            </div>}
        </section>
    )
}

//