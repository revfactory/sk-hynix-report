// data-loader.js — 단일 진실 data.json 로더
// frontend-engineer와 공유: window.SKHData 또는 import { loadData } from './data-loader.js'

const DATA_URL = new URL('../_design/data.json', import.meta.url).href;

let _cachedData = null;
let _loadingPromise = null;

export async function loadData() {
  if (_cachedData) return _cachedData;
  if (_loadingPromise) return _loadingPromise;

  _loadingPromise = fetch(DATA_URL)
    .then((res) => {
      if (!res.ok) throw new Error(`data.json fetch failed: ${res.status}`);
      return res.json();
    })
    .then((data) => {
      _cachedData = data;
      window.SKHData = data;
      window.dispatchEvent(new CustomEvent('skh:data-ready', { detail: data }));
      return data;
    })
    .catch((err) => {
      console.error('[data-loader] load failed', err);
      throw err;
    });

  return _loadingPromise;
}

export function getData() {
  return _cachedData;
}
