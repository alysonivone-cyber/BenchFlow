# BenchFlow — Limites connues et pistes d'amélioration

> L'objectif est de présenter les limites de manière transparente, puis de proposer des évolutions réalistes. Les éléments ci-dessous ne doivent pas être présentés comme déjà implémentés.

## 1. Limites du lecteur PDF

**Constat :** un PDF contient une représentation visuelle du document ; il ne fournit pas toujours une structure sémantique explicite. Le texte extrait peut être fragmenté, déplacé ou mélangé.

**Conséquences possibles :** titres confondus avec des instructions, paragraphes coupés, listes fusionnées, matériel non reconnu, sections ignorées ou mauvaise lecture des colonnes.

**Réponse V1 :** parser local avec règles explicites, document source conservé, édition humaine et messages d'erreur pour les cas non pris en charge.

**Améliorations possibles :** tests sur corpus varié, détection plus robuste de la mise en page, extraction de tableaux, score de confiance par champ, aperçu comparatif source/résultat et OCR local si faisable.

**Limite fondamentale :** il n'est pas réaliste de garantir une lecture « parfaite » de tous les PDF avec des expressions régulières. Le logiciel doit reconnaître ses incertitudes.

**Ce que l'import lit aujourd'hui (état du 22 novembre 2026) :**
- le texte sélectionnable uniquement, lu page par page, pour un fichier de 15 Mo au plus ;
- les étapes, reconnues par un titre de la forme « Step 1: titre », « Étape 1 : titre », « Phase 1 » ou « 1. titre » (130 caractères au plus, sans point, point d'exclamation ni point d'interrogation final), numérotées dans l'ordre à partir de 1 : une ligne numérotée hors séquence reste une instruction ;
- les sections reconnues par leur intitulé, en anglais ou en français : objectif, description, matériel, résultats attendus, durée, procédure, notes ;
- la durée d'une étape, lue seulement dans son titre ou sur une ligne « Duration: … » : une durée citée au milieu d'une instruction ne crée pas de timer ;
- les lignes « Note: », « Observation: », « Warning: » ou « Safety: », conservées dans les instructions de l'étape ; les numéros de page sont ignorés.

**Ce que l'import ne lit pas, ou lit mal :**
- les photos, schémas, tableaux et formules sous forme d'image : seul le texte est lu, et le PDF d'origine reste consultable depuis le protocole ;
- les PDF scannés (images sans texte) : l'application affiche un message d'erreur, il n'y a pas d'OCR ;
- les mises en page en colonnes ou en tableaux : l'ordre des lignes peut être mélangé ;
- les étapes non numérotées ou numérotées dans un autre style : si aucune étape fiable n'est trouvée, l'application le dit et invite à saisir les étapes à la main ;
- **une étape sans aucune instruction est supprimée sans message** : le choix évite de créer des étapes vides, mais l'utilisatrice n'est pas prévenue du nombre d'étapes retirées ;
- une mise en page inconnue peut donner un résultat incomplet sans aucune erreur : le protocole importé doit être relu et corrigé avec le PDF d'origine sous les yeux (correction d'une étape : T11 dans `05`, encore à tester).

**Pourquoi cette limite est assumée :** lire correctement des protocoles réels, avec photos et mises en page variées, demanderait un traitement distant (modèle de lecture de documents), donc un backend et une clé d'API protégée, ce qui sort du périmètre V1 (voir la section 2). La V1 choisit un parser local, qui reste honnête sur ses limites.

**Exemple concret (22 novembre 2026) :** un PDF de test fabriqué pour l'occasion (6 étapes) n'en donnait que 4 : une ligne « Duration » placée en tête d'étape faisait lire ses instructions comme une durée, et les étapes restées vides étaient supprimées sans message. Le défaut a été corrigé (commit `610c03d`, voir `05`). Il illustre qu'un parser à règles a des angles morts, d'où la relecture humaine prévue par la réponse V1.

## 2. Absence de backend

**Contrainte V1 :** pas de serveur applicatif.

**Conséquences :** pas de synchronisation multi-appareils, de comptes centralisés ni de traitement distant sécurisé. Une clé API placée dans le frontend ne resterait pas secrète.

**Pistes futures sous réserve d'un nouveau périmètre :** export/import local des données, synchronisation sécurisée avec backend autorisé, gestion des utilisateurs et des droits.

## 3. Persistance des données

**Constat :** IndexedDB permet le stockage local mais ne garantit pas une sauvegarde permanente.

**Risques :** nettoyage des données du navigateur, navigation privée, quota de stockage, changement d'appareil ou erreur d'accès à la base.

**Améliorations :** export de sauvegarde, import de restauration, messages d'erreur explicites et tests de migration de schéma.

**Extension de TECH-01 réalisée le 25 novembre (R-01, DT-23) :** un écran de récupération remplace la page blanche lorsque l'interface plante pendant l'affichage. **Limites :** il ne rattrape ni les erreurs des gestionnaires d'événements, ni celles des opérations asynchrones, donc pas un échec d'écriture Dexie. Ce cas relève de la gestion d'erreurs propre à chaque opération (par exemple le message du timer) et du test T18 (effacer le stockage local), réussi le 25 novembre pour l'effacement complet (voir `05`). Un échec d'écriture isolé, par exemple un quota plein, n'a pas été provoqué.

## 4. Minuteries et exécution

**Corrigé le 11 novembre :** le message « Timer storage unavailable » venait d'une course entre deux créations simultanées du timer (React.StrictMode) ; la création est maintenant atomique (DT-13).

**NOTIF-01 réalisé (V1) :** bannière, son et notification système avec permission (DT-14).

**Limites restantes :** sans serveur push, aucune alerte si l'application est complètement fermée ; en arrière-plan, le navigateur peut suspendre les timers JavaScript (le temps restant reste juste grâce à `endsAt`). Le son exige un clic préalable (règle des navigateurs).

**Extension de TIME-01 et WORK-01 réalisée le 25 novembre (L-01, DT-24) :** l'écran reste allumé tant qu'une session est ouverte, pour que le décompte et les consignes restent visibles pendant la manipulation. **Limites :** il reste allumé même sans timer actif (raffinement possible : seulement pendant un timer) ; le navigateur peut refuser la demande ; vérifié uniquement dans Edge.

**Évolution V2 :** plusieurs timers simultanés.

## 5. Performance

**Résolu le 11 novembre :** pdf.js est chargé à la demande (DT-11), l'avertissement de taille a disparu.

**Reste possible :** découpage du code par écran, audit Lighthouse.

## 6. Compatibilité et accessibilité

**À vérifier :** navigation clavier, labels de formulaires, contrastes, affichage mobile, lecteurs d'écran, fonctionnement sur différents navigateurs et prise en charge des notifications.

**Écran allumé (L-01) :** l'API Screen Wake Lock manque dans certains navigateurs et exige `localhost` ou HTTPS. Sans elle, l'écran peut s'éteindre ; le reste de l'application fonctionne.

**Évolutions :** audit d'accessibilité, tests multi-appareils et retours d'utilisateurs en laboratoire.

## 7. Fiabilité scientifique

BenchFlow est un **outil d'organisation et d'accompagnement**, pas un dispositif validant la sécurité ou l'exactitude d'une procédure expérimentale. Les paramètres d'une manipulation doivent venir du document source et des procédures approuvées du laboratoire.

Les erreurs d'extraction ne doivent jamais être masquées par des valeurs inventées.

## 8. Priorisation proposée

| Priorité | Sujet | Justification |
|---|---|---|
| Fait (11/11) | Timer de session et persistance | Corrigé, test de régression ; test manuel réussi les 18 et 22 novembre |
| Critique V1 | Exactitude et édition des étapes extraites | Risque de mauvaise compréhension du protocole |
| Haute V1 | Sauvegarde notes/sessions et fonctionnement hors ligne | Promesse centrale de l'application |
| Haute V1 | Tests de régression et gestion d'erreurs | Stabilité de la démonstration |
| Fait (11/11) | Chargement différé de pdf.js | Avertissement de taille résolu |
| Fait (25/11) | Écran d'erreur global (extension de TECH-01) | Évite une page blanche ; limites en section 3 |
| Fait (25/11) | Écran maintenu allumé (extension de TIME-01 et WORK-01) | Confort en laboratoire ; dépend du navigateur |
| Fait (25/11) | Intégration continue (GitHub Actions) | Build et tests vérifiés sur une machine propre |
| V2 | Timers multiples | Fonctionnalité additionnelle (les notifications de base sont faites) |
| V2 | OCR local et prise en charge des PDF complexes | Complexité importante |
| Hors V1 | Backend et API IA distante | Incompatible avec la contrainte actuelle |
| Hors V1 | Publication en ligne (Vercel) | Non nécessaire : l'examen du 10 décembre se fait en localhost |

## 9. Message à retenir pour l'oral

> « J'ai volontairement défini un périmètre réaliste pour la V1. Les fonctionnalités essentielles doivent être stables et vérifiables. Les limites identifiées ne sont pas cachées : elles orientent les tests et la feuille de route des versions suivantes. »
