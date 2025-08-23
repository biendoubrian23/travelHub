²# 🚀 Guide de Migration Complète - Système Seat Maps Amélioré

## 📋 Vue d'ensemble

Ce guide vous accompagne dans la mise en place complète du système de gestion des sièges amélioré avec les nouvelles fonctionnalités :

- ✅ **Nouvelles colonnes** : reservation_status, base_price_fcfa, final_price_fcfa, seat_features, etc.
- ✅ **Migration automatique** des voyages existants
- ✅ **Audit et traçabilité** complète
- ✅ **Performance optimisée** avec index et triggers

## 🗄️ Étape 1 : Mise à jour de la base de données

### 1.1 Appliquer les améliorations de schéma

```sql
-- Exécuter dans l'interface Supabase SQL Editor
-- Fichier: database/seat_maps_improvements.sql

-- Cela va ajouter :
-- ✅ Nouvelles colonnes de données
-- ✅ Colonnes d'audit (created_by, updated_by, version)
-- ✅ Colonnes temporelles (reserved_at, reserved_until)
-- ✅ Index de performance
-- ✅ Triggers de mise à jour automatique
```

### 1.2 Vérifier les modifications

```sql
-- Vérifier la structure de la table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'seat_maps' 
ORDER BY ordinal_position;
```

## 🔄 Étape 2 : Migration des données existantes

### 2.1 Vérifier l'état actuel

```javascript
// Dans la console navigateur (F12)
import('./src/scripts/migrationSeatMapsEnhanced.js')
  .then(m => m.checkEnhancedMigrationStatus());
```

### 2.2 Exécuter la migration complète

```javascript
// ⚠️ ATTENTION : Exécuter en heures creuses
// Cette opération va créer les seat_maps pour TOUS les voyages existants

import('./src/scripts/migrationSeatMapsEnhanced.js')
  .then(m => m.runEnhancedMigration());
```

### 2.3 Migration d'un voyage spécifique (optionnel)

```javascript
// Pour tester sur un voyage particulier
import('./src/scripts/migrationSeatMapsEnhanced.js')
  .then(m => m.migrateEnhancedSingleTrip('TRIP_ID_ICI'));
```

## 🧪 Étape 3 : Tests et validation

### 3.1 Vérifier la cohérence des données

```javascript
// Test de cohérence pour un voyage
import { validateSeatMapConsistency } from './src/utils/seatMapUtils.js';
validateSeatMapConsistency('TRIP_ID_ICI').then(console.log);
```

### 3.2 Tester les statistiques

```javascript
// Statistiques d'un voyage
import { getTripSeatStatistics } from './src/utils/seatMapUtils.js';
getTripSeatStatistics('TRIP_ID_ICI').then(console.log);
```

### 3.3 Test de création de nouveau voyage

1. Aller sur la page de gestion des voyages
2. Créer un nouveau voyage
3. Vérifier que les seat_maps sont automatiquement créés
4. Vérifier les prix et fonctionnalités des sièges VIP

## 📊 Étape 4 : Fonctionnalités ajoutées

### 4.1 Nouvelles données des sièges

```javascript
// Exemple de données générées pour chaque siège
{
  trip_id: "uuid",
  seat_number: "1",
  position_row: 1,
  position_column: 1,
  seat_type: "vip", // ou "standard"
  is_available: true,
  price_modifier_fcfa: 1000, // Supplément VIP
  
  // 🆕 Nouvelles colonnes
  reservation_status: "available", // "available", "occupied", "maintenance"
  base_price_fcfa: 15000,
  final_price_fcfa: 16000, // base + modifier
  seat_features: {
    is_window: true,
    is_aisle: false,
    is_vip: true,
    has_power_outlet: true,
    has_wifi: true,
    has_reading_light: true,
    has_usb_port: true,
    is_accessible: false
  },
  reserved_by: null,
  booking_id: null,
  reserved_at: null,
  reserved_until: null,
  created_by: "system",
  updated_by: "system",
  version: 1,
  notes: null
}
```

### 4.2 Configuration automatique des sièges

- **Sièges 1-4** : VIP (supplément +1000 FCFA)
- **Colonnes 1 et 4** : Sièges fenêtre
- **Colonnes 2 et 3** : Sièges couloir
- **Sièges 37-40** : Accessibles PMR
- **Tous les sièges** : WiFi, prise électrique, éclairage
- **Sièges VIP** : Port USB supplémentaire

## 🔍 Étape 5 : Monitoring et maintenance

### 5.1 Requêtes de surveillance

```sql
-- Voyages sans seat_maps (ne devrait plus arriver)
SELECT t.id, t.departure_city, t.arrival_city, t.departure_date
FROM trips t
LEFT JOIN seat_maps sm ON t.id = sm.trip_id
WHERE sm.trip_id IS NULL;

-- Statistiques globales
SELECT 
  COUNT(DISTINCT trip_id) as voyages_avec_seats,
  COUNT(*) as total_seats,
  SUM(CASE WHEN is_available = false THEN 1 ELSE 0 END) as seats_occupes,
  AVG(final_price_fcfa) as prix_moyen
FROM seat_maps;

-- Top 10 des voyages les plus occupés
SELECT 
  t.departure_city || ' → ' || t.arrival_city as trajet,
  t.departure_date,
  COUNT(sm.id) as total_seats,
  SUM(CASE WHEN sm.is_available = false THEN 1 ELSE 0 END) as occupes,
  ROUND(SUM(CASE WHEN sm.is_available = false THEN 1 ELSE 0 END) * 100.0 / COUNT(sm.id), 1) as taux_occupation
FROM trips t
JOIN seat_maps sm ON t.id = sm.trip_id
GROUP BY t.id, t.departure_city, t.arrival_city, t.departure_date
ORDER BY taux_occupation DESC
LIMIT 10;
```

### 5.2 Maintenance préventive

```javascript
// Script de nettoyage mensuel (à programmer)
async function monthlyMaintenance() {
  // 1. Vérifier la cohérence de tous les voyages
  const trips = await supabase.from('trips').select('id');
  
  for (const trip of trips.data) {
    const consistency = await validateSeatMapConsistency(trip.id);
    if (!consistency.isConsistent) {
      console.warn(`Voyage ${trip.id} incohérent:`, consistency.inconsistencies);
    }
  }
  
  // 2. Nettoyer les réservations expirées (si reserved_until implémenté)
  
  // 3. Mettre à jour les statistiques de performance
}
```

## ⚠️ Points d'attention

### 5.1 Avant la migration

- [ ] **Sauvegarde** : Exporter la base avant migration
- [ ] **Heures creuses** : Lancer la migration en heures de faible trafic
- [ ] **Test préalable** : Tester sur 1-2 voyages avant migration complète

### 5.2 Après la migration

- [ ] **Vérification** : Contrôler la cohérence des données
- [ ] **Performance** : Monitorer les temps de réponse
- [ ] **Utilisateurs** : Former l'équipe aux nouvelles fonctionnalités

### 5.3 En cas de problème

```javascript
// Rollback d'urgence : supprimer tous les seat_maps
// ⚠️ DANGER : N'utiliser qu'en cas d'urgence
await supabase.from('seat_maps').delete().neq('id', '');
```

## 🎯 Résultat attendu

Après cette migration complète :

1. **Tous les voyages** auront leurs seat_maps configurés
2. **Nouvelles réservations** utiliseront automatiquement le système
3. **Cohérence garantie** entre bookings et seat_maps
4. **Performance optimisée** avec les nouveaux index
5. **Audit complet** de toutes les modifications
6. **Fonctionnalités riches** (VIP, fenêtre/couloir, accessibilité)

## 📞 Support

En cas de problème :
1. Vérifier les logs console (F12)
2. Contrôler les erreurs Supabase
3. Consulter les tables d'audit
4. Utiliser les outils de validation intégrés

---

**🚀 Bonne migration !**
