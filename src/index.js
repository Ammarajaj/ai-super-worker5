// هذا هو الكود النهائي لملف src/index.js في مشروع ai-super-worker5
// يدعم توليد النصوص والصور في نفس الوقت

export default {
    async fetch(request, env) {
        // --- [القسم الأمني والتحقق] ---
        if (request.headers.get('X-Secret-Key') !== env.SECRET_KEY) {
            return new Response('Unauthorized', { status: 403 });
        }
        if (request.method !== 'POST') {
            return new Response('Method Not Allowed', { status: 405 });
        }
        if (!env.AI) {
            return new Response('AI binding is not configured.', { status: 500 });
        }

        try {
            const body = await request.json();

            // --- [الموجه الذكي] ---
            // يقرر أي مهمة يجب تنفيذها بناءً على محتوى الطلب

            // الحالة 1: إذا كان الطلب يحتوي على "messages"، فهو طلب محادثة نصية
            if (body.messages) {
                const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', body);
                
                // إرجاع استجابة نصية بتنسيق JSON
                return new Response(JSON.stringify(response), {
                    headers: { 'Content-Type': 'application/json' },
                });
            }
            
            // الحالة 2: إذا كان الطلب يحتوي على "prompt"، فهو طلب توليد صورة
            else if (body.prompt) {
                const inputs = {
                    prompt: body.prompt
                };
                
                const imageResponse = await env.AI.run(
                    '@cf/stabilityai/stable-diffusion-xl-base-1.0', 
                    inputs
                );

                // إرجاع بيانات الصورة الخام مباشرة
                return new Response(imageResponse, {
                    headers: {
                        'Content-Type': 'image/png'
                    },
                });
            }
            
            // الحالة 3: إذا كان الطلب لا يحتوي على أي منهما
            else {
                return new Response('Invalid request body. Expected "messages" for text or "prompt" for image.', { status: 400 });
            }

        } catch (e) {
            console.error(`AI Gateway Error: ${e.message}`);
            return new Response(`Error during AI run: ${e.message}`, { status: 500 });
        }
    },
};
