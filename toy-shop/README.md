# В’язані іграшки

Навчальний магазин на React, Vite та Express. Backend зберігає користувачів і
замовлення в пам’яті; після перезапуску сервера ці дані очищуються.

## Запуск

У папці `toy-shop` встановіть залежності та запустіть frontend і backend у
двох терміналах:

```sh
npm install
npm run server
npm run dev
```

Frontend передає запити `/api` локальному backend на порту `3000`.

## Маршрути й API

- Сторінки: `/`, `/catalog`, `/product/:id`, `/cart`, `/login`,
  `/registration`, `/checkout`.
- Товари: `GET /api/products`, `GET /api/products/:id`.
- Користувачі: `POST /api/auth/register`, `POST /api/auth/login`.
- Замовлення: `POST /api/orders`, `GET /api/orders` (потрібен Bearer-токен).

Паролі в демонстраційному backend хешуються; сесії та інші дані зберігаються
лише в оперативній пам’яті.

## Перевірки

```sh
npm run lint
npm run format
npm run format:write
npm run build
npm run test:component
npm run test:e2e
npm run test
```

`npm run test` послідовно виконує component та E2E тести. E2E-скрипт самостійно
запускає і зупиняє Vite. `format` перевіряє форматування, а `format:write`
застосовує його.

Husky hook у `.husky/pre-commit` запускає ESLint і перевірку Prettier. Оскільки
`toy-shop` є підпапкою наявного Git-репозиторію, `prepare` не змінює Git
конфігурацію поза цією папкою й повідомляє, що hook автоматично не активовано.
