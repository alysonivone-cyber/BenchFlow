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
| Test de régression StrictMode | Appels simultanés d'`ensureTimer` : un seul timer créé |
| `tsc -b` + `vite build` | Réussis ; 11 fichiers précachés |
| Chrome (script automatisé, environnement de l'assistant) | Timer de session démarré sans erreur ; suppression d'un protocole + restauration ; import PDF hors ligne |
| Largeur 375 px | Plus de défilement horizontal |
| Comparaison visuelle avant/après Tailwind | Rendu identique, écarts corrigés |

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
| T12 | Démarrer une session | L'étape active s'affiche | À revalider |
| T13 | Enregistrer des notes | Les notes sont retrouvées après rechargement | À tester |
| T14 | Démarrer, suspendre et réinitialiser le timer de session | États et durée cohérents | Démarrage vérifié le 11/11 (script) ; à refaire à la main |
| T15 | Recharger pendant un timer actif | Temps restant recalculé correctement | Prioritaire |
| T16 | Utiliser le calculateur scientifique | Résultats corrects pour des exemples de référence | À tester |
| T17 | Passer hors ligne après mise en cache | Interface et données locales restent accessibles | À tester |
| T18 | Effacer le stockage local dans un environnement de test | Perte des données expliquée et comportement maîtrisé | À tester |
| T19 | Fin d'un timer (application ouverte) | Bannière, bips, notification si permission accordée | Tests unitaires réussis ; test manuel à faire |
| T20 | Supprimer un protocole avec sessions | Confirmation, suppression des sessions, notes et timers | Réussi (test automatisé et script) |
| T21 | Supprimer puis restaurer un protocole de démonstration | Masqué puis de nouveau visible | Réussi (test automatisé et script) |
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
