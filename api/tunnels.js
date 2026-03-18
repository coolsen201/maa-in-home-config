// Vercel Serverless Function: /api/tunnels.js
// This function securely fetches the list of Cloudflare Tunnels using the API Token.

export default async function handler(req, res) {
    const { CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID } = process.env;

    if (!CLOUDFLARE_API_TOKEN || !CLOUDFLARE_ACCOUNT_ID) {
        return res.status(500).json({ error: 'Missing Cloudflare Credentials in Vercel Environment.' });
    }

    try {
        const response = await fetch(
            `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/cfd_tunnel?is_deleted=false`,
            {
                headers: {
                    'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.errors[0]?.message || 'Cloudflare API Error');
        }

        // Map Cloudflare data to our Dashboard format
        const kiosks = data.result.map(tunnel => ({
            id: tunnel.name,
            location: 'Remote Station', // We can enhance this later with metadata
            status: tunnel.status === 'inactive' ? 'offline' : 'online',
            uptime: tunnel.status === 'inactive' ? '-' : 'Active',
            heartbeat: tunnel.last_seen || 'Recently',
            tunnelId: tunnel.id
        }));

        res.status(200).json(kiosks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}
