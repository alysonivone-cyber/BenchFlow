# BenchFlow — Limites connues et pistes d'amélioration

> L'objectif est de présenter les limites de manière transparente, puis de proposer des évolutions réalistes. Les éléments ci-dessous ne doivent pas être présentés comme déjà implémentés.

## 1. Limites du lecteur PDF

**Constat :** un PDF contient une représentation visuelle du document ; il ne fournit pas toujours une structure sémantique explicite. Le texte extrait peut être fragmenté, déplacé ou mélangé.

**Conséquences possibles :** titres confondus avec des instructions, paragraphes coupés, listes fusionnées, matériel non reconnu, sections ignorées ou mauvaise lecture des colonnes.

**Réponse V1 :** parser local avec règles explicites, document source conservé, édition humaine et messages d'erreur pour les cas non pris en charge.

**Améliorations possibles :** tests sur corpus varié, détection plus robuste de la mise en page, extraction de tableaux, score de confiance par champ, aperçu comparatif source/résultat et OCR local si faisable.

**Limite fondamentale :** il n'est pas réaliste de garantir une lecture « parfaite » de tous les PDF avec des expressions régulières. Le logiciel doit reconnaître ses incertitudes.

**Ce que l'import lit aujourd'hui (état du 25 novembre 2026) :**
- le texte sélectionnable uniquement, lu page par page, pour un fichier de 15 Mo au plus ;
- les étapes, reconnues par un titre de la forme « Step 1: titre », « Étape 1 : titre », « Stage 1 », « Phase 1 » ou « 1. titre » (130 caractères au plus, sans point, point d'exclamation ni point d'interrogation final), numérotées dans l'ordre à partir de 1 : une ligne numérotée hors séquence reste une instruction ;
- les sections reconnues par leur intitulé, en anglais ou en français : objectif, description, matériel, résultats attendus, durée, procédure, notes ; les intitulés avertissements, sécurité, précautions, références, annexe et contrôle qualité sont reconnus, mais leur section est ignorée (voir plus bas) ;
- la durée d'une étape, lue seulement dans son titre ou sur une ligne « Duration: … » : une durée citée au milieu d'une instruction ne crée pas de timer ;
- les lignes « Note: », « Observation: », « Warning: » ou « Safety: », conservées dans les instructions de l'étape ; les numéros de page sont ignorés.

**Ce que l'import ne lit pas, ou lit mal :**
- les photos, schémas, tableaux et formules sous forme d'image : seul le texte est lu, et le PDF d'origine reste consultable depuis le protocole ;
- les PDF scannés (images sans texte) : l'application affiche un message d'erreur, il n'y a pas d'OCR (test T05 dans `05`) ;
- les fichiers invalides ou trop lourds : un fichier texte renommé en .pdf est refusé (« Invalid PDF structure. »), de même qu'un PDF de plus de 15 Mo (« Select a PDF smaller than 15 MB. ») ; tests T06 et T07 dans `05` ;
- les mises en page en colonnes ou en tableaux : l'ordre des lignes peut être mélangé ;
- les étapes non numérotées ou numérotées dans un autre style : si aucune étape fiable n'est trouvée, l'application le dit et invite à saisir les étapes à la main ;
- les avertissements présentés comme une section (« Warnings », « Safety », « Precautions », « References », « Appendix », « Quality control ») : l'intitulé ouvre une section volontairement ignorée, dont les lignes ne sont pas importées jusqu'à l'étape suivante ; seules les lignes commençant par « Note: », « Observation: », « Warning: » ou « Safety: » (au singulier, avec deux-points) sont conservées. Relevé dans le code, pas encore essayé sur un PDF ;
- une liste numérotée à l'intérieur d'une étape : un élément qui porte le numéro attendu pour l'étape suivante et ne se termine pas par un point est pris pour une nouvelle étape ;
- les en-têtes et pieds de page propres à un document : seuls les numéros de page et quelques phrases des PDF de test (fonction `isNoise` de `pdfExtractor.ts`) sont filtrés ; l'en-tête répété d'un autre document serait lu comme une ligne de texte ;
- les PDF en français : le code reconnaît les intitulés français, mais seuls des PDF en anglais ont été essayés (cas 2 dans `05`, non testé) ;
- **une étape sans aucune instruction est supprimée sans message** : le choix évite de créer des étapes vides, mais l'utilisatrice n'est pas prévenue du nombre d'étapes retirées ;
- une mise en page inconnue peut donner un résultat incomplet sans aucune erreur : le protocole importé doit être relu et corrigé avec le PDF d'origine sous les yeux (correction d'une étape : T11 dans `05`, réussi le 25 novembre).

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

**Limites restantes :** sans serveur push, aucune alerte si l'application est complètement fermée ; en arrière-plan, le navigateur peut suspendre les timers JavaScript (le temps restant reste juste grâce à `endsAt`). Le son exige un clic préalable (règle des navigateurs), et le navigateur peut couper l'audio du site. Si la permission des notifications système est bloquée, la bannière et le son restent actifs et un message l'explique (T27 dans `05`).

**Extension de TIME-01 et WORK-01 réalisée le 25 novembre (L-01, DT-24) :** l'écran reste allumé tant qu'une session est ouverte, pour que le décompte et les consignes restent visibles pendant la manipulation. **Limites :** il reste allumé même sans timer actif (raffinement possible : seulement pendant un timer) ; le navigateur peut refuser la demande ; vérifié uniquement dans Edge.

**Plusieurs timers simultanés : réalisés le 18 novembre (DT-19, DT-20) :** chaque timer est indépendant (session ou calculatrice), avec une étiquette et des alertes globales ; depuis le 22 novembre, le temps restant s'affiche aussi dans le titre de l'onglet (L-02). Vérifié à la main (T15 et T19 dans `05`).

## 5. Performance

**Résolu le 11 novembre :** pdf.js est chargé à la demande (DT-11), l'avertissement de taille a disparu.

**Reste possible :** découpage du code par écran, audit Lighthouse (prévu avant le gel du code).

## 6. Compatibilité et accessibilité

**À vérifier :** contrastes et labels de formulaires (audit Lighthouse prévu), navigation au clavier sur les écrans autres que la pastille des étapes, lecteurs d'écran, autres navigateurs et vrai téléphone (l'installation n'a été testée que dans Edge).

**Déjà vérifié :** affichage à 375 px (22 novembre, émulation d'appareil dans Edge, pas un téléphone réel) ; navigation au clavier sur la pastille grise des étapes (22 novembre) ; notifications système accordées et bloquées (T19, T27) ; installation de l'application (T29).

**Écran allumé (L-01) :** l'API Screen Wake Lock manque dans certains navigateurs et exige `localhost` ou HTTPS. Sans elle, l'écran peut s'éteindre ; le reste de l'application fonctionne.

**Évolutions :** audit d'accessibilité, tests multi-appareils et retours d'utilisateurs en laboratoire.

**Constats mineurs de l'interface, non corrigés dans la V1 (25 novembre) :** le champ de durée du timer peut afficher `010` après une saisie commençant par un zéro ; sur la carte d'une session, le bouton « Delete protocol » supprime le protocole et, en cascade, ses sessions, notes et timers (avec confirmation), son libellé pourrait être plus explicite ; une étape sans durée estimée affiche « ~ — min ». Voir `05`.

## 7. Fiabilité scientifique

BenchFlow est un **outil d'organisation et d'accompagnement**, pas un dispositif validant la sécurité ou l'exactitude d'une procédure expérimentale. Les paramètres d'une manipulation doivent venir du document source et des procédures approuvées du laboratoire.

Les erreurs d'extraction ne doivent jamais être masquées par des valeurs inventées.

## 8. Priorisation proposée

| Priorité | Sujet | Justification |
|---|---|---|
| Fait (11/11) | Timer de session et persistance | Corrigé, test de régression ; test manuel réussi les 18 et 22 novembre |
| Critique V1 | Exactitude et édition des étapes extraites | Risque de mauvaise compréhension du protocole ; correction d'une étape vérifiée (T11), limites en section 1 |
| Haute V1 | Sauvegarde notes/sessions et fonctionnement hors ligne | Promesse centrale de l'application ; hors ligne vérifié le 24/11 (T17), à refaire sur le build final |
| Haute V1 | Tests de régression et gestion d'erreurs | Stabilité de la démonstration |
| Fait (11/11) | Chargement différé de pdf.js | Avertissement de taille résolu |
| Fait (25/11) | Écran d'erreur global (extension de TECH-01) | Évite une page blanche ; limites en section 3 |
| Fait (25/11) | Écran maintenu allumé (extension de TIME-01 et WORK-01) | Confort en laboratoire ; dépend du navigateur |
| Fait (25/11) | Intégration continue (GitHub Actions) | Build et tests vérifiés sur une machine propre |
| Fait (18/11) | Timers multiples et indépendants | Étiquettes et alertes globales (DT-19, DT-20) |
| V2 | OCR local et prise en charge des PDF complexes | Complexité importante |
| Hors V1 | Backend et API IA distante | Incompatible avec la contrainte actuelle |
| Hors V1 | Publication en ligne (Vercel) | Non nécessaire : l'examen du 10 décembre se fait en localhost |

## 9. Message à retenir pour l'oral

> « J'ai volontairement défini un périmètre réaliste pour la V1. Les fonctionnalités essentielles doivent être stables et vérifiables. Les limites identifiées ne sont pas cachées : elles orientent les tests et la feuille de route des versions suivantes. »
