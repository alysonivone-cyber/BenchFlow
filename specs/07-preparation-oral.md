# BenchFlow — Préparation de la soutenance orale CREA

> Trame de préparation, à adapter à la durée exacte de l'oral et aux fonctionnalités réellement validées au moment de la présentation.

## 1. Présentation courte du projet (environ 45 secondes)

« BenchFlow est une Progressive Web App conçue pour accompagner les workflows expérimentaux. L'idée est de regrouper dans un même environnement la consultation des protocoles, l'exécution étape par étape, les notes d'expérience, les minuteries et des outils de calcul scientifique. Une contrainte importante de mon projet était de fonctionner sans backend. J'ai donc privilégié une architecture côté navigateur, avec React et TypeScript pour l'interface, IndexedDB pour les données locales et un service worker pour les ressources hors ligne. En bonus, j'ai ajouté l'importation de protocoles PDF avec étapes éditables, en conservant le document original. »

## 2. Plan suggéré pour une démonstration

1. **Problème initial :** les informations expérimentales sont dispersées entre PDF, notes et outils séparés.
2. **Objectif :** centraliser la préparation et le suivi d'une expérience.
3. **Contraintes :** PWA, fonctionnement local, absence de backend et délai de livraison.
4. **Architecture :** React, TypeScript, Vite, IndexedDB, service worker.
5. **Parcours utilisateur :** bibliothèque → détail → session → notes et timer.
6. **Import PDF :** sélection, extraction, correction humaine et conservation du fichier source.
7. **Difficultés rencontrées :** parsing PDF, erreurs TypeScript, persistance du timer.
8. **Validation :** tests, build, limites connues et perspectives.

Ne montrer en direct que les fonctionnalités dont le fonctionnement a été vérifié sur la version présentée.

## 3. Questions techniques probables et réponses

### Pourquoi une PWA ?

Pour fournir une expérience accessible depuis un navigateur, potentiellement installable et utilisable hors ligne après mise en cache, sans maintenir deux applications natives distinctes.

### Pourquoi React et TypeScript ?

React aide à organiser l'interface en composants réutilisables. TypeScript rend explicites les structures de données et aide à repérer des incohérences avant l'exécution.

### Pourquoi IndexedDB plutôt que localStorage ?

IndexedDB est adapté aux données structurées et aux volumes plus importants, y compris les Blob. Dexie simplifie son utilisation. Il faut toutefois gérer les erreurs et les migrations.

### Comment fonctionne l'application sans backend ?

Les calculs et interactions se déroulent dans le navigateur ; les données sont enregistrées localement. Le service worker gère la mise en cache des ressources. Cela ne signifie pas que les données sont synchronisées entre appareils.

### Comment fonctionne l'import PDF ?

PDF.js lit la couche texte du document. Un parseur local tente ensuite d'identifier les sections et étapes selon leur contenu et leur mise en page. L'utilisateur vérifie et corrige les informations avant enregistrement.

### Pourquoi ne pas utiliser Gemini ?

La V1 doit respecter une architecture sans backend. Une clé API insérée dans le code client serait exposée. De plus, une extraction locale permet de fonctionner sans envoyer les protocoles à un service distant. Le choix implique cependant des limites de compréhension documentaire.

### Peut-on lire tous les PDF ?

Non. Les documents scannés, multicolonnes ou complexes peuvent poser problème. La V1 doit gérer ces limites explicitement et permettre la correction humaine.

### Comment éviter de perdre le temps restant quand un onglet est inactif ?

En utilisant une échéance absolue pour les timers actifs et en recalculant le temps restant à partir de l'heure actuelle, plutôt que de compter uniquement les ticks d'un intervalle.

### Pourquoi a-t-on utilisé Tailwind alors que votre CSS fonctionnait ?

« La spécification V1 annonçait Tailwind. J'ai d'abord écrit du CSS à la main pour avancer, puis migré en vérifiant par des captures avant/après que l'apparence ne changeait pas. Les couleurs sont des jetons nommés par rôle dans `@theme`, et les classes répétées sont dans `ui.ts`. »

### Comment supprimez-vous un protocole sans laisser de données orphelines ?

« Une seule transaction Dexie supprime les notes, les timers, les sessions puis le protocole : tout ou rien. Les protocoles de démonstration sont dans le code, donc je les masque avec la table `deletedProtocols` et je peux les restaurer. »

### Avez-vous utilisé l'IA ?

« Oui, c'est déclaré dans le README : ChatGPT pour la base du projet, Claude pour la correction du timer, les notifications, la suppression de protocoles, la migration Tailwind, le chargement différé de pdf.js et l'aide à la documentation. Je relis, teste et sais expliquer chaque fichier. »

### Pourquoi le premier commit contient-il autant de fichiers ?

Le développement avait commencé localement avant l'initialisation de Git. Le premier commit a enregistré une base déjà existante. Par la suite, le suivi des versions est devenu plus régulier. Il faut pouvoir le montrer dans l'historique réel.

### Pourquoi deux semaines sans commit, puis une série de commits le 11 novembre ?

« J'ai continué à modifier le code en local sans enregistrer d'étapes, c'est un défaut de méthode. Le 11 novembre j'ai enregistré ce travail par sujets, après l'avoir testé, et je le dis dans `03`. Depuis, je commite après chaque fonction terminée. »

**À ne pas affirmer :** qu'un commit du 28 octobre prouve, à lui seul, qu'un fichier existait déjà le 20 octobre. Pour étayer cette période, s'appuyer sur le journal de bord et, si disponibles, les historiques locaux ou sauvegardes.

### Comment savez-vous que l'application fonctionne ?

En distinguant compilation, tests unitaires et essais fonctionnels. Un build réussi prouve que le projet compile ; il ne suffit pas à démontrer que toutes les interactions sont correctes. Les scénarios d'utilisation doivent être testés séparément.

### Que feriez-vous avec plus de temps ?

Améliorer la robustesse de l'extraction PDF, ajouter des tests sur plusieurs formats, proposer une sauvegarde/export local, optimiser les performances et envisager des minuteries multiples.

## 4. Questions difficiles : réponses crédibles

**« Votre parseur a déjà donné des résultats incorrects : pourquoi ? »**

« Les PDF ne fournissent pas toujours une structure logique exploitable. Les retours à la ligne, les colonnes et les numérotations peuvent perturber l'analyse. J'ai donc travaillé sur la détection des sections et sur un parcours de validation humaine. Je ne prétends pas que le système comprend tous les documents. »

**« Votre timer a affiché une erreur de stockage : est-ce corrigé ? »**

« Oui, corrigé le 11 novembre. En développement, React.StrictMode exécute les effets deux fois ; ma fonction `ensureTimer` lisait puis ajoutait le timer en deux étapes, donc deux appels simultanés essayaient d'ajouter la même clé et Dexie levait une erreur. Je fais maintenant la lecture et la création dans une seule transaction. J'ai écrit un test qui lance deux appels en même temps ; il échouait avant la correction. »

**« Pourquoi ne pas tout mettre dans un seul composant ? »**

« La séparation des composants, services et types facilite la lecture, la maintenance, les tests et les évolutions. »

**« Quel a été votre principal apprentissage ? »**

« Le développement ne consiste pas uniquement à écrire du code. Il faut structurer le projet, vérifier les hypothèses, corriger les erreurs, tester et documenter les décisions. »

## 5. Préparation de la démonstration

- [ ] Préparer une version stable et noter le hash Git correspondant.
- [ ] Lancer le build et les tests avant la présentation.
- [ ] Prévoir un protocole de démonstration non sensible.
- [ ] Vérifier l'ouverture du PDF source et la lisibilité des étapes.
- [ ] Tester le timer et les notifications dans une session réelle (permission du navigateur).
- [ ] Préparer une capture d'écran de secours pour chaque étape importante.
- [ ] Prévoir une explication claire du mode hors ligne.
- [ ] Garder le README, le cahier des fonctionnalités et les specs accessibles.
- [ ] Préparer une réponse transparente sur les limites.

## 6. Conclusion possible

« BenchFlow m'a permis de travailler à la fois sur la conception d'une interface, la structuration d'une application TypeScript, la persistance locale et la résolution de problèmes concrets. Le projet illustre aussi l'importance de définir un périmètre réaliste, de tester régulièrement et de conserver un historique compréhensible des décisions. »

## Expliquer la phase exploratoire et le rendu du 27 octobre

**Question possible :** « Pourquoi avoir réalisé autant de commits le 28 octobre alors que le projet avait déjà avancé ? »

**Réponse proposée :** « Du 20 au 28 octobre, j'ai développé et expérimenté plusieurs fonctionnalités localement. Ces essais m'ont aidée à évaluer leur faisabilité et à préciser le périmètre de la V1, notamment pour le document des fonctionnalités PWA à rendre le 27 octobre. Le 28 octobre, j'ai commencé à enregistrer le code existant dans Git, puis à structurer son suivi. C'est pourquoi les premiers commits contiennent déjà plusieurs fichiers. »

**Question possible :** « Les commits prouvent-ils que tout a été codé entre le 20 et le 28 octobre ? »

**Réponse proposée :** « Non. Git date les versions enregistrées, pas nécessairement la première rédaction des fichiers avant leur suivi. Mon journal de bord présente la période de développement ; les commits servent ensuite de preuves des versions enregistrées. »
