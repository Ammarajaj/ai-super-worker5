export default {
    async fetch(request, env) {
        // 1. التحقق من كلمة السر
        if (request.headers.get('X-Secret-Key') !== env.SECRET_KEY) {
            return new Response('Unauthorized', { status: 401 });
        }
        // 2. التأكد أن الطلب هو POST
        if (request.method !== 'POST') {
            return new Response('Method Not Allowed', { status: 405 });
        }
        // 3. استدعاء الـ Worker الآخر عبر Service Binding
        try {
            const response = await env.AI_WORKER.fetch(request);
            const responseData = await response.json();
            return new Response(JSON.stringify(responseData), {
                headers: { 'Content-Type': 'application/json' },
            });
        } catch (e) {
            return new Response(e.message, { status: 500 });
        }
    },
};
