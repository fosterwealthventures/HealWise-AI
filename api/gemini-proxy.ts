import type { VercelRequest, VercelResponse } from '@vercel/node';

// Re-declare ModuleType locally instead of importing from TS-only
// client types to avoid runtime module resolution issues in Vercel
// serverless functions.
enum ModuleType {
  Food = 'Food',
  Herbs = 'Herbs',
  Meds = 'Meds',
  Recipe = 'Recipe',
}

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
  operation: 'recipe-variation';
  originalRecipe: RecipeResult;
  variationRequest: string;
  restrictions?: string;
}

interface KidsExplainPayload {
  operation: 'kids-explain';
  moduleType: ModuleType;
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

const generateRecommendations = async (payload: BaseRecommendationPayload) => {
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

      const prompt = `A learner is curious about the wellness focus "${input}". Suggest 3 diverse true whole foods that someone might find in a grocery store that are often discussed in reputable nutrition sources related to that focus.

1. Always provide a mix of categories across the three suggestions. Aim for:
   - at least one fruit or vegetable,
   - at least one whole grain or legume,
   - and, when the learner's ingredient preferences do not indicate that they avoid animal products (for example vegetarian, vegan, or plant-based only), at least one animal-based whole food such as eggs, fish, or minimally processed meats. If their preferences clearly avoid animal products, all suggestions may be plant-based.
2. Avoid repeating the same specific food name for many different themes. Only suggest commonly overused examples like quinoa or salmon if they are especially relevant to this particular focus.
3. Do not include herbs, herbal supplements, spices, teas, capsules, extracts, or powders as standalone items.
4. For each food, provide a short educational description, a simplified summary of a relevant study or evidence source, and a stewardship or mindful-living note.
5. Do not offer prescriptions, dosages, or individualized medical advice. Every suggested food must respect the learner's stated ingredient preferences and avoid-list first.${avoidClause}${clause}`;
      return fetchWithSchema(prompt, foodSchema);
    }
    case ModuleType.Herbs: {
      const prompt = `A learner wants plain-language field notes about the theme "${input}". Highlight 3 herbs that are commonly referenced when exploring that theme. For each herb, explain its traditional or researched context in simple language, cite a reputable study or source, and include a YouTube link from 'The Herbal Code 411' channel if a relevant video exists. Keep the tone educational and avoid medical directives.${clause}`;
      return fetchWithSchema(prompt, herbSchema);
    }
    case ModuleType.Meds: {
      const prompt = `Provide an educational, plain-language decoder for the following list of medications, supplements, or OTC items: "${input}".
1. For each item, explain what it is, offer a simple description of how it is commonly understood to work, and list commonly noted effects or considerations. Avoid prescribing, dosing guidance, or individualized advice.
2. Summarize any notable interactions discussed in reputable sources. If none are noteworthy, keep the "interactionAnalysis" array empty.
3. Highlight potential inactive-ingredient flags (like lactose, gluten, dyes, peanut oil) that could conflict with the learner's stated preferences: "${restrictions ?? 'none'}". If there are no conflicts, leave 'allergyWarnings' empty.
Clearly label that every section is for learning only, not a medical directive.${clause}`;
      return fetchWithSchema(prompt, medsSchema);
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

const generateRecipeVariation = async ({
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

const generateKidsExplanation = async ({ content }: KidsExplainPayload) => {
  const prompt = `Rewrite the following explanation in warm, plain language suitable for a curious older child or young teen (around ages 10–14). Keep it accurate and non-scary, avoid medical commands or dosing advice, and focus on helping them understand the big idea in a calm, hopeful way.\n\nOriginal explanation:\n"${content}"`;
  return fetchWithSchema<{ simplified: string }>(prompt, kidsExplainSchema);
};

const parseBody = (req: VercelRequest) => {
  const body = req.body;
  if (!body) return null;
  if (typeof body === 'string') {
    try {
      return JSON.parse(body);
    } catch (error) {
      console.error('Failed to parse string body', error);
      return null;
    }
  }
  if (Buffer.isBuffer(body)) {
    try {
      return JSON.parse(body.toString('utf8'));
    } catch (error) {
      console.error('Failed to parse buffer body', error);
      return null;
    }
  }
  return body;
};

const isModuleType = (value: unknown): value is ModuleType =>
  typeof value === 'string' &&
  Object.values(ModuleType).includes(value as ModuleType);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const payload = parseBody(req);
  if (!payload || typeof payload !== 'object') {
    res.status(400).json({ error: 'Invalid JSON body' });
    return;
  }

  const operation = (payload as { operation?: string }).operation ?? 'recommendation';

  try {
    if (operation === 'recipe-variation') {
      const variation = payload as RecipeVariationPayload;
      if (
        !variation.originalRecipe ||
        !variation.variationRequest ||
        !variation.originalRecipe.recipeName
      ) {
        res.status(400).json({ error: 'Invalid recipe variation payload' });
        return;
      }

      const data = await generateRecipeVariation(variation);
      res.status(200).json(data);
      return;
    }

    if (operation === 'kids-explain') {
      const kidsPayload = payload as KidsExplainPayload;
      if (!kidsPayload.content || typeof kidsPayload.content !== 'string') {
        res.status(400).json({ error: 'Invalid kids-explain payload' });
        return;
      }

      const data = await generateKidsExplanation(kidsPayload);
      res.status(200).json(data);
      return;
    }

    const recommendation = payload as BaseRecommendationPayload;
    if (
      !isModuleType(recommendation.moduleType) ||
      !recommendation.input ||
      typeof recommendation.input !== 'string'
    ) {
      res.status(400).json({ error: 'Invalid recommendation payload' });
      return;
    }

    const data = await generateRecommendations(recommendation);
    res.status(200).json(data);
  } catch (error: any) {
    console.error('Gemini proxy failed:', error);
    res.status(500).json({ error: 'Gemini request failed', detail: error?.message ?? 'Unknown error' });
  }
}
