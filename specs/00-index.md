# BenchFlow — Index des spécifications complémentaires

**État documentaire : 25 novembre 2026**  
Ce dossier complète le README et le cahier des fonctionnalités **déjà rédigés**, sans les remplacer.

| Document | Contenu |
| --- | --- |
| `02-architecture-technique.md` | Architecture, données, composants et PWA |
| `03-historique-des-commits.md` | Chronologie du 20 octobre au 25 novembre, commits et méthode de traçabilité |
| `04-decisions-techniques.md` | Choix technologiques et compromis (DT-01 à DT-26) |
| `05-tests-et-validation.md` | Tests, anomalies et critères de validation |
| `06-limites-et-ameliorations.md` | Limites de la V1 et pistes V2 |
| `07-preparation-oral.md` | Argumentaire et questions de soutenance |
| `08-journal-de-bord.md` | Journal narratif daté et modèle pour les séances suivantes |

## Note de lecture — chronologie

Le développement exploratoire est documenté du **20 au 28 octobre 2026** ; les deux commits du **25 octobre** ont été créés sur GitHub (interface web) et les premiers commits locaux datent du **28 octobre**. La date d'un commit est celle de l'enregistrement, pas de l'écriture du code. Le 11 novembre, le travail local de deux semaines et la séance de corrections ont été enregistrés en commits séparés par sujet, après coup (dix commits), puis neuf commits ont suivi fonction par fonction l'après-midi (19 au total) : voir `03-historique-des-commits.md`, section 4 bis.

**Numérotation.** Les documents de ce dossier commencent à `02` : le numéro `01` correspond au cahier des fonctionnalités (`CAHIER_DES_FONCTIONNALITES.md`, à la racine du projet), rédigé avant ces spécifications et conservé à part.

## Principes de cohérence

- Développement local initial : **20–28 octobre 2026**.
- Commits du 25 octobre (créés sur GitHub) : `8c5779f`, `f1ef1cf`.
- Commits du 28 octobre : `ef00ee4`, `b0decdf`, `4fb1ae8`, `bb83d6a`, `40794ba`.
- Commits du 11 novembre : voir `03`, section 4 bis.
- Commits des 17, 18, 22, 24 et 25 novembre : voir `03`, sections 4 ter, 4 quater, 4 quinquies, 4 sexies et 4 septies.
- Ne pas attribuer de hash fictif aux travaux qui n'ont pas de commit identifié.
- Distinguer **build réussi**, **test automatisé réussi** et **validation fonctionnelle**.
- Mettre à jour les specs à chaque fonction terminée, avec le hash du commit.

## Intégration dans VS Code

Le dossier `specs/` se trouve à la racine du projet, à côté du `README.md` et du code source. Le cahier des fonctionnalités existant est conservé tel quel. Après les prochaines séances, actualiser ensemble l’historique et le journal de bord à partir des changements réellement effectués.
