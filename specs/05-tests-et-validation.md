# BenchFlow — Plan de tests et validation

> Ce document sépare les **résultats effectivement observés** des tests **à exécuter**. Il ne constitue pas une certification de l'application.

## 1. Stratégie

Les vérifications couvrent quatre niveaux : compilation TypeScript, tests unitaires, parcours utilisateur dans le navigateur et comportement PWA/hors ligne.

## 2. Commandes de référence (Windows PowerShell)

```powershell
npm.cmd run build
npx.cmd vitest run
npm.cmd run dev
```

Le serveur Vite affiche ensuite une URL locale (souvent `http://localhost:5173/`, mais le port réel est celui annoncé par le terminal).

## 3. Résultats déjà observés

| Vérification | Observation | Interprétation |
|---|---|---|
| `npm.cmd run build` après intégration de PDF.js | Compilation TypeScript et build Vite réussis dans un journal partagé | La version correspondante compilait ; cela ne prouve pas l'absence de bugs fonctionnels |
| Build PWA | Génération de `dist/sw.js` et du manifest observée | Les fichiers PWA ont été générés ; l'installation et le mode hors ligne restent à tester |
| Taille des bundles (28/10) | Avertissement Vite pour des chunks de plus de 500 Ko | Résolu le 11/11 par le chargement différé de pdf.js |
| PDF de démonstration | Objectif et matériel affichés après amélioration | Une partie de l'extraction fonctionne sur ce document |
| Extraction des étapes | Instructions parfois mal regroupées ou tronquées | Régression / limite à traiter avec des cas de test représentatifs |
| Timer de session (28/10) | Message « Timer storage unavailable » observé | Diagnostiqué et corrigé le 11/11, voir ci-dessous |
| Timer du calculateur | Fonctionnement signalé lors du même essai | Les deux contextes doivent être testés séparément |

### Résultats du 11 novembre 2026 (état final)

| Vérification | Résultat |
|---|---|
| `npx vitest run` | 32 tests réussis (5 fichiers) : timer, calculs, stockage, alertes, suppression en cascade |
| `npx vitest run` (après le correctif « introuvable », DT-16) | 38 tests réussis (6 fichiers) : s'y ajoutent les noms lisibles et le contrat de `getProtocol` |
| Navigateur, après DT-16 | `/protocols/inconnu` → « Protocol not found. » ; `/sessions/inconnu` → « Session not found. » ; session dont le protocole est supprimé → « Session not found. » ; pages valides inchangées |
| `npx vitest run` (après DT-17, titre de l'onglet du PDF) | 38 tests réussis (6 fichiers) : aucun test ajouté, la vérification de DT-17 a été faite à la main dans Edge |
| Navigateur, après DT-17 | Ordinateur, y compris avec écran tactile : onglet `20261111-1429 · Strawberry DNA Extraction` avec `<embed>` du PDF ; téléphone : PDF ouvert directement. Rendu réel dans Edge : confirmé le 22 novembre (voir les résultats du 22 novembre) |
| Test de régression StrictMode | Appels simultanés d'`ensureTimer` : un seul timer créé |
| `tsc -b` + `vite build` | Réussis ; 11 fichiers précachés |
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
| Pas encore testé | Notifications système, hors ligne sur le build de production, affichage à 375 px, titre de l'onglet d'un PDF fraîchement importé : tests reportés, voir les résultats du 22 novembre |

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
| Titre de l'onglet d'un PDF fraîchement importé (DT-17, 22 novembre) | PDF de test `vitamin-c-juice-titration.pdf`, dont le titre interne est volontairement faux et le nom de fichier différent du titre : l'onglet s'appelle `20261122-1508 · Vitamin C Content of Orange Juice by Iodine Titration` (date et heure de l'import, puis titre du protocole) ; ni le titre interne ni le nom du fichier ne sont repris. Le PDF s'affiche dans la page |
| Import de ce PDF de test (commit `610c03d`) | **Défaut trouvé pendant ce test** : 4 étapes sur 6 importées. Cause : après une ligne « Duration: 5 minutes » placée en tête d'étape, les lignes suivantes étaient lues comme des durées et non comme des instructions ; les étapes restées sans instructions étaient supprimées sans message, et une mention « 20 seconds » dans une instruction écrasait la durée d'une étape (10 minutes). Corrigé : seule la ligne de la durée est lue comme durée. Après correction : 6 étapes, instructions complètes de l'étape 1 (3 lignes), vérifiés à la main dans Edge ; durées (5, 15, 10, 10 et 20 minutes) vérifiées par un script sur le texte du PDF. `tsc -b`, `vite build` et 53 tests réussis (aucun test automatique ajouté : l'extracteur charge pdf.js, qui n'est pas exécutable dans l'environnement de test) |
| Pas encore testé | Hors ligne sur le build de production : prévu le mardi 24 novembre. À faire aussi avant le gel du code du 29 novembre : NOTE-01 (notes indépendantes de deux sessions du même protocole) et pause / réinitialisation du timer (T14) à la main |

### Scénario du test 1 — session, timers, fermeture complète et réouverture (22 novembre 2026, build de production, Edge)

| Étape | Résultat |
|---|---|
| Démarrer une session, écrire une note sur l'étape 1 et l'enregistrer | Conforme |
| Lancer un timer de 1 min sur l'étape 1, passer à l'étape 2 avec « Next », lancer un timer de 5 min | Conforme |
| Fermer complètement Edge, attendre environ 2 minutes, rouvrir l'application et la session (« Resume Session ») | Conforme : la note de l'étape 1 est conservée ; la session reprend à l'étape 2 ; le timer de 5 min est conservé avec son temps restant ; le timer de 1 min, terminé pendant la fermeture, affiche `00:00` avec une alerte de rattrapage (bandeau et bips), car il s'est terminé depuis moins de 5 minutes (DT-20) |
| Constat avant le test | Edge affichait d'abord une ancienne version de l'application (ancien accueil sans logo), servie par le cache du service worker de `localhost:4173`. Après désinscription du service worker (onglet Application) et rechargement forcé, la version actuelle s'est affichée ; la base IndexedDB n'a pas été effacée. C'est le comportement attendu d'une PWA en mise à jour automatique (`autoUpdate`) : la nouvelle version s'affiche à la visite suivante |

Ces vérifications ne remplacent pas un test manuel sur ma machine.

Un build réussi a été observé le 28 octobre 2026. Pour les tests futurs, consigner la date, le commit testé et le résultat réel ; ne pas attribuer rétroactivement un résultat à un commit non identifié.

## 4. Matrice de tests fonctionnels

| ID | Scénario | Résultat attendu | Statut |
|---|---|---|---|
| T01 | Ouvrir la bibliothèque | Les protocoles sont affichés | À revalider |
| T02 | Ouvrir le détail d'un protocole | Titre, objectif, matériel, résultats et étapes s'affichent | À revalider |
| T03 | Ajouter un protocole manuellement | Le protocole est sauvegardé puis retrouvé | À tester |
| T04 | Importer un PDF texte de moins de 15 Mo | Texte extrait, champs proposés à l'édition | À tester |
| T05 | Importer un PDF scanné sans texte | Message explicite, sans instructions inventées | À tester |
| T06 | Importer un fichier non PDF | Rejet avec message compréhensible | À tester |
| T07 | Importer un PDF dépassant 15 Mo | Rejet avec message compréhensible | À tester |
| T08 | PDF avec sections Objectif/Matériel/Résultats | Les champs globaux sont correctement affectés | À tester |
| T09 | PDF avec étapes numérotées | Chaque instruction reste rattachée à la bonne étape | Prioritaire |
| T10 | PDF avec retours à la ligne, colonnes ou tableaux | Le résultat est vérifié ; limites signalées | Prioritaire |
| T11 | Corriger une étape extraite | La correction est enregistrée et réaffichée | À tester |
| T12 | Démarrer une session | L'étape active s'affiche | Réussi à la main (22/11, scénario du test 1) |
| T13 | Enregistrer des notes | Les notes sont retrouvées après rechargement | Réussi à la main (22/11 : note conservée après la fermeture complète du navigateur, scénario du test 1) |
| T14 | Démarrer, suspendre et réinitialiser le timer de session | États et durée cohérents | Démarrage vérifié le 11/11 (script), puis à la main les 18 et 22 novembre ; pause et réinitialisation à revérifier à la main |
| T15 | Recharger pendant un timer actif | Temps restant recalculé correctement | Réussi à la main (18/11 et 22/11) et par script (20 rafraîchissements : aucun saut ni clignotement) |
| T16 | Utiliser le calculateur scientifique | Résultats corrects pour des exemples de référence | À tester |
| T17 | Passer hors ligne après mise en cache | Interface et données locales restent accessibles | À tester |
| T18 | Effacer le stockage local dans un environnement de test | Perte des données expliquée et comportement maîtrisé | À tester |
| T19 | Fin d'un timer (application ouverte) | Bannière, bips, notification si permission accordée | Tests unitaires réussis ; bannière et bips vérifiés à la main les 18 et 22 novembre ; notification système vue le 22 novembre après avoir accordé la permission dans Edge (la demande de permission n'apparaît qu'à la première utilisation) ; avec deux timers à la suite, chaque fin de timer a bien affiché sa notification |
| T20 | Supprimer un protocole avec sessions | Confirmation, suppression des sessions, notes et timers | Réussi (test automatisé et script) |
| T21 | Supprimer puis restaurer un protocole de démonstration | Masqué puis de nouveau visible | Réussi (test automatisé et script) |
| T23 | Nom lisible d'une session | Affichage `AAAAMMJJ-HHmm · Titre`, sans changer l'id | Réussi (5 tests unitaires + script, 11/11) |
| T22 | Importer un PDF hors ligne (build de production) | L'analyse fonctionne | Réussi le 11/11 (script) après ajout de `.mjs` au précache |

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

## 7. Critères de validation de la V1

- [ ] Build de production sans erreur TypeScript.
- [ ] Tests automatisés exécutés et résultats archivés.
- [ ] Parcours bibliothèque → protocole → session opérationnel.
- [ ] Sauvegarde et récupération des notes vérifiées.
- [ ] Timer de session opérationnel, y compris après rechargement.
- [ ] Import PDF avec correction humaine possible.
- [ ] Limites des PDF non pris en charge clairement affichées.
- [ ] Vérification hors ligne sur une version de production.
- [ ] Aucun paramètre scientifique inventé par le parseur.

## 8. Collecte des preuves

Conserver des captures d'écran datées, les commandes de build/test, les cas de test PDF et le hash du commit testé. Une démonstration orale est plus convaincante lorsqu'elle est reliée à un résultat reproductible.
