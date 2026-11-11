# 03 — Historique des commits et chronologie du développement

**Projet :** BenchFlow — Experimental Workflow Companion  
**Période documentée :** 20 octobre – 11 novembre 2026  
**Dernière mise à jour documentaire :** 11 novembre 2026  
**Document complémentaire :** `08-journal-de-bord.md`

**Objectif :** documenter l'évolution du projet BenchFlow, les différentes étapes de développement, les décisions techniques, les difficultés rencontrées ainsi que le suivi des versions Git.

---

## 1. Chronologie générale

### Du 20 au 28 octobre 2026 — Développement exploratoire et structuration du projet

Durant cette période, j'ai travaillé localement sur le développement de BenchFlow afin de construire une première version fonctionnelle de mon application et d'évaluer la faisabilité technique des fonctionnalités envisagées.

Cette phase m'a permis d'expérimenter plusieurs solutions, notamment la gestion des protocoles scientifiques, le suivi des expériences, les minuteries, les notes expérimentales, le calculateur scientifique et l'importation de protocoles PDF.

J'ai également rencontré différentes difficultés techniques, notamment concernant l'interprétation des documents PDF, la structuration du code et la persistance des données.

Ces premiers essais m'ont permis de mieux identifier les fonctionnalités réalisables dans le temps imparti, celles nécessitant des améliorations et celles pouvant être reportées à une version ultérieure.

Ce travail exploratoire a ainsi contribué à préciser le périmètre de la V1 et à réévaluer certains éléments du cahier des fonctionnalités essentielles, dont le PDF intitulé « Document des fonctionnalités PWA » était à rendre pour le **27 octobre 2026**.

Le 28 octobre 2026, j'ai procédé aux premiers commits Git afin d'enregistrer le travail développé localement et de commencer un suivi structuré des versions.

Le nombre de fichiers présents dans les premiers commits s'explique donc par l'existence d'une première base de développement réalisée avant l'initialisation de Git.

Cette démarche m'a permis de passer d'une phase d'expérimentation à une organisation plus rigoureuse du projet, fondée sur le versionnement, les tests et la documentation des décisions techniques.

### Précision — dates des fichiers et dates des commits

La date d'un commit indique le moment où un état du projet a été **enregistré** dans Git ; elle ne prouve pas la date à laquelle le code a été écrit. De même, la date de création d'un fichier affichée par Windows peut changer quand un fichier est remplacé par une version complète. Les dates de développement local (20–28 octobre) reposent donc sur ce journal et non sur les métadonnées des fichiers.

Pour la suite, je conserve les fichiers existants, je documente les réécritures importantes et je fais des commits ciblés après vérification.

---

## 2. 28 octobre 2026 — Premiers commits Git

Après la phase de développement exploratoire, j'ai commencé à enregistrer le projet avec Git afin de conserver un historique des modifications.

Les premiers commits ont permis de sauvegarder la base fonctionnelle existante et d'améliorer progressivement l'organisation du code.

| Date | Commit | Objet | Justification |
|---|---|---|---|
| 28/10/2026 | `ef00ee4` | Premier enregistrement de BenchFlow | Conserver un état de référence du projet développé localement |
| 28/10/2026 | `b0decdf` | Restructuration du projet | Clarifier l'organisation du code et faciliter sa maintenance |
| 28/10/2026 | `4fb1ae8` | Polissage des sessions expérimentales et du timer | Clarifier ces deux modules |
| 28/10/2026 | `bb83d6a` | Polissage du calculateur scientifique et tests supplémentaires | Renforcer la fiabilité des calculs |
| 28/10/2026 | `40794ba` | Polissage du schéma de base de données et des modèles | Stabiliser la couche de données |

Ces cinq commits sont ceux présents dans `git log` pour le 28 octobre (entre 14 h 33 et 16 h 15). Les messages exacts et les fichiers concernés peuvent être consultés directement dans l'historique Git.

### Commit `ef00ee4` — Premier enregistrement du projet

**Contexte :** plusieurs fonctionnalités et fichiers avaient déjà été développés localement avant la mise en place du versionnement.

**Objectif :** créer un premier état de référence de BenchFlow.

**Justification :** disposer d'une version enregistrée permettant de suivre les modifications futures et de revenir à un état antérieur si nécessaire.

**Particularité :** ce commit contient un nombre important de fichiers, car il enregistre une base de travail préexistante. Il ne signifie pas que toutes les fonctionnalités ont été développées le jour du commit.

**Enseignement :** commencer le versionnement plus tôt aurait facilité le suivi individuel des modifications. Cette expérience m'a encouragée à adopter une méthode de commits plus régulière.

### Commit `b0decdf` — Restructuration du projet

**Contexte :** BenchFlow comprend plusieurs domaines fonctionnels, notamment les protocoles, les sessions expérimentales, les minuteries, les calculs scientifiques et la persistance locale.

**Objectif :** améliorer la lisibilité du projet en séparant les différentes responsabilités techniques.

**Choix technique :** organiser le code par fonctionnalités dans `src/features/`, avec les modèles partagés dans `src/types/` et la gestion de la base de données locale dans `src/db/`.

**Bénéfices attendus :** faciliter les corrections, les évolutions futures, la maintenance et la compréhension de l'architecture.

**Vérifications nécessaires :** contrôler les imports, exécuter la compilation TypeScript, réaliser un build de production et vérifier les fonctionnalités concernées.

---

## 3. Travaux techniques réalisés pendant la phase initiale

Les travaux suivants correspondent aux fonctionnalités développées ou aux difficultés rencontrées pendant la phase exploratoire. Ils ne sont pas associés à des commits individuels lorsque leur référence Git n'a pas été vérifiée.

| Domaine | Travail entrepris | État documenté |
|---|---|---|
| Gestion des protocoles | Création et consultation de protocoles scientifiques | Base fonctionnelle développée |
| Importation PDF | Utilisation de PDF.js pour lire les documents directement dans le navigateur | Extraction en cours d'amélioration |
| Extraction structurée | Reconnaissance des titres, objectifs, matériels et étapes | Résultats améliorés sur un document de démonstration |
| Sessions expérimentales | Suivi des protocoles étape par étape | Interface développée, validation complète à poursuivre |
| Notes expérimentales | Préparation de la prise de notes pendant les expériences | Fonctionnalité intégrée au travail exploratoire |
| Minuteries | Gestion du temps pendant les étapes expérimentales | Problème de persistance constaté dans certaines sessions |
| Calculateur scientifique | Développement d'outils de calcul destinés au laboratoire | Fonctionnalités développées pendant la phase initiale |
| TypeScript | Correction d'erreurs de typage et d'intégration de PDF.js | Compilation réussie observée |
| PWA | Configuration du projet avec Vite et génération des ressources PWA | Build réussi observé, tests hors ligne à compléter |

### Difficultés techniques rencontrées

**Extraction PDF :** la structure des documents scientifiques varie considérablement. L'identification automatique des sections, des étapes et des informations expérimentales a nécessité plusieurs ajustements.

**Typage TypeScript :** certaines intégrations, notamment avec PDF.js, ont généré des erreurs nécessitant une adaptation des types et des imports.

**Persistance des minuteries :** un problème de stockage a été observé dans certaines sessions expérimentales, avec l'affichage du message « Timer storage unavailable ». **Cause identifiée et corrigée le 11 novembre** : voir DT-13.

**Organisation du code :** l'évolution du nombre de fonctionnalités a rendu nécessaire une structuration plus claire des composants et services.

Ces difficultés ont contribué à orienter les décisions techniques et à identifier les améliorations prioritaires pour la suite du développement.

---

## 4. Du 1er au 3 novembre 2026 — Création et structuration des spécifications techniques

Durant cette période, j'ai consacré une partie de mon travail à la création et à l'organisation des spécifications techniques de BenchFlow afin de compléter la documentation existante.

Le README et le cahier des fonctionnalités essentielles étant déjà rédigés, l'objectif était de produire une documentation complémentaire permettant de présenter l'architecture de l'application, les décisions techniques, les difficultés rencontrées, les tests réalisés et l'évolution du développement.

J'ai préparé plusieurs fichiers Markdown regroupés dans un dossier `specs`, distinct du dossier `docs` et du code source `src`.

### Documents créés

| Fichier | Objectif |
|---|---|
| `00-index.md` | Présenter l'organisation générale des spécifications |
| `02-architecture-technique.md` | Documenter l'architecture et les technologies utilisées |
| `03-historique-des-commits.md` | Retracer les étapes de développement et les commits Git |
| `04-decisions-techniques.md` | Expliquer les choix techniques et leurs justifications |
| `05-tests-et-validation.md` | Centraliser les vérifications et résultats observés |
| `06-limites-et-ameliorations.md` | Identifier les limites actuelles et les évolutions envisagées |
| `07-preparation-oral.md` | Préparer la présentation et les questions techniques |
| `08-journal-de-bord.md` | Conserver un suivi chronologique du travail effectué |

### Cohérence avec la chronologie du projet

Une attention particulière a été portée à la cohérence entre les spécifications techniques, le journal de bord et l'historique Git.

J'ai notamment documenté la période exploratoire du 20 au 28 octobre, l'échéance du document des fonctionnalités essentielles du 27 octobre et les premiers commits réalisés le 28 octobre.

J'ai également précisé la distinction entre les dates de développement local, les dates de création ou de remplacement des fichiers Windows et les dates des commits Git.

Cette démarche permet d'éviter de confondre la création d'un fichier actuellement présent sur le disque avec le début du développement de la fonctionnalité correspondante.

### 3 novembre 2026 — Intégration du dossier `specs` dans VS Code

Le 3 novembre, j'ai intégré les fichiers de documentation technique dans un dossier `specs` situé à la racine du projet BenchFlow.

Cette organisation permet de séparer clairement :

- Le code source de l'application dans `src/`.
- Les documents complémentaires dans `docs/`.
- Les spécifications techniques dans `specs/`.
- Le README et le cahier des fonctionnalités essentielles à la racine du projet.

Cette structuration facilite la consultation, la maintenance et la mise à jour des documents pendant les prochaines étapes du développement.

### Suivi Git des spécifications

Lors de leur intégration dans VS Code, les nouveaux fichiers du dossier `specs` apparaissaient avec l'indication `U`, correspondant au statut *untracked*.

Cela signifie qu'ils avaient été créés dans le dossier du projet, mais n'étaient pas encore enregistrés dans l'historique Git.

Leur création documentaire et leur premier commit doivent donc être distingués.

**Commit d'intégration des SPECS :** « docs: add and update project specs », enregistré le 11 novembre 2026 (hash dans le tableau de la section 4 bis).

### Bilan documentaire du 1er au 3 novembre

**Travail effectué :** création, révision et organisation des spécifications techniques de BenchFlow.

**Décisions prises :** conserver les documents pédagogiques existants, centraliser la documentation technique dans un dossier dédié et adopter une méthode de suivi chronologique.

**Résultat :** une documentation structurée permettant d'accompagner le développement et de préparer la présentation orale.

**Prochaines étapes :** maintenir les documents à jour, vérifier les informations techniques et enregistrer les modifications documentaires dans Git.

---

## 4 bis. 11 novembre 2026 — Corrections, nouvelles fonctions et enregistrement dans Git

**Constat honnête :** après les cinq commits du 28 octobre, je n'ai plus enregistré de commit pendant deux semaines, alors que je continuais à modifier le code en local (fichiers modifiés entre le 28 octobre et le 5 novembre selon leurs dates de modification). Le 11 novembre, j'ai fait une session de travail avec l'assistant IA Claude : correction du timer, notifications, badge « Open me », suppression de protocoles, chargement différé de pdf.js, migration vers Tailwind. Je n'ai pas commité au fil de l'eau : **les commits ci-dessous ont été créés après coup, regroupés par sujet**, à partir de l'état final de mon dossier. Ils portent donc tous la date du 11 novembre et **ne reflètent pas l'ordre ni l'heure exacts du travail**. Je le précise pour ne pas laisser croire à un historique minuté.

**Ce que j'en retiens :** un commit après chaque fonction terminée aurait donné un historique plus fidèle. À partir de maintenant : un commit par correction ou fonction, avec un message `type(portée): objet`, et le hash noté dans le journal.

Chaque groupe contient des fichiers entiers ; un fichier qui touche plusieurs sujets (par exemple `TimerPanel.tsx`) est dans le commit de son sujet principal. Après chaque commit, `tsc` et les tests passent (18, puis 23, 28, 28, 32, 32, 32 tests).

### Commits du 11 novembre 2026

| Hash | Commit | Contenu |
|---|---|---|
| `2f2b3dc` | `refactor(ui): migrate styles to Tailwind CSS v4 and add shared UI helpers` | Tailwind v4, `styles.css`, `ui.ts`, `Chip`, `Layout`, `App`, calculateur, `vite.config.ts`, favicon |
| `3a85b20` | `fix(timer): create the step timer in one Dexie transaction` | `timerService.ts` et test de régression (DT-13) |
| `f551ae3` | `feat(timer): alert the user when a step timer ends (NOTIF-01)` | `TimerPanel.tsx`, `timerAlerts.ts` et tests (DT-14) |
| `05f3636` | `feat(protocols): add Open me / Close badge on protocol steps` | `ProtocolDetail.tsx` |
| `b838542` | `feat(protocols): delete any protocol with its sessions, notes and timers` | Dexie v3, service, dialogue, tests (DT-12) |
| `8c5b3fb` | `feat(protocols): import a protocol from a PDF, loaded on demand` | `NewProtocol.tsx`, `pdfExtractor.ts` (DT-11) |
| `286a477` | `chore: development diagnostic and small clean-ups` | `main.tsx`, `models.ts`, `sessionService.ts` |
| `a922194` | `chore(vscode): silence Tailwind at-rule warnings and recommend the extension` | `.vscode/` |
| `56ea93d` | `docs: add and update project specs` | Dossier `specs/` |
| `880c22d` | `docs(readme): declare Claude assistance, update scope and styling` | `README.md` |

Obtenir les hashes : `git log --oneline -12`.

Détail des décisions : voir `04-decisions-techniques.md` (DT-10 à DT-14).

---

## 5. Tests et vérifications techniques

### Build de production

Un build de production réussi a été observé pendant la phase initiale, avec compilation TypeScript, génération des fichiers Vite et production des ressources PWA. L'avertissement de taille des bundles observé alors est **résolu le 11 novembre** (voir DT-11).

Un build réussi confirme la possibilité de compiler et de générer l'application, mais ne garantit pas le fonctionnement de toutes ses fonctionnalités.

### Résultats observés le 11 novembre 2026

- 32 tests automatisés réussis (Vitest) sur l'état final.
- `tsc -b` et `vite build` réussis ; 11 fichiers précachés par le service worker.
- Parcours vérifiés dans Chrome par un script automatisé (démarrage d'un timer de session, suppression d'un protocole et restauration des protocoles de démonstration, import PDF hors ligne) ; ce script a été exécuté dans l'environnement de l'assistant, pas sur ma machine.

### Vérifications restant à faire

- Tester l'extraction PDF sur plusieurs documents scientifiques.
- Rejouer à la main, sur ma machine, le timer et les notifications (permission du navigateur, onglet en arrière-plan).
- Vérifier le mode hors ligne sur un build de production installé.
- Tester l'indépendance des notes entre deux sessions (NOTE-01).

Les résultats seront ajoutés uniquement après exécution effective.

---

## 6. Méthode de suivi des prochains commits

Afin d'améliorer la traçabilité du développement, chaque modification importante fera l'objet d'une documentation comprenant :

1. **Date du travail :** moment où la fonctionnalité ou la correction a été développée.
2. **Objectif :** problème à résoudre ou amélioration recherchée.
3. **Fichiers concernés :** composants, services ou documents modifiés.
4. **Choix techniques :** solutions retenues et raisons de leur sélection.
5. **Tests effectués :** commandes exécutées et résultats réellement observés.
6. **Commit Git :** identifiant, date et description du commit.
7. **État final :** fonctionnalité validée, correction partielle ou points restant à traiter.

### Commandes utiles dans PowerShell

```powershell
git status
git log --date=iso-local --pretty=format:"%h | %ad | %s"
git show --stat --oneline ef00ee4
git show --stat --oneline b0decdf
npm.cmd run build
npx.cmd vitest run
```

Ces commandes sont fournies comme références pour les prochaines vérifications. Leur présence dans la documentation ne signifie pas qu'elles ont toutes été exécutées avec succès.

---

## 7. Préparation de la présentation orale

### Pourquoi les premiers commits contiennent-ils autant de fichiers ?

Le développement de BenchFlow a commencé localement avant l'initialisation de Git. Le premier commit enregistre donc une base de travail déjà constituée, et non uniquement du code écrit le jour de son enregistrement.

### Pourquoi certains fichiers affichent-ils une date de création au 28 octobre ?

Windows peut modifier la date de création d'un fichier remplacé : la date affichée ne prouve pas le début du développement. Je m'appuie sur le journal de bord et sur l'historique Git, qui est lui-même daté de l'enregistrement et non de l'écriture.

### Pourquoi y a-t-il eu deux semaines sans commit, puis beaucoup de commits le 11 novembre ?

J'ai continué à modifier le code en local sans enregistrer d'étape. Le 11 novembre, j'ai enregistré ce travail par sujets, après l'avoir testé. C'est un défaut de méthode que je reconnais ; je commite désormais après chaque fonction terminée.

### Pourquoi avoir créé les spécifications après le début du développement ?

Les premiers essais techniques m'ont permis de mieux comprendre l'architecture de BenchFlow, les difficultés rencontrées et les fonctionnalités réellement réalisables.

La création des spécifications du 1er au 3 novembre m'a ensuite permis de formaliser ces choix, de structurer la documentation et de préparer un suivi plus rigoureux pour la suite.

### Pourquoi les fichiers SPECS n'ont-ils pas immédiatement de commit Git ?

Les fichiers ont d'abord été créés, révisés et organisés localement. Leur intégration dans Git constitue une étape distincte, qui sera documentée avec la date et le hash du commit correspondant.

---

## 8. Conclusion

Le développement de BenchFlow a commencé par une phase exploratoire locale du 20 au 28 octobre 2026, permettant de construire une première base fonctionnelle et d'évaluer les contraintes techniques du projet.

Les premiers commits du 28 octobre ont ensuite marqué le début du suivi des versions avec Git.

Du 1er au 3 novembre, la création et l'organisation des spécifications techniques ont permis de compléter cette démarche par une documentation structurée.

Cette évolution reflète une progression dans ma méthode de travail : passer de l'expérimentation et du prototypage à un développement davantage organisé, documenté et vérifiable.

L'objectif pour la suite est de maintenir cette cohérence entre le code source, les tests, les décisions techniques, le journal de bord et l'historique Git.