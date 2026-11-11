# BenchFlow — Limites connues et pistes d'amélioration

> L'objectif est de présenter les limites de manière transparente, puis de proposer des évolutions réalistes. Les éléments ci-dessous ne doivent pas être présentés comme déjà implémentés.

## 1. Limites du lecteur PDF

**Constat :** un PDF contient une représentation visuelle du document ; il ne fournit pas toujours une structure sémantique explicite. Le texte extrait peut être fragmenté, déplacé ou mélangé.

**Conséquences possibles :** titres confondus avec des instructions, paragraphes coupés, listes fusionnées, matériel non reconnu, sections ignorées ou mauvaise lecture des colonnes.

**Réponse V1 :** parser local avec règles explicites, document source conservé, édition humaine et messages d'erreur pour les cas non pris en charge.

**Améliorations possibles :** tests sur corpus varié, détection plus robuste de la mise en page, extraction de tableaux, score de confiance par champ, aperçu comparatif source/résultat et OCR local si faisable.

**Limite fondamentale :** il n'est pas réaliste de garantir une lecture « parfaite » de tous les PDF avec des expressions régulières. Le logiciel doit reconnaître ses incertitudes.

## 2. Absence de backend

**Contrainte V1 :** pas de serveur applicatif.

**Conséquences :** pas de synchronisation multi-appareils, de comptes centralisés ni de traitement distant sécurisé. Une clé API placée dans le frontend ne resterait pas secrète.

**Pistes futures sous réserve d'un nouveau périmètre :** export/import local des données, synchronisation sécurisée avec backend autorisé, gestion des utilisateurs et des droits.

## 3. Persistance des données

**Constat :** IndexedDB permet le stockage local mais ne garantit pas une sauvegarde permanente.

**Risques :** nettoyage des données du navigateur, navigation privée, quota de stockage, changement d'appareil ou erreur d'accès à la base.

**Améliorations :** export de sauvegarde, import de restauration, messages d'erreur explicites et tests de migration de schéma.

## 4. Minuteries et exécution

**Corrigé le 11 novembre :** le message « Timer storage unavailable » venait d'une course entre deux créations simultanées du timer (React.StrictMode) ; la création est maintenant atomique (DT-13).

**NOTIF-01 réalisé (V1) :** bannière, son et notification système avec permission (DT-14).

**Limites restantes :** sans serveur push, aucune alerte si l'application est complètement fermée ; en arrière-plan, le navigateur peut suspendre les timers JavaScript (le temps restant reste juste grâce à `endsAt`). Le son exige un clic préalable (règle des navigateurs).

**Évolution V2 :** plusieurs timers simultanés.

## 5. Performance

**Résolu le 11 novembre :** pdf.js est chargé à la demande (DT-11), l'avertissement de taille a disparu.

**Reste possible :** découpage du code par écran, audit Lighthouse.

## 6. Compatibilité et accessibilité

**À vérifier :** navigation clavier, labels de formulaires, contrastes, affichage mobile, lecteurs d'écran, fonctionnement sur différents navigateurs et prise en charge des notifications.

**Évolutions :** audit d'accessibilité, tests multi-appareils et retours d'utilisateurs en laboratoire.

## 7. Fiabilité scientifique

BenchFlow est un **outil d'organisation et d'accompagnement**, pas un dispositif validant la sécurité ou l'exactitude d'une procédure expérimentale. Les paramètres d'une manipulation doivent venir du document source et des procédures approuvées du laboratoire.

Les erreurs d'extraction ne doivent jamais être masquées par des valeurs inventées.

## 8. Priorisation proposée

| Priorité | Sujet | Justification |
|---|---|---|
| Fait (11/11) | Timer de session et persistance | Corrigé, test de régression ; test manuel à refaire |
| Critique V1 | Exactitude et édition des étapes extraites | Risque de mauvaise compréhension du protocole |
| Haute V1 | Sauvegarde notes/sessions et fonctionnement hors ligne | Promesse centrale de l'application |
| Haute V1 | Tests de régression et gestion d'erreurs | Stabilité de la démonstration |
| Fait (11/11) | Chargement différé de pdf.js | Avertissement de taille résolu |
| V2 | Timers multiples | Fonctionnalité additionnelle (les notifications de base sont faites) |
| V2 | OCR local et prise en charge des PDF complexes | Complexité importante |
| Hors V1 | Backend et API IA distante | Incompatible avec la contrainte actuelle |

## 9. Message à retenir pour l'oral

> « J'ai volontairement défini un périmètre réaliste pour la V1. Les fonctionnalités essentielles doivent être stables et vérifiables. Les limites identifiées ne sont pas cachées : elles orientent les tests et la feuille de route des versions suivantes. »
