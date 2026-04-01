import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { transformSync } from 'esbuild';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = path.join(projectRoot, 'standalone', 'lendora-app.jsx');
const outputPath = path.join(projectRoot, 'standalone', 'lendora-app.js');
const templatePath = path.join(projectRoot, 'standalone', 'standalone-template.html');
const standaloneHtmlPath = path.join(projectRoot, 'Lendora-standalone.html');
const tailwindBin = path.join(projectRoot, 'node_modules', '.bin', 'tailwindcss');
const indexCssPath = path.join(projectRoot, 'src', 'index.css');

const rawSource = fs.readFileSync(sourcePath, 'utf8');
const phosphorModuleAliases = {
  'ph-arrow-u-right-from-bracket': 'SignOut'
};

const toPhosphorModuleName = (iconClass) => (
  phosphorModuleAliases[iconClass] || iconClass
    .replace(/^ph-/, '')
    .split('-')
    .map((segment) => (segment.length === 1 ? segment.toUpperCase() : `${segment[0].toUpperCase()}${segment.slice(1)}`))
    .join('')
);

const renderIconMarkup = (element) => {
  if (!element) return '';

  return renderToStaticMarkup(
    React.createElement(
      'svg',
      { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 256 256' },
      element
    )
  )
    .replace(/^<svg[^>]*>/, '')
    .replace(/<\/svg>$/, '');
};

const loadPhosphorIconMarkup = async (iconClass) => {
  const moduleName = toPhosphorModuleName(iconClass);
  const iconModulePath = pathToFileURL(
    path.join(projectRoot, 'node_modules', '@phosphor-icons', 'react', 'dist', 'defs', `${moduleName}.es.js`)
  ).href;

  try {
    const { default: weights } = await import(iconModulePath);

    return {
      regular: renderIconMarkup(weights.get('regular') || weights.get('fill') || weights.get('bold')),
      fill: renderIconMarkup(weights.get('fill') || weights.get('regular') || weights.get('bold')),
      bold: renderIconMarkup(weights.get('bold') || weights.get('regular') || weights.get('fill'))
    };
  } catch (error) {
    throw new Error(`Unable to load icon "${iconClass}" from ${moduleName}.es.js: ${error.message}`);
  }
};

const ignoredPhosphorTokens = new Set(['ph-fill', 'ph-bold', 'ph-icon', 'ph-icon-svg', 'ph-weight']);
const usedIcons = [...new Set((rawSource.match(/\bph-[a-z0-9-]+\b/g) || []).filter((icon) => !ignoredPhosphorTokens.has(icon)))].sort();
const phosphorIconMarkup = Object.fromEntries(
  await Promise.all(usedIcons.map(async (iconClass) => [iconClass, await loadPhosphorIconMarkup(iconClass)]))
);

const source = `const PHOSPHOR_ICON_MARKUP = ${JSON.stringify(phosphorIconMarkup)};\n\n${rawSource}`;
const compiled = transformSync(source, {
  loader: 'jsx',
  format: 'iife',
  jsx: 'transform',
  jsxFactory: 'React.createElement',
  jsxFragment: 'React.Fragment',
  target: 'es2018',
  legalComments: 'none'
}).code;

const bootGuard = `if (!window.React || !window.ReactDOM) {
  const message = 'Lendora could not load its local app runtime. Open Lendora.html from the project folder and keep the vendor files beside it.';
  if (typeof window.renderLendoraStartupError === 'function') {
    window.renderLendoraStartupError(message);
  } else {
    const root = document.getElementById('root');
    if (root) {
      root.innerHTML = '<div style="padding:24px;font-family:Manrope,sans-serif;color:#0f172a;">' + message + '</div>';
    }
  }
} else {
${compiled}
}
`;

fs.writeFileSync(outputPath, bootGuard);

const tailwindResult = spawnSync(
  tailwindBin,
  [
    '-i',
    './styles/lendora-tailwind-input.css',
    '-o',
    './styles/lendora-tailwind.css',
    '--config',
    './tailwind.config.js',
    '--content',
    './Lendora.html',
    '--content',
    './standalone/lendora-app.jsx'
  ],
  {
    cwd: projectRoot,
    stdio: 'inherit'
  }
);

if (tailwindResult.status !== 0) {
  process.exit(tailwindResult.status ?? 1);
}

const escapeInlineScript = (content) => content.replace(/<\/script/gi, '<\\/script');
const replaceToken = (content, token, value) => content.replace(token, () => value);
const customStyles = fs.readFileSync(indexCssPath, 'utf8')
  .replace(/^@tailwind\s+(base|components|utilities);\s*$/gm, '')
  .trim();

const template = fs.readFileSync(templatePath, 'utf8');
const inlinedStyles = [
  fs.readFileSync(path.join(projectRoot, 'styles', 'lendora-tailwind.css'), 'utf8'),
  customStyles,
  fs.readFileSync(path.join(projectRoot, 'vendor', 'leaflet', 'leaflet.css'), 'utf8')
].filter(Boolean).join('\n\n');

let standaloneHtml = template;
standaloneHtml = replaceToken(standaloneHtml, '__INLINED_STYLES__', inlinedStyles);
standaloneHtml = replaceToken(standaloneHtml, '__INLINED_REACT__', escapeInlineScript(fs.readFileSync(path.join(projectRoot, 'vendor', 'react', 'react.production.min.js'), 'utf8')));
standaloneHtml = replaceToken(standaloneHtml, '__INLINED_REACT_DOM__', escapeInlineScript(fs.readFileSync(path.join(projectRoot, 'vendor', 'react-dom', 'react-dom.production.min.js'), 'utf8')));
standaloneHtml = replaceToken(standaloneHtml, '__INLINED_FRAMER_MOTION__', escapeInlineScript(fs.readFileSync(path.join(projectRoot, 'vendor', 'framer-motion', 'framer-motion.js'), 'utf8')));
standaloneHtml = replaceToken(standaloneHtml, '__INLINED_LEAFLET__', escapeInlineScript(fs.readFileSync(path.join(projectRoot, 'vendor', 'leaflet', 'leaflet.js'), 'utf8')));
standaloneHtml = replaceToken(standaloneHtml, '__INLINED_APP_SCRIPT__', escapeInlineScript(fs.readFileSync(outputPath, 'utf8')));

fs.writeFileSync(standaloneHtmlPath, standaloneHtml);
