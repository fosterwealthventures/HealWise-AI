import { ModuleType } from '../types/common';

type RecipeType = 'Juice' | 'Smoothie' | 'Tea';

interface BaseRecommendationPayload {
  moduleType: ModuleType;
  input: string;
  restrictions?: string;
  recipeType?: RecipeType;
  previousFoods?: string[];
}

interface RecipeResult {
  recipeName: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  recipeType: RecipeType;
}

interface RecipeVariationPayload {
  originalRecipe: RecipeResult;
  variationRequest: string;
  restrictions?: string;
}

interface KidsExplainPayload {
  content: string;
}

const GEMINI_MODEL = process.env.GEMINI_MODEL ?? 'gemini-2.5-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const OPENAI_MODEL = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

const jsonHeaders = { 'Content-Type': 'application/json' };

const toGeminiBody = (prompt: string, schema: Record<string, unknown>) => ({
  contents: [{ role: 'user', parts: [{ text: prompt }] }],
  generationConfig: {
    responseMimeType: 'application/json',
    responseSchema: schema,
  },
});

const callGemini = async <T>(prompt: string, schema: Record<string, unknown>) => {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error('Missing GEMINI_API_KEY');
  }

  const response = await fetch(`${GEMINI_URL}?key=${key}`, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(toGeminiBody(prompt, schema)),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Gemini API error: ${response.status} ${text}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Gemini API returned an empty response');
  }

  return JSON.parse(text) as T;
};

const callOpenAI = async <T>(prompt: string, schema: Record<string, unknown>) => {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    throw new Error('Missing OPENAI_API_KEY');
  }

  const response = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: {
      ...jsonHeaders,
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      temperature: 0.4,
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful wellness assistant for HealWise. Always reply with pure JSON matching the provided schema. Do not wrap the JSON in markdown or explanatory text.',
        },
        {
          role: 'user',
          content: `${prompt}\n\nSchema to follow:\n${JSON.stringify(schema)}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenAI API error: ${response.status} ${text}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('OpenAI Chat Completions returned an empty response');
  }

  const text = Array.isArray(content)
    ? content
        .map((part: { text?: string } | string) =>
          typeof part === 'string' ? part : part.text ?? ''
        )
        .join('')
    : content;

  if (!text) {
    throw new Error('OpenAI Chat Completions returned an empty message');
  }

  return JSON.parse(text) as T;
};

const fetchWithSchema = async <T>(prompt: string, schema: Record<string, unknown>) => {
  try {
    return await callGemini<T>(prompt, schema);
  } catch (geminiError) {
    if (process.env.OPENAI_API_KEY) {
      console.warn('[Gemini] falling back to OpenAI:', (geminiError as Error).message);
      return callOpenAI<T>(prompt, schema);
    }
    throw geminiError;
  }
};

const getRestrictionClause = (restrictions?: string) =>
  restrictions
    ? `\n\nIngredient guardrails shared by the learner: "${restrictions}". Keep every suggestion aligned with these preferences and avoid conflicting ingredients.`
    : '';

const foodSchema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      description: { type: 'string' },
      studySummary: { type: 'string' },
      stewardshipNote: { type: 'string' },
    },
    required: ['name', 'description', 'studySummary', 'stewardshipNote'],
    additionalProperties: false,
  },
};

const herbSchema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      benefits: { type: 'string' },
      studyCitation: { type: 'string' },
      youtubeLink: { type: 'string' },
    },
    required: ['name', 'benefits', 'studyCitation'],
    additionalProperties: false,
  },
};

const medsSchema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      individualMedications: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            howItWorks: { type: 'string' },
            commonSideEffects: {
              type: 'array',
              items: { type: 'string' },
            },
          },
          required: ['name', 'howItWorks', 'commonSideEffects'],
          additionalProperties: false,
        },
      },
      interactionAnalysis: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            medications: {
              type: 'array',
              items: { type: 'string' },
            },
            effectsOnBody: { type: 'string' },
            studySummary: { type: 'string' },
          },
          required: ['medications', 'effectsOnBody', 'studySummary'],
          additionalProperties: false,
        },
      },
      allergyWarnings: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            medicationName: { type: 'string' },
            conflictingIngredient: { type: 'string' },
            warning: { type: 'string' },
          },
          required: ['medicationName', 'conflictingIngredient', 'warning'],
          additionalProperties: false,
        },
      },
    },
    required: ['individualMedications', 'interactionAnalysis', 'allergyWarnings'],
    additionalProperties: false,
  },
};

const recipeSchema = {
  type: 'object',
  properties: {
    recipeName: { type: 'string' },
    description: { type: 'string' },
    ingredients: { type: 'array', items: { type: 'string' } },
    instructions: { type: 'array', items: { type: 'string' } },
    recipeType: { type: 'string', enum: ['Juice', 'Smoothie', 'Tea'] },
  },
  required: ['recipeName', 'description', 'ingredients', 'instructions', 'recipeType'],
  additionalProperties: false,
};

const kidsExplainSchema = {
  type: 'object',
  properties: {
    simplified: { type: 'string' },
  },
  required: ['simplified'],
  additionalProperties: false,
};

export const generateRecommendations = async (payload: BaseRecommendationPayload) => {
  const { moduleType, input, restrictions, recipeType, previousFoods } = payload;
  const clause = getRestrictionClause(restrictions);

  switch (moduleType) {
    case ModuleType.Food: {
      const avoidClause =
        previousFoods && previousFoods.length
          ? ` Avoid repeating foods that have already been suggested for this learner, especially: ${previousFoods.join(
              ', ',
            )}.`
          : '';

      const prompt = `A learner is curious about the wellness focus or condition "${input}". Suggest 3 diverse true whole foods that someone might find in a grocery store that are often discussed in reputable nutrition sources related to that focus.

1. Always provide a mix of categories across the three suggestions. Aim for:
   - at least one colorful vegetable or root (for example, leafy greens, broccoli, sweet potatoes, carrots),
   - at least one food rich in protein or hearty calories (for example, beans, lentils, nuts or seeds, eggs, fish, or minimally processed meats—only include animal foods if the learner's preferences do not clearly avoid them),
   - and at least one additional everyday whole food that rounds out the ideas (such as fruit, whole grains, or seeds).
2. Avoid repeating the same specific food name for many different themes. Only suggest commonly overused examples like quinoa or salmon if they are especially relevant to this particular focus.
3. Do not include herbs, herbal supplements, spices, teas, capsules, extracts, or powders as standalone items.
4. For each food, the JSON fields must be used as follows:
   - "description": briefly describe the food and, in plain language, *why it is often discussed* for the learner's focus "${input}" (for example, which nutrients it contains or which body systems it relates to). This should sound like educational commentary someone might read on a reputable nutrition site—not a personal instruction.
   - "studySummary": give a very short summary of a study or evidence source that explores this food in relation to the theme. Keep it cautious and avoid strong claims.
   - "stewardshipNote": offer a gentle reflection on budgeting, sustainability, or mindful use (for example, how someone might think about including this food when talking with a professional or planning meals), without telling the learner exactly what to do.
5. Do not offer prescriptions, dosages, or individualized medical advice, and do not tell the learner what they personally should eat, avoid, or change. Every suggested food must respect the learner's stated ingredient preferences and avoid-list first.${avoidClause}${clause}`;
      return fetchWithSchema(prompt, foodSchema);
    }
    case ModuleType.Herbs: {
      const prompt = `A learner wants plain-language field notes about the theme "${input}". Highlight 3 herbs that are commonly referenced when exploring that theme.

For each herb:
1. Explain what it is and the tradition or research context it is usually discussed in.
2. In everyday language, describe why this herb is often mentioned for the learner's theme "${input}" (for example, which body systems or patterns it relates to in educational sources), without telling the learner what they personally should take or change.
3. Cite a reputable study or source.
4. Include a YouTube link from 'The Herbal Code 411' channel if a relevant video exists.

Keep the tone educational and avoid medical directives, dosing, or substitution advice.${clause}`;
      return fetchWithSchema(prompt, herbSchema);
    }
    case ModuleType.Meds: {
      const prompt = `Provide an educational, plain-language decoder for the following list of medications, supplements, or OTC items: "${input}".
1. For each item, explain what it is and give a calm, everyday-language summary of how it affects the body (for example, which systems or pathways it generally influences and what that means in daily life). Keep this at the level of \"how it works in the body\" for learning—not at the level of dosing instructions or what someone personally should do.
2. List commonly noted effects or considerations that people might read about on reputable health sites or medication guides. Do not tell the learner what to start, stop, change, or substitute.
3. Summarize any notable interactions discussed in reputable sources. If none are noteworthy, keep the "interactionAnalysis" array empty.
4. Highlight potential inactive-ingredient flags (like lactose, gluten, dyes, peanut oil) that could conflict with the learner's stated preferences: "${restrictions ?? 'none'}". If there are no conflicts, leave 'allergyWarnings' empty.
Make sure every section is clearly framed as educational context only and never as a prescription, diagnosis, dosing, or medical directive.${clause}`;
      const result = await fetchWithSchema<unknown>(prompt, medsSchema);
      if (Array.isArray(result)) {
        return result;
      }
      return [result];
    }
    case ModuleType.Recipe: {
      const recipePrompt = `Generate a ${recipeType ?? 'Juice'} recipe inspired by the learner's prompt "${input}". Keep the tone experimental and educational—share a recipe name, description, ingredient list, and step-by-step instructions so the learner can reflect on the idea. Avoid health claims or prescriptive outcomes. The 'recipeType' field in the JSON output must remain "${recipeType ?? 'Juice'}".${clause}`;
      const result = await fetchWithSchema<RecipeResult>(recipePrompt, recipeSchema);
      if (recipeType) {
        result.recipeType = recipeType;
      }
      return [result];
    }
    default:
      throw new Error(`Unsupported module type: ${moduleType}`);
  }
};

export const generateRecipeVariation = async ({
  originalRecipe,
  variationRequest,
  restrictions,
}: RecipeVariationPayload) => {
  const clause = getRestrictionClause(restrictions);
  const prompt = `Based on the following recipe:
Name: ${originalRecipe.recipeName}
Description: ${originalRecipe.description}
Ingredients: ${originalRecipe.ingredients.join(', ')}
Instructions: ${originalRecipe.instructions.join('; ')}

Please generate a new version of this recipe with the following modification: "${variationRequest}".
Ensure the output is a single JSON object matching the provided schema. The 'recipeType' must remain '${originalRecipe.recipeType}'.
${clause}`;

  const result = await fetchWithSchema<RecipeResult>(prompt, recipeSchema);
  result.recipeType = originalRecipe.recipeType;
  return result;
};

export const explainForKids = async ({ content }: KidsExplainPayload) => {
  const prompt = `Rewrite the following explanation in warm, plain language suitable for a curious older child or young teen (around ages 10–14). Keep it accurate and non-scary, avoid medical commands or dosing advice, and focus on helping them understand the big idea in a calm, hopeful way.\n\nOriginal explanation:\n"${content}"`;

  return fetchWithSchema<{ simplified: string }>(prompt, kidsExplainSchema);
};
