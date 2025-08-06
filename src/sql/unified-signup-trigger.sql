-- Trigger modifié pour supporter les invitations ET les inscriptions normales
CREATE OR REPLACE FUNCTION handle_user_signup()
RETURNS TRIGGER AS $$
DECLARE
    user_role public.user_role;
    v_invitation RECORD;
BEGIN
    -- Vérifier d'abord s'il y a un token d'invitation
    IF NEW.raw_user_meta_data ? 'invitation_token' THEN
        -- LOGIQUE D'INVITATION
        SELECT * INTO v_invitation
        FROM public.agency_employee_invitations
        WHERE invitation_token = (NEW.raw_user_meta_data->>'invitation_token')::UUID
          AND status = 'pending'
          AND expires_at > NOW();
        
        IF FOUND THEN
            -- Calculer le rôle basé sur l'invitation
            user_role := CASE v_invitation.employee_role
                WHEN 'admin' THEN 'agency_admin'::public.user_role
                WHEN 'manager' THEN 'agency_manager'::public.user_role
                WHEN 'employee' THEN 'agency_employee'::public.user_role
                WHEN 'driver' THEN 'agency_driver'::public.user_role
                ELSE 'agency_employee'::public.user_role
            END;
            
            -- Créer le profil avec les données d'invitation
            INSERT INTO public.users (id, email, full_name, phone, role, created_at, updated_at)
            VALUES (
                NEW.id,
                NEW.email,
                COALESCE(NEW.raw_user_meta_data->>'full_name', v_invitation.first_name || ' ' || v_invitation.last_name),
                COALESCE(NEW.raw_user_meta_data->>'phone', v_invitation.phone),
                user_role,
                NOW(),
                NOW()
            );
            
            -- Créer l'employé
            INSERT INTO public.agency_employees (
                agency_id, user_id, employee_role, notes, created_by, 
                phone, date_of_birth, is_active, hire_date, first_name, last_name
            ) VALUES (
                v_invitation.agency_id, NEW.id, v_invitation.employee_role, v_invitation.notes,
                v_invitation.invited_by, COALESCE(NEW.raw_user_meta_data->>'phone', v_invitation.phone),
                v_invitation.date_of_birth, true, CURRENT_DATE, 
                v_invitation.first_name, v_invitation.last_name
            );
            
            -- Marquer l'invitation comme acceptée
            UPDATE public.agency_employee_invitations
            SET status = 'accepted', accepted_at = NOW(), user_id = NEW.id, updated_at = NOW()
            WHERE invitation_token = (NEW.raw_user_meta_data->>'invitation_token')::UUID;
            
        ELSE
            -- Invitation invalide, créer comme client normal
            user_role := 'client'::public.user_role;
            INSERT INTO public.users (id, email, full_name, role, created_at, updated_at)
            VALUES (NEW.id, NEW.email, 
                   COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
                   user_role, NOW(), NOW());
        END IF;
    ELSE
        -- LOGIQUE NORMALE (pas d'invitation)
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
    END IF;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'Erreur lors de la création du profil utilisateur: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
