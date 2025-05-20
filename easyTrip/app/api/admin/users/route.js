// filepath: /app/api/admin/users/route.js

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://evdhnrraznlldkwzviva.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2ZGhucnJhem5sbGRrd3p2aXZhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Njg4NjI0NiwiZXhwIjoyMDYyNDYyMjQ2fQ.YUzaCwRAS_nG5lxGoqdzYJa3Byq0NvKZsXIH0XeDwOo' // Service role key (keep secret!)
);

export async function GET() {
    console.log("inside");
 const { data, error } = await supabase.from('users').select('*');
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
    
//   const { data, error } = await supabase.auth.admin.listUsers();
//   if (error) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
//   return NextResponse.json(data.users);
}

export async function POST(req) {
  const body = await req.json();
  const { email, password, full_name, phone_number, role, avatar_url, is_verified } = body;

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    user_metadata: { full_name, phone_number, role, avatar_url, is_verified },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

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

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, user }, { status: 201 });
}

export async function PUT(req) {
  const body = await req.json();
  const { id, email, full_name, phone_number, role, avatar_url, is_verified, is_active } = body;

  const { data, error } = await supabase.auth.admin.updateUserById(id, {
    email,
    user_metadata: { full_name, phone_number, role, avatar_url, is_verified },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

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

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, user: data.user });
}

export async function PATCH(req) {
  const body = await req.json();
  const { id, is_active, ban_minutes } = body;

  let updateFields = { is_active, updated_at: new Date().toISOString() };

  if (is_active === false && ban_minutes) {
    const bannedUntil = new Date(Date.now() + ban_minutes * 60000).toISOString();
    updateFields.banned_until = bannedUntil;
  } else if (is_active === true) {
    updateFields.banned_until = null;
  }

  const { error: dbError } = await supabase.from('users').update(updateFields).eq('id', id);
  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(req) {
  const body = await req.json();
  const { id } = body;

  const { error } = await supabase.auth.admin.deleteUser(id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { error: dbError } = await supabase.from('users').delete().eq('id', id);
  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
