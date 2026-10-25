# BenchFlow

**Progressive Web App (PWA) — Experimental Workflow Companion**

> Projet en cours de développement. Ce dépôt documente le périmètre prévu de la V1 ; les fonctionnalités ci-dessous ne sont pas nécessairement déjà implémentées.

## Présentation

BenchFlow accompagne l’exécution de protocoles expérimentaux en laboratoire : consulter un protocole, suivre ses étapes, utiliser un timer ou un calculateur contextuel, prendre des notes et reprendre une session enregistrée localement.

**Public cible :** étudiantes et étudiants en sciences expérimentales, doctorants, jeunes chercheurs et personnels de laboratoire.

**Problème abordé :** réduire les interruptions causées par la dispersion des protocoles, minuteries, notes et calculs.

BenchFlow ne remplace ni les procédures de sécurité du laboratoire ni la validation scientifique des protocoles.

## Stack technique retenue

| Domaine | Technologies / approche |
| --- | --- |
| Frontend | React + TypeScript + Vite |
| Interface | Tailwind CSS |
| Gestion de l’état | useState / Context ciblé |
| Stockage local | Dexie + IndexedDB |
| Données de démonstration | Protocoles JSON locaux versionnés |
| PWA | vite-plugin-pwa, manifest, service worker, cache offline |

**Périmètre V1 :** application frontend-only, sans backend, comptes utilisateurs, synchronisation cloud ni push serveur.

## Fonctionnalités prévues pour la V1

| ID | Fonctionnalité |
| --- | --- |
| PROT-01 | Protocol Library |
| WORK-01 | Smart Experimental Workflow |
| PROG-01 | Experiment Progress |
| NOTE-01 | Experiment Notes |
| CALC-01 | Scientific Calculator |
| TIME-01 | Laboratory Timer |
| NOTIF-01 | Timer Alerts / Smart Notifications |

### Fondations techniques V1

| ID | Fondation |
| --- | --- |
| TECH-01 | IndexedDB / Local Persistence |
| TECH-02 | Installable PWA |
| TECH-03 | Responsive UI |
| TECH-04 | Offline Mode / Asset Cache |

## Fonctionnalités envisagées après la V1

Smart Check (`CHECK-01`), Dashboard / Experiment Analytics (`DASH-01`), Cloud Sync (`SYNC-01`), Accounts (`ACCT-01`), Collaboration (`COLL-01`) et AI Assistant (`AI-01`).

## Limites prévues

- Les alertes internes sont prévues lorsque BenchFlow est ouverte. Les notifications système dépendent des permissions et du navigateur ; aucune notification garantie lorsque l’application est totalement fermée n’est promise.
- Le stockage IndexedDB facilite la reprise hors ligne, mais ne garantit pas la conservation des données si le navigateur ou l’utilisateur les supprime.
- La V1 utilise des protocoles de démonstration, sans validation scientifique automatisée.

## Planning prévisionnel

| Période | Objectif |
| --- | --- |
| Fin octobre | Initialisation de la PWA et de l’interface |
| Début novembre | Bibliothèque de protocoles et persistance locale |
| Mi-novembre | Workflow et sessions indépendantes |
| Fin novembre | Notes, calculateur et timer |
| Début décembre | Notifications, tests offline et intégration |
| Jusqu’au 10 décembre | Tests, corrections, documentation et soutenance |

## Documentation complète

Consulter le [cahier des fonctionnalités](CAHIER_DES_FONCTIONNALITES.md) pour les descriptions détaillées, les critères de validation, les dépendances, les priorités et les risques.

## Statut du projet

**Planification de la V1** — l’implémentation et la validation seront suivies au fil du développement. Ne pas interpréter les critères de validation comme des tests déjà réussis.
