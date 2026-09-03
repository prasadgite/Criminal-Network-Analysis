# Data Contract Compatibility

## Major version

Increment when a change breaks an existing downstream consumer.

Examples:

- removing a column
- renaming a column
- changing identifier semantics
- changing a nullable field to non-nullable
- changing relationship semantics

## Minor version

Increment for backward-compatible changes.

Examples:

- adding optional columns
- adding documentation
- adding non-breaking metadata

## Patch

Patch-level changes are allowed for:

- documentation corrections
- clarifications
- non-semantic metadata changes
