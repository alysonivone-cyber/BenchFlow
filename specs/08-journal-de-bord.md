# 08 — Journal de bord du développement

**Projet :** BenchFlow  
**Période :** 20 octobre – 11 novembre 2026  
**Document complémentaire :** `03-historique-des-commits.md`

## Du 20 au 28 octobre 2026 — Développement exploratoire et structuration du projet

Durant cette période, j'ai travaillé localement sur le développement de BenchFlow afin de construire une première version fonctionnelle de mon application et d'évaluer la faisabilité technique des fonctionnalités envisagées.

Cette phase m'a permis d'expérimenter plusieurs solutions, notamment la gestion des protocoles scientifiques, le suivi des expériences, les minuteries, les notes expérimentales, le calculateur scientifique et l'importation de protocoles PDF.

J'ai également rencontré différentes difficultés techniques, notamment concernant l'interprétation des documents PDF, la structuration du code et la persistance des données.

Ces premiers essais m'ont permis de mieux identifier les fonctionnalités réalisables dans le temps imparti, celles nécessitant des améliorations et celles pouvant être reportées à une version ultérieure.

Ce travail exploratoire a ainsi contribué à préciser le périmètre de la V1 et à réévaluer certains éléments du cahier des fonctionnalités essentielles dont le pdf : « Document des fonctionnalités PWA » était à rendre pour le 27 octobre 2026.

Le 28 octobre 2026, j'ai procédé aux premiers commits Git afin d'enregistrer le travail développé localement et de commencer un suivi structuré des versions.

Le nombre de fichiers présents dans les premiers commits s'explique donc par l'existence d'une première base de développement réalisée avant l'initialisation de Git.

Cette démarche m'a permis de passer d'une phase d'expérimentation à une organisation plus rigoureuse du projet, fondée sur le versionnement, les tests et la documentation des décisions techniques.

### Précision pour le suivi

Le travail local précède les premiers commits Git du 28 octobre, et la date d'un commit est celle de l'enregistrement, pas de l'écriture. La période de développement est donc décrite ici ; le détail des commits est dans `03-historique-des-commits.md`.

## Bilan de la période

**Acquis :** une base fonctionnelle de BenchFlow, une organisation du code plus claire et un premier suivi des versions. Un build de production réussi a été observé, avec génération des ressources PWA.

**Difficultés :** lecture structurée de PDF, erreurs de typage TypeScript et indisponibilité du stockage d’un timer dans certaines sessions.

**Prochaines étapes (état au 28 octobre) :** consolider l’extraction PDF sur plusieurs documents, diagnostiquer et retester le timer des sessions, exécuter les tests automatisés, puis documenter chaque commit réel. Le timer et les tests ont été traités le 11 novembre (voir plus bas).

## 11 novembre 2026 — Séance de corrections avec l'assistant IA Claude

- **Travail effectué :** correction du timer de session, alertes de fin de timer (NOTIF-01), badge « Open me » / « Close » et puces, suppression de protocoles (y compris de démonstration) en cascade, chargement différé de pdf.js, migration vers Tailwind CSS, réglages VS Code.
- **Problèmes rencontrés :** « Timer storage unavailable » (course entre deux créations du timer sous React.StrictMode) ; avertissement de taille de bundle ; import PDF hors ligne cassé par un worker `.mjs` non précaché ; débordement horizontal à 375 px ; régressions visuelles de la migration Tailwind (dialogue décalé, couleur du placeholder, bouton de fichier) ; `npm install` oublié après ajout de Tailwind.
- **Solutions et justification :** voir DT-10 à DT-14 dans `04-decisions-techniques.md`.
- **Fichiers concernés :** `timerService.ts`, `TimerPanel.tsx`, `timerAlerts.ts`, `protocolService.ts`, `database.ts` (v3), `ConfirmDialog.tsx`, `ui.ts`, `styles.css`, `vite.config.ts`, etc.
- **Tests exécutés et résultats :** 32 tests Vitest réussis, `tsc -b` et `vite build` réussis, parcours vérifiés dans Chrome par script (voir `05`). Test manuel sur ma machine : à faire.
- **Commits Git :** voir le tableau de `03-historique-des-commits.md`, section 4 bis ; créés le 11 novembre **après** la séance, regroupés par sujet.
- **État final / points à poursuivre :** test manuel du timer et des notifications ; NOTE-01 (indépendance des notes entre sessions) ; test hors ligne sur build de production ; réviser le code ligne à ligne pour l'oral ; commiter désormais après chaque fonction.

## 11 novembre 2026 (après-midi) — Noms lisibles des sessions

- **Travail effectué :** affichage `20261111-1423 · Titre` pour les sessions, date d'ajout des protocoles, titre de repli = nom du fichier PDF.
- **Fichiers concernés :** `sessionLabel.ts` (nouveau), `SessionPages.tsx`, `ProtocolLibrary.tsx`, `NewProtocol.tsx`, `models.ts`.
- **Tests exécutés et résultats :** 37 tests Vitest réussis (5 nouveaux), `tsc -b` et `vite build` réussis, session créée dans Chrome par script : le titre affiché est `20261111-1233 · DNA Extraction`.
- **Commit Git :** 42f7722.
- **État final / points à poursuivre :** décider d'une page d'analyse (bonus hors V1).

## 11 novembre 2026 (après-midi) — Correctif des pages « introuvable » (DT-16)

- **Travail effectué :** les pages d'un protocole ou d'une session dont l'identifiant n'existe pas restaient bloquées sur « Loading… ». Les requêtes renvoient désormais `null` pour « introuvable », `undefined` restant réservé au chargement.
- **Fichiers concernés :** `ProtocolDetail.tsx`, `SessionPages.tsx`, `protocolService.test.ts` (un test ajouté).
- **Tests exécutés et résultats :** 38 tests Vitest réussis, build réussi ; essai dans le navigateur des pages `/protocols/inconnu` et `/sessions/inconnu`, puis d'un vrai protocole et d'une vraie session.
- **Commit Git :** 31e0010, 11 novembre 2026.

## 11 novembre 2026 (après-midi) — Titre lisible pour l'onglet du PDF (DT-17)

- **Travail effectué :** en ouvrant un PDF depuis la bibliothèque, l'onglet portait un identifiant technique. J'ai d'abord écrit un titre dans une copie du PDF (`pdf-lib`) : les tests passaient, mais l'essai dans Edge a montré que cela ne changeait rien. J'ai abandonné cette piste sans la commiter et ouvert à la place une page intermédiaire contenant le PDF, avec repli direct sur téléphone.
- **Résultat dans Edge :** le PDF s'affiche dans la page et l'identifiant technique a disparu, mais l'onglet reprend le titre interne du PDF au lieu de `date-heure · titre` : le lecteur d'Edge remplace le titre de ma page. J'ai gardé l'amélioration en notant la limite dans DT-17.
- **Ce que j'ai appris :** un test unitaire vert ne prouve pas que la fonctionnalité marche dans le vrai navigateur ; il faut l'essayer là où elle sera utilisée.
- **Fichiers concernés :** `pdfTitle.ts` (nouveau), `protocolService.ts`.
- **Commit Git :** `4fdd999` (code), `4e96da6` (specs).
- **Prochaine étape :** retirer les `console.log` de `database.ts`.

## Modèle à réutiliser pour les prochaines séances

### [Date] — [Fonctionnalité ou correction]

- **Travail effectué :**
- **Problème rencontré :**
- **Solution et justification :**
- **Fichiers concernés :**
- **Tests exécutés et résultats :**
- **Commit Git (hash et date) :**
- **État final / points à poursuivre :**

> Ne noter « testé », « corrigé » ou « validé » qu’après avoir constaté le résultat.

## Du 1er au 3 novembre 2026 — Création et structuration de la documentation technique (SPECS)

Durant cette période, j'ai consacré une partie de mon travail à la création et à l'organisation des spécifications techniques de BenchFlow, afin de compléter la documentation existante du projet.

Le README et le cahier des fonctionnalités essentielles étant déjà rédigés, l'objectif était de produire une documentation complémentaire permettant de présenter plus précisément l'architecture de l'application, les décisions techniques, les difficultés rencontrées, les tests réalisés et l'évolution du développement.

J'ai ainsi préparé un ensemble de fichiers Markdown regroupés dans un dossier `specs`, placé à la racine du projet, indépendamment du dossier `docs` et du code source `src`.

### Documentation créée et organisée

Les documents suivants ont été préparés :

- `00-index.md` : sommaire et organisation de la documentation.
- `02-architecture-technique.md` : présentation de l'architecture et des technologies utilisées.
- `03-historique-des-commits.md` : chronologie du développement et suivi des versions Git.
- `04-decisions-techniques.md` : justification des choix techniques et des adaptations du projet.
- `05-tests-et-validation.md` : suivi des vérifications, difficultés et résultats observés.
- `06-limites-et-ameliorations.md` : identification des limites actuelles et des évolutions envisagées.
- `07-preparation-oral.md` : préparation de la présentation technique et des questions potentielles.
- `08-journal-de-bord.md` : documentation chronologique du travail effectué.

### Cohérence avec le développement initial

Une attention particulière a été portée à la cohérence entre les spécifications techniques, le journal de bord et les premiers commits Git.

J'ai notamment documenté la période de développement exploratoire du 20 au 28 octobre 2026, l'échéance du document des fonctionnalités essentielles du 27 octobre ainsi que les premiers commits réalisés le 28 octobre.

J'ai également précisé la distinction entre les dates de développement local, les dates de création ou de remplacement des fichiers sous Windows et les dates d'enregistrement dans Git.

Cette distinction était nécessaire, car certaines modifications importantes avaient conduit au remplacement de fichiers sources par des versions complètes, pouvant modifier leurs métadonnées de création sans refléter la date initiale du développement des fonctionnalités concernées.

### Organisation et intégration dans VS Code — 3 novembre 2026

Le 3 novembre, j'ai intégré les fichiers de spécifications dans un nouveau dossier `specs` directement à la racine de BenchFlow.

Cette organisation permet de séparer les documents techniques du code source, des documents complémentaires et des fichiers principaux du projet, tout en facilitant leur consultation et leur mise à jour.

### Bilan de la période

**Travail effectué :** création, révision et organisation des spécifications techniques, clarification de la chronologie du développement et intégration du dossier `specs` dans VS Code.

**Décisions prises :** conserver le README et le cahier des fonctionnalités existants, centraliser la documentation technique dans un dossier dédié et distinguer systématiquement les périodes de développement des dates de commits Git.

**Résultat :** une documentation structurée, destinée à accompagner le développement de BenchFlow et à faciliter la préparation de sa présentation orale.

**Prochaines étapes :** maintenir les spécifications à jour à chaque évolution importante de l'application, compléter l'historique des commits avec les références Git correspondantes et documenter les résultats des tests réellement effectués.