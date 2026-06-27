type EmbeddingExtractor = (text: string, options: object) => Promise<{ data: Float32Array | number[] }>;

let extractorInstance: EmbeddingExtractor | null = null;

async function getExtractor() {
  if (extractorInstance) return extractorInstance;

  const { pipeline } = await import('@xenova/transformers');

  extractorInstance = (await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
    quantized: true,
  })) as unknown as EmbeddingExtractor;

  return extractorInstance!;
}

export async function generateQueryEmbedding(text: string): Promise<number[]> {
  const extractor = await getExtractor();
  const output = await extractor(text, {
    pooling: 'mean',
    normalize: true,
  });
  return Array.from(output.data);
}
