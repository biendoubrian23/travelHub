-- COMPARAISON : Trigger Actuel vs Trigger Complet Nécessaire

-- ========================================
-- TRIGGER ACTUEL (Incomplet)
-- ========================================
/*
DECLARE
    user_role public.user_role;
BEGIN
    -- ❌ IGNORE COMPLÈTEMENT LES INVITATIONS
    user_role := COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'client');
    
    -- ❌ CRÉE SEULEMENT UN PROFIL BASIQUE
    INSERT INTO public.users (id, email, full_name, role, created_at, updated_at)
    VALUES (NEW.id, NEW.email, ..., user_role, NOW(), NOW());
    
    -- ❌ N'GÈRE PAS :
    -- - Les invitations d'employés
    -- - La table agency_employees
    -- - La validation des tokens
    -- - Les données spécifiques agence
END;
*/

-- ========================================
-- TRIGGER COMPLET NÉCESSAIRE
-- ========================================
/*
DECLARE
    user_role public.user_role;
    v_invitation RECORD;
BEGIN
    -- ✅ GÉRER LES INVITATIONS D'ABORD
    IF NEW.raw_user_meta_data ? 'invitation_token' THEN
        -- Logique d'invitation complète
        -- Créer profil + employé + marquer invitation
    ELSE
        -- Logique normale pour clients
        user_role := COALESCE(..., 'client');
        -- Créer profil basique
    END IF;
END;
*/
