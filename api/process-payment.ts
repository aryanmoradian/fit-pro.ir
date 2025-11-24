
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://quniobapknhnqtcerdvf.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1bmlvYmFwa25obnF0Y2VyZHZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3MzU2MjEsImV4cCI6MjA3OTMxMTYyMX0.oyb0AuLBeYSwjailvnzE2-79nMw1-Mcy5soRqkTNm7U";

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, requestData, requestId, userId, status, months } = req.body;

  try {
    // 1. Submit New Payment Request
    if (action === 'SUBMIT' && requestData) {
        // Auto-verification logic check (Mock: if TxID is long enough)
        const isVerified = requestData.txId.length > 8; 
        const finalStatus = isVerified ? 'Approved' : 'Pending';

        // Insert into 'transactions' table
        const { error } = await supabase
            .from('transactions')
            .insert({
                user_id: requestData.userId,
                tx_id: requestData.txId,
                amount: requestData.amountUSD,
                status: finalStatus
            });

        if (error) throw error;

        // If auto-verified, update the user's profile immediately
        if (isVerified) {
             const expiryDate = new Date();
             expiryDate.setDate(expiryDate.getDate() + (requestData.months * 30));
             
             await supabase.from('profiles').update({
                subscription_tier: 'Premium',
                subscription_status: 'Active',
                subscription_expiry_date: expiryDate.toLocaleDateString('fa-IR')
            }).eq('id', requestData.userId);

            return res.status(200).json({ status: 'AUTO_APPROVED' });
        }

        return res.status(200).json({ status: 'PENDING_REVIEW' });
    }

    // 2. Admin Manually Processes Request
    if (action === 'PROCESS' && requestId && userId && status) {
        // Update 'transactions' status
        const { error: paymentError } = await supabase
            .from('transactions')
            .update({ status: status })
            .eq('id', requestId);
            
        if (paymentError) throw paymentError;

        // If approved, update profile subscription
        if (status === 'Approved') {
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + (months * 30));
            
            await supabase.from('profiles').update({
                subscription_tier: 'Premium',
                subscription_status: 'Active',
                subscription_expiry_date: expiryDate.toLocaleDateString('fa-IR')
            }).eq('id', userId);
        }
        return res.status(200).json({ success: true });
    }

    return res.status(400).json({ error: 'Invalid action or missing data' });

  } catch (error: any) {
    console.error("Payment API Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
