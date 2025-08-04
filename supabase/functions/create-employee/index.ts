import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Créer un client Supabase avec la clé de service
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { 
      email, 
      password, 
      full_name, 
      phone, 
      agency_id, 
      employee_role, 
      date_of_birth, 
      notes, 
      created_by 
    } = await req.json()

    console.log('🔄 Création d\'employé pour:', email)

    // 1. Créer le compte d'authentification
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: full_name,
        phone: phone,
        agency_id: agency_id,
        role: employee_role
      }
    })

    if (authError) {
      console.error('❌ Erreur auth:', authError)
      throw authError
    }

    console.log('✅ Compte auth créé:', authData.user.id)

    // 2. Déterminer le rôle utilisateur
    const roleMapping = {
      'admin': 'agency_admin',
      'manager': 'agency_manager', 
      'employee': 'agency_employee',
      'driver': 'agency_driver'
    }
    const userRole = roleMapping[employee_role] || 'agency_employee'

    // 3. Créer l'enregistrement utilisateur
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authData.user.id,
        email: email,
        full_name: full_name,
        phone: phone,
        date_of_birth: date_of_birth,
        role: userRole,
        is_active: true
      })
      .select()
      .single()

    if (userError) {
      console.error('❌ Erreur user:', userError)
      throw userError
    }

    console.log('✅ Utilisateur créé:', userData.id)

    // 4. Créer l'enregistrement employé
    const { data: employeeData, error: employeeError } = await supabaseAdmin
      .from('agency_employees')
      .insert({
        agency_id: agency_id,
        user_id: authData.user.id,
        employee_role: employee_role,
        notes: notes,
        created_by: created_by,
        generated_by: created_by,
        generated_email: email,
        temp_password: password,
        phone: phone,
        date_of_birth: date_of_birth,
        is_active: true,
        hire_date: new Date().toISOString().split('T')[0]
      })
      .select(`
        *,
        user:users(id, full_name, email)
      `)
      .single()

    if (employeeError) {
      console.error('❌ Erreur employee:', employeeError)
      throw employeeError
    }

    console.log('✅ Employé créé:', employeeData.id)

    return new Response(
      JSON.stringify({
        success: true,
        user: userData,
        employee: employeeData,
        auth_user: authData.user
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('💥 Erreur complète:', error)
    return new Response(
      JSON.stringify({
        error: error.message || 'Erreur lors de la création de l\'employé',
        details: error
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
