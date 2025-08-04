-- Vérifier la structure de la table agencies
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'agencies' 
  AND table_schema = 'public';

-- Ou alternativement, voir la définition complète :
\d agencies;
