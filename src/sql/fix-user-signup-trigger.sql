-- Solution 1: Modifier le trigger existant pour qu'il laisse la priorité aux invitations
-- À exécuter dans Supabase SQL Editor

CREATE OR REPLACE FUNCTION handle_user_signup()
RETURNS TRIGGER AS $$
DECLARE
    user_role public.user_role;
BEGIN
    -- ⭐ VÉRIFIER D'ABORD S'IL Y A UNE INVITATION
    -- Si c'est une invitation, ne rien faire et laisser l'autre trigger gérer
    IF NEW.raw_user_meta_data ? 'invitation_token' THEN
        RAISE NOTICE 'Invitation détectée, délégation au trigger handle_invitation_signup';
        RETURN NEW; -- ⭐ SORTIR IMMÉDIATEMENT, ne pas créer le profil
    END IF;
    
    -- ⭐ LOGIQUE NORMALE POUR LES CLIENTS (pas d'invitation)
    BEGIN
        user_role := COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'client'::public.user_role);
    EXCEPTION WHEN OTHERS THEN
        user_role := 'client'::public.user_role;
    END;

    -- Insérer le nouvel utilisateur dans la table users
    INSERT INTO public.users (id, email, full_name, role, created_at, updated_at)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        user_role,
        NOW(),
        NOW()
    );
    
    RAISE NOTICE 'Profil client normal créé pour: %', NEW.email;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log l'erreur mais ne pas empêcher la création de l'utilisateur
        RAISE LOG 'Erreur lors de la création du profil utilisateur: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
