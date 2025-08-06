-- Script pour vérifier et créer les tables manquantes si nécessaire
-- À exécuter AVANT le trigger

-- 1. Vérifier les tables existantes
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('users', 'agency_employees', 'agency_employee_invitations', 'agencies');

-- 2. Si la table 'users' n'existe pas, la créer
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  date_of_birth DATE,
  role TEXT DEFAULT 'user',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Si la table 'agency_employees' n'existe pas, vérifier sa structure
-- (Vous devez adapter selon votre structure existante)

-- 4. Activer RLS si nécessaire
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 5. Créer des politiques basiques pour les utilisateurs
CREATE POLICY "Users can read own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

SELECT 'Tables vérifiées/créées avec succès!' as message;
