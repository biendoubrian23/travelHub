## 🗺️ STRUCTURE DU FORMULAIRE D'AJOUT DE TRAJET

### Ordre des sections dans le formulaire :

1. **🗺️ Itinéraire**
   - Ville de départ
   - Ville de destination 
   - Distance (km)

2. **⏰ Horaires**
   - Heure de départ
   - Heure d'arrivée
   - Durée estimée (calculée automatiquement)

3. **🌙 Options spéciales** ⭐ NOUVELLE SECTION ⭐
   ```
   ┌─────────────────────────────────────────────┐
   │ 🌙 Options spéciales                        │
   │                                             │
   │ ┌─────────────────────────────────────────┐ │
   │ │ ☑️ 🌙 Trajet de nuit (arrivée le       │ │
   │ │      lendemain)                         │ │
   │ │                                         │ │
   │ │ Cochez si le trajet arrive le lendemain │ │
   │ │ (ex: départ 23h, arrivée 6h)           │ │
   │ └─────────────────────────────────────────┘ │
   └─────────────────────────────────────────────┘
   ```

4. **🚌 Bus et équipe**
   - Sélection du bus
   - Sélection du conducteur
   - Capacité maximale

5. **💰 Prix et statut**
   - Prix par place
   - Statut du trajet

6. **🎯 Services inclus**
   - Wi-Fi, Climatisation, etc.

7. **📝 Notes et observations**
   - Notes additionnelles

---

### 🎯 FONCTIONNEMENT DE LA CHECKBOX "TRAJET DE NUIT" :

**✅ QUAND COCHÉE :**
- ✅ Aucun message d'erreur même si arrivée (6h) < départ (23h)
- ✅ Calcul automatique de la durée sur 24h
- ✅ Validation passe sans problème

**❌ QUAND DÉCOCHÉE :**
- ❌ Message d'erreur si arrivée <= départ
- ❌ Suggestion de cocher la case dans le message

**🔄 AUTO-DÉTECTION :**
- Si vous saisissez 23h → 6h, la case se coche automatiquement
- Si vous saisissez 8h → 14h, la case se décoche automatiquement

---

### 👥 VISIBILITÉ PAR RÔLE :

| Rôle | Voit la section "Options spéciales" |
|------|-------------------------------------|
| Super Admin (patron) | ✅ OUI |
| Manager | ✅ OUI |
| Employee | ✅ OUI |
| Driver/Conducteur | ❌ NON |
