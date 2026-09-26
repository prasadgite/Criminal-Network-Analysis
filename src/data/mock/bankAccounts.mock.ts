import type { BankAccount } from "@/types";

export const mockBankAccounts: BankAccount[] = [
  {
    accountId: "ACC-4001",
    accountNumberMasked: "XXXXXX1001",
    bankName: "Example Bank",
    branchId: "BR-PN-001",
    accountType: "savings",
    holderPersonId: "P-1001",
    openingDate: "2021-04-12",
    accountStatus: "active",
    kycStatus: "verified",
    city: "Pune",
    riskFlag: "normal",
    source: "MVP_SYNTHETIC",
  },

  {
    accountId: "ACC-4002",
    accountNumberMasked: "XXXXXX1002",
    bankName: "Example Bank",
    branchId: "BR-PN-002",
    accountType: "current",
    holderPersonId: "P-1002",
    openingDate: "2020-08-17",
    accountStatus: "active",
    kycStatus: "verified",
    city: "Pune",
    riskFlag: "review",
    source: "MVP_SYNTHETIC",
  },
];
