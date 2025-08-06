-- Script pour identifier les vrais noms de triggers avant suppression
-- À exécuter AVANT le script unifié

-- Lister tous les triggers sur auth.users
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE event_object_schema = 'auth' 
  AND event_object_table = 'users'
ORDER BY trigger_name;

-- Lister toutes les fonctions qui pourraient être des triggers
SELECT 
  proname as function_name,
  prosrc as function_body
FROM pg_proc 
WHERE proname IN ('handle_new_user', 'handle_invitation_signup')
   OR prosrc LIKE '%invitation%'
   OR prosrc LIKE '%NEW.raw_user_meta_data%';

-- Afficher les noms pour copier-coller dans le script unifié
SELECT 'Triggers trouvés. Utilisez ces noms dans le script unifié :' as message;
