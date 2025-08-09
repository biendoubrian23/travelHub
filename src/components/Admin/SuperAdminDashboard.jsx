import React from 'react';
import Dashboard from './Dashboard';
import Agencies from './Agencies';
import { useAuth } from '../../contexts/AuthContext';
import './SuperAdminDashboard.css';
import './SuperAdminSidebar.css';
import './SuperAdminMain.css';
import './SuperAdminComponents.css';

const SuperAdminDashboard = () => {
  const { signOut } = useAuth();
  const [activeTab, setActiveTab] = React.useState('dashboard');
  
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };
  
  const handleAction = (actionId) => {
    console.log('Action clicked:', actionId);
    
    // Navigation vers d'autres onglets en fonction de l'action
    switch (actionId) {
      case 'add-agency':
        setActiveTab('agencies');
        break;
      case 'view-reports':
        setActiveTab('finance');
        break;
      case 'manage-users':
        setActiveTab('users');
        break;
      default:
        break;
    }
  };
    const [showCreateForm, setShowCreateForm] = useState(false)
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
    })
    const [message, setMessage] = useState({ type: '', text: '' })

    // Navigation tabs
    const navigationTabs = [
        { id: 'dashboard', label: 'Tableau de bord', icon: '􀏗' },
        { id: 'agencies', label: 'Agences', icon: '􀙯' },
        { id: 'analytics', label: 'Statistiques', icon: '􀬟' },
        { id: 'finance', label: 'Finances', icon: '􀑉' },
        { id: 'users', label: 'Utilisateurs', icon: '􀉩' }
    ]

    // Charger les données
    useEffect(() => {
        loadDashboardData()
    }, [])

    const loadDashboardData = async () => {
        try {
            await Promise.all([
                loadAgencies(),
                loadStats()
            ])
        } catch (error) {
            console.error('Erreur lors du chargement:', error)
        } finally {
            setLoading(false)
        }
    }

    const loadStats = async () => {
        try {
            // Charger les statistiques globales
            const [agenciesResult, bookingsResult] = await Promise.all([
                supabase.from('agencies').select('*'),
                supabase.from('bookings').select('*')
            ])

            const totalAgencies = agenciesResult.data?.length || 0
            const activeAgencies = agenciesResult.data?.filter(a => a.is_verified).length || 0
            const totalBookings = bookingsResult.data?.length || 0
            const pendingVerifications = agenciesResult.data?.filter(a => !a.is_verified).length || 0

            setStats({
                totalAgencies,
                activeAgencies,
                totalBookings,
                monthlyRevenue: 0, // À calculer selon votre logique
                pendingVerifications
            })
        } catch (error) {
            console.error('Erreur lors du chargement des stats:', error)
        }
    }

    const loadAgencies = async () => {
        try {
            const { data, error } = await supabase
                .from('agencies')
                .select(`
                    *,
                    user:users(full_name, email, role)
                `)
                .order('created_at', { ascending: false })

            if (error) throw error
            setAgencies(data || [])
        } catch (error) {
            console.error('Erreur lors du chargement des agences:', error)
            setMessage({ type: 'error', text: 'Erreur lors du chargement des agences' })
        } finally {
            setLoading(false)
        }
    }

    const generateAdminEmail = (firstName, lastName, agencyName) => {
        const cleanFirst = firstName.toLowerCase().trim().replace(/[^a-z0-9]/g, '')
        const cleanLast = lastName.toLowerCase().trim().replace(/[^a-z0-9]/g, '')
        const cleanAgency = agencyName.toLowerCase().trim().replace(/[^a-z0-9]/g, '')
        return `${cleanFirst}.${cleanLast}@${cleanAgency}.com`
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleCreateAgency = async (e) => {
        e.preventDefault()
        setCreating(true)
        setMessage({ type: '', text: '' })

        try {
            // 1. Générer l'email de l'admin
            const adminEmail = generateAdminEmail(
                formData.adminFirstName,
                formData.adminLastName,
                formData.agencyName
            )

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
                .single()

            if (adminError) throw adminError

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
                .single()

            if (agencyError) throw agencyError

            // 4. Mettre à jour l'utilisateur avec l'agency_id
            const { error: updateError } = await supabase
                .from('users')
                .update({ agency_id: agency.id })
                .eq('id', adminUser.id)

            if (updateError) throw updateError

            // 5. Créer une entrée dans agency_employees
            const { error: employeeError } = await supabase
                .from('agency_employees')
                .insert([{
                    agency_id: agency.id,
                    user_id: adminUser.id,
                    employee_role: 'admin',
                    hire_date: new Date().toISOString().split('T')[0],
                    is_active: true
                }])

            if (employeeError) throw employeeError

            // 6. Générer un lien d'invitation (simulation pour l'instant)
            const invitationUrl = `${window.location.origin}/admin-setup?email=${adminEmail}&agency=${agency.id}`

            setMessage({
                type: 'success',
                text: `✅ Agence créée avec succès !
                📧 Admin: ${adminEmail}
                🔗 Lien d'invitation: ${invitationUrl}`
            })

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
            })

            setShowCreateForm(false)
            loadAgencies() // Recharger la liste

        } catch (error) {
            console.error('Erreur lors de la création:', error)
            setMessage({
                type: 'error',
                text: `❌ Erreur: ${error.message}`
            })
        } finally {
            setCreating(false)
        }
    }

    const renderDashboard = () => (
        <div className="dashboard-content">
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">􀙯</div>
                    <div className="stat-info" style={{textAlign: 'center'}}>
                        <h3 style={{margin: '5px 0'}}>{stats.totalAgencies}</h3>
                        <p style={{margin: '5px 0'}}>Agences Total</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">􀋦</div>
                    <div className="stat-info" style={{textAlign: 'center'}}>
                        <h3 style={{margin: '5px 0'}}>{stats.activeAgencies}</h3>
                        <p style={{margin: '5px 0'}}>Agences Actives</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">􀉪</div>
                    <div className="stat-info" style={{textAlign: 'center'}}>
                        <h3 style={{margin: '5px 0'}}>{stats.totalBookings}</h3>
                        <p style={{margin: '5px 0'}}>Réservations</p>
                    </div>
                </div>
                <div className="stat-card warning">
                    <div className="stat-icon">􀐫</div>
                    <div className="stat-info" style={{textAlign: 'center'}}>
                        <h3 style={{margin: '5px 0'}}>{stats.pendingVerifications}</h3>
                        <p style={{margin: '5px 0'}}>En Attente</p>
                    </div>
                </div>
            </div>

            <div className="quick-actions">
                <h3>Actions Rapides</h3>
                <div className="actions-grid">
                    <button 
                        className="action-card center-icon-content"
                        onClick={() => setActiveTab('agencies')}
                    >
                        <div className="action-icon center-icon">􀙯</div>
                        <span className="center-text" style={{fontWeight: 500}}>Nouvelle Agence</span>
                    </button>
                    <button 
                        className="action-card center-icon-content"
                        onClick={() => setActiveTab('finance')}
                    >
                        <div className="action-icon center-icon">􀑉</div>
                        <span className="center-text" style={{fontWeight: 500}}>Finances</span>
                    </button>
                    <button 
                        className="action-card center-icon-content"
                        onClick={() => setActiveTab('analytics')}
                    >
                        <div className="action-icon center-icon">􀬟</div>
                        <span className="center-text" style={{fontWeight: 500}}>Statistiques</span>
                    </button>
                </div>
            </div>

            <div className="recent-activity">
                <h3>Activité Récente</h3>
                <div className="activity-list">
                    <div className="activity-item">
                        <div className="activity-icon">🏢</div>
                        <div className="activity-content">
                            <p><strong>Nouvelle agence</strong> en attente de vérification</p>
                            <span className="activity-time">Il y a 2 heures</span>
                        </div>
                    </div>
                    <div className="activity-item">
                        <div className="activity-icon">📋</div>
                        <div className="activity-content">
                            <p><strong>150 nouvelles réservations</strong> aujourd'hui</p>
                            <span className="activity-time">Il y a 4 heures</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

    const renderAgencies = () => (
        <div className="agencies-content">
            <div className="content-header">
                <h2>Gestion des Agences</h2>
                <button 
                    className="btn-primary"
                    onClick={() => setShowCreateForm(true)}
                >
                    <span>➕</span> Nouvelle Agence
                </button>
            </div>

            {showCreateForm && (
                <div className="modal-overlay" onClick={() => setShowCreateForm(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Créer une nouvelle agence</h3>
                            <button 
                                className="close-btn"
                                onClick={() => setShowCreateForm(false)}
                            >
                                ✕
                            </button>
                        </div>
                        <form onSubmit={handleCreateAgency} className="create-form">
                            <div className="form-sections">
                                <div className="form-section">
                                    <h4>Informations Agence</h4>
                                    <div className="input-group">
                                        <input
                                            type="text"
                                            name="agencyName"
                                            value={formData.agencyName}
                                            onChange={handleInputChange}
                                            placeholder="Nom de l'agence"
                                            required
                                        />
                                    </div>
                                    <div className="input-group">
                                        <input
                                            type="email"
                                            name="agencyEmail"
                                            value={formData.agencyEmail}
                                            onChange={handleInputChange}
                                            placeholder="Email de l'agence"
                                            required
                                        />
                                    </div>
                                    <div className="input-group">
                                        <input
                                            type="tel"
                                            name="agencyPhone"
                                            value={formData.agencyPhone}
                                            onChange={handleInputChange}
                                            placeholder="Téléphone"
                                            required
                                        />
                                    </div>
                                    <div className="input-group">
                                        <textarea
                                            name="agencyAddress"
                                            value={formData.agencyAddress}
                                            onChange={handleInputChange}
                                            placeholder="Adresse complète"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-section">
                                    <h4>Administrateur</h4>
                                    <div className="input-group">
                                        <input
                                            type="text"
                                            name="adminFirstName"
                                            value={formData.adminFirstName}
                                            onChange={handleInputChange}
                                            placeholder="Prénom"
                                            required
                                        />
                                    </div>
                                    <div className="input-group">
                                        <input
                                            type="text"
                                            name="adminLastName"
                                            value={formData.adminLastName}
                                            onChange={handleInputChange}
                                            placeholder="Nom"
                                            required
                                        />
                                    </div>
                                    <div className="input-group">
                                        <input
                                            type="tel"
                                            name="adminPhone"
                                            value={formData.adminPhone}
                                            onChange={handleInputChange}
                                            placeholder="Téléphone admin"
                                        />
                                    </div>
                                    {formData.adminFirstName && formData.adminLastName && formData.agencyName && (
                                        <div className="generated-email-preview">
                                            <span>📧 Email généré: </span>
                                            <code>{generateAdminEmail(formData.adminFirstName, formData.adminLastName, formData.agencyName)}</code>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button 
                                    type="button" 
                                    className="btn-secondary"
                                    onClick={() => setShowCreateForm(false)}
                                >
                                    Annuler
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn-primary"
                                    disabled={creating}
                                >
                                    {creating ? 'Création...' : 'Créer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="agencies-grid">
                {agencies.map(agency => (
                    <div key={agency.id} className="agency-card-modern">
                        <div className="agency-card-header">
                            <div className="agency-avatar">
                                {agency.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="agency-info">
                                <h4>{agency.name}</h4>
                                <p>{agency.email}</p>
                            </div>
                            <div className="agency-status">
                                {agency.is_verified ? (
                                    <span className="status-badge active">✓ Vérifiée</span>
                                ) : (
                                    <span className="status-badge pending">⏳ En attente</span>
                                )}
                            </div>
                        </div>
                        <div className="agency-metrics">
                            <div className="metric">
                                <span className="metric-value">⭐ {agency.rating?.toFixed(1) || '0.0'}</span>
                                <span className="metric-label">Note</span>
                            </div>
                            <div className="metric">
                                <span className="metric-value">📝 {agency.total_reviews || 0}</span>
                                <span className="metric-label">Avis</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return renderDashboard()
            case 'agencies':
                return renderAgencies()
            case 'analytics':
                return <div className="tab-content">
                    <h2><span className="modern-icon">􀬟</span> Statistiques</h2>
                    <div className="stats-overview">
                        <div className="chart-container">
                            <h3>Croissance des agences</h3>
                            <div className="chart-placeholder">
                                <div className="bar-chart">
                                    <div className="bar" style={{height: '60%'}}><span>Jan</span></div>
                                    <div className="bar" style={{height: '75%'}}><span>Fév</span></div>
                                    <div className="bar" style={{height: '45%'}}><span>Mar</span></div>
                                    <div className="bar" style={{height: '90%'}}><span>Avr</span></div>
                                    <div className="bar" style={{height: '85%'}}><span>Mai</span></div>
                                    <div className="bar" style={{height: '100%'}}><span>Juin</span></div>
                                </div>
                            </div>
                        </div>
                        <div className="analytics-metrics">
                            <div className="metric-card">
                                <h4>Taux de conversion</h4>
                                <p className="metric-value">68%</p>
                                <p className="metric-change positive">+12% ce mois</p>
                            </div>
                            <div className="metric-card">
                                <h4>Temps moyen sur le site</h4>
                                <p className="metric-value">4m 32s</p>
                                <p className="metric-change positive">+40s ce mois</p>
                            </div>
                        </div>
                    </div>
                </div>
            case 'finance':
                return <div className="tab-content">
                    <h2><span className="modern-icon">􀑉</span> Finances</h2>
                    <div className="finance-dashboard">
                        <div className="finance-summary">
                            <div className="finance-card">
                                <h3>Revenu mensuel</h3>
                                <p className="finance-amount">15 240 €</p>
                                <p className="finance-change positive">+8.5% depuis le mois dernier</p>
                            </div>
                            <div className="finance-card">
                                <h3>Revenu annuel</h3>
                                <p className="finance-amount">132 580 €</p>
                                <p className="finance-change positive">+22% depuis l'année dernière</p>
                            </div>
                            <div className="finance-card">
                                <h3>Commission moyenne</h3>
                                <p className="finance-amount">245 €</p>
                                <p className="finance-change neutral">Stable</p>
                            </div>
                        </div>
                        <div className="recent-transactions">
                            <h3>Transactions récentes</h3>
                            <div className="transaction-list">
                                <div className="transaction-item">
                                    <div className="transaction-icon deposit">􀁍</div>
                                    <div className="transaction-details">
                                        <p className="transaction-name">Agence Voyage Express</p>
                                        <p className="transaction-date">Aujourd'hui, 14:30</p>
                                    </div>
                                    <div className="transaction-amount deposit">+1 250 €</div>
                                </div>
                                <div className="transaction-item">
                                    <div className="transaction-icon deposit">􀁍</div>
                                    <div className="transaction-details">
                                        <p className="transaction-name">Africa Tours</p>
                                        <p className="transaction-date">Hier, 09:15</p>
                                    </div>
                                    <div className="transaction-amount deposit">+850 €</div>
                                </div>
                                <div className="transaction-item">
                                    <div className="transaction-icon expense">􀁏</div>
                                    <div className="transaction-details">
                                        <p className="transaction-name">Maintenance serveur</p>
                                        <p className="transaction-date">3 août, 10:22</p>
                                    </div>
                                    <div className="transaction-amount expense">-350 €</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            case 'users':
                return <div className="tab-content">
                    <h2><span className="modern-icon">􀉩</span> Utilisateurs</h2>
                    <div className="users-dashboard">
                        <div className="users-summary">
                            <div className="user-metric-card">
                                <h3>Total utilisateurs</h3>
                                <p className="user-metric-value">1,284</p>
                                <p className="user-metric-change positive">+124 ce mois</p>
                            </div>
                            <div className="user-metric-card">
                                <h3>Admins d'agence</h3>
                                <p className="user-metric-value">24</p>
                                <p className="user-metric-change positive">+3 ce mois</p>
                            </div>
                            <div className="user-metric-card">
                                <h3>Taux de rétention</h3>
                                <p className="user-metric-value">94%</p>
                                <p className="user-metric-change positive">+2% ce mois</p>
                            </div>
                        </div>
                        <div className="recent-users">
                            <h3>Nouveaux utilisateurs</h3>
                            <div className="user-list">
                                <div className="user-item">
                                    <div className="user-avatar">JD</div>
                                    <div className="user-details">
                                        <p className="user-name">Jean Dupont</p>
                                        <p className="user-role">Admin d'agence</p>
                                    </div>
                                    <div className="user-date">Il y a 2 heures</div>
                                </div>
                                <div className="user-item">
                                    <div className="user-avatar">MM</div>
                                    <div className="user-details">
                                        <p className="user-name">Marie Martin</p>
                                        <p className="user-role">Agent</p>
                                    </div>
                                    <div className="user-date">Il y a 6 heures</div>
                                </div>
                                <div className="user-item">
                                    <div className="user-avatar">PL</div>
                                    <div className="user-details">
                                        <p className="user-name">Pierre Laporte</p>
                                        <p className="user-role">Client</p>
                                    </div>
                                    <div className="user-date">Hier</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            default:
                return renderDashboard()
        }
    }

    if (loading) {
        return (
            <div className="super-admin-container">
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Chargement...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="super-admin-container">
            {/* Navigation Sidebar */}
            <nav className="admin-sidebar">
                <div className="sidebar-header">
                    <div className="logo">
                        <span className="logo-icon">👑</span>
                        <span className="logo-text" style={{color: "#0066FF", fontWeight: "700"}}>TravelHub Admin</span>
                    </div>
                </div>
                
                <div className="sidebar-nav">
                    {navigationTabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`nav-item ${activeTab === tab.id ? 'active' : ''} center-icon-content`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <span className="nav-icon center-icon">{tab.icon}</span>
                            <span className="nav-label center-text">{tab.label}</span>
                        </button>
                    ))}
                </div>

                <div className="sidebar-footer">
                    <div className="user-info">
                        <div className="user-avatar">B</div>
                        <div className="user-details">
                            <span className="user-name">Brian Djayou</span>
                            <span className="user-role">Super Admin</span>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="admin-main">
                <header className="main-header">
                    <h1>TravelHub Super Admin</h1>
                    <div className="header-actions">
                        <button className="profile-btn">
                            <span>👤</span>
                        </button>
                        <button 
                            className="logout-btn"
                            style={{
                                backgroundColor: "#FF0000", 
                                color: "white", 
                                fontWeight: "bold",
                                padding: "0 16px",
                                borderRadius: "8px"
                            }}
                            onClick={async () => {
                                try {
                                    await signOut()
                                } catch (error) {
                                    console.error('Erreur déconnexion:', error)
                                }
                            }}
                        >
                            🚪 Déconnexion
                        </button>
                    </div>
                </header>

                {message.text && (
                    <div className={`alert-message ${message.type}`}>
                        <span>{message.text}</span>
                        <button onClick={() => setMessage({ type: '', text: '' })}>✕</button>
                    </div>
                )}

                <div className="main-content">
                    {renderContent()}
                </div>
            </main>
        </div>
    )
}

export default SuperAdminDashboard
