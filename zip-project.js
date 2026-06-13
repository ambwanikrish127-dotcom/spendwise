import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const filesToInclude = [
  'src',
  'index.html',
  'package.json',
  'vite.config.js',
  'README.md'
];

const tempDir = './temp_zip_dist';
const outputZip = './spendwise-react.zip';

async function main() {
  try {
    console.log('Starting SpendWise React project archiving...');

    // Clean up old zip and temp dir
    if (fs.existsSync(outputZip)) {
      fs.unlinkSync(outputZip);
      console.log('Removed existing ZIP file.');
    }
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }

    // Create temp directory
    fs.mkdirSync(tempDir);
    console.log('Created temporary packing directory.');

    // Copy each file/folder
    for (const file of filesToInclude) {
      if (fs.existsSync(file)) {
        const targetPath = path.join(tempDir, file);
        fs.cpSync(file, targetPath, { recursive: true });
        console.log(`Copied: ${file}`);
      } else {
        console.log(`Warning: File or folder "${file}" not found, skipping.`);
      }
    }

    // Execute PowerShell command to archive the folder content
    const absoluteTempDir = path.resolve(tempDir);
    const absoluteZipPath = path.resolve(outputZip);
    
    console.log('Archiving via PowerShell Compress-Archive...');
    // We target absoluteTempDir/* to zip the contents of the folder rather than the folder itself.
    // In PowerShell, we can run: Compress-Archive -Path "C:\path\to\temp\*" -DestinationPath "C:\path\to\zip"
    const psCommand = `powershell -Command "Compress-Archive -Path '${absoluteTempDir}\\*' -DestinationPath '${absoluteZipPath}' -Force"`;
    
    execSync(psCommand, { stdio: 'inherit' });
    console.log(`SUCCESS: Created ${outputZip} successfully.`);

  } catch (error) {
    console.error('An error occurred during zipping:', error);
  } finally {
    // Cleanup
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
      console.log('Cleaned up temporary packing directory.');
    }
  }
}

main();
