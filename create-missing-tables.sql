-- Script SQL pour créer les tables manquantes dans Supabase
-- Exécutez ce script dans l'éditeur SQL de votre dashboard Supabase

-- 1. Table agencies (principale)
CREATE TABLE IF NOT EXISTS public.agencies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    license_number VARCHAR(100),
    description TEXT,
    logo_url TEXT,
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Table agency_documents
CREATE TABLE IF NOT EXISTS public.agency_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    is_verified BOOLEAN DEFAULT false,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by UUID REFERENCES auth.users(id)
);

-- 3. Indexes pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_agencies_user_id ON public.agencies(user_id);
CREATE INDEX IF NOT EXISTS idx_agencies_email ON public.agencies(email);
CREATE INDEX IF NOT EXISTS idx_agencies_is_verified ON public.agencies(is_verified);
CREATE INDEX IF NOT EXISTS idx_agency_documents_agency_id ON public.agency_documents(agency_id);
CREATE INDEX IF NOT EXISTS idx_agency_documents_type ON public.agency_documents(document_type);

-- 4. Politiques de sécurité RLS (Row Level Security)
ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agency_documents ENABLE ROW LEVEL SECURITY;

-- Politique pour agencies - les utilisateurs peuvent lire/modifier leur propre agence
CREATE POLICY "Users can view their own agency" ON public.agencies
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own agency" ON public.agencies
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own agency" ON public.agencies
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politique pour agency_documents - les utilisateurs peuvent gérer les documents de leur agence
CREATE POLICY "Users can view their agency documents" ON public.agency_documents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.agencies 
            WHERE agencies.id = agency_documents.agency_id 
            AND agencies.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their agency documents" ON public.agency_documents
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.agencies 
            WHERE agencies.id = agency_documents.agency_id 
            AND agencies.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their agency documents" ON public.agency_documents
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.agencies 
            WHERE agencies.id = agency_documents.agency_id 
            AND agencies.user_id = auth.uid()
        )
    );

-- 5. Fonctions pour la mise à jour automatique de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour mettre à jour automatiquement updated_at
CREATE TRIGGER update_agencies_updated_at 
    BEFORE UPDATE ON public.agencies 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. Vérification que les tables users existent et sont correctement configurées
-- Si cette table n'existe pas, la créer
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(50),
    role VARCHAR(50) DEFAULT 'client',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Politique pour users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Trigger pour users
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON public.users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Commentaires pour la documentation
COMMENT ON TABLE public.agencies IS 'Table principale des agences de transport';
COMMENT ON TABLE public.agency_documents IS 'Documents légaux et certificats des agences';
COMMENT ON TABLE public.users IS 'Profils utilisateurs étendus';

-- Afficher le résultat
SELECT 'Tables créées avec succès!' as message;
