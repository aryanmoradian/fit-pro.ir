
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../../src/lib/supabaseAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { targetUserId, newRole } = req.body;

  if (!targetUserId || !['Coach', 'Trainee', 'Admin'].includes(newRole)) {
      return res.status(400).json({ error: 'Invalid data. Roles must be Coach, Trainee, or Admin.' });
  }

  try {
    // Update the user's role in the profiles table using Service Role (bypasses RLS)
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ role: newRole })
      .eq('id', targetUserId);

    if (error) throw error;

    return res.status(200).json({ success: true, message: `User role updated to ${newRole}` });

  } catch (error: any) {
    console.error("Set Role Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
