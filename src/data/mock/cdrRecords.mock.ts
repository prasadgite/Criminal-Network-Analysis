import type { CdrRecord } from "@/types";

export const mockCdrRecords: CdrRecord[] = [
  {
    cdrId: "CDR-7001",
    callerPhoneId: "PH-2001",
    receiverPhoneId: "PH-2002",
    timestamp: "2026-09-15T09:15:00+05:30",
    durationSeconds: 182,
    callType: "voice",
    callStatus: "completed",
    cellTowerId: "TOWER-6001",
    locationId: "LOC-5001",
    direction: "outgoing",
    sourceSystem: "MVP_SYNTHETIC",
  },

  {
    cdrId: "CDR-7002",
    callerPhoneId: "PH-2002",
    receiverPhoneId: "PH-2003",
    timestamp: "2026-09-15T11:42:00+05:30",
    durationSeconds: 94,
    callType: "voice",
    callStatus: "completed",
    cellTowerId: "TOWER-6002",
    locationId: "LOC-5002",
    direction: "outgoing",
    sourceSystem: "MVP_SYNTHETIC",
  },

  {
    cdrId: "CDR-7003",
    callerPhoneId: "PH-2003",
    receiverPhoneId: "PH-2001",
    timestamp: "2026-09-16T18:21:00+05:30",
    durationSeconds: 321,
    callType: "voice",
    callStatus: "completed",
    cellTowerId: "TOWER-6001",
    locationId: "LOC-5001",
    direction: "incoming",
    sourceSystem: "MVP_SYNTHETIC",
  },
];
