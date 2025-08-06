-- Trigger corrigé pour la création d'utilisateur avec gestion des rôles
-- Version corrigée qui retourne TRIGGER au lieu de void

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$  -- IMPORTANT: RETURNS TRIGGER, pas void
DECLARE
    user_role public.user_role;
BEGIN
    -- Extraire le rôle des métadonnées, avec une valeur par défaut
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
    
    RETURN NEW;  -- Maintenant c'est correct car la fonction retourne TRIGGER
EXCEPTION
    WHEN OTHERS THEN
        -- Log l'erreur mais ne pas empêcher la création de l'utilisateur
        RAISE LOG 'Erreur lors de la création du profil utilisateur: %', SQLERRM;
        RETURN NEW;  -- Toujours retourner NEW même en cas d'erreur
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer le trigger
CREATE TRIGGER handle_new_user_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Accorder les permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT INSERT, SELECT ON public.users TO service_role;
