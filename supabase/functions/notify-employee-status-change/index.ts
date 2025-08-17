import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotificationRequest {
  employee_id: number
  user_id: string
  employee_email: string
  employee_name: string
  new_status: boolean
  admin_name: string
  admin_email: string
  agency_name: string
  agency_id: number
  action_date: string
  action_type: 'ACTIVATION' | 'DÉSACTIVATION'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { 
      employee_id,
      user_id,
      employee_email, 
      employee_name,
      new_status,
      admin_name,
      admin_email,
      agency_name,
      agency_id,
      action_date,
      action_type
    }: NotificationRequest = await req.json()

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Préparer le contenu de l'email selon le type d'action
    const isActivation = new_status === true
    const subject = isActivation 
      ? `✅ Votre accès TravelHub a été restauré - ${agency_name}`
      : `🔒 Votre accès TravelHub a été suspendu - ${agency_name}`

    const emailContent = isActivation ? `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #34C759, #28A745); color: white; padding: 30px; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">✅ Accès restauré</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Votre accès à TravelHub a été rétabli</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <p>Bonjour <strong>${employee_name}</strong>,</p>
          
          <p>Nous vous informons que votre accès à la plateforme TravelHub de <strong>${agency_name}</strong> a été <strong>restauré</strong> par ${admin_name}.</p>
          
          <div style="background: #e8f5e8; border-left: 4px solid #34C759; padding: 15px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #1a5f1a;">Vous pouvez maintenant :</h3>
            <ul style="margin: 0; color: #2d5a2d;">
              <li>Vous connecter à votre compte TravelHub</li>
              <li>Accéder à toutes vos fonctionnalités habituelles</li>
              <li>Gérer les réservations et les clients</li>
            </ul>
          </div>
          
          <p>Si vous avez des questions, n'hésitez pas à contacter votre responsable.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666;">
            <p><strong>Détails de l'action :</strong></p>
            <p>• Action effectuée par : ${admin_name} (${admin_email})</p>
            <p>• Date et heure : ${new Date(action_date).toLocaleString('fr-FR')}</p>
            <p>• Agence : ${agency_name}</p>
          </div>
        </div>
      </div>
    ` : `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #FF3B30, #DC3545); color: white; padding: 30px; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">🔒 Accès suspendu</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Votre accès à TravelHub a été temporairement suspendu</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <p>Bonjour <strong>${employee_name}</strong>,</p>
          
          <p>Nous vous informons que votre accès à la plateforme TravelHub de <strong>${agency_name}</strong> a été <strong>suspendu</strong> par ${admin_name}.</p>
          
          <div style="background: #f8d7da; border-left: 4px solid #FF3B30; padding: 15px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #721c24;">Conséquences :</h3>
            <ul style="margin: 0; color: #721c24;">
              <li>Vous ne pouvez plus vous connecter à TravelHub</li>
              <li>Vos sessions actives ont été révoquées</li>
              <li>L'accès à toutes les fonctionnalités est temporairement bloqué</li>
            </ul>
          </div>
          
          <p>Pour plus d'informations sur cette décision ou pour discuter de la réactivation de votre compte, veuillez contacter directement votre responsable.</p>
          
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <p style="margin: 0; color: #856404;"><strong>Important :</strong> Cette suspension peut être temporaire. Contactez ${admin_name} pour plus de détails.</p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666;">
            <p><strong>Détails de l'action :</strong></p>
            <p>• Action effectuée par : ${admin_name} (${admin_email})</p>
            <p>• Date et heure : ${new Date(action_date).toLocaleString('fr-FR')}</p>
            <p>• Agence : ${agency_name}</p>
          </div>
        </div>
      </div>
    `

    // Envoyer l'email via une API externe (ex: SendGrid, Resend, etc.)
    // Pour cet exemple, on va juste logger et confirmer la réception
    console.log('📧 Email de notification préparé:', {
      to: employee_email,
      subject,
      action_type,
      employee_name,
      agency_name,
      admin_name
    })

    // Enregistrer la notification dans la table agency_notifications existante
    const { error: notificationError } = await supabase
      .from('agency_notifications')
      .insert({
        agency_id,
        user_id,
        title: subject,
        message: isActivation 
          ? `Votre accès à TravelHub a été restauré par ${admin_name}.`
          : `Votre accès à TravelHub a été suspendu par ${admin_name}.`,
        type: action_type.toLowerCase(),
        notification_category: 'access_control',
        target_user_id: user_id,
        email_content: emailContent,
        sent_to_email: employee_email,
        sent_by_email: admin_email,
        status: 'sent',
        is_read: false
      })

    if (notificationError) {
      console.error('Erreur enregistrement notification:', notificationError)
    }

    // TODO: Intégrer ici votre service d'email préféré
    // Exemple avec Resend:
    /*
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'))
    
    const { data, error } = await resend.emails.send({
      from: `TravelHub <noreply@${agency_name.toLowerCase().replace(/\s+/g, '')}.com>`,
      to: employee_email,
      subject: subject,
      html: emailContent,
    })
    
    if (error) {
      throw new Error(`Erreur envoi email: ${error.message}`)
    }
    */

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Notification envoyée avec succès',
        notification_type: action_type,
        recipient: employee_email
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Erreur dans notify-employee-status-change:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Erreur interne du serveur' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
