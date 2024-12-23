# Playshub Blockchain Service

`Playshub Blockchain Service` handle payment processor on BSC and notification for other service payment status.

# Feature

- Handle BSC payment for Playshub shop
- Send proceed payment events via webhooks

# Technique

- Nestjs: Index work and parse BSC transaction and express api server
- Socket.io: Push payment transaction to game server
- viem: a JavaScript library that provides tools for interacting with the BSC blockchain

# How to run

## Running locally

- Install package dependencies

```shell
pnpm install
```

- Prepare environment variables

```shell
cp .env.example .env
```

- Start

```shell
- dev: pnpm run start:dev
- prod: pnpm run build & pnpm run start
```

# Project Structure

```
playshub-blockchain/
├── src/
│   ├── modules/
│   │   ├── check-in
│   │   ├── evm-ws-providers
│   │   ├── notification
│   │   ├── purchase-item
│   │   └── telegram-bot
│   ├── types
│   ├── utils
│   ├── app.module.ts
│   └── main.ts
├── .gitignore
├── package.json
└── README.md
```

- `src/`: Contains the source code, including components and styles.
- `modules/check-in`: Handles user check-ins with multi-currency support, including BNB.
- `modules/evm-ws-providers`: WebSocket providers for EVM-based blockchain interactions.
- `modules/notification`: Sends notifications via WebSocket or webhook for service listeners.
- `modules/purchase-item`: Manages item purchases on Playshub using smart contracts.
- `modules/telegram-bot`: Integrates Telegram bot for notifications and user interactions.
- `types/`: Contains type definitions and interfaces for strong typing and consistency.
- `utils/`: Contains utility functions, classes, and helpers used across the project.
- `app.module.ts`: Main application module for organizing and managing modules.
- `main.ts`: Entry point for the blockchain application.
- `.gitignore`: Specifies files and directories to be ignored by Git.
- `package.json`: Project metadata, dependencies, and scripts for managing the application.
- `README.md`: Documentation for setup, usage, and development guidelines.

# Authors and acknowledgment

Playshub Team

# License

This project is licensed under the MIT License. See the LICENSE file for details.

# Project status

We are still developing this project following the roadmap in here: https://playshub.io/
