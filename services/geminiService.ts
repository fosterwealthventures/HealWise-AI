import { GoogleGenAI, Type } from "@google/genai";
import { ModuleType, RecipeResult, ApiResult } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getPromptAndSchema = (moduleType: ModuleType, input: string, restrictions: string, recipeType?: 'Juice' | 'Smoothie' | 'Tea') => {
  const restrictionClause = restrictions
    ? `\n\nIMPORTANT: The user has the following dietary restrictions: "${restrictions}". You MUST NOT recommend any foods, herbs, or ingredients that fall under these restrictions. Your suggestions must be safe according to these user-provided constraints.`
    : '';
    
  switch (moduleType) {
    case ModuleType.Food:
      return {
        prompt: `For the condition(s) "${input}", suggest 3 diverse whole foods that may help (e.g., a fruit, a vegetable, lean meat, whole grain). For each food, provide a short description, a simplified summary of a relevant study, and a scriptural or stewardship note.${restrictionClause}`,
        schema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "Name of the food" },
              description: { type: Type.STRING, description: "Short description of the food's benefits for the condition" },
              studySummary: { type: Type.STRING, description: "Simplified summary of a relevant scientific study" },
              stewardshipNote: { type: Type.STRING, description: "A scriptural or stewardship-related note" },
            },
            required: ["name", "description", "studySummary", "stewardshipNote"],
          },
        },
      };
    case ModuleType.Herbs:
      return {
        prompt: `For the condition(s) or system(s) "${input}", suggest 3 herbs. For each, explain its benefits in simple, easy-to-understand language. Also provide a simplified study citation and a YouTube link from 'The Herbal Code 411' channel if available.${restrictionClause}`,
        schema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "Name of the herb" },
              benefits: { type: Type.STRING, description: "Description of the herb's benefits in simple language" },
              studyCitation: { type: Type.STRING, description: "Simplified citation of a relevant study" },
              youtubeLink: { type: Type.STRING, description: "Full YouTube URL if available" },
            },
            required: ["name", "benefits", "studyCitation"],
          },
        },
      };
    case ModuleType.Meds:
      return {
        prompt: `Analyze the following medications, supplements, and over-the-counter (OTC) drugs: "${input}". Provide a detailed breakdown in simple, easy-to-understand language.
1.  For each item (medication, supplement, or OTC) individually, provide its name, explain how it affects the body, and list its common side effects or benefits.
2.  Then, analyze all potential interactions between all the provided items. For each significant interaction found, list the items involved, describe the potential effects on the body, and summarize what relevant studies or clinical evidence says about it. If no significant interactions are found, the "interactionAnalysis" array should be empty.
3.  Additionally, analyze if any of the items commonly contain inactive ingredients (like lactose, gluten, dyes, peanut oil) that would conflict with the user's provided restrictions: "${restrictions}". If a potential conflict is identified, populate the 'allergyWarnings' array with details. If no conflicts are found, this array must be empty.`,
        schema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              individualMedications: {
                type: Type.ARRAY,
                description: "List of details for each individual item (medication, supplement, or OTC).",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING, description: "Name of the item." },
                    howItWorks: { type: Type.STRING, description: "Easy-to-understand explanation of how the item affects the body." },
                    commonSideEffects: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of common side-effects or benefits." },
                  },
                  required: ["name", "howItWorks", "commonSideEffects"],
                },
              },
              interactionAnalysis: {
                type: Type.ARRAY,
                description: "Analysis of interactions between the provided items. This will be empty if no significant interactions are found.",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    medications: { type: Type.ARRAY, items: { type: Type.STRING }, description: "The specific items (medications, supplements, etc.) that interact." },
                    effectsOnBody: { type: Type.STRING, description: "Description of the interaction's effects on the body." },
                    studySummary: { type: Type.STRING, description: "Summary of study findings regarding the interaction." },
                  },
                  required: ["medications", "effectsOnBody", "studySummary"],
                },
              },
              allergyWarnings: {
                type: Type.ARRAY,
                description: "List of potential allergy or sensitivity warnings based on user restrictions. Empty if no conflicts are found.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        medicationName: { type: Type.STRING, description: "The item with the potential issue." },
                        conflictingIngredient: { type: Type.STRING, description: "The common inactive ingredient that may cause a reaction (e.g., 'Lactose', 'Gluten')." },
                        warning: { type: Type.STRING, description: "A clear warning message for the user." },
                    },
                    required: ["medicationName", "conflictingIngredient", "warning"],
                }
              }
            },
            required: ["individualMedications", "interactionAnalysis", "allergyWarnings"],
          },
        },
      };
    case ModuleType.Recipe:
      return {
        prompt: `Generate a ${recipeType} recipe based on the user's request, which may include health conditions or specific ingredients: "${input}".
- The response must include a recipe name, a brief description, a list of ingredients, and step-by-step instructions. 
- The 'recipeType' field in the JSON output must be exactly "${recipeType}".${restrictionClause}`,
        schema: {
          type: Type.OBJECT,
          properties: {
            recipeName: { type: Type.STRING, description: "Name of the recipe" },
            description: { type: Type.STRING, description: "Short description of the recipe" },
            ingredients: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of ingredients" },
            instructions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Step-by-step instructions" },
            recipeType: { 
                type: Type.STRING, 
                description: "Type of recipe (Juice, Smoothie, or Tea)",
                enum: ['Juice', 'Smoothie', 'Tea'],
            },
          },
          required: ["recipeName", "description", "ingredients", "instructions", "recipeType"],
        },
      };
    default:
      throw new Error("Invalid module type");
  }
};

export const generateRecommendation = async <T extends ApiResult[],>(
  moduleType: ModuleType,
  input: string,
  restrictions: string,
  recipeType?: 'Juice' | 'Smoothie' | 'Tea'
): Promise<T> => {
  // Do not send restrictions if the field is empty and the module is Meds, to avoid confusing the model.
  const finalRestrictions = moduleType === ModuleType.Meds && !restrictions ? 'none' : restrictions;
  const { prompt, schema } = getPromptAndSchema(moduleType, input, finalRestrictions, recipeType);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const jsonText = response.text.trim();
    const parsedJson = JSON.parse(jsonText);

    // Special handling for Recipe which returns an object, not an array
    if(moduleType === ModuleType.Recipe) {
        (parsedJson as RecipeResult).recipeType = recipeType!;
        // Fix: Ensure the recipe object is returned inside an array to match the expected return type.
        return [parsedJson] as T;
    }

    return parsedJson as T;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to get recommendations from HealWise AI. Please try again.");
  }
};

export const generateRecipeVariation = async (
  originalRecipe: RecipeResult,
  variationRequest: string,
  restrictions: string
): Promise<RecipeResult> => {
  const restrictionClause = restrictions
    ? `\n\nIMPORTANT: The user has the following dietary restrictions: "${restrictions}". You MUST NOT recommend any ingredients that fall under these restrictions. The new recipe must adhere to these constraints.`
    : '';

  const prompt = `Based on the following recipe:
Name: ${originalRecipe.recipeName}
Description: ${originalRecipe.description}
Ingredients: ${originalRecipe.ingredients.join(', ')}
Instructions: ${originalRecipe.instructions.join('; ')}

Please generate a new version of this recipe with the following modification: "${variationRequest}".
Ensure the output is a single JSON object matching the provided schema. The 'recipeType' must remain '${originalRecipe.recipeType}'.
${restrictionClause}`;

  const schema = {
      type: Type.OBJECT,
      properties: {
        recipeName: { type: Type.STRING, description: "Name of the new, varied recipe" },
        description: { type: Type.STRING, description: "Short description of the new recipe" },
        ingredients: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of ingredients for the new recipe" },
        instructions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Step-by-step instructions for the new recipe" },
        recipeType: { 
            type: Type.STRING, 
            description: "Type of recipe (Juice, Smoothie, or Tea)",
            enum: ['Juice', 'Smoothie', 'Tea'],
        },
      },
      required: ["recipeName", "description", "ingredients", "instructions", "recipeType"],
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const jsonText = response.text.trim();
    const parsedJson = JSON.parse(jsonText) as RecipeResult;
    // Ensure the recipeType is preserved if the model misses it
    parsedJson.recipeType = originalRecipe.recipeType; 
    return parsedJson;
  } catch (error) {
    console.error("Error calling Gemini API for recipe variation:", error);
    throw new Error("Failed to get recipe variation from HealWise AI. Please try again.");
  }
};