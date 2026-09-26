export interface Transaction {
  transactionId: string;

  timestamp: string;

  senderAccountId: string;
  receiverAccountId: string;

  amount: number;
  currency?: string;

  transactionType?: string;
  channel?: string;

  merchantId?: string;

  locationId?: string;

  referenceNumber?: string;

  status?: string;

  description?: string;

  source?: string;
}
