# BenchFlow — Architecture technique

> Document de travail pour la soutenance CREA. État documentaire : 11 novembre 2026. À confronter au code source avant la remise finale.

## 1. Objectif architectural

BenchFlow est une Progressive Web App (PWA) destinée à accompagner l'exécution de protocoles expérimentaux. L'application cherche à rendre accessibles les protocoles, les étapes, les notes, les minuteries et les calculs scientifiques dans une interface cohérente, y compris lorsque la connexion réseau est indisponible après installation et mise en cache.

**Contrainte du projet :** ne pas utiliser de backend pour la V1. Les données de travail sont donc gérées dans le navigateur. Cette décision limite les besoins d'infrastructure, mais impose de traiter la persistance, les performances et les limites de stockage côté client.

## 2. Technologies et responsabilités

| Technologie | Rôle dans BenchFlow | Justification |
|---|---|---|
| React | Composants d'interface et états locaux | Réutilisation des écrans et séparation des responsabilités |
| TypeScript | Typage des modèles, services et composants | Réduction des erreurs de structure et meilleure maintenabilité |
| Vite | Serveur de développement et compilation | Itérations rapides et construction d'une version de production |
| Tailwind CSS v4 | Mise en forme de l'interface (classes utilitaires, jetons de design dans `@theme`) | Outil annoncé dans la spécification V1 ; un seul style cohérent, sans CSS global de 800 lignes |
| Dexie / IndexedDB | Stockage local des protocoles personnalisés, protocoles de démonstration masqués, sessions, notes et timers | Persistance dans le navigateur sans serveur |
| `vite-plugin-pwa` / Workbox | Manifest et service worker | Installation et mise en cache des ressources de l'application |
| `pdfjs-dist` | Lecture du texte des PDF dans le navigateur | Traitement local, sans transmission du document à un service externe |
| Vitest | Tests automatisés de fonctions et services | Détection de régressions sur la logique métier |
| Git | Historique du développement | Traçabilité et retour à un état antérieur |

## 3. Organisation du code

Arborescence indicative issue des fichiers travaillés ; vérifier l'arborescence réelle avant remise :

```text
src/
├── App.tsx
├── main.tsx
├── styles.css                  # jetons Tailwind (@theme), variantes, styles de base
├── components/
│   ├── Layout.tsx
│   ├── ConfirmDialog.tsx       # confirmation avec <dialog> natif
│   ├── Chip.tsx
│   └── ui.ts                   # classes Tailwind partagées (boutons, cartes…)
├── db/
│   └── database.ts             # schéma Dexie v3
├── data/
│   └── protocols.ts
├── types/
│   └── models.ts
└── features/
    ├── protocols/
    │   ├── ProtocolLibrary.tsx
    │   ├── ProtocolDetail.tsx
    │   ├── NewProtocol.tsx
    │   ├── DeleteProtocolButton.tsx
    │   ├── useDeleteProtocol.tsx
    │   ├── protocolService.ts
    │   └── pdfExtractor.ts     # chargé à la demande
    ├── sessions/
    │   ├── SessionPages.tsx
    │   └── sessionService.ts
    ├── timer/
    │   ├── TimerPanel.tsx
    │   ├── timerService.ts
    │   └── timerAlerts.ts      # son + notification de fin (NOTIF-01)
    └── calculator/
        ├── CalculatorPage.tsx
        └── calculations.ts
```

Le principe est de **regrouper les fichiers par fonctionnalité** plutôt que de mélanger tous les composants et services dans un dossier unique. Les composants React affichent l'interface ; les services encapsulent les opérations métier et de stockage ; les types décrivent les objets manipulés.

## 4. Modèle de données

Les objets de référence comprennent :

- **Protocol** : identifiant, titre, description, objectif, matériel global, résultats attendus, durée, étapes et éventuellement PDF source.
- **ProtocolStep** : identifiant, titre, description, matériel propre à l'étape, instructions et durée estimée facultative.
- **Session** : progression d'une exécution expérimentale ; ses champs exacts sont à vérifier dans `src/types/models.ts`.
- **LabTimer** : session et étape associées, durée, temps restant, échéance, statut et date de mise à jour.

Schéma Dexie : v1 (sessions, notes, timers), v2 (+ `customProtocols`), v3 (+ `deletedProtocols`, qui mémorise les identifiants des protocoles de démonstration supprimés).

Un protocole prédéfini peut être affiché depuis les données intégrées. Un protocole personnalisé est enregistré dans IndexedDB. La logique de lecture privilégie la version personnalisée lorsqu'un identifiant existe dans les deux sources ; ce comportement doit être conservé et testé.

## 5. Flux fonctionnels

### Consultation d'un protocole

```text
Protocol Library → choix du protocole → Protocol Detail
                                  → Start New Session → étapes de la session
```

### Suppression d'un protocole

```text
Bouton Delete → ConfirmDialog (nombre de sessions concernées)
    ↓
deleteProtocol(id) : UNE transaction Dexie
    ├─ supprime notes et timers des sessions du protocole
    ├─ supprime les sessions
    ├─ supprime le protocole personnalisé
    └─ protocole de démonstration : son id est ajouté à deletedProtocols (masqué)
```

Un protocole de démonstration est écrit dans le code (`src/data/protocols.ts`) : il ne peut pas être effacé de la base, il est donc masqué et peut être restauré depuis la bibliothèque.

### Importation d'un PDF

```text
Sélection du fichier PDF
    ↓
Chargement à la demande de pdf.js (import dynamique)
    ↓
Contrôle du format et de la taille (15 Mo maximum)
    ↓
PDF.js : extraction du texte et de sa position sur les pages
    ↓
Analyse locale : titres, sections, matériel, étapes, durées
    ↓
Prévisualisation / édition humaine
    ↓
Enregistrement du protocole et du PDF source dans IndexedDB
```

**Point essentiel :** le parseur actuel repose sur des règles de lecture et des expressions régulières, et non sur une compréhension sémantique universelle. Il ne faut pas présenter son résultat comme une interprétation parfaite de tous les PDF. Les scans sans couche texte nécessiteraient une solution OCR, non garantie dans la V1.

### Minuterie d'une étape

```text
Session + Step ID → ensureTimer() → IndexedDB (une transaction : lecture + création)
                             ↓
                   Start / Pause / Reset
                             ↓
             Calcul à partir d'une échéance absolue
                             ↓
                 Sauvegarde de l'état du timer
```

L'usage d'une échéance (`endsAt`) évite que le décompte dépende uniquement de la fréquence des rafraîchissements de l'interface.

**Fin de minuterie (NOTIF-01) :** quand l'état passe de `running` à `finished` pendant que l'application est ouverte, `alertTimerFinished()` affiche une bannière, joue trois bips (Web Audio, débloqué par le clic sur Start) et, si l'utilisateur a accepté la permission, envoie une notification système via le service worker. Sans backend ni serveur push, **aucune alerte ne peut partir si l'application est complètement fermée** ; à la réouverture, le timer s'affiche terminé sans bip.

## 6. Fonctionnement hors ligne

Le service worker met en cache les ressources de l'application prévues par la configuration PWA, y compris le worker de pdf.js (`.mjs`), afin que l'import de PDF fonctionne hors ligne. Les données métier sont enregistrées localement via IndexedDB. **La disponibilité hors ligne doit être vérifiée en conditions réelles** : chargement initial en ligne, installation ou mise en cache, coupure réseau, réouverture et récupération des données.

Les données restent liées au navigateur et à son stockage local. Une suppression des données du site, un mode privé ou un changement d'appareil peut entraîner leur perte. Ne pas promettre de synchronisation ni de sauvegarde cloud dans la V1.

## 7. Sécurité, confidentialité et rigueur scientifique

- Les PDF sont traités localement dans la version sans backend ; aucun envoi vers Gemini n'est nécessaire pour l'extraction par règles.
- La validation scientifique des instructions reste sous la responsabilité de l'utilisateur et des procédures de laboratoire approuvées.
- Les paramètres expérimentaux absents du PDF ne doivent jamais être inventés.
- Les erreurs de lecture doivent être signalées et les champs rester modifiables avant enregistrement.
- Le stockage local n'est pas un mécanisme de sauvegarde garanti.

## 8. Points à confirmer avant la soutenance

- [ ] Vérifier les versions exactes des dépendances dans `package.json`.
- [ ] Confirmer les champs et migrations Dexie dans `database.ts`.
- [ ] Vérifier la configuration du service worker et les icônes de la PWA.
- [ ] Tester le fonctionnement hors ligne après un build de production.
- [ ] Confirmer les fonctionnalités effectivement livrées, sans confondre V1 et V2.
