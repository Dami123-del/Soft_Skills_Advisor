/* ==========================================================================
   TIMER MODULE
   A small countdown timer class used by the quiz engine. Kept independent
   of any DOM so it can be unit-tested or reused (e.g. for the audio question
   progress bar) without duplicating interval-management logic.
   ========================================================================== */
class CountdownTimer {
  /**
   * @param {number} seconds        total seconds to count down from
   * @param {(remaining:number)=>void} onTick     called every second
   * @param {()=>void} onExpire     called once when the timer hits 0
   */
  constructor(seconds, onTick, onExpire) {
    this.total = seconds;
    this.remaining = seconds;
    this.onTick = onTick;
    this.onExpire = onExpire;
    this.intervalId = null;
    this.running = false;
  }

  start() {
    // Guard against double-starts stacking multiple intervals.
    if (this.running) return;
    this.running = true;
    this.onTick(this.remaining);

    this.intervalId = setInterval(() => {
      this.remaining -= 1;
      this.onTick(this.remaining);

      if (this.remaining <= 0) {
        this.stop();
        this.onExpire();
      }
    }, 1000);
  }

  stop() {
    clearInterval(this.intervalId);
    this.intervalId = null;
    this.running = false;
  }

  /** Seconds actually used so far — used to compute the speed bonus. */
  elapsed() {
    return this.total - Math.max(this.remaining, 0);
  }
}
