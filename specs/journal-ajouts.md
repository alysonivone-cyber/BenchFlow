## 11 novembre 2026 (après-midi) — Correctif des pages « introuvable » (DT-16)

- **Travail effectué :** les pages d'un protocole ou d'une session dont l'identifiant n'existe pas restaient bloquées sur « Loading… ». Les requêtes renvoient désormais `null` pour « introuvable », `undefined` restant réservé au chargement.
- **Fichiers concernés :** `ProtocolDetail.tsx`, `SessionPages.tsx`, `protocolService.test.ts` (un test ajouté).
- **Tests exécutés et résultats :** à compléter avec le nombre réel de tests ; essai dans le navigateur des pages `/protocols/inconnu` et `/sessions/inconnu`, puis d'un vrai protocole et d'une vraie session.
- **Commit Git :** à compléter (hash et date).

## 11 novembre 2026 (après-midi) — Titre lisible pour l'onglet du PDF (DT-17)

- **Travail effectué :** en ouvrant un PDF depuis la bibliothèque, l'onglet portait un identifiant technique. J'ai d'abord écrit un titre dans une copie du PDF (`pdf-lib`) : les tests passaient, mais l'essai dans Edge a montré que cela ne changeait rien. J'ai abandonné cette piste sans la commiter et ouvert à la place une page intermédiaire contenant le PDF, avec repli direct sur téléphone.
- **Résultat dans Edge :** le PDF s'affiche dans la page et l'identifiant technique a disparu, mais l'onglet reprend le titre interne du PDF au lieu de `date-heure · titre` : le lecteur d'Edge remplace le titre de ma page. J'ai gardé l'amélioration en notant la limite dans DT-17.
- **Ce que j'ai appris :** un test unitaire vert ne prouve pas que la fonctionnalité marche dans le vrai navigateur ; il faut l'essayer là où elle sera utilisée.
- **Fichiers concernés :** `pdfTitle.ts` (nouveau), `protocolService.ts`.
- **Commit Git :** `4fdd999` (code), `4e96da6` (specs).
- **Prochaine étape :** retirer les `console.log` de `database.ts`.

