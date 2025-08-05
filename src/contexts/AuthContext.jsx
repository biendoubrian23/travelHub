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

  // 🔧 DÉCLARER loadUserProfile AVANT useEffect pour éviter l'erreur de référence
  const loadUserProfile = useCallback(async (userId) => {
    const startTime = Date.now()
    console.log('🔄 Chargement du profil utilisateur pour:', userId, 'à', new Date().toLocaleTimeString());
    
    try {
      // Récupérer le profil utilisateur avec timeout
      const profilePromise = supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()
      
      // Timeout de 10 secondes pour éviter le blocage
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout loadUserProfile')), 10000)
      )
      
      const { data: profile, error: profileError } = await Promise.race([
        profilePromise,
        timeoutPromise
      ])

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
              console.log('✅ Fin loadUserProfile (erreur création) après', Date.now() - startTime, 'ms');
              return;
            }
            setUserProfile(newProfile);
            console.log('✅ Nouveau profil créé et défini');
          }
        }
        console.log('✅ Fin loadUserProfile (erreur profil) après', Date.now() - startTime, 'ms');
        return;
      }
      
      console.log('✅ Profil utilisateur chargé:', profile.full_name);
      setUserProfile(profile)

      // Si c'est un utilisateur d'agence, récupérer les données d'agence
      if (profile.role === 'agence' || profile.role?.includes('agency')) {
        console.log('🏢 Chargement données agence...');
        await loadAgencyData(userId, profile.role)
        console.log('✅ Données agence chargées');
      }
      
      console.log('✅ Fin loadUserProfile (succès complet) après', Date.now() - startTime, 'ms');
    } catch (error) {
      console.error('💥 Erreur lors du chargement du profil:', error)
      console.log('❌ Fin loadUserProfile (erreur catch) après', Date.now() - startTime, 'ms');
    }
  }, [])

  useEffect(() => {
    // Récupérer l'utilisateur initial
    const getInitialUser = async () => {
      try {
        console.log('🔄 Récupération de l\'utilisateur initial...')
        
        // Rechercher toutes les clés d'authentification possibles
        const allKeys = Object.keys(localStorage)
        const authKeys = allKeys.filter(k => 
          k.includes('supabase') || k.startsWith('sb-') || k.includes('auth')
        )
        console.log('🔍 localStorage auth keys trouvées:', authKeys)
        
        // Créer une liste dynamique des clés possibles
        const sbKeys = allKeys.filter(k => k.startsWith('sb-'))
        const possibleKeys = [
          'supabase.auth.token',
          'supabase.session',
          ...sbKeys, // Inclure toutes les clés sb-* trouvées
          `sb-${window.location.hostname}-auth-token`,
          'sb-auth-token'
        ]
        
        console.log('🔑 Clés testées:', possibleKeys)
        
        let localSession = null
        let sessionKey = null
        
        // Tester chaque clé pour trouver une session valide
        for (const key of possibleKeys) {
          const value = localStorage.getItem(key)
          if (value) {
            try {
              const parsed = JSON.parse(value)
              // Vérifier si c'est bien une session Supabase
              if (parsed.access_token || parsed.refresh_token || parsed.user || parsed.session) {
                console.log(`✅ Session Supabase trouvée avec clé: ${key}`)
                localSession = value
                sessionKey = key
                break
              }
            } catch {
              // Pas un JSON valide, continuer
            }
          }
        }
        
        console.log('💾 Session locale détectée:', !!localSession)
        if (localSession && sessionKey) {
          try {
            const parsed = JSON.parse(localSession)
            const sessionInfo = {
              hasAccessToken: !!parsed.access_token,
              hasRefreshToken: !!parsed.refresh_token,
              hasUser: !!parsed.user,
              expiresAt: parsed.expires_at ? new Date(parsed.expires_at * 1000) : null,
              isExpired: parsed.expires_at ? Date.now() > (parsed.expires_at * 1000) : false
            }
            console.log('📋 Contenu session:', sessionInfo)
            
            // Si la session est valide mais potentiellement pas synchronisée avec Supabase
            if (sessionInfo.hasAccessToken && !sessionInfo.isExpired) {
              console.log('🔄 Session valide détectée, forcer getSession() en priorité...')
              
              // Essayer getSession() en premier si on a une session locale valide
              try {
                const { data: prioritySessionData, error: prioritySessionError } = await supabase.auth.getSession()
                
                if (prioritySessionData?.session?.user) {
                  console.log('✅ Utilisateur récupéré via getSession() prioritaire:', prioritySessionData.session.user.email)
                  // Définir directement l'utilisateur et continuer
                  setUser(prioritySessionData.session.user)
                  await loadUserProfile(prioritySessionData.session.user.id)
                  console.log('✅ Profil chargé, arrêt du loading...')
                  setLoading(false)
                  return // Sortir de la fonction, mission accomplie
                } else if (prioritySessionError) {
                  console.error('❌ Erreur getSession() prioritaire:', prioritySessionError)
                  console.log('🔄 Continuation vers getUser() fallback...')
                }
              } catch (sessionErr) {
                console.error('❌ Erreur lors du getSession() prioritaire:', sessionErr)
                console.log('🔄 Continuation vers getUser() fallback...')
              }
            }
          } catch {
            console.log('⚠️ Session non-JSON:', localSession.substring(0, 100))
          }
        }
        
        // Méthode 1: getUser() (fallback si getSession() prioritaire a échoué)
        let { data: { user: currentUser }, error } = await supabase.auth.getUser()
        
        console.log('📋 Résultat getUser():', { 
          hasUser: !!currentUser, 
          hasError: !!error,
          error: error?.message 
        })
        
        // Méthode 2: fallback avec getSession() si getUser() échoue
        if (!currentUser && !error) {
          console.log('🔄 Fallback: tentative avec getSession()...')
          const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
          
          if (sessionData?.session?.user) {
            currentUser = sessionData.session.user
            console.log('✅ Utilisateur récupéré via getSession():', currentUser.email)
          } else if (sessionError) {
            console.error('❌ Erreur getSession():', sessionError)
            error = sessionError
          }
        }
        
        if (error) {
          console.error('❌ Erreur lors de getUser():', error)
          // Nettoyer les données potentiellement corrompues
          await supabase.auth.signOut()
          setLoading(false)
          return
        }
        
        if (currentUser) {
          console.log('✅ Utilisateur trouvé:', currentUser.email)
          console.log('🔑 User ID:', currentUser.id)
          console.log('📧 Email confirmé:', !!currentUser.email_confirmed_at)
          setUser(currentUser)
          await loadUserProfile(currentUser.id)
          console.log('✅ Profil chargé, arrêt du loading...')
          setLoading(false)
        } else {
          console.log('❌ Aucun utilisateur trouvé, arrêt du loading...')
          setLoading(false)
        }
      } catch (error) {
        console.error('❌ Erreur lors de la récupération de l\'utilisateur:', error)
        console.error('📊 Stack trace:', error.stack)
        console.log('❌ Erreur fatale, arrêt du loading...')
        setLoading(false)
      }
    }

    // Ajouter un petit délai pour s'assurer que Supabase est bien initialisé
    const initTimer = setTimeout(() => {
      getInitialUser()
    }, 100)
    
    // 🚨 TIMEOUT DE SÉCURITÉ : Forcer arrêt loading après 15 secondes
    const emergencyTimeout = setTimeout(() => {
      console.log('🚨 TIMEOUT URGENCE: Forcer arrêt loading après 15s')
      setLoading(false)
    }, 15000)

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Changement d\'authentification:', event)
        if (session?.user) {
          console.log('✅ Session utilisateur:', session.user.email)
          setUser(session.user)
          
          try {
            await loadUserProfile(session.user.id)
            console.log('✅ loadUserProfile terminé dans onAuthStateChange')
          } catch (error) {
            console.error('❌ Erreur loadUserProfile dans onAuthStateChange:', error)
          } finally {
            // TOUJOURS arrêter le loading, même en cas d'erreur
            console.log('🔄 Force setLoading(false) dans onAuthStateChange')
            setLoading(false)
          }
        } else {
          console.log('❌ Aucune session utilisateur')
          setUser(null)
          setUserProfile(null)
          setAgency(null)
          setEmployeeData(null)
          setLoading(false)
        }
      }
    )

    return () => {
      clearTimeout(initTimer)
      clearTimeout(emergencyTimeout)
      subscription.unsubscribe()
    }
  }, [loadUserProfile])

  // Fonction de diagnostic pour déboguer les problèmes de session
  const diagnoseSession = useCallback(async () => {
    console.log('🔬 === DIAGNOSTIC SESSION ===')
    
    // 1. Vérifier localStorage - toutes les clés
    console.log('📦 Toutes les clés localStorage:', Object.keys(localStorage))
    
    const authKeys = Object.keys(localStorage).filter(k => 
      k.includes('supabase') || k.includes('auth') || k.startsWith('sb-')
    )
    console.log('� Clés auth trouvées:', authKeys)
    
    authKeys.forEach(key => {
      const value = localStorage.getItem(key)
      if (value) {
        try {
          const parsed = JSON.parse(value)
          console.log(`🔑 ${key}:`, {
            hasAccessToken: !!parsed.access_token,
            hasRefreshToken: !!parsed.refresh_token,
            hasUser: !!parsed.user,
            hasSession: !!parsed.session,
            expiresAt: parsed.expires_at ? new Date(parsed.expires_at * 1000) : null,
            isExpired: parsed.expires_at ? Date.now() > (parsed.expires_at * 1000) : false
          })
        } catch {
          console.log(`🔑 ${key}: ${value?.substring(0, 100)}...`)
        }
      } else {
        console.log(`🔑 ${key}: VIDE`)
      }
    })
    
    // 2. Détecter la vraie clé Supabase
    const hostname = window.location.hostname
    const possibleKeys = [
      `sb-${hostname}-auth-token`,
      'sb-localhost-auth-token',
      'sb-127.0.0.1-auth-token',
      'supabase.auth.token',
      'supabase.session',
      'sb-auth-token',
      ...authKeys
    ]
    
    let realSessionKey = null
    for (const key of possibleKeys) {
      const value = localStorage.getItem(key)
      if (value) {
        try {
          const parsed = JSON.parse(value)
          if (parsed.access_token || parsed.session) {
            realSessionKey = key
            console.log(`✅ CLÉ RÉELLE DÉTECTÉE: ${key}`)
            break
          }
        } catch {
          // Ignorer les erreurs de parsing JSON
        }
      }
    }
    
    if (!realSessionKey) {
      console.log('❌ Aucune clé session valide trouvée')
    }
    
    // 3. Tester getUser()
    try {
      const { data, error } = await supabase.auth.getUser()
      console.log('🧪 Test getUser():', {
        success: !error,
        hasUser: !!data.user,
        userId: data.user?.id,
        email: data.user?.email,
        error: error?.message
      })
    } catch (error) {
      console.error('❌ Erreur test getUser():', error)
    }
    
    // 4. Tester getSession()
    try {
      const { data, error } = await supabase.auth.getSession()
      console.log('🧪 Test getSession():', {
        success: !error,
        hasSession: !!data.session,
        hasUser: !!data.session?.user,
        error: error?.message
      })
    } catch (error) {
      console.error('❌ Erreur test getSession():', error)
    }
    
    console.log('🔬 === FIN DIAGNOSTIC ===')
    return realSessionKey
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
    refreshUserData: () => loadUserProfile(user?.id),
    diagnoseSession // Fonction de diagnostic pour déboguer
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
