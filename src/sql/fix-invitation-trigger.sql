-- Solution 2: Modifier handle_invitation_signup pour gérer les conflits
-- À exécuter dans Supabase SQL Editor

CREATE OR REPLACE FUNCTION handle_invitation_signup()
RETURNS TRIGGER AS $$
DECLARE
  v_invitation RECORD;
  v_user_role VARCHAR;
  v_token_str TEXT;
BEGIN
  RAISE NOTICE 'TRIGGER INVITATION: Début pour user %', NEW.id;
  
  -- Vérifier si l'utilisateur a un token d'invitation dans ses métadonnées
  IF NEW.raw_user_meta_data ? 'invitation_token' THEN
    v_token_str := NEW.raw_user_meta_data->>'invitation_token';
    RAISE NOTICE 'TRIGGER INVITATION: Token trouvé = %', v_token_str;
    
    -- Récupérer l'invitation
    SELECT * INTO v_invitation
    FROM public.agency_employee_invitations
    WHERE invitation_token = v_token_str::UUID
      AND status = 'pending'
      AND expires_at > NOW();
    
    IF FOUND THEN
      RAISE NOTICE 'TRIGGER INVITATION: Invitation valide trouvée';
      
      -- Déterminer le user_role basé sur employee_role
      v_user_role := CASE v_invitation.employee_role
        WHEN 'admin' THEN 'agency_admin'
        WHEN 'manager' THEN 'agency_manager'
        WHEN 'employee' THEN 'agency_employee'
        WHEN 'driver' THEN 'agency_driver'
        ELSE 'agency_employee'
      END;
      
      RAISE NOTICE 'TRIGGER INVITATION: Rôle calculé = %', v_user_role;
      
      -- ⭐ UTILISER INSERT ... ON CONFLICT pour gérer les doublons
      -- Soit créer, soit mettre à jour si l'autre trigger a déjà créé l'utilisateur
      INSERT INTO public.users (
        id, 
        email, 
        full_name, 
        phone, 
        date_of_birth, 
        role, 
        is_active,
        created_at,
        updated_at
      ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', v_invitation.first_name || ' ' || v_invitation.last_name),
        COALESCE(NEW.raw_user_meta_data->>'phone', v_invitation.phone),
        v_invitation.date_of_birth,
        v_user_role::public.user_role,
        true,
        NOW(),
        NOW()
      ) ON CONFLICT (id) DO UPDATE SET
        role = EXCLUDED.role,              -- ⭐ FORCER LE BON RÔLE
        full_name = EXCLUDED.full_name,
        phone = EXCLUDED.phone,
        date_of_birth = EXCLUDED.date_of_birth,
        updated_at = NOW();
      
      RAISE NOTICE 'TRIGGER INVITATION: Utilisateur créé/mis à jour avec rôle %', v_user_role;
      
      -- Créer l'employé dans agency_employees
      INSERT INTO public.agency_employees (
        agency_id, 
        user_id, 
        employee_role, 
        notes,
        created_by, 
        phone, 
        date_of_birth, 
        is_active, 
        hire_date,
        first_name,
        last_name,
        created_at,
        updated_at
      ) VALUES (
        v_invitation.agency_id,
        NEW.id,
        v_invitation.employee_role,
        v_invitation.notes,
        v_invitation.invited_by,
        COALESCE(NEW.raw_user_meta_data->>'phone', v_invitation.phone),
        v_invitation.date_of_birth,
        true,
        CURRENT_DATE,
        v_invitation.first_name,
        v_invitation.last_name,
        NOW(),
        NOW()
      ) ON CONFLICT (user_id, agency_id) DO UPDATE SET
        employee_role = EXCLUDED.employee_role,
        updated_at = NOW();
      
      RAISE NOTICE 'TRIGGER INVITATION: Employé créé';
      
      -- Marquer l'invitation comme acceptée
      UPDATE public.agency_employee_invitations
      SET 
        status = 'accepted',
        accepted_at = NOW(),
        user_id = NEW.id,
        updated_at = NOW()
      WHERE invitation_token = v_token_str::UUID;
      
      RAISE NOTICE 'TRIGGER INVITATION: Invitation marquée acceptée';
      
    ELSE
      RAISE NOTICE 'TRIGGER INVITATION: Invitation invalide pour token %', v_token_str;
    END IF;
  ELSE
    RAISE NOTICE 'TRIGGER INVITATION: Pas de token d''invitation';
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'TRIGGER INVITATION: Erreur % %', SQLSTATE, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
