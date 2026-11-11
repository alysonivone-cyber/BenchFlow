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

## 11 novembre 2026 (après-midi) — Titre lisible pour l'onglet du PDF (DT-17)

**Travail effectué :** en ouvrant un PDF depuis la bibliothèque, j'ai constaté que l'onglet portait un identifiant technique. J'ai d'abord écrit un titre dans une copie du PDF (`pdf-lib`) : les tests passaient, mais l'essai dans Edge a montré que cela ne changeait rien. J'ai abandonné cette piste sans la commiter et ouvert à la place une page intermédiaire dont le titre est `date-heure · titre`, avec repli direct sur téléphone.

**Ce que j'ai appris :** un test unitaire vert ne prouve pas que la fonctionnalité marche dans le vrai navigateur ; il faut l'essayer là où elle sera utilisée.

**À vérifier :** le rendu du PDF dans la page, sur Edge.

**Prochaine étape :** nettoyer les `console.log` de `database.ts`.
