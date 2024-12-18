### Migrations

- Apply for new database

```
npm run migration:run
```

- Apply new change for database

```
npm run migration:generate ./src/migrations/__NAME__
npm run migration:run
```

- Revert migration

```
npm run migration:revert
```
