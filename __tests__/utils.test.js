// Unit tests for core pure functions

// ── cosineSimilarity ──────────────────────────────────────────────────────────

function cosineSimilarity(a, b) {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dot / (magA * magB);
}

describe('cosineSimilarity', () => {
  test('identical vectors return 1', () => {
    const v = [1, 2, 3];
    expect(cosineSimilarity(v, v)).toBeCloseTo(1);
  });

  test('opposite vectors return -1', () => {
    expect(cosineSimilarity([1, 0], [-1, 0])).toBeCloseTo(-1);
  });

  test('orthogonal vectors return 0', () => {
    expect(cosineSimilarity([1, 0], [0, 1])).toBeCloseTo(0);
  });

  test('is symmetric', () => {
    const a = [1, 2, 3];
    const b = [4, 5, 6];
    expect(cosineSimilarity(a, b)).toBeCloseTo(cosineSimilarity(b, a));
  });

  test('result is always between -1 and 1', () => {
    const a = [0.1, -0.5, 0.8];
    const b = [-0.3, 0.7, 0.2];
    const score = cosineSimilarity(a, b);
    expect(score).toBeGreaterThanOrEqual(-1);
    expect(score).toBeLessThanOrEqual(1);
  });
});

// ── chunkText ─────────────────────────────────────────────────────────────────

function chunkText(text, chunkSize = 200, overlap = 40) {
  const sentences = text.split(/[.!?]+/).map((s) => s.trim()).filter(Boolean);
  const chunks = [];
  let current = '';
  for (const sentence of sentences) {
    if ((current + sentence).length > chunkSize && current) {
      chunks.push(current.trim());
      current = current.slice(-overlap) + ' ' + sentence;
    } else {
      current += (current ? ' ' : '') + sentence;
    }
  }
  if (current) chunks.push(current.trim());
  return chunks;
}

describe('chunkText', () => {
  test('returns at least one chunk for non-empty text', () => {
    const chunks = chunkText('Hello world. This is a test.');
    expect(chunks.length).toBeGreaterThan(0);
  });

  test('no chunk exceeds chunkSize by more than one sentence', () => {
    const text = 'Short sentence. '.repeat(20);
    const chunks = chunkText(text, 100);
    chunks.forEach((chunk) => {
      expect(chunk.length).toBeLessThan(200);
    });
  });

  test('empty string returns no chunks', () => {
    expect(chunkText('')).toEqual([]);
  });

  test('single sentence returns one chunk', () => {
    expect(chunkText('Just one sentence')).toHaveLength(1);
  });
});

// ── API validation logic ───────────────────────────────────────────────────────

describe('API input validation', () => {
  const MAX_MESSAGES = 20;
  const MAX_MESSAGE_LENGTH = 4000;

  function validateMessages(messages) {
    if (!Array.isArray(messages) || messages.length === 0) return 'messages must be a non-empty array';
    if (messages.length > MAX_MESSAGES) return `Too many messages (max ${MAX_MESSAGES})`;
    for (const msg of messages) {
      if (!msg.role || !msg.content || typeof msg.content !== 'string') return 'Each message must have role and content';
      if (msg.content.length > MAX_MESSAGE_LENGTH) return `Message too long (max ${MAX_MESSAGE_LENGTH} chars)`;
    }
    return null;
  }

  test('valid messages pass validation', () => {
    expect(validateMessages([{ role: 'user', content: 'Hello' }])).toBeNull();
  });

  test('empty array fails validation', () => {
    expect(validateMessages([])).toBeTruthy();
  });

  test('non-array fails validation', () => {
    expect(validateMessages('not an array')).toBeTruthy();
  });

  test('too many messages fails validation', () => {
    const msgs = Array(21).fill({ role: 'user', content: 'hi' });
    expect(validateMessages(msgs)).toBeTruthy();
  });

  test('message exceeding length limit fails', () => {
    const msgs = [{ role: 'user', content: 'a'.repeat(4001) }];
    expect(validateMessages(msgs)).toBeTruthy();
  });

  test('message missing content fails', () => {
    expect(validateMessages([{ role: 'user' }])).toBeTruthy();
  });
});
