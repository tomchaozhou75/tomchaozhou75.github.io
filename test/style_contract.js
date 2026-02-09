const fs = require('node:fs');
const path = require('node:path');

const root = process.cwd();

const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

const failures = [];

const utilitiesScss = read('_sass/_utilities.scss');
if (/transition\s*:\s*all\s+/i.test(utilitiesScss)) {
  failures.push('`_sass/_utilities.scss` must not use broad `transition: all` rules.');
}

const distillTransforms = read('assets/js/distillpub/transforms.v2.js');
if (/https:\/\/distill\.pub\/template\.v2\.js/.test(distillTransforms)) {
  failures.push('`assets/js/distillpub/transforms.v2.js` must not load remote distill runtime.');
}

const tailwindAppCss = read('assets/tailwind/app.css');
if (!/@config\s+"\.\.\/\.\.\/tailwind\.config\.js";/.test(tailwindAppCss)) {
  failures.push('`assets/tailwind/app.css` must declare the Tailwind config via `@config`.');
}
if (!/@import\s+"tailwindcss\/theme\.css"\s+layer\(theme\);/.test(tailwindAppCss)) {
  failures.push('`assets/tailwind/app.css` must import Tailwind theme layer.');
}
if (!/@import\s+"tailwindcss\/utilities\.css"\s+layer\(utilities\);/.test(tailwindAppCss)) {
  failures.push('`assets/tailwind/app.css` must import Tailwind utilities layer.');
}
if (/@tailwind\s+base;|@tailwind\s+components;|@tailwind\s+utilities;/.test(tailwindAppCss)) {
  failures.push('`assets/tailwind/app.css` should not use legacy Tailwind v3 @tailwind directives.');
}

if (failures.length > 0) {
  console.error('Style contract check failed:');
  failures.forEach((message) => console.error(`- ${message}`));
  process.exit(1);
}

console.log('Style contract check passed.');
