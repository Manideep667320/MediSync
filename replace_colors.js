const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'frontend/src/pages');
const compPath = path.join(__dirname, 'frontend/src/components');

// Using word boundary matching to replace the color stem universally
const stemReplacements = {
    // Slate to Brand mapping
    'slate-950': 'brand-900',
    'slate-900': 'brand-900',
    'slate-800': 'brand-800',
    'slate-700': 'brand-700',
    'slate-600': 'brand-700',
    'slate-500': 'brand-500',
    'slate-400': 'brand-300',
    'slate-300': 'brand-100',
    'slate-200': 'brand-100',

    // Blue/Cyan to Brand mapping (maintains CTA highlights)
    'blue-600': 'brand-700',
    'blue-500': 'brand-500',
    'blue-400': 'brand-300',
    'cyan-600': 'brand-700',
    'cyan-500': 'brand-300',
    'cyan-400': 'brand-100',

    'shadow-glow-blue': 'shadow-glow-cyan-stitch',
};

function processDirectory(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.tsx')) {
            // Exclude files that already use the brand theme properly
            if (file === 'Landing.tsx' || file === 'LandingPage.tsx') continue;

            let content = fs.readFileSync(fullPath, 'utf8');
            let changed = false;

            // Hardware hex replacements
            if (content.includes('bg-[#0f172a]')) {
                content = content.replace(/bg-\[#0f172a\]/g, 'bg-brand-900');
                changed = true;
            }

            // Stem replacements
            for (const [oldClass, newClass] of Object.entries(stemReplacements)) {
                // \b matches word boundaries, so it matches `-` perfectly for tailwind
                const regex = new RegExp(`\\b${oldClass}\\b`, 'g');
                const count = (content.match(regex) || []).length;
                if (count > 0) {
                    content = content.replace(regex, newClass);
                    changed = true;
                    console.log(`Replaced ${oldClass} with ${newClass} ${count} times in ${file}`);
                }
            }

            if (changed) {
                fs.writeFileSync(fullPath, content, 'utf8');
            }
        }
    }
}

console.log('Starting universal color replacement...');
processDirectory(directoryPath);
processDirectory(compPath);
console.log('Done.');
