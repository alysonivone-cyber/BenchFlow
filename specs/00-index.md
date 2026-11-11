# BenchFlow — Index des spécifications complémentaires

**État documentaire : 11 novembre 2026**  
Ce dossier complète le README et le cahier des fonctionnalités **déjà rédigés**, sans les remplacer.

| Document | Contenu |
| --- | --- |
| `02-architecture-technique.md` | Architecture, données, composants et PWA |
| `03-historique-des-commits.md` | Chronologie du 20 octobre au 11 novembre, commits et méthode de traçabilité |
| `04-decisions-techniques.md` | Choix technologiques et compromis |
| `05-tests-et-validation.md` | Tests, anomalies et critères de validation |
| `06-limites-et-ameliorations.md` | Limites de la V1 et pistes V2 |
| `07-preparation-oral.md` | Argumentaire et questions de soutenance |
| `08-journal-de-bord.md` | Journal narratif daté et modèle pour les séances suivantes |

## Note de lecture — chronologie

Le développement exploratoire est documenté du **20 au 28 octobre 2026** ; les premiers commits Git datent du **28 octobre**. La date d'un commit est celle de l'enregistrement, pas de l'écriture du code. Le 11 novembre, le travail local de deux semaines et la séance de corrections ont été enregistrés en commits séparés par sujet, après coup : voir `03-historique-des-commits.md`, section 4 bis.

## Principes de cohérence

- Développement local initial : **20–28 octobre 2026**.
- Commits du 28 octobre : `ef00ee4`, `b0decdf`, `4fb1ae8`, `bb83d6a`, `40794ba`.
- Commits du 11 novembre : voir `03`, section 4 bis.
- Ne pas attribuer de hash fictif aux travaux qui n'ont pas de commit identifié.
- Distinguer **build réussi**, **test automatisé réussi** et **validation fonctionnelle**.
- Mettre à jour les specs à chaque fonction terminée, avec le hash du commit.

## Intégration dans VS Code

Copier le dossier `specs/` à la racine du projet, à côté du `README.md` et du code source. Conserver le cahier des fonctionnalités existant. Après les prochaines séances, actualiser ensemble l’historique et le journal de bord à partir des changements réellement effectués.
