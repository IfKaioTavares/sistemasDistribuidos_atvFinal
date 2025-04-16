export class LamportClock {
  private static instance: LamportClock;
  private timestamp: number;

  private constructor() {
    this.timestamp = 0;
  }

  public static getInstance(): LamportClock {
    if (!LamportClock.instance) {
      LamportClock.instance = new LamportClock();
    }
    return LamportClock.instance;
  }

  public tick(): number {
    return ++this.timestamp;
  }

  public update(receivedTimestamp: number): number {
    this.timestamp = Math.max(this.timestamp, receivedTimestamp) + 1;
    return this.timestamp;
  }

  public getTime(): number {
    return this.timestamp;
  }
}
