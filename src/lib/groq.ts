import Groq from 'groq-sdk';
import fs from 'fs';
import path from 'path';

const globalForGroq = globalThis as unknown as { groq: Groq | undefined };

function readKeyFromEnvFile(fileName: string): string | undefined {
  try {
    const filePath = path.join(process.cwd(), fileName);
    if (!fs.existsSync(filePath)) return undefined;

    const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
    for (const line of lines) {
      if (!line || line.trim().startsWith('#')) continue;
      const match = line.match(/^\s*GROQ_API_KEY\s*=\s*(.*)\s*$/);
      if (!match) continue;

      let value = match[1].trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      return value.trim() || undefined;
    }
  } catch {
    return undefined;
  }

  return undefined;
}

function isLikelyGroqKey(value: string | undefined): value is string {
  return Boolean(value && value.startsWith('gsk_') && value.length > 20);
}

function resolveGroqApiKey(): string | undefined {
  const processKey = process.env.GROQ_API_KEY?.trim() || undefined;
  const localFileKey = readKeyFromEnvFile('.env.local');
  const baseFileKey = readKeyFromEnvFile('.env');

  const best = [localFileKey, baseFileKey, processKey].find(isLikelyGroqKey);
  if (best) return best;

  return localFileKey || baseFileKey || processKey;
}

const resolvedGroqApiKey = resolveGroqApiKey();

export const groq: Groq =
  globalForGroq.groq ??
  new Groq({
    apiKey: resolvedGroqApiKey,
  });

if (process.env.NODE_ENV !== 'production') globalForGroq.groq = groq;

export const GROQ_MODEL_PRIMARY = 'llama-3.3-70b-versatile';
export const GROQ_MODEL_FALLBACK = 'llama-3.1-8b-instant';

export async function groqComplete(
  systemPrompt: string,
  userMessage: string,
  stream = false,
  temperature = 0.3
) {
  try {
    return await groq.chat.completions.create({
      model: GROQ_MODEL_PRIMARY,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      stream,
      temperature,
      max_tokens: 4096,
    });
  } catch (err: unknown) {
    const error = err as { status?: number };
    if (error?.status === 429) {
      return await groq.chat.completions.create({
        model: GROQ_MODEL_FALLBACK,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        stream,
        temperature,
        max_tokens: 4096,
      });
    }
    throw err;
  }
}

export default groq;
