import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';

async function packageTeamsApp() {
  console.log('[Teams Packaging] Creating Microsoft Teams App ZIP bundle...');
  const zip = new JSZip();

  const manifestPath = path.join(process.cwd(), 'teams-app', 'manifest.json');
  const colorIconPath = path.join(process.cwd(), 'teams-app', 'icons', 'color.png');
  const outlineIconPath = path.join(process.cwd(), 'teams-app', 'icons', 'outline.png');

  if (!fs.existsSync(manifestPath)) {
    throw new Error('teams-app/manifest.json not found!');
  }

  zip.file('manifest.json', fs.readFileSync(manifestPath));
  if (fs.existsSync(colorIconPath)) {
    zip.file('color.png', fs.readFileSync(colorIconPath));
  }
  if (fs.existsSync(outlineIconPath)) {
    zip.file('outline.png', fs.readFileSync(outlineIconPath));
  }

  const content = await zip.generateAsync({ type: 'nodebuffer' });

  // Output 1: Root directory
  const rootZipPath = path.join(process.cwd(), 'thinkit-teams-app.zip');
  fs.writeFileSync(rootZipPath, content);
  console.log(`[Teams Packaging] Saved ZIP bundle to: ${rootZipPath}`);

  // Output 2: Public directory (for web downloads from Vercel)
  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  const publicZipPath = path.join(publicDir, 'thinkit-teams-app.zip');
  fs.writeFileSync(publicZipPath, content);
  console.log(`[Teams Packaging] Saved ZIP bundle to: ${publicZipPath}`);
}

packageTeamsApp().catch(err => {
  console.error('[Teams Packaging Error]', err);
  process.exit(1);
});
