// URL param ?key=sk-... takes priority, then falls back to .env
export function getApiKey() {
  const params = new URLSearchParams(window.location.search);
  return params.get('key') || process.env.REACT_APP_OPENAI_KEY || '';
}
