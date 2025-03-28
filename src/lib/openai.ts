import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export async function getChatResponse(message: string) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Tu es un expert en accords mets et boissons, spécialisé dans les vins, bières et spiritueux. Tu dois aider les utilisateurs à trouver les meilleures associations pour leurs plats ou boissons. Sois précis dans tes recommandations et explique toujours le raisonnement derrière tes suggestions. Limite tes réponses à 2-3 phrases maximum."
        },
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 150
    });

    return completion.choices[0]?.message?.content || "Désolé, je n'ai pas pu générer une réponse.";
  } catch (error: any) {
    // Check for quota exceeded error
    if (error?.status === 429) {
      throw new Error("Le service est temporairement indisponible en raison d'une utilisation excessive. Veuillez réessayer plus tard.");
    }
    
    // Log the full error for debugging
    console.error('Erreur OpenAI détaillée:', {
      status: error?.status,
      message: error?.message,
      type: error?.type,
      stack: error?.stack
    });

    throw new Error("Une erreur est survenue lors de la génération de la réponse. Veuillez réessayer.");
  }
}