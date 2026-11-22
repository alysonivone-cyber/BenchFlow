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

**Statut :** le bug « Timer storage unavailable » est corrigé et couvert par un test de régression (voir DT-13). Test manuel sur ma machine réussi le 18 novembre, puis de nouveau le 22 novembre (`npm.cmd run dev` : timers créés et conservés sans erreur de stockage).

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

## DT-15 — Noms lisibles pour les sessions et date d'ajout des protocoles

**Contexte :** l'écran des sessions affichait les 8 premiers caractères d'un UUID (par exemple `7046f1ce`), illisible pour l'utilisateur et inutilisable pour classer les expériences.

**Décision :** l'`id` reste un UUID aléatoire (c'est la clé Dexie des notes et des timers) ; le nom affiché est calculé à partir de `createdAt` : `20261111-1423 · Titre du protocole`. Les protocoles reçoivent un champ optionnel `importedAt` (date d'ajout, affichée « Added 20261111 »), et le titre d'un PDF sans titre exploitable reprend le nom du fichier.

**Pourquoi ne pas utiliser le nom lisible comme identifiant :** deux sessions du même protocole le même jour auraient le même nom, et changer les clés casserait les notes et timers déjà enregistrés. Aucune migration Dexie n'est nécessaire (`importedAt` n'est pas indexé).

**Suite possible :** une page de synthèse (durées, étapes terminées) à partir de `createdAt`, `updatedAt` et `completedStepIds`, hors périmètre V1 déclaré.

## DT-16 — Distinguer « chargement » et « introuvable » dans les pages de détail

**Contexte :** en relisant le code, j'ai constaté qu'une adresse inconnue (`/protocols/inconnu`, `/sessions/inconnu`) restait indéfiniment sur « Loading… ». `useLiveQuery` renvoie `undefined` pendant le chargement, et la requête renvoyait aussi `undefined` quand l'identifiant n'existait pas : les deux situations étaient indiscernables et le message « not found » n'était jamais atteint.

**Décision :** les requêtes des pages renvoient `null` pour « introuvable » (`(await getProtocol(id)) ?? null`). La convention est : `undefined` = chargement en cours, `null` = introuvable. Dans `SessionDetail`, la page attend aussi le protocole avant d'afficher « Session not found », ce qui supprime un bref affichage erroné entre le chargement de la session et celui du protocole.

**Alternatives écartées :** modifier `getProtocol` pour qu'il renvoie `null` (il est utilisé ailleurs et son contrat `undefined` est déjà couvert par des tests) ; ajouter un état `loading` séparé (plus de code pour le même résultat).

**Validation :** un test unitaire fixe le contrat de `getProtocol` (id inconnu → `undefined`) ; vérification manuelle dans le navigateur de `/protocols/inconnu`, `/sessions/inconnu`, d'un protocole valide, d'une session valide et d'une session dont le protocole n'existe plus.

## DT-17 — Titre lisible pour l'onglet du PDF ouvert dans le navigateur

**Contexte :** « View Original PDF » ouvre le PDF depuis IndexedDB à une adresse `blob:` dont la dernière partie est un UUID aléatoire. Le navigateur s'en sert comme titre d'onglet (par exemple `14f9caf5-5581-4840-9ae9-…`), ce qui rend les onglets illisibles.

**Première tentative (abandonnée) :** écrire un titre dans les métadonnées d'une copie du PDF avec `pdf-lib`. Les tests unitaires et une vérification du fichier ouvert confirmaient que le titre y était, mais l'essai dans Edge a montré que l'onglet affichait toujours l'UUID : le navigateur ignore ce titre pour une adresse `blob:`. Je l'ai donc retirée (pas de commit, pas de dépendance ajoutée).

**Décision :** sur ordinateur, ouvrir un onglet dont **la page est la nôtre** : son `<title>` est `20261111-1429 · Titre du protocole` (date et heure d'ajout `importedAt`, comme les noms de sessions, DT-15) et elle affiche le PDF avec le lecteur du navigateur (`<embed type="application/pdf">`). Sans date d'ajout (démo avec PDF attachée), le titre est seul.

**Repli :** sur téléphone ou tablette (détectés par l'indicateur « mobile » du navigateur, `userAgentData`, ou par le nom de l'appareil ; pas par le type de pointeur, car un PC portable à écran tactile reste un ordinateur), où les navigateurs n'affichent pas un PDF dans une page, ou si l'ouverture de l'onglet est bloquée, le PDF s'ouvre directement comme avant ; l'onglet garde alors son nom technique.

**Alternatives écartées :** un bouton « Télécharger » avec le bon nom de fichier (ce n'est plus « ouvrir dans le navigateur ») ; un service worker qui servirait le PDF à une adresse lisible (trop complexe pour le gain).

**Validation :** dans le navigateur (mode ordinateur), l'onglet s'appelle `20261111-1429 · Strawberry DNA Extraction` et contient l'`<embed>` du PDF ; en mode tactile, le PDF s'ouvre directement. **Confirmé sur Edge le 22 novembre 2026** sur un PDF fraîchement importé (`vitamin-c-juice-titration.pdf`, dont le titre interne est volontairement différent) : l'onglet s'appelle `20261122-1515 · Vitamin C Content of Orange Juice by Iodine Titration` et le PDF s'affiche dans la page.

## DT-18 — Logo et slogan sur l'écran d'accueil

**Contexte :** l'accueil affichait un carré provisoire « BF ». Le slogan « Experimental Workflow Companion » existait déjà dans le bandeau et dans le manifeste de la PWA.

**Décision :** afficher le logo complet (symbole, nom, slogan) à la place du carré, avec le texte alternatif « BenchFlow — Experimental Workflow Companion ». L'image est un PNG et non un WebP, car la liste des fichiers mis en cache hors ligne de `vite.config.ts` contient `png` mais pas `webp`. Le fond blanc d'origine a été rendu transparent, car le fond de la page est bleu très clair. L'image a été recadrée et réduite à 720 px de large (326 Ko au lieu de 1,3 Mo), puis placée dans `src/assets` et importée par le code : Vite lui donne un nom unique et la PWA la met en cache pour le hors ligne. Les icônes d'installation (192 et 512 px) reprennent le symbole sur fond blanc avec une marge, pour rester lisibles quand le système les rogne.

**Limite :** le slogan fait partie de l'image : il n'est pas sélectionnable et reste petit sur téléphone ; le même texte existe en vrai texte dans le bandeau. Une variante simplifiée en SVG a été comparée puis écartée : le logo d'origine est conservé.

**Validation :** `tsc -b` et `vite build` réussis ; l'image fait partie du cache hors ligne (12 fichiers au lieu de 11) ; affichage vérifié sur ordinateur et à 375 px de large ; test hors ligne sur le build de production prévu le 24 novembre.

## DT-19 — Timer de la calculatrice indépendant, persistant, et logique partagée

**Contexte :** le timer de la page Scientific Calculator repartait à zéro au rafraîchissement : le composant `TimerPanel`, utilisé sans identifiants, ne travaillait qu'en mémoire (vérifié : 00:28 avant le rafraîchissement, 00:30 après, aucun enregistrement dans IndexedDB). Les timers des sessions, eux, étaient déjà enregistrés par étape (DT-07). Il fallait deux timers complètement indépendants, capables de tourner en même temps avec des durées différentes (par exemple 45 secondes dans une session et 15 minutes dans la calculatrice), et qui survivent tous deux à un rafraîchissement.

**Décision :** découper l'ancien `TimerPanel` (388 lignes) en quatre fichiers de `src/features/timer/`. `useLabTimer.ts` contient la logique (chargement, enregistrement, affichage mis à jour toutes les 250 ms) ; `TimerView.tsx` ne contient que l'affichage ; `TimerPanel.tsx` (sessions) et `GlobalTimer.tsx` (calculatrice) sont deux petits fichiers qui appellent le même hook avec leur propre identité. Le timer de la calculatrice est un enregistrement ordinaire de la table `timers`, sous l'identifiant `global:calculator` (constantes dans `timerService.ts`). La branche « sans identifiants / en mémoire » a été supprimée. Ce découpage reprend la suggestion de l'enseignant : garder `TimerPanel` pour les sessions et ajouter un fichier de timer global.

**Indépendance :** deux timers = deux identifiants = deux enregistrements. Le code est partagé, pas les données. La suppression d'un protocole ou d'une session supprime les timers de ses sessions (par `sessionId`), mais jamais `global:calculator`.

**Couplage :** le but du découpage est un **faible couplage** (*coupling* : à quel point un module dépend d'un autre) entre les timers, avec une **forte cohésion** dans chaque fichier (un fichier = une seule responsabilité). Le timer de la calculatrice et ceux des sessions ne dépendent pas l'un de l'autre : chacun a sa propre identité et son propre enregistrement, l'identifiant réservé `global` jouant le rôle d'espace de noms qui ne peut pas entrer en collision avec un vrai identifiant de session. De même, la logique (`useLabTimer`) ignore comment elle est affichée, et l'affichage (`TimerView`) ignore où les données sont stockées. **Couplage conservé volontairement :** les timers partagent le même hook et la même table `timers`, et `TimerWatcher` (DT-20) lit tous les timers : c'est ce qui permet une alerte globale, et il ne modifie que le timer qui vient de se terminer.

**Alternatives écartées :** garder un seul composant avec des cas particuliers (la logique « sans identifiants » est précisément ce qui causait le bogue) ; deux copies de la logique (code dupliqué, risque d'écarts entre les deux timers) ; une table séparée pour le timer global (une table de plus pour un seul enregistrement, sans bénéfice).

**Correctif lié (rafraîchissement) :** après un rafraîchissement, l'affichage montrait pendant quelques millisecondes `00:00` puis `00:30` (un timer temporaire), et la valeur restaurée était calculée avec une heure vieille de jusqu'à 250 ms, ce qui pouvait afficher une seconde de trop puis la retirer au tick suivant. Le hook n'affiche plus rien (`--:--`, « Loading timer… ») avant la fin du chargement, et prend l'heure exacte au moment de la restauration. Le timer temporaire en mémoire ne sert plus que si IndexedDB est inaccessible.

**Validation :** tests unitaires (indépendance de deux timers démarrés avec des durées différentes ; le timer global survit à la suppression d'un protocole) ; vérification dans le navigateur : rafraîchissement de la calculatrice, deux timers simultanés (session 45 s, calculatrice 15 min). Le correctif d'affichage a été vérifié par 20 rafraîchissements successifs dans un navigateur automatisé : 0 clignotement et 0 seconde en trop, contre 20 clignotements et 1 seconde en trop avant. **Limite :** pas de test unitaire pour ce correctif d'affichage, car aucune bibliothèque de test d'interface n'est installée.

## DT-20 — Étiquette lisible des timers et surveillance globale des alertes

**Contexte :** (1) en inspectant IndexedDB, un timer n'était identifiable que par ses identifiants techniques, alors que les PDF et les sessions ont un nom lisible (DT-15, DT-17). (2) L'alerte de fin de timer n'était déclenchée que par le composant du timer affiché : si l'utilisatrice changeait de page ou d'expérience, un timer en cours se terminait sans alerte.

**Étiquette :** ajout d'un champ optionnel `label` à `LabTimer`, au format `20261118-1141 · titre du protocole · étape` (calculatrice : `Calculator timer`). Le champ n'est pas indexé : pas de nouvelle version de la base. `ensureTimer` l'écrit à la création et l'ajoute (dans la même transaction) à un ancien timer qui n'en a pas ou dont le nom a changé. **Écartée :** remplacer l'identifiant par un nom lisible (deux sessions dans la même minute entreraient en collision, et les anciens timers resteraient orphelins).

**Surveillance globale :** le composant `TimerWatcher`, monté une fois dans `Layout`, observe en direct la table `timers` (`useLiveQuery`), attend l'échéance la plus proche et vérifie aussi au retour au premier plan (les minuteurs sont ralentis dans un onglet en arrière-plan). Le passage de « en cours » à « terminé » se fait dans une seule transaction en lecture-écriture (`finishDueTimers`) : chaque timer n'est donc signalé qu'une seule fois, même avec plusieurs onglets. L'alerte combine les trois bips, la notification système (si la permission a été accordée) et un bandeau dans l'application, affiché sur n'importe quelle page. **Le bandeau reste affiché jusqu'à ce qu'on le ferme :** en laboratoire, une alerte qui disparaît seule peut être manquée. Le composant du timer affiche seulement la fin ; il n'enregistre plus la transition et ne déclenche plus l'alerte.

**Limites :** il s'agit d'une alerte locale (pas de Web Push, qui exigerait un serveur, hors du périmètre V1, comme dans le cahier des fonctionnalités) : application fermée, aucune alerte. Un timer terminé depuis plus de 5 minutes à l'ouverture de l'application passe à « terminé » sans alerte, pour éviter une alerte très en retard. Le nom d'un timer de session est recalculé à l'ouverture de son étape (un protocole renommé met l'étiquette à jour à ce moment-là).

**Validation :** tests unitaires (étiquette à la création et ajoutée à un ancien timer ; `finishDueTimers` ne signale un timer qu'une fois, ignore ceux qui ne sont pas échus, et ne signale pas un timer terminé depuis très longtemps ; texte de l'alerte). Vérification dans le navigateur : un timer de la calculatrice terminé pendant qu'on est sur une autre page déclenche le bandeau, qui se ferme avec « Close ». Solution présentée à l'enseignant le 18 novembre 2026, qui l'a validée. Affichage à 375 px vérifié le 22 novembre 2026. **Reste à vérifier** avant le gel du code du 29 novembre : hors ligne (prévu le 24 novembre). La notification système a été vue le 22 novembre (voir `05`, T19).

## DT-21 — Bouton d'ouverture des étapes : pastille ronde grise

**Contexte :** le 11 novembre, j'avais ajouté sur chaque étape d'un protocole un badge vert « Open me » et rouge « Close », pour montrer qu'une étape peut être dépliée. Lors de la présentation du 18 novembre, l'enseignant a fait remarquer que le rouge évoque une action dangereuse alors que le bouton ne fait que replier l'étape, et que ce badge ne suit pas le style des pastilles colorées du reste de l'application (« 6 steps » en bleu, durée en violet).

**Décision :** remplacer le badge par une pastille **neutre grise**, dans la même famille de teintes pâles que les autres pastilles (fond, bordure et texte grisés, survol un peu plus foncé), **identique pour les deux états**. L'état est donné par la flèche qui se retourne, pas par la couleur. Dans un second temps, le même jour, j'ai retiré le texte visible : la pastille est un cercle de 32 px, comme le numéro de l'étape à gauche, ce qui donne une ligne symétrique. Le texte « Open step » / « Close step » est conservé pour les lecteurs d'écran (classe `sr-only`). Les couleurs sont des variables de `styles.css` (`--color-chip-grey*`) ; les anciennes variables vertes et rouges ont été supprimées, car plus aucun élément ne les utilisait.

**Justification :** une couleur de danger ne convient pas à une action sans risque ; une teinte neutre est cohérente avec les autres pastilles ; l'information ne repose pas sur la seule couleur (flèche et texte pour les lecteurs d'écran). Le contraste du gris foncé sur le gris clair est d'environ 6,6 : 1 (calcul sur les valeurs des variables), au-dessus du seuil de 3 : 1 demandé pour un élément d'interface.

**Alternatives écartées :** garder le texte visible (plus explicite pour un nouvel utilisateur, mais plus chargé) ; deux gris différents selon l'état (une couleur de plus sans information utile).

**Limite :** sans mot visible, la découvrabilité repose sur la flèche et sur le fait que toute la ligne de l'étape est cliquable.

**Validation :** `tsc -b`, `vite build` et 47 tests réussis ; rendu vérifié sur les protocoles de démonstration et sur un protocole importé (commit `93bccc9`). Navigation au clavier vérifiée le 22 novembre 2026 (`Tab` atteint la pastille, `Entrée` et `Espace` ouvrent et ferment l'étape, contour de focus visible). **Reste à vérifier** avant le gel du code du 29 novembre : lecteur d'écran.

## DT-22 — Temps restant dans le titre de l'onglet du navigateur (L-02)

**Contexte :** pendant une manipulation, on consulte souvent un autre onglet (protocole PDF, document de cours). Sans rien dans le titre de l'onglet BenchFlow, il faut revenir sur l'application pour savoir où en est le timer.

**Décision :** `TimerWatcher` (déjà monté dans `Layout`, voir DT-19) met à jour `document.title` chaque seconde tant qu'un timer tourne, au format `⏱ 04:32 · BenchFlow`. Quand plusieurs timers tournent (session et calculatrice), le titre affiche celui qui **se termine le plus tôt** ; quand il se termine, le titre passe au suivant, puis revient à `BenchFlow` quand plus aucun timer ne tourne. Le texte est fabriqué par une fonction pure, `timerTabTitle` (`tabTitle.ts`), et le formatage de l'horloge a été déplacé dans `utils/format.ts` (`formatClock`), pour être partagé avec l'affichage du timer au lieu d'être dupliqué.

**Justification :** `TimerWatcher` connaît déjà l'échéance la plus proche (requête Dexie en direct), donc aucune nouvelle source de données ni nouveau composant ; la fonction pure se teste sans navigateur ; le timer reste calculé à partir de son échéance (DT-07), donc le titre est juste après un rafraîchissement.

**Alternatives écartées :** afficher le temps de tous les timers dans le titre (trop long pour un onglet) ; lire puis modifier le titre existant (fragile : une constante `BenchFlow` suffit, l'application n'a qu'un titre).

**Limite :** les navigateurs peuvent ralentir les minuteries d'un onglet caché, donc le titre peut se mettre à jour moins souvent qu'une fois par seconde. Ce n'est qu'un affichage : l'alerte de fin de timer ne dépend pas de lui.

**Validation :** 53 tests réussis (+ 4 pour `formatClock`, + 2 pour `timerTabTitle`), `tsc -b` et `vite build` réussis ; test manuel sur ma machine (titre pendant le décompte, changement d'onglet, deux timers, retour à `BenchFlow` à la fin, rafraîchissement en plein décompte) ; contrôle automatisé dans le navigateur par l'assistant (commit `ed9ed56`).

## Comment défendre une décision à l'oral

Pour chaque choix, suivre la structure : **besoin → contrainte → options → solution retenue → compromis → validation**. Un choix technique solide n'est pas nécessairement parfait : il est adapté au contexte et ses limites sont connues.

## DT-09 — Faire évoluer le périmètre V1 à partir des tests exploratoires (20–28 octobre 2026)

**Contexte :** avant la formalisation des premiers commits du 28 octobre, une phase de développement local a permis d'essayer les principales fonctions de BenchFlow et d'en apprécier la faisabilité dans le délai imparti.

**Décision :** utiliser les retours des prototypes pour préciser les fonctionnalités essentielles de la V1, identifier les fonctions à améliorer et reporter les fonctions avancées si nécessaire.

**Lien avec le livrable pédagogique :** le document « Document des fonctionnalités PWA » devait être remis le **27 octobre 2026**. Les essais locaux ont nourri la réflexion sur son périmètre. Cette note n'altère pas le cahier des fonctionnalités déjà rédigé et ne présume pas des changements exacts effectués dans le PDF rendu.

**Justification :** limiter les promesses irréalistes, privilégier les fonctionnalités démontrables, et conserver du temps pour les tests et les corrections.

**Traçabilité :** distinguer les dates de développement des dates de commit ; documenter les arbitrages sans inventer de modifications au cahier des charges.
