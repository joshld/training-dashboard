import path from 'node:path';

export function normalizeMarkdown(markdown) {
  return String(markdown).replace(/\r\n?/g, '\n');
}

export function parseFrontMatter(markdown, filePath, { allowedKeys } = {}) {
  const normalized = normalizeMarkdown(markdown);
  if (!normalized.startsWith('---\n')) throw new Error(`${filePath}: missing YAML-style front matter`);
  const end = normalized.indexOf('\n---\n', 4);
  if (end < 0) throw new Error(`${filePath}: unterminated front matter`);

  const data = {};
  const seen = new Set();
  for (const rawLine of normalized.slice(4, end).split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!match) throw new Error(`${filePath}: invalid front matter line: ${rawLine}`);
    const [, key, rawValue] = match;
    if (seen.has(key)) throw new Error(`${filePath}: duplicate front matter field '${key}'`);
    if (allowedKeys && !allowedKeys.has(key)) throw new Error(`${filePath}: unknown front matter field '${key}'`);
    seen.add(key);
    let value = rawValue.trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    else if (value === 'true' || value === 'false') value = value === 'true';
    else if (value !== '' && Number.isFinite(Number(value))) value = Number(value);
    data[key] = value;
  }
  return { data, body: normalized.slice(end + 5).trim() };
}

export function requireFields(data, fields, filePath) {
  for (const field of fields) {
    if (data[field] === undefined || data[field] === '') throw new Error(`${filePath}: required field '${field}' is missing`);
  }
}

export function validateId(value, label) {
  const id = String(value || '');
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) throw new Error(`${label}: invalid ID '${id}'`);
  return id;
}

export function validateDate(value, label, { dateOnly = false } = {}) {
  const date = String(value || '');
  if (dateOnly && !/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error(`${label}: invalid date '${date}'`);
  if (!Number.isFinite(Date.parse(date))) throw new Error(`${label}: invalid date '${date}'`);
  if (dateOnly && new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) !== date) throw new Error(`${label}: invalid date '${date}'`);
  return date;
}

export function validateNumber(value, label, { min = 0, integer = false } = {}) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < min || (integer && !Number.isInteger(number))) throw new Error(`${label}: invalid numeric value '${value}'`);
  return number;
}

export function extractSection(body, heading, filePath) {
  const lines = normalizeMarkdown(body).split('\n');
  const start = lines.findIndex(line => line.trim().toLowerCase() === `## ${heading}`.toLowerCase());
  if (start < 0) throw new Error(`${filePath}: missing required section '## ${heading}'`);
  const selected = [];
  for (let index = start + 1; index < lines.length; index += 1) {
    if (/^##\s+/.test(lines[index])) break;
    selected.push(lines[index]);
  }
  return selected.join('\n').trim();
}

export function parseTable(section, filePath, label, expectedHeaders) {
  const rows = normalizeMarkdown(section).split('\n').map(line => line.trim()).filter(line => line.startsWith('|'));
  if (rows.length < 3) throw new Error(`${filePath}: malformed ${label} table`);
  const headers = rows[0].split('|').slice(1, -1).map(item => item.trim().toLowerCase());
  const divider = rows[1].split('|').slice(1, -1);
  if (divider.length !== headers.length || divider.some(cell => !/^:?-{3,}:?$/.test(cell.trim()))) throw new Error(`${filePath}: malformed ${label} table divider`);
  if (expectedHeaders && JSON.stringify(headers) !== JSON.stringify(expectedHeaders)) throw new Error(`${filePath}: invalid ${label} table columns`);
  return rows.slice(2).map((line, index) => {
    const values = line.split('|').slice(1, -1).map(item => item.trim());
    if (values.length !== headers.length || values.some(value => value === '')) throw new Error(`${filePath}: malformed ${label} table row ${index + 1}`);
    return Object.fromEntries(headers.map((header, valueIndex) => [header, values[valueIndex]]));
  });
}

export function parseBulletItems(section, filePath, label) {
  const lines = section.split('\n').map(line => line.trim()).filter(Boolean);
  if (!lines.length) throw new Error(`${filePath}: malformed ${label} list`);
  if (lines.some(line => !/^[-*]\s+\S/.test(line))) throw new Error(`${filePath}: malformed ${label} list`);
  return lines.map(line => line.replace(/^[-*]\s+/, '').trim());
}

export function parseDelimitedList(value, label, delimiter, pattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/) {
  const items = String(value || '').split(delimiter).map(item => item.trim().replace(/^`|`$/g, ''));
  if (!items.length || items.some(item => !item || !pattern.test(item))) throw new Error(`${label}: malformed list`);
  if (new Set(items).size !== items.length) throw new Error(`${label}: duplicate list item`);
  return items;
}

export function parseMetadataEntries(markdown, filePath, { allowedKeys, requiredFields }) {
  const chunks = normalizeMarkdown(markdown).split(/^## /m).slice(1);
  const entries = [];
  for (const chunk of chunks) {
    const lines = chunk.split('\n');
    const name = lines.shift().trim().replace(/^`|`$/g, '');
    const fields = {};
    let current = null;
    let metadataLines = 0;
    for (const raw of lines) {
      const line = raw.trim();
      if (!line || line === '---') continue;
      const match = line.match(/^\*\*([^*]+):\*\*\s*(.*)$/);
      if (match) {
        const key = match[1].trim().toLowerCase().replace(/\s+/g, '_');
        if (!allowedKeys.has(key)) throw new Error(`${filePath}: unknown metadata field '${key}' in '${name}'`);
        if (Object.hasOwn(fields, key)) throw new Error(`${filePath}: duplicate metadata field '${key}' in '${name}'`);
        metadataLines += 1;
        current = key;
        fields[current] = match[2].trim().replace(/^`|`$/g, '');
      } else if (current) {
        fields[current] = `${fields[current]} ${line.replace(/^`|`$/g, '')}`.trim();
      }
    }
    // A heading with prose or bullet guidance but no metadata is a reference section.
    if (metadataLines === 0) continue;
    requireFields(fields, requiredFields, filePath);
    entries.push({ name, fields });
  }
  return entries;
}

export function resolveTimestamp(value) {
  if (value === undefined) return new Date().toISOString();
  const timestamp = String(value);
  if (!Number.isFinite(Date.parse(timestamp))) throw new Error(`invalid generation timestamp '${timestamp}'`);
  return timestamp;
}

export function relativeSource(root, filePath) {
  return path.relative(root, filePath).replaceAll('\\', '/');
}
