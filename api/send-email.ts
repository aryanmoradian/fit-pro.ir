
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type, payload } = req.body;

  try {
    console.log(`[API] Mock Sending Email - Type: ${type}, Recipient: ${payload?.name || 'User'}`);
    
    // In production, integrate with Nodemailer, Resend, or SendGrid here.

    return res.status(200).json({ 
        message: 'Email processed successfully', 
        status: 'Sent' 
    });
  } catch (error: any) {
    console.error("Email Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
