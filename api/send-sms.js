import twilio from 'twilio';

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Handle OPTIONS request for CORS
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { phoneNumber, message } = req.body;

    if (!phoneNumber || !message) {
        return res.status(400).json({ success: false, error: 'Phone number and message are required' });
    }

    try {
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

        if (!accountSid || !authToken || !twilioPhoneNumber) {
            console.error('Twilio environment variables missing');
            return res.status(500).json({ success: false, error: 'Server misconfiguration' });
        }

        const client = twilio(accountSid, authToken);

        // Format phone number
        let formattedPhoneNumber = phoneNumber.trim();
        if (!formattedPhoneNumber.startsWith('+')) {
            formattedPhoneNumber = `+1${formattedPhoneNumber.replace(/\D/g, '')}`;
        } else {
            formattedPhoneNumber = '+' + formattedPhoneNumber.replace(/[^\d]/g, '');
        }

        const fromNumber = twilioPhoneNumber.startsWith('whatsapp:') ? twilioPhoneNumber : `whatsapp:${twilioPhoneNumber}`;
        const toNumber = formattedPhoneNumber.startsWith('whatsapp:') ? formattedPhoneNumber : `whatsapp:${formattedPhoneNumber}`;

        const result = await client.messages.create({
            body: message,
            from: fromNumber,
            to: toNumber
        });

        return res.status(200).json({
            success: true,
            messageSid: result.sid,
            to: formattedPhoneNumber
        });

    } catch (error) {
        console.error('Error sending SMS:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Failed to send SMS'
        });
    }
}
