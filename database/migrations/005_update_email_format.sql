-- Migration pour modifier le format d'email des employés
-- Retirer .travelhub et garder seulement .com

-- Mise à jour de la fonction generate_employee_email
CREATE OR REPLACE FUNCTION generate_employee_email(
    first_name TEXT,
    last_name TEXT,
    agency_name TEXT
)
RETURNS TEXT AS $$
DECLARE
    base_email TEXT;
    final_email TEXT;
    counter INTEGER := 1;
BEGIN
    -- Nettoyer et formater les noms
    first_name := LOWER(REGEXP_REPLACE(first_name, '[^a-zA-Z]', '', 'g'));
    last_name := LOWER(REGEXP_REPLACE(last_name, '[^a-zA-Z]', '', 'g'));
    agency_name := LOWER(REGEXP_REPLACE(agency_name, '[^a-zA-Z]', '', 'g'));
    
    -- Créer l'email de base (FORMAT MODIFIÉ: nom.prenom@agence.com)
    base_email := first_name || '.' || last_name || '@' || agency_name || '.com';
    final_email := base_email;
    
    -- Vérifier l'unicité et ajouter un numéro si nécessaire
    WHILE EXISTS (SELECT 1 FROM users WHERE email = final_email) LOOP
        counter := counter + 1;
        final_email := first_name || '.' || last_name || counter || '@' || agency_name || '.com';
    END LOOP;
    
    RETURN final_email;
END;
$$ LANGUAGE plpgsql;

-- Commentaire sur la modification
COMMENT ON FUNCTION generate_employee_email(TEXT, TEXT, TEXT) IS 
'Génère un email unique pour un employé au format: prenom.nom@agence.com (travelhub.com retiré)';
