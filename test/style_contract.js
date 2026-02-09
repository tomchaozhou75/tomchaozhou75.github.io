const fs = require('node:fs');
const path = require('node:path');
const childProcess = require('node:child_process');
const os = require('node:os');

const root = process.cwd();

let coreRootCache = null;
const coreRoot = () => {
  if (coreRootCache !== null) {
    return coreRootCache;
  }

  const bundleCommands = ['bundle show al_folio_core', '~/.rbenv/shims/bundle show al_folio_core'];
  for (const command of bundleCommands) {
    try {
      coreRootCache = childProcess.execSync(command, { cwd: root, stdio: ['ignore', 'pipe', 'ignore'], shell: '/bin/bash' }).toString().trim();
      if (coreRootCache && fs.existsSync(coreRootCache)) {
        return coreRootCache;
      }
    } catch (_error) {
      // Keep trying fallback commands.
    }
  }

  const fallbackGlob = path.join(os.homedir(), '.rbenv/versions/*/lib/ruby/gems/*/bundler/gems/al-folio-core-*');
  try {
    const fallback = childProcess.execSync(`ls -d ${fallbackGlob} 2>/dev/null | head -n 1`, { cwd: root, stdio: ['ignore', 'pipe', 'ignore'], shell: '/bin/bash' }).toString().trim();
    coreRootCache = fallback;
  } catch (_error) {
    coreRootCache = '';
  }

  return coreRootCache;
};

const resolveThemeFile = (rel) => {
  const localPath = path.join(root, rel);
  if (fs.existsSync(localPath)) {
    return localPath;
  }

  const gemRoot = coreRoot();
  if (gemRoot) {
    const gemPath = path.join(gemRoot, rel);
    if (fs.existsSync(gemPath)) {
      return gemPath;
    }
  }

  throw new Error(`Unable to resolve theme file: ${rel}`);
};

const read = (rel) => fs.readFileSync(resolveThemeFile(rel), 'utf8');

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
