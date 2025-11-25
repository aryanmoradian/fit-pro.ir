
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../src/lib/supabaseAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, requestData, requestId, userId, status, months } = req.body;

  try {
    // 1. Submit New Payment Request (User Action)
    if (action === 'SUBMIT' && requestData) {
        // Auto-verification logic check (e.g. verify TxID length or format)
        const isVerified = requestData.txId && requestData.txId.length > 10; 
        const finalStatus = isVerified ? 'Approved' : 'Pending';

        // Insert into 'transactions' table using Admin client
        const { error } = await supabaseAdmin
            .from('transactions')
            .insert({
                user_id: requestData.userId,
                tx_id: requestData.txId,
                amount: requestData.amountUSD,
                status: finalStatus,
                months: requestData.months || 1
            });

        if (error) throw error;

        // If auto-verified, update the user's profile immediately
        if (isVerified) {
             const expiryDate = new Date();
             expiryDate.setDate(expiryDate.getDate() + ((requestData.months || 1) * 30));
             const expiryString = expiryDate.toLocaleDateString('fa-IR');

             await supabaseAdmin.from('profiles').update({
                subscription_tier: 'Premium',
                subscription_status: 'Active',
                subscription_expiry_date: expiryString
            }).eq('id', requestData.userId);

            return res.status(200).json({ status: 'AUTO_APPROVED' });
        }

        return res.status(200).json({ status: 'PENDING_REVIEW' });
    }

    // 2. Admin Manually Processes Request (Admin Action)
    if (action === 'PROCESS' && requestId && userId && status) {
        // Update 'transactions' status
        const { error: paymentError } = await supabaseAdmin
            .from('transactions')
            .update({ status: status })
            .eq('id', requestId);
            
        if (paymentError) throw paymentError;

        // If approved, update profile subscription
        if (status === 'Approved') {
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + ((months || 1) * 30));
            const expiryString = expiryDate.toLocaleDateString('fa-IR');
            
            const { error: profileError } = await supabaseAdmin.from('profiles').update({
                subscription_tier: 'Premium',
                subscription_status: 'Active',
                subscription_expiry_date: expiryString
            }).eq('id', userId);

            if (profileError) throw profileError;
        }

        return res.status(200).json({ success: true });
    }

    return res.status(400).json({ error: 'Invalid action or missing data' });

  } catch (error: any) {
    console.error("Payment API Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
