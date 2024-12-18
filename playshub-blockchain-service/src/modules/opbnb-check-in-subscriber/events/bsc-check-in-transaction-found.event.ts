export class BscCheckInTransactionFoundEvent {
  constructor(
    public readonly sender: `0x${string}`,
    public readonly timestamp: number,
    public readonly token: `0x${string}`,
    public readonly count: number,
  ) {}
}
