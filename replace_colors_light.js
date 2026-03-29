const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'frontend/src/pages');
const compPath = path.join(__dirname, 'frontend/src/components');

const replacements = {
    // --- Structural Backgrounds ---
    'bg-brand-900': 'bg-slate-50', // Page roots
    'bg-brand-800': 'bg-white', // Cards and elevated surfaces

    // --- Glass Details ---
    'bg-white/5': 'bg-brand-900/5',
    'hover:bg-white/5': 'hover:bg-brand-900/5',
    'hover:bg-white/10': 'hover:bg-brand-900/10',

    // --- Borders ---
    'border-white/10': 'border-brand-900/10',
    'border-white/20': 'border-brand-900/20',

    // --- Primary Text Visibility ---
    'text-white': 'text-brand-900', // Making white text dark navy for the white BG
    'hover:text-white': 'hover:text-brand-900',

    // --- Secondary Text Visibility ---
    // In our previous dark theme, text-brand-300 and text-brand-100 were light equivalents of "gray-400"
    // Now we need them to be dark text since the background is white.
    'text-brand-100': 'text-brand-800',
    'text-brand-300': 'text-brand-700',
    'hover:text-brand-300': 'hover:text-brand-700',

    // Fix up specific table header and input cases that might rely on text-slate-400 instead of brand
    'text-slate-400': 'text-brand-700',
    'border-slate-700': 'border-brand-700/20',
    'bg-slate-900': 'bg-white',

    'bg-slate-800/50': 'bg-white/50',
};

function processDirectory(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.tsx')) {
            // Don't modify the Landing page which has a distinct theme
            if (file === 'Landing.tsx' || file === 'LandingPage.tsx') continue;

            let content = fs.readFileSync(fullPath, 'utf8');
            let changed = false;

            // Hardware hex replacements
            if (content.includes('bg-[#0B151E]')) {
                content = content.replace(/bg-\[#0B151E\]/g, 'bg-slate-50');
                changed = true;
            }
            if (content.includes('bg-[#0f172a]')) {
                content = content.replace(/bg-\[#0f172a\]/g, 'bg-slate-50');
                changed = true;
            }

            // Proceed with the regex boundary replacements
            for (const [oldClass, newClass] of Object.entries(replacements)) {
                // Safe regex replace matching exact word/class boundaries
                // Added support for forward slash in tailwind opacity classes
                const regex = new RegExp(`(?<![a-zA-Z0-9-])` + oldClass.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&') + `(?![a-zA-Z0-9-])`, 'g');
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

console.log('Starting light theme color replacement...');
processDirectory(directoryPath);
processDirectory(compPath);
console.log('Done.');
