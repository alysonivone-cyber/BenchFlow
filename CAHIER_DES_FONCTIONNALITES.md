# BenchFlow

| Champ | Contenu |
| --- | --- |
| Titre du projet | BenchFlow |
| Nom de l’étudiante | Alyson ISABELLA VALENZI |
| Framework retenu | React + TypeScript (Vite) |
| Lien du dépôt Git | URL GitHub *(à remplacer par le lien réel)* |
| Date de soumission | 27/10/2026 |


## 1. Description brève du projet

BenchFlow est une Progressive Web App (PWA) destinée à accompagner l’exécution d’expériences en laboratoire. Elle transforme des protocoles structurés en parcours interactifs : l’utilisateur sélectionne un protocole, suit les étapes, lance des timers, réalise des calculs ciblés, consigne des observations et retrouve sa progression, même sans connexion après préparation des ressources. Le MVP privilégie une expérience simple, locale et sans backend. BenchFlow constitue un outil d'accompagnement de l'exécution expérimentale et ne se substitue ni aux procédures de sécurité du laboratoire ni à la validation scientifique des protocoles par les utilisateurs.

**Utilisatrices et utilisateurs cibles :** Étudiantes et étudiants en sciences expérimentales, doctorants, jeunes chercheurs et personnels de laboratoire exécutant des protocoles récurrents.

**Problème résolu :** La dispersion entre protocoles, minuteries, notes et calculs accroît les interruptions et rend le suivi expérimental moins fluide.

## 2. Choix techniques

| Décision | Choix | Justification brève |
| --- | --- | --- |
| Framework | React + TypeScript avec Vite | Composants réutilisables pour étapes, timers et notes ; typage des protocoles et des observations ; démarrage rapide. |
| Framework UI | Tailwind CSS | Styles cohérents, responsives et rapides à ajuster sans bibliothèque de composants complexes. |
| Gestion de l’état | useState / Context ciblé + Dexie / IndexedDB | État transitoire simple dans React ; données structurées persistées localement (protocoles, sessions, notes). |
| Simulation des données | Jeux de protocoles JSON locaux, versionnés | Démonstration déterministe et utilisable hors ligne, sans serveur ni API ; pas de MSW nécessaire en V1. |


**Architecture PWA :** vite-plugin-pwa pour le manifest et le service worker ; cache des ressources applicatives et des protocoles de démonstration. Aucun backend, authentification distante ou push serveur en V1. Les notifications système restent conditionnées aux permissions et au support du navigateur.

## 3. Description détaillée des fonctionnalités

Les fonctionnalités métier sont séparées des fondations techniques. Chaque ID est stable ; la catégorie, la priorité et l’engagement V1 figurent uniquement en section 4.

### PROT-01 — Protocol Library

**Description :** Consulter une bibliothèque de protocoles de démonstration, visualiser le titre, l’objectif et la liste ordonnée des étapes, puis choisir un protocole à exécuter.

**Critère de validation :** Au moins trois protocoles de démonstration sont disponibles dans la bibliothèque. Pour chacun, l'utilisateur peut consulter son titre, son objectif et ses étapes dans l'ordre prévu, puis démarrer une session expérimentale associée au protocole sélectionné.

### WORK-01 — Smart Experimental Workflow

**Description :** Exécuter un protocole étape par étape, afficher les consignes et les outils utiles à l’étape courante, puis valider l’étape et passer à la suivante.

**Critère de validation :** L'utilisateur peut sélectionner un protocole, démarrer une session expérimentale, consulter les instructions de chaque étape, accéder aux outils contextuels disponibles, valider les étapes successivement et terminer l'expérience. Le parcours respecte l'ordre défini dans le protocole et affiche clairement la progression.

### PROG-01 — Experiment Progress

**Description :** Enregistrer l’étape courante, les étapes validées et le statut d’une session expérimentale pour reprendre après fermeture/rechargement. Chaque session expérimentale possède un identifiant unique, un protocole associé, un statut et une progression indépendante. Plusieurs sessions peuvent être conservées localement, mais l'utilisateur travaille sur une seule session à la fois dans l'interface principale.

**Critère de validation :** L'utilisateur peut créer et enregistrer au moins deux sessions expérimentales distinctes, chacune possédant son propre protocole, son statut et sa progression. Après fermeture et réouverture de l'application, les sessions sont toujours accessibles et reprennent à leur dernière étape enregistrée, avec les validations précédentes conservées. Le passage d'une session à une autre ne modifie ni les données ni la progression de l'autre session.

### NOTE-01 — Experiment Notes

**Description :** Saisir et modifier une observation textuelle associée à une étape et à une session, sans la confondre avec le protocole source.

**Critère de validation :** L'utilisateur peut saisir et modifier une observation sur une étape d'une session expérimentale. Après rechargement de l'application, l'observation est conservée et reste associée à la bonne étape et à la bonne session, sans apparaître dans une autre session.

### CALC-01 — Scientific Calculator

**Description :** Le Scientific Calculator propose des outils de calcul intégrés au parcours expérimental. La V1 comprend un calculateur de dilution fondé sur la relation C₁V₁ = C₂V₂ ainsi que des conversions de volumes entre µL et mL. Les résultats affichent systématiquement les unités et les saisies invalides sont signalées. Les concentrations et les volumes doivent être exprimés dans des unités compatibles. Le calculateur vérifie la validité des données saisies et signale notamment les divisions par zéro et les volumes ou concentrations incompatibles avec une dilution réalisable.

**Critère de validation :** Le calculateur produit les résultats attendus pour au moins deux cas de dilution et deux conversions de volume prédéfinis. Une valeur manquante, négative ou incompatible avec le calcul déclenche un message d'erreur explicite.

### TIME-01 — Laboratory Timer

**Description :** Associer un timer à une étape expérimentale ; permettre à l'utilisateur de saisir une durée, démarrer, mettre en pause, reprendre et réinitialiser le décompte. L'état du timer et son horodatage de référence sont enregistrés localement. À la réouverture de l'application, le temps restant ou l'état « terminé » est recalculé à partir des données sauvegardées, sans supposer qu'une notification a été émise pendant la fermeture.

**Critère de validation :** L'utilisateur peut créer un timer de 30 secondes associé à une étape expérimentale, le démarrer, le mettre en pause, le reprendre et le réinitialiser. Le décompte reflète correctement ces actions et atteint l'état « terminé » à l'échéance. Après un passage temporaire de l'application en arrière-plan, le temps restant est recalculé à partir de l'horodatage. Après fermeture et réouverture de l'application, le timer retrouve son état enregistré et son temps restant est recalculé correctement à partir de l'horodatage.

### NOTIF-01 — Timer Alerts / Smart Notifications

**Description :** À la fin d’un timer, afficher une alerte visible dans l’application et, si possible, un son ; proposer une notification système après consentement explicite lorsque l’API et le contexte le permettent. Ne promet pas d’alerte fiable lorsque l’application est totalement fermée.

**Critère de validation :** Lorsqu'un timer atteint zéro pendant que BenchFlow est ouverte, une alerte visuelle apparaît et indique l'étape expérimentale concernée. Une alerte sonore peut être déclenchée lorsque les autorisations et les restrictions du navigateur le permettent. Une notification système est proposée sur les navigateurs compatibles, après autorisation explicite de l'utilisateur. En cas de refus ou d'indisponibilité, l'alerte interne reste fonctionnelle.

### CHECK-01 — Smart Check

**Description :** Vérifier des règles explicites sur certaines étapes (champ obligatoire, valeur dans une plage de démonstration, confirmation avant validation) sans prétendre à une expertise scientifique automatisée.

**Critère de validation :** Une règle de démonstration détecte une valeur invalide et permet la correction avant validation.

### DASH-01 — Dashboard / Experiment Analytics

**Description :** Afficher un résumé des sessions, de leur statut et des étapes terminées à partir des données locales.

**Critère de validation :** Un tableau de bord affiche correctement les sessions d’exemple et leurs statuts.

### SYNC-01 — Cloud Sync

**Description :** Synchroniser ultérieurement les données entre appareils avec comptes et gestion des conflits ; hors périmètre sans backend.

**Critère de validation :** Dans une version ultérieure, une modification sur un appareil est visible sur un autre après synchronisation.

### ACCT-01 — Accounts

**Description :** Créer ultérieurement des profils persistants et gérer les accès aux données de manière sécurisée.

**Critère de validation :** Dans une version ultérieure, un compte permet d’accéder uniquement aux données autorisées.

### COLL-01 — Collaboration

**Description :** Partager ultérieurement protocoles et sessions entre membres d’une équipe avec rôles et permissions.

**Critère de validation :** Dans une version ultérieure, deux utilisateurs autorisés collaborent sur un protocole partagé.

### AI-01 — AI Assistant

**Description :** Envisager ultérieurement une aide contextuelle contrôlée, soumise à vérification humaine, sans la présenter comme validation scientifique.

**Critère de validation :** Dans une version ultérieure, les réponses sont clairement signalées comme suggestions et vérifiables.

### TECH-01 — IndexedDB / Local Persistence

**Description :** Fondation technique : stocker localement protocoles, sessions, étapes et notes via Dexie/IndexedDB, avec gestion des erreurs et des limites de stockage.

**Critère de validation :** Une session et ses notes restent accessibles après rechargement, sans réseau ; un échec de stockage affiche un message.

### TECH-02 — Installable PWA

**Description :** Fondation technique : fournir un manifest valide et des icônes adaptées pour permettre l'installation de BenchFlow lorsque le navigateur et la plateforme le proposent. Le service worker est utilisé notamment pour la gestion du cache et le fonctionnement hors ligne.

**Critère de validation :** L’application est installable sur un navigateur compatible et s’ouvre en mode application.

### TECH-03 — Responsive UI

**Description :** Exigence transversale : adapter la navigation et les composants aux formats ordinateur et mobile, avec contrôles lisibles.

**Critère de validation :** Le parcours principal reste utilisable sans débordement horizontal à 375 px et sur desktop.

### TECH-04 — Offline Mode / Asset Cache

**Description :** Fondation technique : mettre en cache l’interface et les ressources requises ; permettre le parcours d’un protocole déjà présent localement sans connexion.

**Critère de validation :** Après une première visite en ligne, une expérience de démonstration reste accessible en mode avion ; un contenu absent est signalé.

## 4. Classification et priorisation

**Catégorie :** Essentielle / Nice to have.

**Priorité :** P1 indispensable, P2 souhaitée si temps disponible, P3 après V1.

**Complexité :** S ≤ 0,5 jour ; M > 0,5 à 2 jours ; L > 2 jours. **Nota bene :** La complexité estime l’effort et non une garantie de délai.

| ID | Catégorie | Priorité | Complexité | Dépend de | V1 |
| --- | --- | --- | --- | --- | --- |
| PROT-01 | Essentielle | P1 | M | — | Oui |
| WORK-01 | Essentielle | P1 | L | PROT-01, TECH-01 | Oui |
| PROG-01 | Essentielle | P1 | M | WORK-01, TECH-01 | Oui |
| NOTE-01 | Essentielle | P1 | M | WORK-01, TECH-01 | Oui |
| CALC-01 | Essentielle | P1 | M | WORK-01 | Oui |
| TIME-01 | Essentielle | P1 | M | WORK-01, TECH-01 | Oui |
| NOTIF-01 | Essentielle | P1 | M | TIME-01 | Oui |
| CHECK-01 | Nice to have | P2 | M | WORK-01 | Non |
| DASH-01 | Nice to have | P3 | M | PROG-01 | Non |
| SYNC-01 | Nice to have | P3 | L | TECH-01, ACCT-01 | Non |
| ACCT-01 | Nice to have | P3 | L | — | Non |
| COLL-01 | Nice to have | P3 | L | ACCT-01, SYNC-01 | Non |
| AI-01 | Nice to have | P3 | L | WORK-01 | Non |
| TECH-01 | Essentielle | P1 | L | — | Oui |
| TECH-02 | Essentielle | P1 | M | — | Oui |
| TECH-03 | Essentielle | P1 | M | — | Oui |
| TECH-04 | Essentielle | P1 | L | TECH-01 | Oui |


**Précision technique :** Le fonctionnement hors ligne repose sur la mise en cache des ressources applicatives par un service worker et sur la conservation des données expérimentales dans IndexedDB. L'installabilité de la PWA constitue une capacité distincte et n'est pas une condition obligatoire du fonctionnement hors ligne.

**Vérification de cohérence :** Toutes les fonctionnalités prioritaires (P1) sont intégrées au périmètre de la V1. Leurs dépendances techniques et fonctionnelles sont également prévues dans cette version. Les exigences techniques sont identifiées séparément afin de distinguer les fonctionnalités métier des fondations nécessaires au fonctionnement de la PWA.

## 5. Synthèse du périmètre V1

| Indicateur | Valeur |
| --- | --- |
| Nombre total d’éléments décrits | 17 (13 fonctionnalités métier + 4 fondations techniques) |
| Dont inclus dans la V1 | 11 (7 fonctionnalités métier + 4 fondations techniques) |
| Répartition des complexités en V1 | 0 S / 8 M / 3 L |


**Ce que j’ai délibérément écarté de la V1, et pourquoi :** Smart Check et Dashboard sont différés pour privilégier la fiabilité du parcours principal et des alertes de timer. Cloud Sync, Accounts et Collaboration nécessitent des services distants, une sécurité et une gestion des accès incompatibles avec le périmètre frontend-only. L’AI Assistant demande des validations et une infrastructure supplémentaires. Les alertes garanties lorsque l’application est fermée ne sont pas promises en V1.

## 6. Plan de développement prévisionnel

| Semaine | Période | Objectif | Fonctionnalités visées |
| --- | --- | --- | --- |
| 1 | Fin octobre | Initialisation React, TypeScript, Vite, PWA et interface | TECH-02, TECH-03, base TECH-04 |
| 2 | Début novembre | Protocol Library, modèles de données et IndexedDB | PROT-01, TECH-01 |
| 3 | Mi-novembre | Smart Workflow, gestion de deux sessions indépendantes, sauvegarde et test de reprise après fermeture et réouverture. | WORK-01, PROG-01 |
| 4 | Fin novembre | Experiment Notes, Scientific Calculator et Laboratory Timer | NOTE-01, CALC-01, TIME-01 |
| 5 | Début décembre | Notifications, tests offline et intégration | NOTIF-01, finalisation TECH-04 |
| 6 | Jusqu’au 10 décembre | Tests complets, corrections, documentation et soutenance | Aucune nouvelle fonctionnalité |


## 7. Risques identifiés

| Risque | Fonctionnalité concernée | Plan de repli |
| --- | --- | --- |
| Notifications système limitées selon navigateur, permission ou fermeture de la PWA | NOTIF-01 | Alerte visuelle/sonore interne fiable lorsque l’app est ouverte ; tester sur appareils cibles ; ne pas promettre le push en arrière-plan. |
| Timers ralentis lors de la mise en veille | TIME-01 | Calculer le temps restant par horodatage plutôt que par nombre de ticks ; recalcul au retour au premier plan. |
| Perte/éviction des données locales | TECH-01, TECH-04 | Jeux de démonstration reproductibles, gestion des erreurs et message explicite ; ne pas présenter IndexedDB comme sauvegarde garantie. |
| Périmètre trop large pour six semaines | WORK-01, CALC-01 | Limiter à trois protocoles de démonstration et un calculateur de dilution et des conversions de volume ; reporter CHECK-01 et DASH-01. |
| Comportements PWA différents selon appareils | TECH-02, TECH-04 | Tester tôt sur Chrome desktop et un téléphone ; documenter les limites des navigateurs. |


### Scénarios de risque et vérification de la fiabilité

Afin d'anticiper les difficultés techniques susceptibles de survenir lors de l'utilisation de BenchFlow, deux scénarios représentatifs ont été identifiés. Ils permettront de vérifier la fiabilité du stockage local, la gestion des timers et l'indépendance des sessions expérimentales.

**Premier scénario :** L'utilisateur démarre une session expérimentale et active un timer associé à une étape. Il ferme ensuite complètement BenchFlow et rouvre l'application après une période prolongée. À la réouverture, les données préalablement enregistrées doivent rester accessibles, sous réserve qu'elles n'aient pas été supprimées par le navigateur ou l'utilisateur. L'application doit retrouver la progression de l'expérience et recalculer l'état du timer à partir de son horodatage. Elle ne doit cependant pas prétendre qu'une notification a été envoyée pendant sa fermeture si aucun mécanisme ne le garantit.

**Deuxième scénario :** L'utilisateur crée deux sessions distinctes à partir d'un même protocole et avance à des étapes différentes dans chacune d'elles. Il ajoute des observations et valide plusieurs étapes dans la première session, puis passe à la seconde. Les données et la progression doivent rester propres à chaque session. Après fermeture et réouverture de BenchFlow, les deux sessions doivent pouvoir être retrouvées sans mélange d'informations ni perte des validations enregistrées.
