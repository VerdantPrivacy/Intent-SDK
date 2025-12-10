# @verdant/intent-sdk

[![npm version](https://img.shields.io/npm/v/@verdant/intent-sdk.svg)](https://www.npmjs.com/package/@verdant/intent-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![CI](https://github.com/verdant-privacy/verdant-protocol/actions/workflows/ci.yml/badge.svg)](https://github.com/verdant-privacy/verdant-protocol/actions/workflows/ci.yml)

Official TypeScript SDK for the **Verdant Privacy Protocol** — enabling intent-based private transactions through deterministic identity sharding on Solana.

## Features

- **Intent-Based Transactions**: Declare what you want to do, not how to do it
- **Identity Sharding**: Fragment transaction origins across multiple ephemeral addresses
- **Execution Planning**: Preview and customize transaction splitting strategies
- **Privacy Scoring**: Real-time privacy metrics for personas and transactions
- **Event Subscriptions**: React to intent updates and shard rotations
- **TypeScript First**: Fully typed API with comprehensive type exports
- **Simulation Mode**: Test locally without blockchain connectivity

## Installation

```bash
npm install @verdant/intent-sdk
```

```bash
yarn add @verdant/intent-sdk
```

```bash
pnpm add @verdant/intent-sdk
```

## Quick Start

```typescript
import { VerdantIntentClient } from '@verdant/intent-sdk';

// Initialize the client
const client = new VerdantIntentClient({
  baseUrl: 'https://api.verdant.privacy',
  apiKey: process.env.VERDANT_API_KEY,
});

// Create a persona (identity container)
const persona = await client.createPersona({
  name: 'Trading Persona',
  type: 'trader',
});

// Generate identity shards
const shards = await client.createShards(persona.id, 5);

// Create a private transfer intent
const intent = await client.createIntent({
  personaId: persona.id,
  to: 'recipient-solana-address',
  amount: 1.5,
  mode: 'devnet',
  privacy: 'maximum',
  options: {
    splits: 4,
    delayMin: 10,
    delayMax: 60,
    decoys: true,
  },
});

// Execute the intent
const result = await client.executeIntent(intent.id);
console.log(`Executed through ${result.confirmedCount} transactions`);
```

## API Reference

### VerdantIntentClient

The main SDK client for interacting with Verdant Privacy.

#### Constructor

```typescript
new VerdantIntentClient(options: ClientOptions)
```

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `baseUrl` | `string` | Yes | - | Base URL of the Verdant API |
| `apiKey` | `string` | No | - | API key for authentication |
| `timeout` | `number` | No | `30000` | Request timeout in milliseconds |
| `debug` | `boolean` | No | `false` | Enable debug logging |

#### Authentication

```typescript
// Set API token
client.setAuthToken(token: string): void

// Clear API token
client.clearAuthToken(): void
```

#### Persona Methods

```typescript
// Create a new persona
client.createPersona(params: CreatePersonaParams): Promise<Persona>

// List all personas
client.listPersonas(): Promise<Persona[]>

// Get a specific persona
client.getPersona(personaId: string): Promise<Persona>
```

**CreatePersonaParams:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | Yes | Display name (1-50 chars) |
| `type` | `PersonaType` | No | `'basic'` \| `'private'` \| `'trader'` \| `'automated'` |
| `shardCount` | `number` | No | Initial shards to create (1-20) |
| `metadata` | `Record<string, unknown>` | No | Custom metadata |

#### Shard Methods

```typescript
// Create shards for a persona
client.createShards(personaId: string, count?: number): Promise<Shard[]>

// List shards (optionally filtered by persona)
client.listShards(personaId?: string): Promise<Shard[]>
```

#### Intent Methods

```typescript
// Create a new intent
client.createIntent(params: CreateIntentParams): Promise<Intent>

// Preview execution plan (without creating intent)
client.previewIntent(params: CreateIntentParams): Promise<ExecutionPlan>

// Preview execution plan for existing intent
client.previewIntent(intentId: string): Promise<ExecutionPlan>

// Execute an intent
client.executeIntent(intentId: string): Promise<ExecutionResult>

// Get intent status
client.getIntentStatus(intentId: string): Promise<IntentStatus>

// Cancel an intent
client.cancelIntent(intentId: string): Promise<boolean>
```

**CreateIntentParams:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `personaId` | `string` | Yes | Source persona ID |
| `to` | `string` | Yes | Recipient address (Base58) |
| `amount` | `string \| number` | Yes | Amount to transfer |
| `mode` | `IntentMode` | Yes | `'simulated'` \| `'devnet'` \| `'mainnet'` |
| `fromShardId` | `string` | No | Specific source shard |
| `token` | `string` | No | Token mint address (default: SOL) |
| `privacy` | `PrivacyLevel` | No | `'standard'` \| `'enhanced'` \| `'maximum'` |
| `options` | `IntentOptions` | No | Advanced options |

**IntentOptions:**
| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `splits` | `number` | `3` | Transaction splits (1-10) |
| `delayMin` | `number` | `5` | Min delay between splits (seconds) |
| `delayMax` | `number` | `30` | Max delay between splits (seconds) |
| `noisePct` | `number` | `5` | Amount obfuscation (0-20%) |
| `decoys` | `boolean` | `false` | Generate decoy transactions |
| `priorityFee` | `number` | - | Priority fee in lamports |
| `memo` | `string` | - | Custom memo |

#### Logs & Events

```typescript
// Get activity logs
client.getLogs(filter?: LogFilter): Promise<LogEntry[]>

// Subscribe to events
client.on(event: EventType, handler: (payload) => void): Unsubscribe

// Disconnect and cleanup
client.disconnect(): void
```

**Event Types:**
- `'intent:update'` - Intent status changed
- `'log:new'` - New activity log entry
- `'shard:rotate'` - Shard rotation occurred
- `'persona:update'` - Persona updated

### Types

All types are exported for TypeScript users:

```typescript
import type {
  Persona,
  Shard,
  Intent,
  ExecutionPlan,
  ExecutionResult,
  SubTransaction,
  DecoyTransaction,
  LogEntry,
  // ... and more
} from '@verdant/intent-sdk';
```

### Errors

The SDK provides typed error classes:

```typescript
import {
  VerdantError,
  NetworkError,
  TimeoutError,
  AuthenticationError,
  RateLimitError,
  ErrorCode,
} from '@verdant/intent-sdk';

try {
  await client.createIntent(params);
} catch (error) {
  if (error instanceof VerdantError) {
    console.log(error.code); // ErrorCode enum
    console.log(error.meta); // Additional context
    console.log(error.isRetryable); // Whether to retry
  }
}
```

### Utilities

```typescript
import {
  isValidSolanaAddress,
  isValidAmount,
  normalizeAmount,
  generateBase58Address,
  selectOptimalShards,
  generateExecutionPlan,
} from '@verdant/intent-sdk';
```

## Simulation Mode

For local development, the SDK automatically enters simulation mode when the base URL contains `localhost`, `127.0.0.1`, or `simulated`:

```typescript
const client = new VerdantIntentClient({
  baseUrl: 'http://localhost:3000/api',
});

// All operations return simulated data
const persona = await client.createPersona({ name: 'Test' });
```

## Examples

### Node.js

See [`examples/node-example.ts`](./examples/node-example.ts) for a complete workflow.

```bash
npx ts-node examples/node-example.ts
```

### Browser

Open [`examples/browser-example.html`](./examples/browser-example.html) in your browser.

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint
npm run lint

# Format
npm run format

# Type check
npm run typecheck
```

## Security Considerations

- **Never pass private keys** to the SDK — it's designed to work with references only
- Store API keys securely using environment variables
- Use `devnet` mode for testing before `mainnet`
- Review execution plans before executing intents

## Versioning

This SDK follows [Semantic Versioning](https://semver.org/). See [CHANGELOG.md](./CHANGELOG.md) for release history.

## License

MIT License — see [LICENSE](../LICENSE) for details.

## Links

- [Verdant Privacy Website](https://verdant.privacy)
- [Documentation](https://docs.verdant.privacy)
- [API Reference](https://docs.verdant.privacy/api)
- [Discord](https://discord.gg/verdant)
- [Twitter](https://twitter.com/VerdantPrivacy)
