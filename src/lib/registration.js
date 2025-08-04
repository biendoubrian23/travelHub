import { supabase } from './supabase'

// Upload d'un fichier vers Supabase Storage
export const uploadFile = async (file, bucket, path) => {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${path}/${Date.now()}.${fileExt}`

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file)

    if (error) throw error

    // Récupérer l'URL publique du fichier
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName)

    return { 
      url: publicUrl, 
      path: fileName,
      error: null 
    }
  } catch (error) {
    return { 
      url: null, 
      path: null, 
      error 
    }
  }
}

// Créer un profil utilisateur complet
export const createUserProfile = async (user, profileData) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        email: user.email,
        full_name: `${profileData.firstName} ${profileData.lastName}`,
        phone: profileData.phone,
        role: 'agence',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

// Créer l'agence avec toutes les informations
export const createAgencyProfile = async (userId, formData, logoUrl = null) => {
  try {
    // 1. Créer l'agence principale
    const { data: agency, error: agencyError } = await supabase
      .from('agencies')
      .insert({
        user_id: userId,
        name: formData.agencyName,
        email: formData.email,
        phone: formData.phone,
        address: `${formData.address}, ${formData.city}, ${formData.region}, ${formData.country}`,
        license_number: formData.registrationNumber,
        description: formData.description || `Agence de ${formData.businessType} située à ${formData.city}`,
        logo_url: logoUrl,
        is_verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (agencyError) throw agencyError

    // 2. Ajouter les services
    if (formData.services && formData.services.length > 0) {
      const servicesData = formData.services.map(service => ({
        agency_id: agency.id,
        service_name: service,
        is_active: true
      }))

      const { error: servicesError } = await supabase
        .from('agency_services')
        .insert(servicesData)

      if (servicesError) throw servicesError
    }

    // 3. Ajouter les capacités
    const { error: capabilitiesError } = await supabase
      .from('agency_capabilities')
      .insert({
        agency_id: agency.id,
        bus_count: parseInt(formData.totalBuses) || 0,
        total_seats: parseInt(formData.totalSeats) || 0,
        vip_buses: parseInt(formData.vipBuses) || 0,
        standard_buses: parseInt(formData.standardBuses) || 0,
        minivan_count: parseInt(formData.minivans) || 0,
        max_daily_trips: parseInt(formData.maxDailyTrips) || 10,
        coverage_areas: formData.coverageAreas || [formData.region]
      })

    if (capabilitiesError) throw capabilitiesError

    return { data: agency, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

// Uploader et enregistrer les documents
export const uploadAgencyDocuments = async (agencyId, documents) => {
  const uploadPromises = []

  for (const [docType, file] of Object.entries(documents)) {
    if (file && file instanceof File) {
      uploadPromises.push(
        uploadFile(file, 'agency-documents', `${agencyId}/${docType}`)
          .then(({ url, path, error }) => {
            if (error) throw error
            
            return supabase
              .from('agency_documents')
              .insert({
                agency_id: agencyId,
                document_type: docType,
                document_name: file.name,
                file_url: url,
                file_size: file.size,
                mime_type: file.type,
                is_verified: false
              })
          })
      )
    }
  }

  try {
    await Promise.all(uploadPromises)
    return { error: null }
  } catch (error) {
    return { error }
  }
}

// Fonction principale pour l'enregistrement complet
export const completeAgencyRegistration = async (formData) => {
  try {
    // 1. Créer le compte utilisateur
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          role: 'agence'
        }
      }
    })

    if (authError) throw authError

    const user = authData.user
    if (!user) throw new Error('Erreur lors de la création du compte')

    // 2. Créer le profil utilisateur
    const { error: profileError } = await createUserProfile(user, formData)
    if (profileError) throw profileError

    // 3. Upload du logo si présent
    let logoUrl = null
    if (formData.logo && formData.logo instanceof File) {
      const { url, error: logoError } = await uploadFile(
        formData.logo, 
        'agency-logos', 
        user.id
      )
      if (logoError) throw logoError
      logoUrl = url
    }

    // 4. Créer l'agence
    const { data: agency, error: agencyError } = await createAgencyProfile(
      user.id, 
      formData, 
      logoUrl
    )
    if (agencyError) throw agencyError

    // 5. Upload des documents
    const documents = {
      license: formData.businessLicense,
      insurance: formData.insurance,
      registration: formData.vehicleRegistration,
      tax_certificate: formData.taxCertificate
    }

    const { error: documentsError } = await uploadAgencyDocuments(agency.id, documents)
    if (documentsError) {
      console.warn('Erreur lors de l\'upload des documents:', documentsError)
      // Ne pas faire échouer l'inscription pour ça
    }

    return { 
      user, 
      agency, 
      error: null,
      message: 'Inscription réussie ! Veuillez vérifier votre email pour confirmer votre compte.'
    }
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error)
    return { 
      user: null, 
      agency: null, 
      error,
      message: 'Erreur lors de l\'inscription. Veuillez réessayer.'
    }
  }
}
