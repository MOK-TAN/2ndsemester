
// import { supabase } from '../supabase/supabaseClient';

// import { createClient } from '@supabase/supabase-js';
// REMOVE this line if present:
// import { supabase } from '../supabase/supabaseClient';

// KEEP and use ONLY this:
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);



export default async function handler(req, res) {
  if (req.method === 'GET') {
    // List all users
    const { data, error } = await supabase.auth.admin.listUsers();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data.users);
  }

  if (req.method === 'POST') {
    // Create user in Auth and users table
    const { email, password, full_name, phone_number, role, avatar_url, is_verified } = req.body;
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { full_name, phone_number, role, avatar_url, is_verified },
    });
    if (error) return res.status(500).json({ error: error.message });
    const { user } = data;
    const { error: dbError } = await supabase.from('users').insert([{
      id: user.id,
      email,
      full_name,
      phone_number,
      role,
      avatar_url: avatar_url || null,
      is_verified: is_verified || false,
      is_active: true,
      last_login: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      banned_until: null,
    }]);
    if (dbError) return res.status(500).json({ error: dbError.message });
    return res.status(201).json({ success: true, user });
  }

  if (req.method === 'PUT') {
    // Update user in Auth and users table
    const { id, email, full_name, phone_number, role, avatar_url, is_verified, is_active } = req.body;
    // Update Auth user metadata
    const { data, error } = await supabase.auth.admin.updateUserById(id, {
      email,
      user_metadata: { full_name, phone_number, role, avatar_url, is_verified },
    });
    if (error) return res.status(500).json({ error: error.message });
    // Update users table
    const { error: dbError } = await supabase.from('users').update({
      email,
      full_name,
      phone_number,
      role,
      avatar_url,
      is_verified,
      is_active,
      updated_at: new Date().toISOString(),
    }).eq('id', id);
    if (dbError) return res.status(500).json({ error: dbError.message });
    return res.status(200).json({ success: true, user: data.user });
  }

  if (req.method === 'PATCH') {
    // Suspend/Activate user (with optional ban duration)
    const { id, is_active, ban_minutes } = req.body;
    let updateFields = { is_active, updated_at: new Date().toISOString() };

    if (is_active === false && ban_minutes) {
      // Set banned_until to now + ban_minutes
      const bannedUntil = new Date(Date.now() + ban_minutes * 60000).toISOString();
      updateFields.banned_until = bannedUntil;
    } else if (is_active === true) {
      // Reactivate: clear banned_until
      updateFields.banned_until = null;
    }

    const { error: dbError } = await supabase.from('users').update(updateFields).eq('id', id);
    if (dbError) return res.status(500).json({ error: dbError.message });
    return res.status(200).json({ success: true });
  }

  if (req.method === 'DELETE') {
    // Delete user from Auth and users table
    const { id } = req.body;
    // Delete from Auth
    const { error } = await supabase.auth.admin.deleteUser(id);
    if (error) return res.status(500).json({ error: error.message });
    // Delete from users table
    const { error: dbError } = await supabase.from('users').delete().eq('id', id);
    if (dbError) return res.status(500).json({ error: dbError.message });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}