# BenchFlow — Journal des décisions techniques

> Les décisions ci-dessous sont celles discutées pendant le développement. Les statuts « à valider » signalent ce qui doit encore être confirmé dans la version finale.

## Note transversale — traçabilité

La date d'un commit est celle de l'enregistrement, pas celle de l'écriture du code ; les dates de création Windows ne prouvent rien non plus. Les dates de développement sont donc consignées dans le journal de bord (`08`) et le détail des commits dans `03`. Depuis le 11 novembre : un commit par sujet, avec les tests exécutés avant chaque commit.

## DT-01 — Choisir une PWA plutôt qu'une application native

**Contexte :** BenchFlow doit être accessible facilement depuis un navigateur, sur différents formats d'écran, avec une expérience proche d'une application installée.

**Décision :** développer une PWA avec React, TypeScript et Vite.

**Arguments :** un code web commun, installation possible sur les plateformes compatibles, mise à jour des ressources par service worker et développement adapté au cadre pédagogique.

**Compromis :** certaines fonctionnalités dépendent des capacités du navigateur ; l'expérience et les autorisations peuvent varier selon l'appareil.

## DT-02 — Concevoir une V1 sans backend

**Contexte :** le projet CREA impose de ne pas utiliser de backend.

**Décision :** conserver la logique métier et les données dans le navigateur.

**Arguments :** respect du périmètre, architecture plus simple à déployer, fonctionnement local et absence de gestion de serveur.

**Compromis :** pas de synchronisation native entre appareils, pas de compte utilisateur centralisé, données dépendantes du stockage local.

**Conséquence :** une clé Gemini intégrée directement dans le frontend serait exposée aux utilisateurs. Ce n'est pas une solution appropriée pour sécuriser une API payante ou soumise à quotas.

## DT-03 — Utiliser Dexie et IndexedDB

**Contexte :** les protocoles personnalisés, notes, sessions et timers doivent persister après la fermeture d'une page.

**Décision :** stocker les données dans IndexedDB via Dexie.

**Arguments :** stockage structuré, gestion asynchrone, possibilité de conserver des objets et des fichiers Blob, intégration côté client.

**Compromis :** migrations de schéma, risques de stockage indisponible, nécessité de tester la restauration et la suppression des données.

**Point de vigilance :** les échecs de stockage ne doivent pas bloquer silencieusement l'interface.

## DT-04 — Séparer les fonctionnalités dans `src/features/`

**Contexte :** la croissance du projet rend un ensemble de fichiers peu organisé difficile à maintenir.

**Décision :** séparer protocoles, sessions, minuterie et calculateur ; garder les types et la base de données dans des dossiers communs.

**Arguments :** responsabilité claire, imports lisibles, tests ciblés, facilité de débogage.

**Compromis :** davantage de fichiers et nécessité de définir des interfaces stables entre modules.

## DT-05 — Extraire les PDF localement avec PDF.js

**Contexte :** l'utilisateur doit pouvoir importer un protocole PDF et en récupérer les étapes sans serveur.

**Décision :** utiliser `pdfjs-dist` pour extraire le texte, puis des règles de structuration pour identifier les sections et les étapes.

**Arguments :** aucun transfert du document à une API, compatibilité avec la contrainte sans backend, traitement hors ligne lorsque les ressources nécessaires sont disponibles.

**Compromis :** l'ordre de lecture peut être incorrect sur les PDF complexes, les tableaux, les colonnes ou les scans. Une expression régulière ne comprend pas le sens scientifique d'un protocole.

**Règle de qualité :** toujours proposer une vérification et une correction humaines avant enregistrement. Ne pas inventer les volumes, durées, températures ou réactifs manquants.

## DT-06 — Préserver le PDF original

**Contexte :** l'extraction automatique peut être imparfaite.

**Décision :** conserver le document source associé au protocole lorsque l'utilisateur le joint.

**Arguments :** comparaison entre les champs générés et la source, traçabilité, possibilité de corriger une extraction.

**Compromis :** augmentation de la taille du stockage local ; limite d'importation fixée à 15 Mo dans les services discutés.

## DT-07 — Calculer les timers à partir d'une échéance

**Contexte :** un intervalle JavaScript peut ralentir quand l'onglet passe en arrière-plan.

**Décision :** représenter une minuterie active par une échéance `endsAt` et recalculer le temps restant avec l'horloge.

**Arguments :** décompte plus fiable après suspension ou réouverture ; restauration possible de l'état enregistré.

**Compromis :** il faut réconcilier l'état à la reprise et gérer correctement les erreurs IndexedDB.

**Statut :** le bug « Timer storage unavailable » est corrigé et couvert par un test de régression (voir DT-13). Test manuel sur ma machine à refaire.

## DT-08 — Limiter la V1 et reporter les fonctions avancées

**Contexte :** une date de livraison impose de prioriser les fonctionnalités essentielles.

**Décision :** privilégier bibliothèque de protocoles, sessions, notes, calculateur et timer fonctionnel. L'import PDF éditable est une **fonction ajoutée en plus**, hors du périmètre déclaré dans le document des fonctionnalités (qui prévoyait des protocoles de démonstration structurés) : je l'ai développée parce que le temps le permettait, et je la présente comme un bonus, pas comme une exigence V1. Les timers multiples simultanés et les traitements documentaires avancés peuvent être envisagés en V2.

**Arguments :** réduire le risque de fonctionnalités inachevées et consacrer du temps aux tests.

**Compromis :** certaines demandes restent hors périmètre de la première livraison.

## DT-10 — Utiliser Tailwind CSS (migration le 11 novembre 2026)

**Contexte :** la spécification V1 annonçait Tailwind CSS ; j'avais d'abord écrit un fichier `styles.css` à la main (environ 800 lignes) pour avancer vite.

**Décision :** migrer vers Tailwind CSS v4 sans changer l'apparence : plugin `@tailwindcss/vite`, couleurs et ombres déclarées dans `@theme`, variantes `tablet` et `phone` reprenant les anciens points de rupture, helpers partagés dans `components/ui.ts`.

**Vérification :** captures d'écran avant/après comparées pixel par pixel ; les écarts trouvés (reset de marges du `<dialog>`, couleur du placeholder, bouton de fichier) ont été corrigés.

**Compromis :** les classes alourdissent le JSX ; `ui.ts` limite la répétition. Dépendance de build supplémentaire.

## DT-11 — Charger pdf.js à la demande

**Contexte :** `npm run build` signalait un bundle de plus de 500 Ko, à cause de pdf.js.

**Décision :** `import()` dynamique de `pdfExtractor` au moment de l'analyse d'un PDF, et ajout de `.mjs` au précache Workbox pour que le worker soit disponible hors ligne.

**Résultat :** l'avertissement disparaît ; l'import PDF hors ligne a été vérifié dans Chrome (avant la correction du précache, il échouait).

## DT-12 — Supprimer un protocole en cascade

**Contexte :** on pouvait ajouter des protocoles mais pas les supprimer.

**Décision :** supprimer n'importe quel protocole, avec ses sessions, notes et timers, dans **une seule transaction** Dexie (tout ou rien, pas d'orphelins), après confirmation indiquant le nombre de sessions touchées. Les protocoles de démonstration, écrits dans le code, sont masqués via la table `deletedProtocols` (schéma v3) et restaurables.

**Compromis :** la suppression est définitive pour les protocoles personnalisés ; la confirmation avec `<dialog>` natif donne gratuitement la gestion du focus et de la touche Échap.

## DT-13 — Corriger le timer de session

**Cause :** React.StrictMode exécute les effets deux fois en développement ; `ensureTimer()` faisait « lire puis ajouter » en deux étapes, donc deux appels simultanés tentaient d'ajouter la même clé (ConstraintError), ce qui affichait « Timer storage unavailable ». Le timer du calculateur n'utilise pas IndexedDB, d'où la différence.

**Décision :** lecture et création dans une transaction `rw` ; un échec de sauvegarde ne désactive plus définitivement la sauvegarde ; le temps affiché est rafraîchi au retour au premier plan.

**Preuve :** test de régression (appels simultanés d'`ensureTimer`) qui échoue sans la transaction.

## DT-14 — Alerter la fin d'un timer sans backend (NOTIF-01)

**Décision :** bannière dans l'application, trois bips Web Audio, notification système via le service worker uniquement après une action explicite de l'utilisateur (bouton « Enable system notifications »).

**Limite assumée :** sans serveur push, une application entièrement fermée ne peut pas alerter ; je ne promets pas le contraire.

## Comment défendre une décision à l'oral

Pour chaque choix, suivre la structure : **besoin → contrainte → options → solution retenue → compromis → validation**. Un choix technique solide n'est pas nécessairement parfait : il est adapté au contexte et ses limites sont connues.

## DT-09 — Faire évoluer le périmètre V1 à partir des tests exploratoires (20–28 octobre 2026)

**Contexte :** avant la formalisation des premiers commits du 28 octobre, une phase de développement local a permis d'essayer les principales fonctions de BenchFlow et d'en apprécier la faisabilité dans le délai imparti.

**Décision :** utiliser les retours des prototypes pour préciser les fonctionnalités essentielles de la V1, identifier les fonctions à améliorer et reporter les fonctions avancées si nécessaire.

**Lien avec le livrable pédagogique :** le document « Document des fonctionnalités PWA » devait être remis le **27 octobre 2026**. Les essais locaux ont nourri la réflexion sur son périmètre. Cette note n'altère pas le cahier des fonctionnalités déjà rédigé et ne présume pas des changements exacts effectués dans le PDF rendu.

**Justification :** limiter les promesses irréalistes, privilégier les fonctionnalités démontrables, et conserver du temps pour les tests et les corrections.

**Traçabilité :** distinguer les dates de développement des dates de commit ; documenter les arbitrages sans inventer de modifications au cahier des charges.
