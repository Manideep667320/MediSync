const fs = require('fs');
const path = require('path');

const file = 'c:/Users/manid/Documents/Innovation/frontend/src/pages/Landing.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace background
content = content.replace(/bg-slate-950/g, 'bg-white');

// Replace text colors for light theme
content = content.replace(/text-white/g, 'text-slate-900');
content = content.replace(/text-brand-300/g, 'text-brand-700');
content = content.replace(/text-brand-200/g, 'text-brand-800');
content = content.replace(/text-brand-100/g, 'text-brand-900');
content = content.replace(/text-slate-300/g, 'text-slate-600');
content = content.replace(/text-slate-400/g, 'text-slate-600');

// Hover states
content = content.replace(/hover:text-white/g, 'hover:text-brand-900');

// Borders could be darkened slightly for contrast
content = content.replace(/border-white\/10/g, 'border-slate-900/10');
content = content.replace(/border-white\/20/g, 'border-slate-900/20');

// specifically for the stitch cards:
content = content.replace(/text-teal-400/g, 'text-teal-700');

// Glow text inversion (might need to go from white glow to dark glow)
content = content.replace(/drop-shadow-\[0_0_8px_rgba\(255,255,255,0\.8\)\]/g, 'drop-shadow-[0_0_8px_rgba(15,23,42,0.8)]');

fs.writeFileSync(file, content);
console.log('Successfully inverted theme classes in Landing.tsx');
