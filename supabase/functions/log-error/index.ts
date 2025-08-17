import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ErrorLog {
  timestamp: string
  error_category?: string
  error_message: string
  error_stack?: string
  operation_context?: {
    employee_id?: number
    user_id?: string
    target_status?: boolean
    current_user?: string
    agency_id?: number
  }
  browser_info?: {
    user_agent?: string
    url?: string
    timestamp?: number
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const errorLog: ErrorLog = await req.json()

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Log to console for immediate debugging
    console.error('🚨 ERREUR SYSTÈME TRAVELHUB:', {
      timestamp: errorLog.timestamp,
      category: errorLog.error_category || 'UNKNOWN',
      message: errorLog.error_message,
      context: errorLog.operation_context,
      browser: errorLog.browser_info
    })

    // Enregistrer l'erreur en base de données pour monitoring
    const { error: insertError } = await supabase
      .from('system_error_logs')
      .insert({
        timestamp: errorLog.timestamp,
        error_category: errorLog.error_category || 'GENERAL',
        error_message: errorLog.error_message.substring(0, 1000), // Limiter la taille
        error_stack: errorLog.error_stack?.substring(0, 2000), // Limiter la taille
        
        // Contexte opérationnel
        employee_id: errorLog.operation_context?.employee_id,
        user_id: errorLog.operation_context?.user_id,
        target_status: errorLog.operation_context?.target_status,
        current_user: errorLog.operation_context?.current_user,
        agency_id: errorLog.operation_context?.agency_id,
        
        // Informations navigateur
        user_agent: errorLog.browser_info?.user_agent?.substring(0, 500),
        page_url: errorLog.browser_info?.url?.substring(0, 500),
        browser_timestamp: errorLog.browser_info?.timestamp,
        
        created_at: new Date().toISOString()
      })

    if (insertError) {
      console.error('Erreur lors de l\'enregistrement du log d\'erreur:', insertError)
    }

    // Si c'est une erreur critique, on pourrait envoyer une notification
    if (errorLog.error_category === 'DATA_INTEGRITY' || 
        errorLog.error_category === 'SECURITY' ||
        errorLog.error_message.includes('corruption')) {
      
      console.error('🚨 ALERTE SÉCURITÉ/INTÉGRITÉ DÉTECTÉE:', errorLog)
      
      // TODO: Envoyer une alerte aux administrateurs système
      // Par exemple, via Slack, Discord, ou email aux développeurs
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Erreur enregistrée pour monitoring',
        log_id: new Date().getTime(),
        category: errorLog.error_category || 'GENERAL'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Erreur dans log-error:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Impossible d\'enregistrer l\'erreur' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
