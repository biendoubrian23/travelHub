# Structure des rôles dans TravelHub

## Rôles système standardisés

La base de données TravelHub utilise les rôles système suivants :

1. **super_admin** - Administrateur système global
2. **agence** - Propriétaire/Administrateur d'une agence
3. **agency_manager** - Manager dans une agence
4. **agency_employee** - Employé standard d'une agence
5. **agency_driver** - Conducteur de bus d'une agence

## Mapping des rôles internes

Au sein des agences, des rôles simplifiés sont utilisés :

| Rôle interne | Rôle système | Description |
|--------------|--------------|-------------|
| admin        | agence       | Propriétaire/Administrateur avec tous les droits |
| manager      | agency_manager | Gestion des équipes et réservations |
| employee     | agency_employee | Opérations quotidiennes |
| driver       | agency_driver | Conducteur (lecture seule) |

## Note importante

Le rôle 'agence' correspond à un propriétaire/administrateur d'agence et remplace l'ancien rôle 'agency_admin'. Ces deux rôles sont désormais considérés comme identiques.

Dans le code, le rôle 'patron' (dans les fichiers de configuration) correspond au rôle 'agence' dans la base de données.
