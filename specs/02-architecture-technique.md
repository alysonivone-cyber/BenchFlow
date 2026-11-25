# BenchFlow — Architecture technique

> Document de travail pour la soutenance CREA. État documentaire : 25 novembre 2026. À confronter au code source avant la remise finale.

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
| GitHub Actions | Build et tests à chaque push sur `main` (D-02) | Vérification sur une machine propre, sous Linux |
| API du navigateur | Web Audio (bips), notifications via le service worker, Screen Wake Lock | Alertes locales et écran allumé, sans serveur |
| Git | Historique du développement | Traçabilité et retour à un état antérieur |

## 3. Organisation du code

Arborescence relevée avec `git ls-files src` le 25 novembre 2026 (les fichiers de test sont notés à côté du fichier qu'ils vérifient) :

```text
src/
├── App.tsx
├── main.tsx                    # enveloppe l'application dans ErrorBoundary
├── styles.css                  # jetons Tailwind (@theme), variantes, styles de base
├── components/
│   ├── Layout.tsx              # structure, barre latérale, surveillance globale (TimerWatcher)
│   ├── ConfirmDialog.tsx       # confirmation avec <dialog> natif
│   ├── Chip.tsx
│   ├── ErrorBoundary.tsx       # écran de récupération (R-01) ; ErrorBoundary.test.ts
│   └── ui.ts                   # classes Tailwind partagées (boutons, cartes…)
├── db/
│   └── database.ts             # schéma Dexie v3
├── data/
│   └── protocols.ts
├── types/
│   └── models.ts
├── utils/
│   └── format.ts               # twoDigits, formatClock ; format.test.ts
└── features/
    ├── protocols/
    │   ├── ProtocolLibrary.tsx
    │   ├── ProtocolDetail.tsx
    │   ├── NewProtocol.tsx
    │   ├── DeleteProtocolButton.tsx
    │   ├── useDeleteProtocol.tsx
    │   ├── protocolService.ts  # + protocolService.test.ts
    │   ├── pdfExtractor.ts     # chargé à la demande
    │   └── pdfTitle.ts         # titre lisible de l'onglet du PDF (DT-17)
    ├── sessions/
    │   ├── SessionPages.tsx
    │   ├── sessionService.ts
    │   ├── sessionLabel.ts     # nom lisible d'une session ; sessionLabel.test.ts
    │   └── useWakeLock.ts      # écran allumé (L-01)
    ├── timer/
    │   ├── useLabTimer.ts      # logique partagée des timers (DT-19)
    │   ├── TimerView.tsx       # affichage d'un timer
    │   ├── TimerPanel.tsx      # timer d'une étape de session
    │   ├── GlobalTimer.tsx     # timer de la calculatrice
    │   ├── TimerWatcher.tsx    # alertes globales et titre de l'onglet (DT-20, DT-22)
    │   ├── timerService.ts     # + timerService.test.ts, timerStorage.test.ts
    │   ├── timerAlerts.ts      # son + notification de fin (NOTIF-01) ; timerAlerts.test.ts
    │   └── tabTitle.ts         # texte du titre de l'onglet ; tabTitle.test.ts
    └── calculator/
        ├── CalculatorPage.tsx
        └── calculations.ts     # + calculations.test.ts
```

Hors de `src/` : `vite.config.ts` (manifeste et service worker), `.github/workflows/ci.yml` (intégration continue), `public/icons/` (icônes d'installation), `docs/` et `specs/`.

Le principe est de **regrouper les fichiers par fonctionnalité** plutôt que de mélanger tous les composants et services dans un dossier unique. Les composants React affichent l'interface ; les services encapsulent les opérations métier et de stockage ; les types décrivent les objets manipulés.

## 4. Modèle de données

Les objets de référence comprennent :

- **Protocol** : identifiant, titre, description, objectif, matériel global, résultats attendus, durée, étapes, éventuellement PDF source et date d'ajout `importedAt` facultative (DT-15).
- **ProtocolStep** : identifiant, titre, description, matériel propre à l'étape, instructions et durée estimée facultative.
- **Session** : progression d'une exécution expérimentale ; elle comprend notamment `createdAt`, `updatedAt` et `completedStepIds` (liste complète dans `src/types/models.ts`).
- **LabTimer** : session et étape associées, durée, temps restant, échéance, statut, date de mise à jour et étiquette lisible facultative `label` (DT-20). Le timer de la calculatrice est un enregistrement ordinaire de la table `timers`, sous l'identifiant `global:calculator` (DT-19).

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

**Fin de minuterie (NOTIF-01) :** quand l'état passe de `running` à `finished` pendant que l'application est ouverte (surveillé par `TimerWatcher`, monté dans `Layout`, donc sur toutes les pages : DT-20), `alertTimerFinished()` affiche une bannière, joue trois bips (Web Audio, débloqué par le clic sur Start) et, si l'utilisateur a accepté la permission, envoie une notification système via le service worker. Sans backend ni serveur push, **aucune alerte ne peut partir si l'application est complètement fermée** ; à la réouverture, un timer terminé depuis moins de 5 minutes déclenche l'alerte (bandeau et bips) ; au-delà, il s'affiche simplement terminé, sans alerte (DT-20). Le titre de l'onglet du navigateur affiche le temps restant du timer qui se termine le plus tôt (DT-22). Si les notifications système sont bloquées par le navigateur, la bannière et le son restent actifs et un message l'explique (voir `05`, T27).

### Écran d'erreur et écran allumé (extensions du 25 novembre)

`main.tsx` enveloppe l'application dans `ErrorBoundary` : une erreur levée pendant l'affichage montre un écran de récupération au lieu d'une page blanche (DT-23). `SessionDetail` appelle `useWakeLock(true)` : le navigateur garde l'écran allumé tant qu'une session est ouverte (DT-24). Les limites de chaque mécanisme sont dans `06`.

## 6. Fonctionnement hors ligne

Le service worker met en cache les ressources de l'application prévues par la configuration PWA, y compris le worker de pdf.js (`.mjs`), afin que l'import de PDF fonctionne hors ligne. Les données métier sont enregistrées localement via IndexedDB. **La disponibilité hors ligne doit être vérifiée en conditions réelles** : chargement initial en ligne, installation ou mise en cache, coupure réseau, réouverture et récupération des données. **Vérifié le 24 novembre 2026** sur le build de production servi par `vite preview` : chargement hors ligne puis test strict avec le serveur arrêté (voir `05`, T17). L'installation de l'application a été testée le 25 novembre 2026 (voir `05`, T29). Le service worker ignore le paramètre `v` des adresses lors de la recherche dans le cache, ce qui permet de retrouver l'icône de l'onglet hors ligne (DT-26). Une version périmée peut s'afficher une fois après une reconstruction, tant que d'autres onglets restent ouverts (mise à jour automatique, voir `05`).

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
- [x] Tester le fonctionnement hors ligne après un build de production (fait le 24 novembre 2026, voir `05`, T17 ; à refaire sur le build final).
- [x] Confirmer les fonctionnalités effectivement livrées, sans confondre V1 et V2 (tableau de correspondance cahier, code et tests dans `05`).
