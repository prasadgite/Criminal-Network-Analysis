import type { Transaction } from "@/types";

export const mockTransactions: Transaction[] = [
  {
    transactionId: "TX-8001",
    timestamp: "2026-09-14T14:10:00+05:30",
    senderAccountId: "ACC-4001",
    receiverAccountId: "ACC-4002",
    amount: 125000,
    currency: "INR",
    transactionType: "transfer",
    channel: "online",
    locationId: "LOC-5001",
    referenceNumber: "REF-8001",
    status: "completed",
    description: "Account transfer",
    source: "MVP_SYNTHETIC",
  },

  {
    transactionId: "TX-8002",
    timestamp: "2026-09-16T16:30:00+05:30",
    senderAccountId: "ACC-4002",
    receiverAccountId: "ACC-4001",
    amount: 48000,
    currency: "INR",
    transactionType: "transfer",
    channel: "online",
    locationId: "LOC-5002",
    referenceNumber: "REF-8002",
    status: "completed",
    description: "Account transfer",
    source: "MVP_SYNTHETIC",
  },
];
