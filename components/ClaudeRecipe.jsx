import ReactMarkdown from "react-markdown"

export default function ClaudeRecipe(props) {
    return (
        <section className="suggested-recipe-container" aria-live="polite">
            <h2>Шеф Клод рекомендует:</h2>
            <ReactMarkdown>{props.recipe}</ReactMarkdown>
        </section>
    )
}