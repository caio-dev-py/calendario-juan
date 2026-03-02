/**
 * Helper para fazer requests REST ao Supabase sem usar o JS client.
 * O JS client pode travar por causa de RLS recursivo.
 * Aqui usamos fetch + AbortController para garantir timeout.
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Chave do localStorage onde o Supabase armazena a sessão
const STORAGE_KEY = `sb-${new URL(SUPABASE_URL).hostname.split('.')[0]}-auth-token`;

/**
 * Lê o token JWT da sessão diretamente do localStorage.
 * NÃO usa o Supabase JS client (que pode travar).
 */
export function getToken() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const session = JSON.parse(raw);
        return session?.access_token || null;
    } catch {
        return null;
    }
}

/**
 * Faz uma request REST ao Supabase com timeout garantido.
 * @param {string} path - Caminho da tabela + query params (ex: 'horarios_marcados?select=*')
 * @param {object} options
 * @param {string} options.method - GET, POST, PATCH, DELETE
 * @param {object} options.body - Body para POST/PATCH
 * @param {number} options.timeoutMs - Timeout em ms (default: 5000)
 * @returns {Promise<{data: any, error: any}>}
 */
export async function supabaseRest(path, { method = 'GET', body, timeoutMs = 5000 } = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const token = getToken();

        const headers = {
            'apikey': SUPABASE_KEY,
            'Content-Type': 'application/json',
            'Prefer': method === 'POST' ? 'return=representation' : 'return=representation',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
            signal: controller.signal,
        });

        clearTimeout(timer);

        const text = await res.text();
        let data;
        try { data = JSON.parse(text); } catch { data = null; }

        if (!res.ok) {
            const errMsg = data?.message || data?.error || data?.hint || `Erro HTTP ${res.status}`;
            return { data: null, error: { message: errMsg, status: res.status } };
        }

        return { data, error: null };
    } catch (err) {
        clearTimeout(timer);
        if (err.name === 'AbortError') {
            return { data: null, error: { message: 'Timeout: o Supabase não respondeu. Verifique as políticas RLS.' } };
        }
        return { data: null, error: { message: err.message } };
    }
}

export { SUPABASE_URL, SUPABASE_KEY };
