import React, { useState } from 'react';
import { completeAgencyRegistration } from '../../lib/registration';
import './Register.css';
import { 
  Building2, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  MapPin, 
  FileText,
  CreditCard,
  Users,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const Register = ({ onBackToLogin }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    // Étape 1: Informations personnelles du responsable
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    
    // Étape 2: Informations de l'agence
    agencyName: '',
    businessType: 'transport', // transport, tour-operator, both
    registrationNumber: '',
    taxId: '',
    foundedYear: '',
    description: '',
    
    // Étape 3: Adresse et localisation
    address: '',
    city: '',
    region: '',
    country: 'Cameroun',
    postalCode: '',
    
    // Étape 4: Services et capacités
    services: [], // transport-intercity, transport-urban, tours, charter
    fleetSize: '',
    employeeCount: '',
    dailyCapacity: '',
    
    // Étape 5: Documents et vérification
    businessLicense: null,
    transportLicense: null,
    insurance: null,
    terms: false,
    privacy: false
  });

  const steps = [
    {
      title: 'Responsable',
      description: 'Informations personnelles',
      icon: User,
      fields: ['firstName', 'lastName', 'email', 'phone', 'password', 'confirmPassword']
    },
    {
      title: 'Agence',
      description: 'Informations de l\'entreprise',
      icon: Building2,
      fields: ['agencyName', 'businessType', 'registrationNumber', 'taxId', 'foundedYear']
    },
    {
      title: 'Localisation',
      description: 'Adresse et contact',
      icon: MapPin,
      fields: ['address', 'city', 'region', 'country', 'postalCode']
    },
    {
      title: 'Services',
      description: 'Capacités et services',
      icon: Users,
      fields: ['services', 'fleetSize', 'employeeCount', 'dailyCapacity']
    },
    {
      title: 'Vérification',
      description: 'Documents requis',
      icon: FileText,
      fields: ['businessLicense', 'transportLicense', 'insurance', 'terms', 'privacy']
    }
  ];

  const businessTypes = [
    { value: 'transport', label: 'Transport de voyageurs', description: 'Lignes régulières intercités' },
    { value: 'tour-operator', label: 'Tour opérateur', description: 'Voyages organisés et excursions' },
    { value: 'both', label: 'Mixte', description: 'Transport + Tours' }
  ];

  const serviceOptions = [
    { value: 'transport-intercity', label: 'Transport intercités', icon: '🚌' },
    { value: 'transport-urban', label: 'Transport urbain', icon: '🚐' },
    { value: 'tours', label: 'Voyages organisés', icon: '✈️' },
    { value: 'charter', label: 'Affrètement', icon: '🎯' }
  ];

  const cameroonRegions = [
    'Adamaoua', 'Centre', 'Est', 'Extrême-Nord', 'Littoral', 
    'Nord', 'Nord-Ouest', 'Ouest', 'Sud', 'Sud-Ouest'
  ];

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleServiceToggle = (service) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  const handleFileUpload = (field, file) => {
    setFormData(prev => ({
      ...prev,
      [field]: file
    }));
  };

  const validateStep = (stepIndex) => {
    const stepFields = steps[stepIndex].fields;
    
    for (const field of stepFields) {
      if (field === 'services') {
        if (formData.services.length === 0) return false;
      } else if (field === 'terms' || field === 'privacy') {
        if (!formData[field]) return false;
      } else if (field === 'confirmPassword') {
        if (formData.password !== formData.confirmPassword) return false;
      } else if (!formData[field] && field !== 'postalCode') {
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;
    
    setIsLoading(true);
    setError('');
    
    console.log("Soumission du formulaire d'inscription...", formData);
    
    try {
      const result = await completeAgencyRegistration(formData);
      
      console.log("Résultat de l'inscription:", result);
      
      if (result.error) {
        throw result.error;
      }
      
      setRegistrationSuccess(true);
      console.log("Inscription réussie !");
      // La redirection se fera automatiquement via le contexte d'authentification
      // après confirmation de l'email
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      
      let errorMessage = 'Une erreur est survenue lors de l\'inscription';
      
      if (error.message.includes('email')) {
        errorMessage = 'Cette adresse email est déjà utilisée';
      } else if (error.message.includes('password')) {
        errorMessage = 'Le mot de passe ne respecte pas les critères requis';
      } else if (error.message.includes('network')) {
        errorMessage = 'Erreur de connexion. Vérifiez votre connexion internet';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="step-indicator">
      {steps.map((step, index) => (
        <div key={index} className={`step ${index <= currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}>
          <div className="step-circle">
            {index < currentStep ? (
              <Check size={16} />
            ) : (
              <step.icon size={16} />
            )}
          </div>
          <div className="step-info">
            <span className="step-title">{step.title}</span>
            <span className="step-description">{step.description}</span>
          </div>
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="step-content">
      <h3 className="step-heading">Informations du responsable</h3>
      <p className="step-subheading">Créez votre compte administrateur</p>
      
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Prénom</label>
          <div className="input-container">
            <User size={16} className="input-icon" />
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              className="form-input"
              placeholder="Votre prénom"
              required
            />
          </div>
        </div>
        
        <div className="form-group">
          <label className="form-label">Nom</label>
          <div className="input-container">
            <User size={16} className="input-icon" />
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              className="form-input"
              placeholder="Votre nom"
              required
            />
          </div>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Email professionnel</label>
        <div className="input-container">
          <Mail size={16} className="input-icon" />
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className="form-input"
            placeholder="contact@votre-agence.com"
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Téléphone</label>
        <div className="input-container">
          <Phone size={16} className="input-icon" />
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            className="form-input"
            placeholder="+237 6XX XXX XXX"
            required
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Mot de passe</label>
          <div className="input-container">
            <Lock size={16} className="input-icon" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              className="form-input"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Confirmer le mot de passe</label>
          <div className="input-container">
            <Lock size={16} className="input-icon" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              className="form-input"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="step-content">
      <h3 className="step-heading">Informations de l'agence</h3>
      <p className="step-subheading">Détails de votre entreprise</p>

      <div className="form-group">
        <label className="form-label">Nom de l'agence</label>
        <div className="input-container">
          <Building2 size={16} className="input-icon" />
          <input
            type="text"
            value={formData.agencyName}
            onChange={(e) => handleChange('agencyName', e.target.value)}
            className="form-input"
            placeholder="Ex: Transport Express Cameroun"
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Type d'activité</label>
        <div className="business-types">
          {businessTypes.map((type) => (
            <div
              key={type.value}
              className={`business-type-card ${formData.businessType === type.value ? 'selected' : ''}`}
              onClick={() => handleChange('businessType', type.value)}
            >
              <div className="business-type-header">
                <div className="radio-button">
                  {formData.businessType === type.value && <div className="radio-selected" />}
                </div>
                <h4>{type.label}</h4>
              </div>
              <p>{type.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Numéro d'immatriculation</label>
          <div className="input-container">
            <FileText size={16} className="input-icon" />
            <input
              type="text"
              value={formData.registrationNumber}
              onChange={(e) => handleChange('registrationNumber', e.target.value)}
              className="form-input"
              placeholder="RC/YAO/2024/A/123"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Numéro fiscal</label>
          <div className="input-container">
            <CreditCard size={16} className="input-icon" />
            <input
              type="text"
              value={formData.taxId}
              onChange={(e) => handleChange('taxId', e.target.value)}
              className="form-input"
              placeholder="M070512345678P"
              required
            />
          </div>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Année de création</label>
        <div className="input-container">
          <Building2 size={16} className="input-icon" />
          <input
            type="number"
            min="1950"
            max={new Date().getFullYear()}
            value={formData.foundedYear}
            onChange={(e) => handleChange('foundedYear', e.target.value)}
            className="form-input"
            placeholder="2020"
            required
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="step-content">
      <h3 className="step-heading">Localisation</h3>
      <p className="step-subheading">Adresse de votre agence</p>

      <div className="form-group">
        <label className="form-label">Adresse complète</label>
        <div className="input-container">
          <MapPin size={16} className="input-icon" />
          <input
            type="text"
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            className="form-input"
            placeholder="123 Avenue de l'Indépendance"
            required
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Ville</label>
          <div className="input-container">
            <MapPin size={16} className="input-icon" />
            <input
              type="text"
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              className="form-input"
              placeholder="Yaoundé"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Région</label>
          <div className="input-container">
            <MapPin size={16} className="input-icon" />
            <select
              value={formData.region}
              onChange={(e) => handleChange('region', e.target.value)}
              className="form-input"
              required
            >
              <option value="">Sélectionner une région</option>
              {cameroonRegions.map((region) => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Pays</label>
          <div className="input-container">
            <MapPin size={16} className="input-icon" />
            <input
              type="text"
              value={formData.country}
              onChange={(e) => handleChange('country', e.target.value)}
              className="form-input"
              placeholder="Cameroun"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Code postal (optionnel)</label>
          <div className="input-container">
            <MapPin size={16} className="input-icon" />
            <input
              type="text"
              value={formData.postalCode}
              onChange={(e) => handleChange('postalCode', e.target.value)}
              className="form-input"
              placeholder="00237"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="step-content">
      <h3 className="step-heading">Services et capacités</h3>
      <p className="step-subheading">Définissez vos activités</p>

      <div className="form-group">
        <label className="form-label">Services proposés</label>
        <div className="services-grid">
          {serviceOptions.map((service) => (
            <div
              key={service.value}
              className={`service-card ${formData.services.includes(service.value) ? 'selected' : ''}`}
              onClick={() => handleServiceToggle(service.value)}
            >
              <div className="service-icon">{service.icon}</div>
              <span className="service-label">{service.label}</span>
              {formData.services.includes(service.value) && (
                <Check size={16} className="service-check" />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Taille de la flotte</label>
          <div className="input-container">
            <Users size={16} className="input-icon" />
            <input
              type="number"
              min="1"
              value={formData.fleetSize}
              onChange={(e) => handleChange('fleetSize', e.target.value)}
              className="form-input"
              placeholder="5"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Nombre d'employés</label>
          <div className="input-container">
            <Users size={16} className="input-icon" />
            <input
              type="number"
              min="1"
              value={formData.employeeCount}
              onChange={(e) => handleChange('employeeCount', e.target.value)}
              className="form-input"
              placeholder="10"
              required
            />
          </div>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Capacité journalière (passagers)</label>
        <div className="input-container">
          <Users size={16} className="input-icon" />
          <input
            type="number"
            min="1"
            value={formData.dailyCapacity}
            onChange={(e) => handleChange('dailyCapacity', e.target.value)}
            className="form-input"
            placeholder="200"
            required
          />
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="step-content">
      <h3 className="step-heading">Documents et vérification</h3>
      <p className="step-subheading">Finalisez votre inscription</p>

      <div className="documents-section">
        <div className="document-upload">
          <label className="document-label">
            <FileText size={24} />
            <span>Licence commerciale</span>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFileUpload('businessLicense', e.target.files[0])}
              hidden
            />
          </label>
          {formData.businessLicense && (
            <span className="file-name">{formData.businessLicense.name}</span>
          )}
        </div>

        <div className="document-upload">
          <label className="document-label">
            <FileText size={24} />
            <span>Licence de transport</span>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFileUpload('transportLicense', e.target.files[0])}
              hidden
            />
          </label>
          {formData.transportLicense && (
            <span className="file-name">{formData.transportLicense.name}</span>
          )}
        </div>

        <div className="document-upload">
          <label className="document-label">
            <FileText size={24} />
            <span>Attestation d'assurance</span>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFileUpload('insurance', e.target.files[0])}
              hidden
            />
          </label>
          {formData.insurance && (
            <span className="file-name">{formData.insurance.name}</span>
          )}
        </div>
      </div>

      <div className="terms-section">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={formData.terms}
            onChange={(e) => handleChange('terms', e.target.checked)}
            required
          />
          <span className="checkmark"></span>
          J'accepte les <a href="#" className="link">conditions d'utilisation</a>
        </label>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={formData.privacy}
            onChange={(e) => handleChange('privacy', e.target.checked)}
            required
          />
          <span className="checkmark"></span>
          J'accepte la <a href="#" className="link">politique de confidentialité</a>
        </label>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0: return renderStep1();
      case 1: return renderStep2();
      case 2: return renderStep3();
      case 3: return renderStep4();
      case 4: return renderStep5();
      default: return renderStep1();
    }
  };

  // Écran de succès d'inscription
  if (registrationSuccess) {
    return (
      <div className="register-container">
        <div className="register-card">
          <div className="success-message">
            <CheckCircle size={64} className="success-icon" />
            <h2>Inscription réussie !</h2>
            <p>
              Votre compte agence a été créé avec succès. 
              Un email de confirmation a été envoyé à <strong>{formData.email}</strong>.
            </p>
            <p>
              Veuillez cliquer sur le lien dans l'email pour activer votre compte, 
              puis votre agence sera soumise à vérification par notre équipe.
            </p>
            <button 
              onClick={onBackToLogin}
              className="btn btn-primary"
            >
              Retour à la connexion
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h1 className="register-title">Créer un compte agence</h1>
          <p className="register-subtitle">Rejoignez TravelHub</p>
        </div>

        {renderStepIndicator()}

        <form onSubmit={handleSubmit} className="register-form">
          {renderCurrentStep()}

          <div className="form-navigation">
            {currentStep > 0 && (
              <button type="button" className="btn btn-outline" onClick={prevStep}>
                <ArrowLeft size={16} />
                Précédent
              </button>
            )}
            
            <div className="nav-spacer" />
            
            {currentStep < steps.length - 1 ? (
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={nextStep}
                disabled={!validateStep(currentStep)}
              >
                Suivant
                <ArrowRight size={16} />
              </button>
            ) : (
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={!validateStep(currentStep) || isLoading}
              >
                {isLoading ? 'Création...' : 'Créer le compte'}
              </button>
            )}
          </div>
        </form>

        <div className="register-footer">
          <p>
            Déjà un compte ? 
            <button className="link-button" onClick={onBackToLogin}>
              Se connecter
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
