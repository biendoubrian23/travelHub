-- Solution 3: Fusionner les deux triggers en un seul
-- À exécuter dans Supabase SQL Editor

-- 1. Supprimer TOUS les triggers potentiels sur auth.users
DROP TRIGGER IF EXISTS on_auth_user_created_invitation ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS handle_new_user_trigger ON auth.users;
DROP TRIGGER IF EXISTS handle_invitation_signup_trigger ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_unified ON auth.users;

-- 2. Supprimer les anciennes fonctions
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS handle_invitation_signup() CASCADE;
DROP FUNCTION IF EXISTS handle_all_user_signup() CASCADE;

-- 3. Créer la nouvelle fonction unifiée qui remplace handle_new_user ET handle_invitation_signup
CREATE OR REPLACE FUNCTION handle_all_user_signup()
RETURNS TRIGGER AS $$
DECLARE
    user_role public.user_role;
    v_invitation RECORD;
    v_token_str TEXT;
BEGIN
    RAISE NOTICE 'TRIGGER UNIFIÉ: Traitement signup pour %', NEW.email;
    
    -- ⭐ PRIORITÉ 1: GÉRER LES INVITATIONS (logique de handle_invitation_signup)
    IF NEW.raw_user_meta_data ? 'invitation_token' THEN
        v_token_str := NEW.raw_user_meta_data->>'invitation_token';
        RAISE NOTICE 'TRIGGER UNIFIÉ: Invitation détectée, token = %', v_token_str;
        
        -- Récupérer l'invitation
        SELECT * INTO v_invitation
        FROM public.agency_employee_invitations
        WHERE invitation_token = v_token_str::UUID
          AND status = 'pending'
          AND expires_at > NOW();
        
        IF FOUND THEN
            -- Calculer le rôle d'agence
            user_role := CASE v_invitation.employee_role
                WHEN 'admin' THEN 'agency_admin'::public.user_role
                WHEN 'manager' THEN 'agency_manager'::public.user_role
                WHEN 'employee' THEN 'agency_employee'::public.user_role
                WHEN 'driver' THEN 'agency_driver'::public.user_role
                ELSE 'agency_employee'::public.user_role
            END;
            
            RAISE NOTICE 'TRIGGER UNIFIÉ: Invitation valide, rôle = %', user_role;
            
            -- Créer le profil avec les données d'invitation
            INSERT INTO public.users (id, email, full_name, phone, date_of_birth, role, is_active, created_at, updated_at)
            VALUES (
                NEW.id,
                NEW.email,
                COALESCE(NEW.raw_user_meta_data->>'full_name', v_invitation.first_name || ' ' || v_invitation.last_name),
                COALESCE(NEW.raw_user_meta_data->>'phone', v_invitation.phone),
                v_invitation.date_of_birth,
                user_role,
                true,
                NOW(),
                NOW()
            );
            
            -- Créer l'employé
            INSERT INTO public.agency_employees (
                agency_id, user_id, employee_role, notes, created_by, 
                phone, date_of_birth, is_active, hire_date, first_name, last_name,
                created_at, updated_at
            ) VALUES (
                v_invitation.agency_id, NEW.id, v_invitation.employee_role, v_invitation.notes,
                v_invitation.invited_by, COALESCE(NEW.raw_user_meta_data->>'phone', v_invitation.phone),
                v_invitation.date_of_birth, true, CURRENT_DATE, 
                v_invitation.first_name, v_invitation.last_name, NOW(), NOW()
            );
            
            -- Marquer l'invitation comme acceptée
            UPDATE public.agency_employee_invitations
            SET status = 'accepted', accepted_at = NOW(), user_id = NEW.id, updated_at = NOW()
            WHERE invitation_token = v_token_str::UUID;
            
            RAISE NOTICE 'TRIGGER UNIFIÉ: Employé créé avec succès';
            
        ELSE
            -- Invitation invalide, créer comme client
            RAISE NOTICE 'TRIGGER UNIFIÉ: Invitation invalide, création client';
            user_role := 'client'::public.user_role;
            INSERT INTO public.users (id, email, full_name, role, created_at, updated_at)
            VALUES (NEW.id, NEW.email, 
                   COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
                   user_role, NOW(), NOW());
        END IF;
        
    ELSE
        -- ⭐ PRIORITÉ 2: INSCRIPTION NORMALE (logique de handle_new_user)
        RAISE NOTICE 'TRIGGER UNIFIÉ: Inscription normale détectée';
        
        BEGIN
            user_role := COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'client'::public.user_role);
        EXCEPTION WHEN OTHERS THEN
            user_role := 'client'::public.user_role;
        END;

        INSERT INTO public.users (id, email, full_name, role, created_at, updated_at)
        VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
            user_role,
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'TRIGGER UNIFIÉ: Client normal créé avec rôle %', user_role;
    END IF;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'TRIGGER UNIFIÉ: Erreur %: %', SQLSTATE, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Créer le trigger unique qui remplace les deux anciens
CREATE TRIGGER on_auth_user_created_unified
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_all_user_signup();

-- 5. Permissions
GRANT EXECUTE ON FUNCTION handle_all_user_signup() TO authenticated;
GRANT EXECUTE ON FUNCTION handle_all_user_signup() TO service_role;

-- 6. Vérification que l'ancien système est bien supprimé et le nouveau créé
SELECT 
  'Triggers supprimés:' as action,
  trigger_name
FROM information_schema.triggers 
WHERE event_object_schema = 'auth' 
  AND event_object_table = 'users'
  AND trigger_name IN ('handle_new_user_trigger', 'handle_invitation_signup_trigger', 'on_auth_user_created_invitation', 'on_auth_user_created')

UNION ALL

SELECT 
  'Nouveau trigger créé:' as action,
  trigger_name
FROM information_schema.triggers 
WHERE event_object_schema = 'auth' 
  AND event_object_table = 'users'
  AND trigger_name = 'on_auth_user_created_unified';

SELECT 'Migration trigger unifié terminée!' as message;
