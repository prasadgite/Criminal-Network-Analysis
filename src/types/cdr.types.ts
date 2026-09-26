export interface CdrRecord {
  cdrId: string;

  callerPhoneId: string;
  receiverPhoneId: string;

  timestamp: string;

  durationSeconds?: number;

  callType?: string;
  callStatus?: string;

  cellTowerId?: string;
  locationId?: string;

  direction?: string;

  sourceSystem?: string;
}
