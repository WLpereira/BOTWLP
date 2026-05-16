const META_TOKEN = process.env.META_WHATSAPP_TOKEN;
const META_API_VERSION = process.env.META_WHATSAPP_API_VERSION || "v20.0";

function ensureToken() {
    if (!META_TOKEN) {
        throw new Error("META_WHATSAPP_TOKEN não configurado.");
    }

    return META_TOKEN;
}

export function getVerifyToken() {
    return process.env.META_WEBHOOK_VERIFY_TOKEN || "";
}

export function isMetaConfigured() {
    return Boolean(META_TOKEN);
}

export async function sendText(phoneNumberId: string, to: string, body: string) {
    const token = ensureToken();
    const url = `https://graph.facebook.com/${META_API_VERSION}/${phoneNumberId}/messages`;

    const response = await fetch(url, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            messaging_product: "whatsapp",
            to,
            type: "text",
            text: { body },
        }),
    });

    if (!response.ok) {
        const details = await response.text();
        throw new Error(details || "Falha ao enviar mensagem via Meta Cloud API.");
    }
}