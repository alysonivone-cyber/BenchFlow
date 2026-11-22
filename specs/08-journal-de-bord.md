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

## 17 novembre 2026 — Nettoyage du code (séances du 12 au 16 novembre regroupées)

- **Travail effectué :** les séances de nettoyage prévues du 12 au 16 novembre n'ont pas pu avoir lieu ; je les ai faites le 17 novembre, avec un commit par sujet à la date réelle. Retrait du diagnostic de développement de `database.ts` (dont les `console.log`) et de son appel dans `main.tsx` ; suppression du fichier `ProtocolPages.tsx`, jamais importé ; fonction `twoDigits` dédoublée, désormais dans `src/utils/format.ts` avec 2 tests.
- **Imports inutilisés :** aucun à retirer, car `noUnusedLocals` et `noUnusedParameters` sont actifs dans `tsconfig.json` et le build échoue sinon.
- **Tests exécutés et résultats :** 40 tests Vitest réussis, `tsc -b` et `vite build` réussis.
- **Commits Git :** `f7730cf` (diagnostic), `f773e35` (fichier mort), `4db4b47` (doublon).
## 17 novembre 2026 (suite) — Logo et slogan (DT-18)

- **Travail effectué :** le logo remplace le carré provisoire « BF » sur l'accueil, et les icônes de l'application reprennent le symbole du logo. Le logo a été préparé (fond transparent, recadré, réduit).
- **Fichiers concernés :** `App.tsx`, `src/assets/benchflow-logo.png` (nouveau), `public/icons/icon-192.png` et `icon-512.png`.
- **Tests exécutés et résultats :** `tsc -b` et `vite build` réussis, 12 fichiers dans le cache hors ligne ; test hors ligne à faire le 21 novembre.
- **Commits Git :** `59d2a1d` (accueil), `0a1982a` (icônes).

## 18 novembre 2026 — Timers indépendants, étiquettes lisibles et alertes globales (DT-19, DT-20)

**Constat :** en testant devant l'enseignant, le timer de la page Scientific Calculator repartait à zéro au rafraîchissement, alors que les timers des sessions étaient bien conservés. Cause : ce timer n'était pas enregistré (composant utilisé sans identifiants, donc en mémoire seulement). Je voulais aussi deux timers complètement indépendants, capables de tourner en même temps avec des durées différentes, un nom lisible des timers dans l'inspecteur (comme pour les PDF), et une alerte de fin même quand on change de page.

**Décisions (prises avec l'enseignant) :** garder `TimerPanel` pour les sessions et ajouter un fichier de timer global ; la logique partagée passe dans un hook ; ajouter un champ `label` au format `date-heure · titre du protocole · étape` ; surveiller tous les timers au même endroit pour les alertes. L'enseignant a aussi nommé la notion de **couplage** : le but est un faible couplage entre les timers (voir DT-19).

**Réalisation avec l'assistant IA Claude (un commit par étape) :**
- `7af23e6` — `refactor(timer)` : logique dans `useLabTimer`, affichage dans `TimerView`, `TimerPanel` allégé.
- `a8b0e2d` — `feat(timer)` : `GlobalTimer` (identifiant `global:calculator`), timer de la calculatrice enregistré, suppression du mode « en mémoire ».
- `2fec44d` — `feat(timer)` : champ `label` lisible (ajouté aussi aux anciens timers).
- `ada49ec` — `feat(timer)` : surveillance globale des alertes (`TimerWatcher` dans `Layout`), alerte déclenchée une seule fois.
- `7e1e707` — `feat(timer)` : bandeau dans l'application, qui reste jusqu'à ce qu'on le ferme.
- `4cd042c` — `fix(timer)` : plus de clignotement `00:00` / `00:30` ni de seconde en trop après un rafraîchissement.
- `e98ce95` — `style(protocols)` : une ligne vide en trop supprimée.
- `f1d8d4a` et `d162f47` — documentation : DT-19, DT-20 et déclaration d'IA du README.

**Tests :** 40 → 47 tests unitaires (indépendance des deux timers, timer global conservé à la suppression d'un protocole, étiquette, `finishDueTimers` une seule fois, texte de l'alerte). `tsc -b` et `vite build` réussis à chaque commit. Dans le navigateur : rafraîchissement de la calculatrice, deux timers simultanés (session 45 s et calculatrice 15 min), bandeau sur une autre page. Le défaut d'affichage au rafraîchissement a été reproduit puis corrigé (20 rafraîchissements automatisés : 0 anomalie après, contre 20 clignotements et 1 seconde en trop avant).

**Limites connues :** alerte locale uniquement (application fermée : aucune alerte, pas de Web Push) ; pas de test unitaire pour l'affichage au rafraîchissement (aucune bibliothèque de test d'interface installée).

**Validation :** solution présentée à l'enseignant le 18 novembre, qui l'a validée.

**Interface (18 novembre, après-midi) :** sur le conseil de l'enseignant, le badge vert « Open me » / rouge « Close » des étapes est remplacé par une pastille ronde grise, sans texte visible (commit `93bccc9`, voir DT-21).

**Planning :** le scénario de test 1 (résultats dans `specs/05`) est reporté au 19 novembre, avec L-02 (temps restant dans le titre de l'onglet) ; 20 novembre : R-03 (« Notes enregistrées ») ; 21 novembre : tests manuels (hors ligne, 375 px, timers, notifications). **Encore à vérifier :** le titre de l'onglet d'un PDF fraîchement importé (DT-17).

## 22 novembre 2026 — Temps restant dans l'onglet (L-02) et confirmation d'enregistrement des notes (R-03)

**Constat :** les séances prévues du 19 au 21 novembre ont été reportées ; je les ai regroupées le 22 novembre. Deux points de la liste restaient à faire : voir le temps restant d'un timer sans revenir sur l'application (L-02), et savoir si les notes d'une étape sont bien enregistrées (R-03).

**Réalisation avec l'assistant IA Claude (un commit par fonction) :**
- `ed9ed56` — `feat` L-02 : titre de l'onglet `⏱ mm:ss · BenchFlow`, géré par `TimerWatcher` ; fonction pure `timerTabTitle` et fonction `formatClock` déplacée dans `utils/format.ts` (DT-22).
- `823989d` — `feat` R-03 : message « ✓ Notes saved » sous le bouton « Save Notes ».

**Un défaut trouvé en testant moi-même :** le message de R-03 pouvait disparaître tout de suite, car l'enregistrement modifie la note et cela le remettait à zéro. Je l'ai signalé à l'assistant avant le commit ; la correction est incluse dans le même commit. J'ai aussi vérifié que « Next » et « Previous » enregistrent déjà la note de l'étape, ce qui explique qu'un texte reste quand on revient en arrière.

**Tests :** 47 → 53 tests unitaires (`formatClock` et `timerTabTitle`). `tsc -b` et `vite build` réussis. Détail dans `specs/05`.

**Encore à faire :** scénario de test 1, tests manuels (hors ligne, 375 px, clavier, notifications), titre de l'onglet d'un PDF fraîchement importé, mise à jour de la déclaration d'IA du README.

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