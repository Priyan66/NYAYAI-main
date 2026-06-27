import { pipeline } from '@xenova/transformers';
import * as fs from 'fs';
import * as path from 'path';

const CASES_PATH = path.join(process.cwd(), 'src/data/legal-cases.json');
const EMBEDDINGS_PATH = path.join(process.cwd(), 'src/data/case-embeddings.json');

interface LegalCase {
  id: string;
  searchText: string;
  [key: string]: unknown;
}

interface EmbeddingOutput {
  id: string;
  vector: number[];
}

async function main() {
  console.log('Loading cases...');
  const cases: LegalCase[] = JSON.parse(fs.readFileSync(CASES_PATH, 'utf-8'));
  console.log(`Loaded ${cases.length} cases.`);

  console.log('Loading embedding model (Xenova/all-MiniLM-L6-v2)...');
  console.log('First run will download ~23MB model. Subsequent runs use cache.');

  const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
    quantized: true,
  });

  const embeddings: EmbeddingOutput[] = [];

  for (let i = 0; i < cases.length; i++) {
    const c = cases[i];
    process.stdout.write(`\rEmbedding case ${i + 1}/${cases.length}: ${c.id}        `);

    const output = await extractor(c.searchText, {
      pooling: 'mean',
      normalize: true,
    });

    const vector = Array.from(output.data as Float32Array);
    embeddings.push({ id: c.id, vector });
  }

  console.log('\nWriting embeddings to disk...');
  fs.writeFileSync(EMBEDDINGS_PATH, JSON.stringify(embeddings, null, 0));
  console.log(`✓ Wrote ${embeddings.length} embeddings to ${EMBEDDINGS_PATH}`);
  console.log(`File size: ${(fs.statSync(EMBEDDINGS_PATH).size / 1024).toFixed(1)} KB`);
  console.log('Done. Commit src/data/case-embeddings.json to your repository.');
}

main().catch(console.error);
