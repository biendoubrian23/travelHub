import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Client admin pour les opérations d'administration
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Types pour la base de données
export const USER_ROLES = {
  CLIENT: 'client',
  AGENCY: 'agence',
  AGENCY_ADMIN: 'agency_admin',
  AGENCY_MANAGER: 'agency_manager',
  AGENCY_EMPLOYEE: 'agency_employee',
  AGENCY_DRIVER: 'agency_driver',
  SUPER_ADMIN: 'super_admin'
}

export const AGENCY_EMPLOYEE_ROLES = {
  ADMIN: 'admin',        // Accès complet à l'agence
  MANAGER: 'manager',    // Gestion des employés et réservations
  EMPLOYEE: 'employee',  // Consultation et réservations limitées
  DRIVER: 'driver'       // Accès conducteur spécifique
}

export const PERMISSIONS = {
  // Gestion des trajets
  TRIPS_CREATE: 'trips:create',
  TRIPS_UPDATE: 'trips:update',
  TRIPS_DELETE: 'trips:delete',
  TRIPS_VIEW: 'trips:view',
  
  // Gestion des réservations
  BOOKINGS_CREATE: 'bookings:create',
  BOOKINGS_UPDATE: 'bookings:update',
  BOOKINGS_CANCEL: 'bookings:cancel',
  BOOKINGS_VIEW: 'bookings:view',
  BOOKINGS_VIEW_ALL: 'bookings:view_all',
  
  // Gestion des employés
  EMPLOYEES_CREATE: 'employees:create',
  EMPLOYEES_UPDATE: 'employees:update',
  EMPLOYEES_DELETE: 'employees:delete',
  EMPLOYEES_VIEW: 'employees:view',
  
  // Gestion financière
  FINANCES_VIEW: 'finances:view',
  FINANCES_REPORTS: 'finances:reports',
  
  // Administration
  AGENCY_SETTINGS: 'agency:settings',
  SYSTEM_ADMIN: 'system:admin'
}

// Permissions par rôle
export const ROLE_PERMISSIONS = {
  [AGENCY_EMPLOYEE_ROLES.ADMIN]: [
    PERMISSIONS.TRIPS_CREATE,
    PERMISSIONS.TRIPS_UPDATE,
    PERMISSIONS.TRIPS_DELETE,
    PERMISSIONS.TRIPS_VIEW,
    PERMISSIONS.BOOKINGS_CREATE,
    PERMISSIONS.BOOKINGS_UPDATE,
    PERMISSIONS.BOOKINGS_CANCEL,
    PERMISSIONS.BOOKINGS_VIEW_ALL,
    PERMISSIONS.EMPLOYEES_CREATE,
    PERMISSIONS.EMPLOYEES_UPDATE,
    PERMISSIONS.EMPLOYEES_DELETE,
    PERMISSIONS.EMPLOYEES_VIEW,
    PERMISSIONS.FINANCES_VIEW,
    PERMISSIONS.FINANCES_REPORTS,
    PERMISSIONS.AGENCY_SETTINGS
  ],
  [AGENCY_EMPLOYEE_ROLES.MANAGER]: [
    PERMISSIONS.TRIPS_CREATE,
    PERMISSIONS.TRIPS_UPDATE,
    PERMISSIONS.TRIPS_VIEW,
    PERMISSIONS.BOOKINGS_CREATE,
    PERMISSIONS.BOOKINGS_UPDATE,
    PERMISSIONS.BOOKINGS_CANCEL,
    PERMISSIONS.BOOKINGS_VIEW_ALL,
    PERMISSIONS.EMPLOYEES_VIEW,
    PERMISSIONS.FINANCES_VIEW
  ],
  [AGENCY_EMPLOYEE_ROLES.EMPLOYEE]: [
    PERMISSIONS.TRIPS_VIEW,
    PERMISSIONS.BOOKINGS_CREATE,
    PERMISSIONS.BOOKINGS_UPDATE,
    PERMISSIONS.BOOKINGS_VIEW
  ],
  [AGENCY_EMPLOYEE_ROLES.DRIVER]: [
    PERMISSIONS.TRIPS_VIEW,
    PERMISSIONS.BOOKINGS_VIEW
  ]
}

// Fonction pour vérifier les permissions
export const hasPermission = (userRole, permission) => {
  const rolePermissions = ROLE_PERMISSIONS[userRole] || []
  return rolePermissions.includes(permission)
}

// Fonctions d'authentification
export const signUp = async (email, password, userData) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData
    }
  })
  return { data, error }
}

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

// Fonctions pour les agences
export const createAgency = async (agencyData) => {
  const { data, error } = await supabase
    .from('agencies')
    .insert([agencyData])
    .select()
  return { data, error }
}

export const getAgencyByUserId = async (userId) => {
  const { data, error } = await supabase
    .from('agencies')
    .select('*')
    .eq('user_id', userId)
    .single()
  return { data, error }
}

// Fonctions pour les employés d'agence
export const createAgencyEmployee = async (employeeData) => {
  const { data, error } = await supabase
    .from('agency_employees')
    .insert([employeeData])
    .select()
  return { data, error }
}

export const getAgencyEmployees = async (agencyId) => {
  const { data, error } = await supabase
    .from('agency_employees')
    .select(`
      *,
      user:users(*)
    `)
    .eq('agency_id', agencyId)
  return { data, error }
}

// Fonctions utilitaires pour génération automatique
export const generateEmployeeEmail = (firstName, lastName, agencyName) => {
  const cleanFirstName = firstName.toLowerCase().replace(/[^a-z]/g, '')
  const cleanLastName = lastName.toLowerCase().replace(/[^a-z]/g, '')
  const cleanAgencyName = agencyName.toLowerCase().replace(/[^a-z]/g, '')
  
  return `${cleanFirstName}.${cleanLastName}@${cleanAgencyName}.travelhub.cm`
}

export const generateTempPassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Fonction pour créer un employé complet (utilisateur + employé)
export const createCompleteEmployee = async (agencyId, employeeData, createdBy) => {
  try {
    // 1. Générer les identifiants
    const email = generateEmployeeEmail(
      employeeData.firstName,
      employeeData.lastName,
      employeeData.agencyName
    )
    const tempPassword = generateTempPassword()

    // 2. Créer le compte utilisateur
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: tempPassword,
      user_metadata: {
        first_name: employeeData.firstName,
        last_name: employeeData.lastName,
        role: 'agency_employee'
      },
      email_confirm: true
    })

    if (authError) throw authError

    // 3. Créer le profil utilisateur
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: email,
        full_name: `${employeeData.firstName} ${employeeData.lastName}`,
        role: 'agency_employee',
        is_generated_user: true,
        generated_by: createdBy
      })

    if (userError) throw userError

    // 4. Créer l'employé d'agence
    const { data: employee, error: employeeError } = await supabase
      .from('agency_employees')
      .insert({
        agency_id: agencyId,
        user_id: authData.user.id,
        employee_role: employeeData.role,
        salary_fcfa: employeeData.salary ? parseInt(employeeData.salary) : null,
        notes: employeeData.notes,
        created_by: createdBy,
        generated_email: email,
        temp_password: tempPassword
      })
      .select()
      .single()

    if (employeeError) throw employeeError

    return {
      data: {
        user: authData.user,
        employee: employee,
        credentials: {
          email: email,
          password: tempPassword
        }
      },
      error: null
    }
  } catch (error) {
    return { data: null, error }
  }
}
