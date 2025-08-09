import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import './CreateAgencyForm.css';

const CreateAgencyForm = ({ onSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        agencyName: '',
        agencyEmail: '',
        agencyPhone: '',
        agencyAddress: '',
        agencyLicense: '',
        agencyDescription: '',
        adminFirstName: '',
        adminLastName: '',
        adminPhone: ''
    });
    
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const generateAdminEmail = (firstName, lastName, agencyName) => {
        const cleanFirst = firstName.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
        const cleanLast = lastName.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
        const cleanAgency = agencyName.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
        return `${cleanFirst}.${cleanLast}@${cleanAgency}.com`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            // 1. Générer l'email de l'admin
            const adminEmail = generateAdminEmail(
                formData.adminFirstName,
                formData.adminLastName,
                formData.agencyName
            );

            // 2. Créer l'utilisateur admin de l'agence
            const { data: adminUser, error: adminError } = await supabase
                .from('users')
                .insert([{
                    email: adminEmail,
                    role: 'agence',
                    full_name: `${formData.adminFirstName} ${formData.adminLastName}`,
                    phone: formData.adminPhone,
                    is_active: true,
                    is_generated_user: true,
                    password_changed: false
                }])
                .select()
                .single();

            if (adminError) throw adminError;

            // 3. Créer l'agence
            const { data: agency, error: agencyError } = await supabase
                .from('agencies')
                .insert([{
                    user_id: adminUser.id,
                    name: formData.agencyName,
                    email: formData.agencyEmail,
                    phone: formData.agencyPhone,
                    address: formData.agencyAddress,
                    license_number: formData.agencyLicense,
                    description: formData.agencyDescription,
                    is_verified: true,
                    verified_at: new Date().toISOString()
                }])
                .select()
                .single();

            if (agencyError) throw agencyError;

            // 4. Mettre à jour l'utilisateur avec l'agency_id
            const { error: updateError } = await supabase
                .from('users')
                .update({ agency_id: agency.id })
                .eq('id', adminUser.id);

            if (updateError) throw updateError;

            // 5. Créer une entrée dans agency_employees
            const { error: employeeError } = await supabase
                .from('agency_employees')
                .insert([{
                    agency_id: agency.id,
                    user_id: adminUser.id,
                    employee_role: 'admin',
                    hire_date: new Date().toISOString().split('T')[0],
                    is_active: true
                }]);

            if (employeeError) throw employeeError;

            // 6. Générer un lien d'invitation (simulation pour l'instant)
            const invitationUrl = `${window.location.origin}/admin-setup?email=${adminEmail}&agency=${agency.id}`;

            setMessage({
                type: 'success',
                text: `✅ Agence créée avec succès !\n📧 Admin: ${adminEmail}\n🔗 Lien d'invitation: ${invitationUrl}`
            });

            // Réinitialiser le formulaire
            setFormData({
                agencyName: '',
                agencyEmail: '',
                agencyPhone: '',
                agencyAddress: '',
                agencyLicense: '',
                agencyDescription: '',
                adminFirstName: '',
                adminLastName: '',
                adminPhone: ''
            });

            // Informer le composant parent du succès
            if (onSuccess) {
                onSuccess({
                    agency: agency,
                    admin: adminUser,
                    invitationUrl: invitationUrl
                });
            }

        } catch (error) {
            console.error('Erreur lors de la création:', error);
            setMessage({
                type: 'error',
                text: `❌ Erreur: ${error.message}`
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-agency-form-container">
            <h2 className="form-title">Créer une nouvelle agence</h2>
            
            {message.text && (
                <div className={`message ${message.type}`}>
                    {message.text.split('\n').map((line, i) => (
                        <div key={i}>{line}</div>
                    ))}
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="create-form">
                <div className="form-section">
                    <h3>Informations de l'agence</h3>
                    <div className="form-group">
                        <label htmlFor="agencyName">Nom de l'agence *</label>
                        <input
                            type="text"
                            id="agencyName"
                            name="agencyName"
                            value={formData.agencyName}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="agencyEmail">Email de l'agence *</label>
                        <input
                            type="email"
                            id="agencyEmail"
                            name="agencyEmail"
                            value={formData.agencyEmail}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="agencyPhone">Téléphone *</label>
                        <input
                            type="text"
                            id="agencyPhone"
                            name="agencyPhone"
                            value={formData.agencyPhone}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="agencyAddress">Adresse *</label>
                        <input
                            type="text"
                            id="agencyAddress"
                            name="agencyAddress"
                            value={formData.agencyAddress}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="agencyLicense">Numéro de licence</label>
                        <input
                            type="text"
                            id="agencyLicense"
                            name="agencyLicense"
                            value={formData.agencyLicense}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="agencyDescription">Description</label>
                        <textarea
                            id="agencyDescription"
                            name="agencyDescription"
                            value={formData.agencyDescription}
                            onChange={handleInputChange}
                            rows="3"
                        />
                    </div>
                </div>

                <div className="form-section">
                    <h3>Informations de l'administrateur</h3>
                    <div className="form-group">
                        <label htmlFor="adminFirstName">Prénom *</label>
                        <input
                            type="text"
                            id="adminFirstName"
                            name="adminFirstName"
                            value={formData.adminFirstName}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="adminLastName">Nom *</label>
                        <input
                            type="text"
                            id="adminLastName"
                            name="adminLastName"
                            value={formData.adminLastName}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="adminPhone">Téléphone</label>
                        <input
                            type="text"
                            id="adminPhone"
                            name="adminPhone"
                            value={formData.adminPhone}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>

                <div className="form-actions">
                    <button 
                        type="button" 
                        onClick={onCancel} 
                        className="cancel-button"
                        disabled={loading}
                    >
                        Annuler
                    </button>
                    <button 
                        type="submit" 
                        className="submit-button"
                        disabled={loading}
                    >
                        {loading ? 'Création en cours...' : 'Créer l\'agence'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateAgencyForm;
