import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase, getAgencyByUserId } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState(null)
  const [agency, setAgency] = useState(null)
  const [employeeData, setEmployeeData] = useState(null)

  useEffect(() => {
    // Récupérer l'utilisateur initial
    const getInitialUser = async () => {
      try {
        console.log('🔄 Récupération de l\'utilisateur initial...')
        const { data: { user: currentUser } } = await supabase.auth.getUser()
        
        if (currentUser) {
          console.log('✅ Utilisateur trouvé:', currentUser.email)
          setUser(currentUser)
          await loadUserProfile(currentUser.id)
        } else {
          console.log('❌ Aucun utilisateur trouvé')
          setLoading(false)
        }
      } catch (error) {
        console.error('❌ Erreur lors de la récupération de l\'utilisateur:', error)
        setLoading(false)
      }
    }

    getInitialUser()

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Changement d\'authentification:', event)
        if (session?.user) {
          console.log('✅ Session utilisateur:', session.user.email)
          setUser(session.user)
          await loadUserProfile(session.user.id)
        } else {
          console.log('❌ Aucune session utilisateur')
          setUser(null)
          setUserProfile(null)
          setAgency(null)
          setEmployeeData(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const loadUserProfile = useCallback(async (userId) => {
    try {
      console.log('🔄 Chargement du profil utilisateur pour:', userId);
      
      // Récupérer le profil utilisateur
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (profileError) {
        console.error('❌ Erreur profil utilisateur:', profileError.message);
        // Si l'utilisateur n'existe pas dans la table users, on le crée
        if (profileError.code === 'PGRST116') {
          console.log('👤 Utilisateur non trouvé, création du profil...');
          const { data: user } = await supabase.auth.getUser();
          if (user?.user) {
            const { data: newProfile, error: createError } = await supabase
              .from('users')
              .insert({
                id: userId,
                full_name: user.user.user_metadata?.full_name || user.user.email,
                email: user.user.email,
                role: 'user'
              })
              .select()
              .single();
            
            if (createError) {
              console.error('❌ Erreur création profil:', createError.message);
              return;
            }
            setUserProfile(newProfile);
          }
        }
        return;
      }
      
      console.log('✅ Profil utilisateur chargé:', profile.full_name);
      setUserProfile(profile)

      // Si c'est un utilisateur d'agence, récupérer les données d'agence
      if (profile.role === 'agence' || profile.role?.includes('agency')) {
        await loadAgencyData(userId, profile.role)
      }
    } catch (error) {
      console.error('💥 Erreur lors du chargement du profil:', error)
    }
  }, [])

  const loadAgencyData = async (userId, userRole) => {
    try {
      console.log('🔄 Chargement des données d\'agence pour:', userRole);
      
      // Si c'est le propriétaire de l'agence
      if (userRole === 'agence') {
        const { data: agencyData, error: agencyError } = await getAgencyByUserId(userId)
        if (agencyError) {
          console.error('❌ Erreur récupération agence:', agencyError.message);
          return;
        }
        console.log('✅ Agence chargée:', agencyData?.name);
        setAgency(agencyData)
      } else {
        // Si c'est un employé d'agence
        const { data: employeeData, error: employeeError } = await supabase
          .from('agency_employees')
          .select(`
            *,
            agency:agencies(*)
          `)
          .eq('user_id', userId)
          .single()

        if (employeeError) {
          console.error('❌ Erreur récupération employé:', employeeError.message);
          return;
        }

        console.log('✅ Données employé chargées');
        setEmployeeData(employeeData)
        setAgency(employeeData.agency)
      }
    } catch (error) {
      console.error('💥 Erreur lors du chargement des données d\'agence:', error)
    }
  }

  const signIn = async (email, password) => {
    try {
      console.log('🔐 AuthContext: Tentative de connexion pour:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      console.log('📋 AuthContext: Résultat signInWithPassword:', error ? 'ERREUR' : 'SUCCÈS');
      
      if (error) {
        console.error('❌ AuthContext: Erreur Supabase:', error.message);
        throw error;
      }

      if (data.user) {
        console.log('✅ AuthContext: Utilisateur connecté:', data.user.id);
        console.log('📧 AuthContext: Email confirmé:', data.user.email_confirmed_at ? 'OUI' : 'NON');
        
        // Charger immédiatement le profil
        await loadUserProfile(data.user.id);
        console.log('📋 AuthContext: Profil chargé');
      }

      return { data, error: null }
    } catch (error) {
      console.error('❌ AuthContext: Erreur générale:', error);
      return { data: null, error }
    }
  }

  const signUp = async (email, password, userData) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      })

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const signOut = async () => {
    try {
      console.log('🔄 Tentative de déconnexion...')
      
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('❌ Erreur Supabase signOut:', error)
        throw error
      }
      
      console.log('✅ Déconnexion Supabase réussie')
      
      // Forcer la réinitialisation des états
      setUser(null)
      setUserProfile(null)
      setAgency(null)
      setEmployeeData(null)
      
      console.log('✅ États réinitialisés')

      return { error: null }
    } catch (error) {
      console.error('❌ Erreur lors de la déconnexion:', error)
      // Même en cas d'erreur, on force la déconnexion côté client
      setUser(null)
      setUserProfile(null)
      setAgency(null)
      setEmployeeData(null)
      
      return { error }
    }
  }

  const updateProfile = async (updates) => {
    try {
      if (!user) throw new Error('Utilisateur non connecté')

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error

      setUserProfile(data)
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const hasPermission = (permission) => {
    if (!userProfile || !agency) return false

    // Si c'est le propriétaire de l'agence
    if (userProfile.role === 'agence') return true

    // Si c'est un employé, vérifier selon le rôle
    if (employeeData) {
      const role = employeeData.employee_role

      switch (role) {
        case 'admin':
          return true
        case 'manager':
          return [
            'trips:view', 'trips:create', 'trips:update',
            'bookings:view_all', 'bookings:create', 'bookings:update', 'bookings:cancel',
            'employees:view', 'finances:view'
          ].includes(permission)
        case 'employee':
          return [
            'trips:view', 'bookings:view', 'bookings:create', 'bookings:update'
          ].includes(permission)
        case 'driver':
          return [
            'trips:view', 'bookings:view'
          ].includes(permission)
        default:
          return false
      }
    }

    return false
  }

  const isAgencyOwner = () => {
    return userProfile?.role === 'agence'
  }

  const isAgencyEmployee = () => {
    return userProfile?.role?.includes('agency') && employeeData
  }

  const getEmployeeRole = () => {
    return employeeData?.employee_role || null
  }

  const value = {
    user,
    userProfile,
    agency,
    employeeData,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    hasPermission,
    isAgencyOwner,
    isAgencyEmployee,
    getEmployeeRole,
    refreshUserData: () => loadUserProfile(user?.id)
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
