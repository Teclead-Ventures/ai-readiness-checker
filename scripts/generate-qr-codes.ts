#!/usr/bin/env npx tsx
/**
 * QR Code Batch Generator for AI Readiness Checker campaigns
 *
 * Usage:
 *   npx tsx scripts/generate-qr-codes.ts --group tech-talk --count 500 --base-url https://ai-readiness-checker.vercel.app
 *
 * Output:
 *   ./qr-codes/{group}/
 *     ├── manifest.csv
 *     ├── {group}-{cid}.png
 *     └── ...
 *
 * Dependencies: npm install -D qrcode @types/qrcode
 */

import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import QRCode from 'qrcode';
import { nanoid } from 'nanoid';

function parseArgs(args: string[]): { group: string; count: number; baseUrl: string } {
  let group = '';
  let count = 100;
  let baseUrl = '';

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--group':
        group = args[++i];
        break;
      case '--count':
        count = parseInt(args[++i], 10);
        break;
      case '--base-url':
        baseUrl = args[++i];
        break;
    }
  }

  if (!group) {
    console.error('Error: --group is required');
    process.exit(1);
  }
  if (!baseUrl) {
    console.error('Error: --base-url is required');
    process.exit(1);
  }
  if (isNaN(count) || count < 1) {
    console.error('Error: --count must be a positive number');
    process.exit(1);
  }

  return { group, count, baseUrl };
}

async function main() {
  const { group, count, baseUrl } = parseArgs(process.argv.slice(2));

  const outDir = join(process.cwd(), 'qr-codes', group);
  mkdirSync(outDir, { recursive: true });

  const csvRows: string[] = ['card_id,group,full_url,qr_filename'];

  console.log(`Generating ${count} QR codes for group "${group}"...`);

  for (let i = 0; i < count; i++) {
    const cid = nanoid(6);
    const url = `${baseUrl}/c/${group}?cid=${cid}`;
    const filename = `${group}-${cid}.png`;
    const filepath = join(outDir, filename);

    await QRCode.toFile(filepath, url, {
      width: 300,
      margin: 2,
      color: { dark: '#121212', light: '#FFFFFF' },
    });

    csvRows.push(`${cid},${group},${url},${filename}`);

    if ((i + 1) % 50 === 0) {
      console.log(`  ${i + 1}/${count} done`);
    }
  }

  const manifestPath = join(outDir, 'manifest.csv');
  writeFileSync(manifestPath, csvRows.join('\n') + '\n');

  console.log(`\nDone! Output: ${outDir}`);
  console.log(`  ${count} QR code PNGs`);
  console.log(`  manifest.csv with ${count} rows`);
}

main().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
