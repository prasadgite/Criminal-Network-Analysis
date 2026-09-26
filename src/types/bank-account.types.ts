export type BankAccountStatus =
  | "active"
  | "closed"
  | "blocked"
  | "unknown";

export type AccountStatus = BankAccountStatus | "inactive";

export interface BankAccount {
  accountId: string;

  accountNumberMasked: string;

  bankName?: string;
  branchId?: string;

  accountType?: string;

  holderPersonId?: string;

  openingDate?: string;
  closingDate?: string;

  accountStatus?: BankAccountStatus;

  kycStatus?: string;

  city?: string;

  riskFlag?: string;

  source?: string;
}
