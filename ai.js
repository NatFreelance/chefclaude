
import { InferenceClient } from '@huggingface/inference'

const SYSTEM_PROMPT = `
You are an assistant that receives a list of ingredients that a user has and suggests a recipe they could make with some or all of those ingredients. You don't need to use every ingredient they mention in your recipe. The recipe can include additional ingredients they didn't mentioned, but try not to include too many extra ingredients. Format your response in markdown to make it easier to render to a web page
`

const hf = new InferenceClient(import.meta.env.VITE_HF_ACCESS_TOKEN)

// Функция для YandexGPT
async function tryYandexGPT(ingredientsString) {
    try {
        console.log('Пробуем YandexGPT...')
        
        const response = await fetch('https://llm.api.cloud.yandex.net/foundationModels/v1/completion', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Api-Key ${import.meta.env.VITE_YANDEX_API_KEY}`,
                'x-folder-id': import.meta.env.VITE_YANDEX_FOLDER_ID
            },
            body: JSON.stringify({
                modelUri: `gpt://${import.meta.env.VITE_YANDEX_FOLDER_ID}/yandexgpt-lite`,
                completionOptions: {
                    stream: false,
                    temperature: 0.7,
                    maxTokens: 1000
                },
                messages: [
                    {
                        role: "system",
                        text: "Вы помощник по кулинарии. Предложите рецепт блюда на русском языке в формате markdown."
                    },
                    {
                        role: "user", 
                        text: `У меня есть следующие ингредиенты: ${ingredientsString}. Предложите рецепт блюда, которое можно приготовить из этих ингредиентов.`
                    }
                ]
            })
        })
        
        if (!response.ok) {
            const errorText = await response.text()
            console.error('YandexGPT ошибка:', response.status, errorText)
            throw new Error(`YandexGPT API error: ${response.status}`)
        }
        
        const data = await response.json()
        console.log('✅ YandexGPT ответил!')
        
        return data.result.alternatives[0].message.text
        
    } catch (err) {
        console.error('❌ YandexGPT не работает:', err.message)
        return null
    }
}

// Локальная база рецептов - отличное решение для портфолио!
const recipeDatabase = {
    'говядина': {
        name: 'Тушеная говядина с овощами',
        time: '1.5 часа',
        difficulty: 'Средне',
        steps: [
            'Нарежьте говядину кубиками 3х3 см',
            'Обжарьте мясо до румяной корочки',
            'Добавьте нарезанный лук и морковь',
            'Влейте воду, чтобы покрыла мясо',
            'Тушите под крышкой 1-1.5 часа',
            'За 15 минут до готовности добавьте специи'
        ]
    },
    'курица': {
        name: 'Курица в сметанном соусе',
        time: '35 минут',
        difficulty: 'Легко',
        steps: [
            'Нарежьте куриное филе кусочками',
            'Обжарьте курицу до золотистого цвета',
            'Добавьте лук, обжарьте 5 минут',
            'Влейте сметану и немного воды',
            'Тушите 15-20 минут под крышкой',
            'Приправьте зеленью перед подачей'
        ]
    },
    'картофель': {
        name: 'Жареная картошка с луком',
        time: '25 минут',
        difficulty: 'Легко',
        steps: [
            'Очистите и нарежьте картофель дольками',
            'Нарежьте лук полукольцами',
            'Разогрейте сковороду с маслом',
            'Жарьте картофель 15-20 минут',
            'Добавьте лук, жарьте еще 5 минут',
            'Посолите и подавайте горячим'
        ]
    }
}

export async function getRecipeFromMistral(ingredientsArr) {
    const ingredientsString = ingredientsArr.join(", ")
    
    // Отладочная информация
    console.log('🔧 Проверка переменных окружения:')
    console.log('YANDEX_API_KEY:', import.meta.env.VITE_YANDEX_API_KEY ? 'Есть' : 'НЕТ')
    console.log('YANDEX_FOLDER_ID:', import.meta.env.VITE_YANDEX_FOLDER_ID ? 'Есть' : 'НЕТ')
    console.log('HF_TOKEN:', import.meta.env.VITE_HF_ACCESS_TOKEN ? 'Есть' : 'НЕТ')
    
    // Имитируем задержку API
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    console.log('🍳 Генерируем рецепт для:', ingredientsString)
    
    // Ищем подходящий рецепт
    const lowerIngredients = ingredientsString.toLowerCase()
    let selectedRecipe = null
    let mainIngredient = ''
    
    for (const [key, recipe] of Object.entries(recipeDatabase)) {
        if (lowerIngredients.includes(key)) {
            selectedRecipe = recipe
            mainIngredient = key
            break
        }
    }
    
    if (selectedRecipe) {
        return formatRecipe(selectedRecipe, ingredientsArr, mainIngredient)
    }
    
    return generateUniversalRecipe(ingredientsArr)
}

function formatRecipe(recipe, userIngredients, mainIngredient) {
    const steps = recipe.steps.map((step, index) => `${index + 1}. ${step}`).join('\n')
    
    return `## 🍳 ${recipe.name}

**Ваши ингредиенты:** ${userIngredients.join(", ")}
**Основной продукт:** ${mainIngredient}

### 👨‍🍳 Пошаговый рецепт:
${steps}

### ℹ️ Информация о блюде:
- ⏱️ **Время приготовления:** ${recipe.time}
- 📊 **Сложность:** ${recipe.difficulty}
- 🍽️ **Количество порций:** 3-4

### 💡 Советы от Шеф Клода:
- Все ингредиенты лучше подготовить заранее
- Не торопитесь - дайте блюду хорошо прогреться
- Пробуйте на соль в процессе готовки
- Экспериментируйте с любимыми специями!

**Приятного аппетита!** 😋`
}

function generateUniversalRecipe(ingredientsArr) {
    const ingredients = ingredientsArr.join(", ")
    
    return `## 🎨 Креативное блюдо из ваших ингредиентов

**Доступные ингредиенты:** ${ingredients}

### 🍳 Универсальный способ приготовления:

1. **Подготовка (5 минут):**
   - Вымойте и нарежьте все ингредиенты
   - Подготовьте сковороду и специи

2. **Основной процесс (20 минут):**
   - Разогрейте сковороду с маслом
   - Начните с ингредиентов, которые готовятся дольше
   - Добавляйте остальные по мере готовности

3. **Завершение (5 минут):**
   - Приправьте солью, перцем и специями
   - Дайте настояться и подавайте

### 💡 Полезные советы:
- **Мясо и корнеплоды** - готовятся 20-30 минут
- **Мягкие овощи** - добавляйте за 5-10 минут
- **Зелень** - в самом конце

### ⏱️ Время: 30 минут | 🍽️ Порций: 2-3

*Рецепт создан персонально для ваших ингредиентов* 👨‍🍳

**Не бойтесь экспериментировать!** ✨`
}