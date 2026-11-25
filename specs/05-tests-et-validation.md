# BenchFlow — Plan de tests et validation

> Ce document sépare les **résultats effectivement observés** des tests **à exécuter**. Il ne constitue pas une certification de l'application.

## 1. Stratégie

Les vérifications couvrent quatre niveaux : compilation TypeScript, tests unitaires, parcours utilisateur dans le navigateur et comportement PWA/hors ligne.

## 2. Commandes de référence (Windows PowerShell)

```powershell
npm.cmd run build
npx.cmd vitest run
npm.cmd run dev
npm.cmd run preview -- --port 4173 --strictPort
```

Le serveur Vite affiche ensuite une URL locale (souvent `http://localhost:5173/`, mais le port réel est celui annoncé par le terminal).

## 3. Résultats déjà observés

Cette première série date du 28 octobre 2026. Les lignes marquées **Suite** indiquent comment chaque point a été traité ensuite.

| Vérification | Observation | Interprétation |
|---|---|---|
| `npm.cmd run build` après intégration de PDF.js | Compilation TypeScript et build Vite réussis dans un journal partagé | La version correspondante compilait ; cela ne prouve pas l'absence de bugs fonctionnels |
| Build PWA | Génération de `dist/sw.js` et du manifest observée | Les fichiers PWA ont été générés ; le mode hors ligne a été testé le 24 novembre 2026 (T17) et l'installation le 25 novembre 2026 (T29) |
| Taille des bundles (28/10) | Avertissement Vite pour des chunks de plus de 500 Ko | Résolu le 11/11 par le chargement différé de pdf.js |
| PDF de démonstration | Objectif et matériel affichés après amélioration | Une partie de l'extraction fonctionne sur ce document. **Suite** : améliorée ensuite, voir T04 et T08 |
| Extraction des étapes | Instructions parfois mal regroupées ou tronquées | Régression / limite à traiter avec des cas de test représentatifs. **Suite** : traité les 22 et 25 novembre (T09, T10) |
| Timer de session (28/10) | Message « Timer storage unavailable » observé | Diagnostiqué et corrigé le 11/11, voir ci-dessous |
| Timer du calculateur | Fonctionnement signalé lors du même essai | Les deux contextes doivent être testés séparément. **Suite** : traité le 18 novembre (timers indépendants, DT-19) |

### Résultats du 11 novembre 2026 (état final)

| Vérification | Résultat |
|---|---|
| `npx vitest run` | 32 tests réussis (5 fichiers) : timer, calculs, stockage, alertes, suppression en cascade |
| `npx vitest run` (après le correctif « introuvable », DT-16) | 38 tests réussis (6 fichiers) : s'y ajoutent les noms lisibles et le contrat de `getProtocol` |
| Navigateur, après DT-16 | `/protocols/inconnu` → « Protocol not found. » ; `/sessions/inconnu` → « Session not found. » ; session dont le protocole est supprimé → « Session not found. » ; pages valides inchangées |
| `npx vitest run` (après DT-17, titre de l'onglet du PDF) | 38 tests réussis (6 fichiers) : aucun test ajouté, la vérification de DT-17 a été faite à la main dans Edge |
| Navigateur, après DT-17 | Ordinateur, y compris avec écran tactile : onglet `20261111-1429 · Strawberry DNA Extraction` avec `<embed>` du PDF ; téléphone : PDF ouvert directement. Rendu réel dans Edge : confirmé le 22 novembre (voir les résultats du 22 novembre) |
| Test de régression StrictMode | Appels simultanés d'`ensureTimer` : un seul timer créé |
| `tsc -b` + `vite build` | Réussis ; 11 entrées précachées (nombre annoncé par le build) |
| Chrome (script automatisé, environnement de l'assistant) | Timer de session démarré sans erreur ; suppression d'un protocole + restauration ; import PDF hors ligne |
| Largeur 375 px | Plus de défilement horizontal |
| Comparaison visuelle avant/après Tailwind | Rendu identique, écarts corrigés |

### Résultats du 18 novembre 2026 (timers indépendants, étiquettes et alertes globales : DT-19, DT-20)

| Vérification | Résultat |
|---|---|
| `npm.cmd test` chez moi, commit `a8b0e2d` (timer de la calculatrice) | 42 tests réussis (7 fichiers) : s'y ajoutent l'indépendance de deux timers et la conservation du timer global à la suppression d'un protocole |
| `npm.cmd test`, commit `2fec44d` (étiquette) | 44 tests réussis : étiquette à la création et ajoutée à un ancien timer, texte `date-heure · protocole · étape` |
| `npm.cmd test`, commit `ada49ec` (surveillance globale) | 46 tests réussis : `finishDueTimers` signale un timer une seule fois, ignore les timers non échus, ne signale pas un timer terminé depuis très longtemps |
| `npm.cmd test`, commits `7e1e707` (bandeau) et `4cd042c` (rafraîchissement) | 47 tests réussis (7 fichiers) : s'y ajoute le texte de l'alerte |
| `npm.cmd run build` (`tsc -b` + `vite build`), commits 1 à 6 de la séance | Réussis à chaque commit |
| Edge, chez moi (`npm.cmd run dev`) | Le timer de la calculatrice continue après un rafraîchissement ; plusieurs timers peuvent tourner en même temps, avec des durées différentes |
| Chrome (script automatisé, environnement de l'assistant) | Timer de la calculatrice conservé après rafraîchissement ; alerte déclenchée et bandeau affiché pendant qu'on est sur une autre page, bandeau fermé avec « Close » ; 20 rafraîchissements successifs : 0 clignotement et 0 seconde en trop (avant le correctif : 20 clignotements et 1 seconde en trop) |
| `npm.cmd run build` et `npm.cmd test` chez moi, commit `93bccc9` (pastille grise des étapes) | Build réussi, 47 tests réussis ; rendu observé dans le navigateur sur un protocole importé |
| Présentation à l'enseignant | Fonctionnement présenté le 18 novembre, solution validée par l'enseignant |
| Pas encore testé | Notifications système, hors ligne sur le build de production, affichage à 375 px, titre de l'onglet d'un PDF fraîchement importé : tests reportés. **Suite** : affichage à 375 px et titre de l'onglet faits le 22 novembre, hors ligne le 24 novembre (T17), notifications système vues le 22 novembre (T19) et bloquées le 25 novembre (T27) |

### Résultats du 22 novembre 2026 (temps restant dans l'onglet : L-02 ; confirmation « Notes saved » : R-03)

| Vérification | Résultat |
|---|---|
| `npm.cmd test`, commit `ed9ed56` (L-02) | 53 tests réussis (8 fichiers) : s'y ajoutent `formatClock` (minutes, heures, arrondi vers le haut, jamais négatif) et `timerTabTitle` |
| `npm.cmd run build`, commits `ed9ed56` et `823989d` | Réussis |
| L-02 à la main, Edge (`npm.cmd run dev`) | Titre `⏱ mm:ss · BenchFlow` pendant le décompte ; le décompte continue quand je change d'onglet ; avec deux timers (Smart Experimental Workflow et Scientific Calculator), le titre suit le plus court puis passe à l'autre quand le premier est terminé ; retour à `BenchFlow` à la fin ; bannière et son toujours déclenchés ; rafraîchissement en plein décompte sans saut |
| R-03 à la main, Edge | « ✓ Notes saved » s'affiche après « Save Notes » et disparaît dès qu'on retape du texte ; **défaut trouvé pendant ce test** : le message pouvait disparaître juste après être apparu, car l'enregistrement met la note à jour et cela relançait la remise à zéro du message. Corrigé avant le commit (la remise à zéro ne dépend plus que du changement d'étape) |
| Précision sur « Next » / « Previous » | Ces boutons enregistrent la note de l'étape avant de changer d'étape (comportement prévu depuis le début) : un texte non enregistré à la main n'est donc pas perdu en changeant d'étape |
| Étapes sans description, hauteur des cartes d'étapes, libellé du PDF (commit `a2db064`) | Vérifié dans Edge (`npm.cmd run dev`) sur un protocole importé : plus de ligne vide sous le titre d'une étape sans description ; cartes d'étapes compactes ; bouton « Start New Session » à sa hauteur normale ; libellé « Attach / replace PDF » sur sa propre ligne. Cause du vide : la colonne des étapes était étirée à la hauteur de la colonne de gauche et la grille répartissait l'espace dans les cartes. `tsc -b`, `vite build` et 53 tests réussis |
| Affichage à 375 px (22 novembre) | Parcours de l'application à 375 px de large dans Edge (émulation d'appareil) : affichage normal, rien à corriger |
| Navigation au clavier sur la pastille grise (22 novembre) | `Tab` atteint la pastille ; `Entrée` et `Espace` ouvrent et ferment l'étape ; contour de focus visible |
| Titre de l'onglet d'un PDF fraîchement importé (DT-17, 22 novembre) | PDF de test `vitamin-c-juice-titration.pdf`, dont le titre interne est volontairement faux et le nom de fichier différent du titre : l'onglet s'appelle `20261122-1515 · Vitamin C Content of Orange Juice by Iodine Titration` (date et heure de l'import, puis titre du protocole) ; ni le titre interne ni le nom du fichier ne sont repris. Le PDF s'affiche dans la page |
| Import de ce PDF de test (commit `610c03d`) | **Défaut trouvé pendant ce test** : 4 étapes sur 6 importées. Cause : après une ligne « Duration: 5 minutes » placée en tête d'étape, les lignes suivantes étaient lues comme des durées et non comme des instructions ; les étapes restées sans instructions étaient supprimées sans message, et une mention « 20 seconds » dans une instruction écrasait la durée d'une étape (10 minutes). Corrigé : seule la ligne de la durée est lue comme durée. Après correction : 6 étapes, instructions complètes de l'étape 1 (3 lignes), vérifiés à la main dans Edge ; durées (5, 15, 10, 10 et 20 minutes) vérifiées par un script sur le texte du PDF. `tsc -b`, `vite build` et 53 tests réussis (aucun test automatique ajouté : l'extracteur charge pdf.js, qui n'est pas exécutable dans l'environnement de test) |
| NOTE-01 à la main (22 novembre) | Note écrite et enregistrée à l'étape 1 d'une première session ; seconde session du même protocole démarrée : son étape 1 est vide ; en rouvrant la première session, la note est toujours là. Vérifié aussi par un script le même jour. **Point d'attention** : deux sessions lancées dans la même minute portent exactement le même nom (`AAAAMMJJ-HHMM · titre`) dans la liste des sessions : la carte du bas (la plus ancienne) contient la note, celle du haut (la plus récente) est vide. **Corrigé** par le commit `ffc7422` (voir la ligne suivante) |
| Heure de début des sessions (commit `ffc7422`, 22 novembre) | Deux sessions du même protocole créées à quelques secondes d'écart : la liste affiche `Started hh:mm:ss` avec des secondes différentes sur chaque carte, et le fil d'Ariane de la session ouverte affiche `· started hh:mm:ss`. Vérifié à la main dans Edge ; rendu à 375 px vérifié par une capture dans l'environnement de l'assistant. Un test unitaire ajouté (deux sessions de la même minute : même nom, heures de début différentes) ; `tsc -b`, `vite build` et 54 tests réussis |
| T14 à la main (22 novembre) | Pause : le temps reste figé et le titre de l'onglet ne décompte plus ; réinitialisation : le timer revient à sa durée de départ et le titre redevient `BenchFlow` |
| Pas encore testé | Hors ligne sur le build final : à refaire une fois les dernières modifications faites, avant le gel du code et le tag v1.0 |

### Scénario du test 1 — session, timers, fermeture complète et réouverture (22 novembre 2026, build de production, Edge)

| Étape | Résultat |
|---|---|
| Démarrer une session, écrire une note sur l'étape 1 et l'enregistrer | Conforme |
| Lancer un timer de 1 min sur l'étape 1, passer à l'étape 2 avec « Next », lancer un timer de 5 min | Conforme |
| Fermer complètement Edge, attendre environ 2 minutes, rouvrir l'application et la session (« Resume Session ») | Conforme : la note de l'étape 1 est conservée ; la session reprend à l'étape 2 ; le timer de 5 min est conservé avec son temps restant ; le timer de 1 min, terminé pendant la fermeture, affiche `00:00` avec une alerte de rattrapage (bandeau et bips), car il s'est terminé depuis moins de 5 minutes (DT-20) |
| Constat avant le test | Edge affichait d'abord une ancienne version de l'application (ancien accueil sans logo), servie par le cache du service worker de `localhost:4173`. Après désinscription du service worker (onglet Application) et rechargement forcé, la version actuelle s'est affichée ; la base IndexedDB n'a pas été effacée. C'est le comportement attendu d'une PWA en mise à jour automatique (`autoUpdate`) : la nouvelle version s'affiche à la visite suivante |

Les vérifications par script ou dans l'environnement de l'assistant (11 et 18 novembre) ont été complétées par des tests à la main dans Edge, sur ma machine (22, 24 et 25 novembre).

Un build réussi a été observé le 28 octobre 2026. Pour les tests futurs, consigner la date, le commit testé et le résultat réel ; ne pas attribuer rétroactivement un résultat à un commit non identifié.

### Résultats du 24 novembre 2026 (hors ligne sur le build de production : T17)

| Vérification | Résultat |
|---|---|
| Préparation | `npm.cmd run build` puis `npm.cmd run preview` (`http://localhost:4173/`), Edge. Service worker réinstallé (« Annuler l'inscription » puis rechargement forcé). Cache de précache de 11 fichiers uniques : le build annonce 13 entrées, mais les deux icônes y sont déclarées deux fois (par `includeAssets` et par le motif `png` de `globPatterns`). Les fichiers modifiés portent l'horodatage du nouveau build |
| Chargement hors ligne (case « Hors ligne » des outils de développement), version d'avant le correctif | L'application s'affiche et mes données sont présentes. Protocole, session, note enregistrée, timer, « View Original PDF », calculatrice et rechargement `F5` d'une session fonctionnent. **Défaut trouvé** : la console affichait `GET /icons/icon-192.png?v=2 net::ERR_INTERNET_DISCONNECTED`. `index.html` demande l'icône de l'onglet avec `?v=2`, mais le cache contient le fichier sans ce paramètre : la requête n'était pas reconnue et partait vers le réseau. Sans conséquence sur les fonctions, mais visible dans la console |
| Correctif (commit `d0344ea`) | `ignoreURLParametersMatching: [/^utm_/, /^fbclid$/, /^v$/]` dans la configuration Workbox de `vite.config.ts`. Vérifié dans l'environnement de l'assistant (navigateur de test, build de production, hors ligne) : `icon-192.png?v=2` et `icon-512.png?v=2` passent de « échec » à « 200 ». Vérifié chez moi sur la version corrigée : plus aucune ligne rouge dans la console hors ligne. `tsc -b`, `vite build` et 54 tests réussis |
| Test strict (serveur arrêté) | Serveur `vite preview` arrêté (VS Code fermé complètement), onglet fermé, adresse `http://localhost:4173/` ressaisie dans un nouvel onglet : l'application se charge et fonctionne depuis le cache |
| Observation sur la mise à jour du service worker | Après une reconstruction, l'ancienne version est restée active et la nouvelle « en attente d'activation ». La nouvelle version n'a été utilisée qu'après la fermeture des autres onglets de l'application et l'ouverture d'un nouvel onglet. Cela rejoint la précaution notée le 22 novembre : une version périmée peut s'afficher une fois après une mise à jour |
| Non testé | Installation de l'application (faite depuis, le 25 novembre : voir T29) ; autres navigateurs et téléphone. Les vérifications fonctionnelles hors ligne (note, timer, PDF, calculatrice, `F5`) ont été faites sur la version d'avant le correctif et n'ont pas été rejouées sur la version corrigée : seuls le chargement hors ligne et le test strict l'ont été |

### Résultats du 25 novembre 2026 (R-01, L-01 et intégration continue)

| Vérification | Résultat |
|---|---|
| Écran d'erreur global (R-01), commits `3a6f928` et `8591419` | Erreur provoquée volontairement (un composant qui lève une exception, ajouté puis retiré avec `git checkout`) : l'écran « Something went wrong » s'est affiché avec « Reload the app », « Back to home » et « Technical details », et la console a affiché l'erreur de React puis `BenchFlow crashed while rendering`. 1 test unitaire ajouté (état d'erreur), 55 tests, `tsc -b` et `vite build` réussis. **Non testé** : les erreurs dans un gestionnaire d'événement ou une opération asynchrone, que ce mécanisme ne rattrape pas |
| Écran maintenu allumé (L-01), commit `f1ba657` | Un premier essai n'a rien affiché : l'appel du hook n'était pas dans `SessionPages.tsx` (la modification n'avait pas été conservée ; refaite et vérifiée avec `git diff`). Ensuite, journal de console dans Edge sur `localhost` : ouverture d'une session (acquis, relâché, acquis : `React.StrictMode` monte l'effet deux fois en développement), changement d'onglet (relâché puis acquis), sortie de la page (relâché, sans nouvel acquis). Aucun test automatique. **Non testé** : téléphone, autres navigateurs, HTTPS |
| Intégration continue (D-02), commit `83c4665` | Exécution n° 1 sur GitHub Actions : build et 55 tests réussis sous Linux (Ubuntu, Node 22) en 30 secondes. Capture d'écran non versionnée à ce jour : à ajouter au dépôt (README) |
| Observation en développement | Après modification de `main.tsx` pendant que le serveur de développement tourne, la console affiche « You are calling ReactDOMClient.createRoot() on a container that has already been passed to createRoot() » : le rechargement à chaud ré-exécute le point d'entrée. Sans effet sur l'application construite ; un rafraîchissement de la page l'efface |

## 4. Matrice de tests fonctionnels

| ID | Scénario | Résultat attendu | Statut |
|---|---|---|---|
| T01 | Ouvrir la bibliothèque | Les protocoles sont affichés | Réussi à la main (22/11, avec le protocole vitamine C) ; revu le 25/11 : après effacement du stockage, les trois protocoles de démonstration reviennent |
| T02 | Ouvrir le détail d'un protocole | Titre, objectif, matériel, résultats et étapes s'affichent | Réussi à la main (22/11, protocole vitamine C importé depuis son PDF) |
| T03 | Ajouter un protocole manuellement | Le protocole est sauvegardé puis retrouvé | Réussi à la main le 25/11 : protocole saisi sans PDF, enregistré puis retrouvé dans la bibliothèque |
| T04 | Importer un PDF texte de moins de 15 Mo | Texte extrait, champs proposés à l'édition | Réussi à la main (22/11 : PDF vitamine C ; 24/11 : PDF fraises ; 25/11 : réimport des deux PDF, 6 étapes extraites chacun) |
| T05 | Importer un PDF scanné sans texte | Message explicite, sans instructions inventées | Réussi à la main le 25/11 (PDF composé d'une image) : message « No selectable text found. This PDF may be scanned or image-based. », formulaire laissé vide, aucune étape inventée |
| T06 | Importer un fichier non PDF | Rejet avec message compréhensible | Réussi à la main le 25/11 : le sélecteur de fichier n'affiche que les PDF ; un fichier texte renommé en .pdf passe ce filtre et est refusé par l'analyse avec « Invalid PDF structure. » |
| T07 | Importer un PDF dépassant 15 Mo | Rejet avec message compréhensible | Réussi à la main le 25/11 (fichier de 16 864 688 octets) : refus avec « Select a PDF smaller than 15 MB. » |
| T08 | PDF avec sections Objectif/Matériel/Résultats | Les champs globaux sont correctement affectés | Réussi à la main (22/11, PDF vitamine C) |
| T09 | PDF avec étapes numérotées | Chaque instruction reste rattachée à la bonne étape | Réussi à la main (22/11, PDF vitamine C : chaque instruction sous la bonne étape) |
| T10 | PDF avec retours à la ligne, colonnes ou tableaux | Le résultat est vérifié ; limites signalées | Réussi à la main le 25/11 sur deux PDF multipages (fraises : 4 pages ; vitamine C : 2 pages) avec coupure de page au milieu d'une étape et pieds de page répétés : 6 étapes extraites et correctement rattachées pour chacun. Colonnes et tableaux non testés : limite documentée dans `06` |
| T11 | Corriger une étape extraite | La correction est enregistrée et réaffichée | Réussi à la main le 25/11 : étape corrigée après l'extraction, enregistrée puis réaffichée |
| T12 | Démarrer une session | L'étape active s'affiche | Réussi à la main (22/11, scénario du test 1) |
| T13 | Enregistrer des notes | Les notes sont retrouvées après rechargement | Réussi à la main (22/11 : note conservée après la fermeture complète du navigateur, scénario du test 1) |
| T14 | Démarrer, suspendre et réinitialiser le timer de session | États et durée cohérents | Démarrage vérifié le 11/11 (script), puis à la main les 18 et 22 novembre ; pause et réinitialisation vérifiées à la main le 22 novembre |
| T15 | Recharger pendant un timer actif | Temps restant recalculé correctement | Réussi à la main (18/11 et 22/11) et par script (20 rafraîchissements : aucun saut ni clignotement) |
| T16 | Utiliser le calculateur scientifique | Résultats corrects pour des exemples de référence | Réussi à la main le 25/11 : dilution C1V1 = C2V2 (C1 = 10, C2 = 2, V2 = 100 donne V1 = 20 mL ; C1 = 10, V1 = 20, V2 = 100 donne C2 = 2 mg/mL) ; champ vide, valeur négative et zéro refusés avec « Enter three positive, valid values. » ; conversions 1000 µL = 1 mL, 1 mL = 1000 µL, 1000 mL = 1 000 000 µL |
| T17 | Passer hors ligne après mise en cache | Interface et données locales restent accessibles | Réussi le 24/11 (build de production, `vite preview`, Edge) : chargement hors ligne et test strict serveur arrêté ; défaut d'icône trouvé et corrigé (`d0344ea`) |
| T18 | Effacer le stockage local dans un environnement de test | Perte des données expliquée et comportement maîtrisé | Réussi à la main le 25/11 (build de production, localhost:4173) : effacement complet (IndexedDB, caches, service worker) puis rechargement ; l'application redémarre avec les trois protocoles de démonstration, sans session (message « No saved sessions yet. »), logo présent, aucune page blanche |
| T19 | Fin d'un timer (application ouverte) | Bannière, bips, notification si permission accordée | Tests unitaires réussis ; bannière et bips vérifiés à la main les 18 et 22 novembre ; notification système vue le 22 novembre après avoir accordé la permission dans Edge (la demande de permission n'apparaît qu'à la première utilisation) ; avec deux timers à la suite, chaque fin de timer a bien affiché sa notification |
| T20 | Supprimer un protocole avec sessions | Confirmation, suppression des sessions, notes et timers | Réussi (test automatisé et script) |
| T21 | Supprimer puis restaurer un protocole de démonstration | Masqué puis de nouveau visible | Réussi (test automatisé et script) |
| T22 | Importer un PDF hors ligne (build de production) | L'analyse fonctionne | Réussi le 11/11 (script) après ajout de `.mjs` au précache |
| T23 | Nom lisible d'une session | Affichage `AAAAMMJJ-HHmm · Titre`, sans changer l'id | Réussi (5 tests unitaires + script, 11/11) ; précision du 22/11 : heure de début avec secondes dans la liste des sessions (1 test ajouté) |
| T24 | Erreur d'affichage de l'interface | Écran de récupération au lieu d'une page blanche | Réussi à la main le 25/11 (erreur provoquée temporairement) ; 1 test unitaire de l'état d'erreur |
| T25 | Garder l'écran allumé pendant une session | Verrou pris à l'ouverture, relâché en quittant la page, repris au retour dans l'onglet | Réussi à la main le 25/11 (Edge, `localhost`, journal de console) ; pas de test automatique ; téléphone non testé |
| T26 | Intégration continue | Build et tests réussis sur une machine propre | Réussi le 25/11 (GitHub Actions, exécution n° 1, 30 secondes) |
| T27 | Notifications système bloquées dans le navigateur (cahier NOTIF-01) | Alerte dans l'application ; le blocage est expliqué | Réussi à la main le 25/11 (Edge) : bannière « Timer ... is complete » affichée et message « System notifications are blocked: the in-app alert and sound remain active. » ; avec le son du site également bloqué, même affichage (l'audio est alors coupé par le navigateur) |
| T28 | Terminer une session (cahier WORK-01) | Progression 4/4 et état terminé | Réussi à la main le 25/11 : bouton « Complete Experiment » à la dernière étape ; la liste affiche « Completed · Step 4/4 · 100% » avec « View Session » à la place de « Resume Session » |
| T29 | Installer l'application (cahier TECH-02) | Elle s'ouvre dans sa propre fenêtre | Réussi à la main le 25/11 (Edge, build `vite preview` sur localhost:4173) : invitation « Installer l'appli BenchFlow », fenêtre sans barre d'adresse, données présentes |

## 5. Cas de test spécifiques au lecteur PDF

Créer un jeu de PDF de démonstration avec résultats attendus connus :

1. **PDF simple** : sections clairement nommées et étapes `Step 1`, `Step 2`.
2. **PDF français** : `Objectif`, `Matériel`, `Étape 1`, `Résultats attendus`.
3. **Instructions sur plusieurs lignes** : vérifier qu'une phrase n'est ni coupée ni fusionnée avec une autre étape.
4. **Liste de matériel à puces** : vérifier les éléments et les quantités quand elles sont présentes.
5. **Durées dans le texte** : vérifier les conversions secondes/minutes/heures, sans inférence abusive.
6. **PDF multicolonnes** : identifier les erreurs d'ordre de lecture.
7. **PDF scanné** : échec explicite si aucune couche texte n'est disponible.
8. **PDF contenant des avertissements** : vérifier qu'ils ne sont pas silencieusement présentés comme des étapes expérimentales.

Pour chaque document, comparer : **texte source → sortie du parseur → protocole affiché**. Documenter les divergences et conserver les fichiers de test non sensibles.

### Où en est chaque cas (25 novembre 2026)

| Cas | Statut |
|---|---|
| 1. PDF simple | Vérifié : T08 et T09 (PDF vitamine C), T04 (PDF fraises) |
| 2. PDF français | Non testé : seuls des PDF en anglais ont été essayés ; le code reconnaît les intitulés français |
| 3. Instructions sur plusieurs lignes | Vérifié : T10 (coupures de page et pieds de page répétés) |
| 4. Liste de matériel à puces | Matériel affiché dans T02 et T08 ; quantités non vérifiées une à une |
| 5. Durées dans le texte | Vérifié le 22 novembre (durées de 5, 15, 10, 10 et 20 minutes ; un défaut corrigé) ; une étape sans durée affiche « ~ — min » |
| 6. PDF multicolonnes | Non testé (limite documentée dans `06`) |
| 7. PDF scanné | Vérifié : T05 |
| 8. PDF contenant des avertissements | Non testé sur un PDF ; relevé dans le code : « Warning: » et « Safety: » restent dans les instructions de l'étape, un intitulé « Warnings » seul est ignoré avec ses lignes (voir `06`) |

## 6. Exemple de fiche de bug

```text
Identifiant : BUG-XXX
Date :
Version / commit :
Écran :
Étapes pour reproduire :
Résultat attendu :
Résultat observé :
Cause identifiée :
Correction appliquée :
Tests de non-régression :
Statut : ouvert / corrigé / validé
```

### Défauts trouvés par les tests et corrigés

Les fiches `BUG-XXX` ci-dessus n'ont pas été numérotées une à une ; ce tableau en tient lieu.

| Date | Défaut | Correction |
|---|---|---|
| 28/10 | Message « Timer storage unavailable » dans le timer de session | Diagnostiqué et corrigé le 11/11 (voir `03`) |
| 18/11 | Timers : 20 clignotements et 1 seconde en trop sur 20 rafraîchissements | 0 clignotement et 0 seconde en trop après le commit `4cd042c` |
| 22/11 | Message « Notes saved » qui disparaissait aussitôt | Corrigé avant le commit de R-03 |
| 22/11 | Import de PDF : 4 étapes sur 6 | Commit `610c03d` |
| 22/11 | Deux sessions de la même minute portant le même nom | Commit `ffc7422` |
| 24/11 | Icône demandée avec `?v=2` hors ligne, requête partie vers le réseau | Commit `d0344ea` |
| 25/11 | Écran maintenu allumé (L-01) sans effet : hook non appelé dans `SessionPages.tsx` | Modification refaite et vérifiée avec `git diff` ; commit `f1ba657` |

## 7. Critères de validation de la V1

- [x] Build de production sans erreur TypeScript (`tsc -b` + `vite build` à chaque commit de code ; CI n° 1 du 25 novembre).
- [x] Tests automatisés exécutés et résultats archivés (55 tests, relevés dans ce document et exécutés par la CI).
- [x] Parcours bibliothèque → protocole → session opérationnel (T01, T02, T12, T28).
- [x] Sauvegarde et récupération des notes vérifiées (T13, vérification d'indépendance du 22 novembre).
- [x] Timer de session opérationnel, y compris après rechargement (T14, T15).
- [x] Import PDF avec correction humaine possible (T04, T11).
- [x] Limites des PDF non pris en charge clairement affichées (T05, T06, T07 ; colonnes et tableaux : limite documentée dans `06`).
- [x] Vérification hors ligne sur une version de production (24 novembre 2026 ; à refaire sur le build final).
- [x] Application installable dans sa propre fenêtre (T29, 25 novembre 2026).
- [ ] Aucun paramètre scientifique inventé par le parseur (durées vérifiées sur deux PDF, pas de garantie générale : case laissée ouverte).

## 8. Collecte des preuves

Conserver des captures d'écran datées, les commandes de build/test, les cas de test PDF et le hash du commit testé. Une démonstration orale est plus convaincante lorsqu'elle est reliée à un résultat reproductible.

## Résultats du 25 novembre : batterie de tests manuels

Tests faits à la main dans Edge sur le build de production (`npm run build`, `npm run preview`, `localhost:4173`) : T03, T05, T06, T07, T10, T11, T16, T18, T27, T28 et T29, ainsi que le réimport des deux PDF (T04). Chaque ligne du tableau ci-dessus donne le message ou le comportement observé. Code testé : celui du commit `83c4665`, dernier commit de code du 25 novembre (les commits suivants ne modifient que les specs).

Constats mineurs, non corrigés dans la V1 :

- Le champ de durée du timer peut afficher `010` après une saisie commençant par un zéro ; le fonctionnement n'est pas affecté.
- Sur la carte d'une session, le bouton « Delete protocol » supprime le protocole et, en cascade, ses sessions, notes et timers (avec confirmation) ; son libellé pourrait être plus explicite.
- Une étape sans durée estimée affiche « ~ — min ».

Précaution de test : un second `vite preview` démarre sur le port 4174 si le port 4173 est déjà pris, et les données du navigateur sont séparées par port. Pour éviter la confusion, lancer `npm run preview -- --port 4173 --strictPort`.

## Correspondance entre le cahier, le code et les tests

Ce tableau relie chaque fonction du cahier des fonctionnalités (non modifié) aux fichiers qui la réalisent et aux tests qui la vérifient. Les extensions du 25 novembre sont rattachées à la fonction qu'elles prolongent.

| Cahier | Code principal | Tests automatiques | Tests à la main |
|---|---|---|---|
| PROT-01 Protocoles | `src/features/protocols/` (`ProtocolLibrary`, `ProtocolDetail`, `NewProtocol`, `protocolService`, `pdfExtractor`, `pdfTitle`, `DeleteProtocolButton`, `useDeleteProtocol`), `src/data/protocols.ts`, `src/components/ConfirmDialog.tsx` | `protocolService.test.ts` | T01 à T11, T20 à T22 |
| WORK-01 Sessions | `src/features/sessions/` (`SessionPages`, `sessionService`, `sessionLabel`) | `sessionLabel.test.ts` | T12, T23, T28 |
| PROG-01 Progression | `SessionPages.tsx`, `sessionService.ts` | aucun | T28 |
| NOTE-01 Notes | `SessionPages.tsx`, `sessionService.ts`, `src/db/database.ts` (notes classées par session et par étape) | aucun | T13 et vérification d'indépendance du 22 novembre |
| CALC-01 Calculatrice | `src/features/calculator/` (`CalculatorPage`, `calculations`) | `calculations.test.ts` | T16 |
| TIME-01 Minuteries | `src/features/timer/` (`timerService`, `useLabTimer`, `TimerPanel`, `TimerView`, `GlobalTimer`, `tabTitle`), `src/utils/format.ts` | `timerService.test.ts`, `timerStorage.test.ts`, `tabTitle.test.ts`, `format.test.ts` | T14, T15 |
| NOTIF-01 Notifications | `TimerWatcher.tsx`, `timerAlerts.ts` | `timerAlerts.test.ts` | T19, T27 |
| TECH-01 Persistance et fiabilité | `src/db/database.ts`, `src/types/models.ts`, `src/components/ErrorBoundary.tsx`, `src/main.tsx` | `ErrorBoundary.test.ts` | T13, T18, T24 ; échec d'écriture isolé non testé (voir `06`) |
| TECH-02 Application installable | `vite.config.ts` (manifeste et icônes) | aucun | T29 |
| TECH-03 Affichage mobile | `src/components/Layout.tsx`, `src/components/ui.ts`, `src/styles.css` | aucun | vérification à 375 px du 22 novembre |
| TECH-04 Hors ligne | `vite.config.ts` (service worker), `src/db/database.ts` | aucun | T17, T22 |
| L-01 Écran allumé (extension de TIME-01 et WORK-01) | `src/features/sessions/useWakeLock.ts`, `SessionPages.tsx` | aucun | T25 |
| L-02 Titre de l'onglet (extension de TIME-01) | `src/features/timer/tabTitle.ts` | `tabTitle.test.ts` | T14 |
| R-01 Écran d'erreur (extension de TECH-01) | `src/components/ErrorBoundary.tsx`, `src/main.tsx` | `ErrorBoundary.test.ts` | T24 |
| D-02 Intégration continue | `.github/workflows/ci.yml` | les 55 tests, exécutés à chaque push | T26 |
| CHECK-01, DASH-01, SYNC-01, ACCT-01, COLL-01, AI-01 | non réalisés (hors V1) | sans objet | voir `06` |
