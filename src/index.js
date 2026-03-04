export default {
    async fetch(request, env) {
        // 1. التحقق من كلمة السر (منطق الوسيط)
        if (request.headers.get('X-Secret-Key') !== env.SECRET_KEY) {
            return new Response('Unauthorized', { status: 401 });
        }
        // 2. التأكد أن الطلب هو POST (منطق الوسيط)
        if (request.method !== 'POST') {
            return new Response('Method Not Allowed', { status: 405 });
        }
        // 3. التحقق من وجود ربط AI
        if (!env.AI) {
            return new Response('AI binding is not configured.', { status: 500 });
        }

        try {
            const body = await request.json();
            // 4. استدعاء نموذج اللغة مباشرة (منطق العقل)
            const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', body);
            return new Response(JSON.stringify(response), {
                headers: { 'Content-Type': 'application/json' },
            });
        } catch (e) {
            return new Response(`Error during AI run: ${e.message}`, { status: 500 });
        }
    },
};
