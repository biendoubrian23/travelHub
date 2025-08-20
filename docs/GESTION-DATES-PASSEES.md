# Gestion des Dat### 2. Désactivation du Bouton "Ajouter un Trajet" pour les Dates Passées

#### Dans `TripsCalendar.jsx`:
- **Bouton "Ajouter un trajet"**: Devient gris pour les dates passées dans le calendrier
- Affiche un message d'alerte expliquant pourquoi l'ajout n'est pas possible

#### Logique:
- Vérifie si la `selectedDate` dans le calendrier est antérieure à aujourd'hui
- Compare les dates en ignorant l'heure (00:00:00)
- Empêche l'ouverture du modal de création de trajet

### 3. Désactivation du Bouton "Ajouter un Passager" pour les Dates Passées

#### Dans `BookingsCalendar.jsx`:
- **Bouton "Ajouter un Passager"**: Devient gris pour les trajets dont la date est passée
- Affiche un message d'alerte expliquant pourquoi l'ajout n'est pas possible

#### Logique:
- Vérifie si la date du `selectedBus` (trajet sélectionné) est antérieure à aujourd'hui
- Compare les dates en ignorant l'heure (00:00:00)
- Empêche l'ouverture du modal d'ajout de passager - TravelHub

## Fonctionnalités Implémentées

### 1. Désactivation des Boutons pour les Réservations avec Dates Passées

#### Dans `BookingsList.jsx`:
- **Bouton "Voir"**: Devient gris avec texte "Consulter" pour les dates passées
- **Bouton "Modifier"**: Désactivé pour les dates passées
- **Bouton "Annuler"**: Désactivé pour les dates passées
- **Bouton "Rembourser"**: Désactivé pour les dates passées

#### Logique:
- Vérifie si `departure_time` de la réservation est antérieure à aujourd'hui
- Compare les dates en ignorant l'heure (00:00:00)
- Affiche un message d'alerte personnalisé pour chaque action impossible

### 2. Désactivation du Bouton "Ajouter un Trajet" pour les Dates Passées

#### Dans `TripsCalendar.jsx`:
- **Bouton "Ajouter un trajet"**: Devient gris pour les dates passées dans le calendrier
- Affiche un message d'alerte expliquant pourquoi l'action n'est pas possible

#### Logique:
- Vérifie si la `selectedDate` dans le calendrier est antérieure à aujourd'hui
- Compare les dates en ignorant l'heure (00:00:00)
- Empêche l'ouverture du modal de création de trajet

### 3. Styles CSS Personnalisés (Préfixés TravelHub)

#### Classes CSS ajoutées:
```css
.tvhub-disabled-btn {
  /* Style global pour tous les boutons désactivés */
  background-color: #e5e5ea !important;
  color: #8e8e93 !important;
  cursor: not-allowed !important;
  opacity: 0.6 !important;
}
```

#### Boutons spécifiques:
- **Boutons d'action tableau**: Style iOS avec couleurs grises
- **Boutons cartes mobile**: Dégradé gris avec transition douce
- **Bouton "Ajouter trajet"**: Dégradé gris avec animation désactivée
- **Bouton "Ajouter passager"**: Dégradé gris avec transitions iOS modernes

### 4. Messages d'Alerte Personnalisés

#### Réservations:
- "⚠️ Impossible de voir les détails : cette réservation concerne un trajet dont la date est déjà passée. Vous ne pouvez que consulter les informations."
- "⚠️ Impossible de modifier : cette réservation concerne un trajet dont la date est déjà passée."
- "⚠️ Impossible d'annuler : cette réservation concerne un trajet dont la date est déjà passée."
- "⚠️ Impossible de rembourser : cette réservation concerne un trajet dont la date est déjà passée."

#### Trajets:
- "⚠️ Impossible d'ajouter un trajet : vous ne pouvez pas créer des trajets pour des dates passées. Veuillez sélectionner une date future."

#### Passagers:
- "⚠️ Impossible d'ajouter un passager : ce trajet a déjà eu lieu. Vous ne pouvez pas ajouter de nouveaux passagers pour des trajets dont la date est passée."

## Fonctions Utilitaires

### `isDatePassed(dateString)`
```javascript
const isDatePassed = (dateString) => {
  if (!dateString) return false;
  const tripDate = new Date(dateString);
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  tripDate.setHours(0, 0, 0, 0);
  return tripDate < currentDate;
};
```

### `handleDisabledButtonClick(action)`
```javascript
const handleDisabledButtonClick = (action) => {
  const messages = {
    view: "Message pour consultation",
    edit: "Message pour modification",
    // etc.
  };
  alert(messages[action]);
};
```

### `isTripDatePassed()`
```javascript
const isTripDatePassed = () => {
  if (!selectedBus || !selectedBus.date) return false;
  const tripDate = new Date(selectedBus.date);
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  tripDate.setHours(0, 0, 0, 0);
  return tripDate < currentDate;
};
```

### `handleDisabledAddPassengerClick()`
```javascript
const handleDisabledAddPassengerClick = () => {
  alert("⚠️ Impossible d'ajouter un passager : ce trajet a déjà eu lieu...");
};
```

## Fichiers Modifiés

1. **`src/components/Bookings/BookingsList.jsx`**
   - Ajout de la logique de vérification de date
   - Modification des gestionnaires d'événements des boutons
   - Ajout des classes CSS conditionnelles

2. **`src/components/Bookings/BookingsList.css`**
   - Ajout des styles `.tvhub-disabled-btn`
   - Styles spécifiques pour les boutons d'action désactivés
   - Styles pour les cartes mobiles désactivées

3. **`src/components/Trips/TripsCalendar.jsx`**
   - Ajout de la logique de vérification de date sélectionnée
   - Modification du bouton "Ajouter un trajet"
   - Ajout du gestionnaire pour les clics désactivés

4. **`src/components/Trips/TripsCalendar.css`**
   - Ajout des styles pour le bouton "Ajouter trajet" désactivé
   - Animation désactivée pour l'icône quand le bouton est gris

5. **`src/components/Bookings/BookingsCalendar.jsx`**
   - Ajout de la logique de vérification de date pour le trajet sélectionné
   - Modification du bouton "Ajouter un Passager"
   - Ajout du gestionnaire pour les clics désactivés

6. **`src/components/Bookings/BookingsCalendar.css`**
   - Ajout des styles pour le bouton "Ajouter passager" désactivé
   - Dégradé gris avec transitions iOS modernes

7. **`src/utils/dateUtils.js`** (nouveau fichier)
   - Fonctions utilitaires pour la gestion des dates
   - Formatage des dates et heures en français

## Compatibilité

- ✅ Vue Desktop (tableau)
- ✅ Vue Mobile (cartes)
- ✅ Design iOS moderne maintenu
- ✅ Responsive design préservé
- ✅ Accessibilité (curseur, tooltips)

## Notes Techniques

- Les styles utilisent `!important` pour garantir la priorité sur les styles existants
- Les transitions CSS sont maintenues pour une expérience utilisateur fluide
- Les comparaisons de dates ignorent l'heure pour éviter les problèmes de fuseau horaire
- Les messages d'alerte sont en français et contiennent des émojis pour l'UX
