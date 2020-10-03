import { Component } from '@angular/core';
import Decimal from 'break_infinity.js';

class Dimension {
  public number = new Decimal(0);
  public numberBought = 0;

  constructor(
    public tier: number,
    public name: string,
    public baseCost: Decimal,
    public costMultiplier: Decimal,
    public baseProduction: Decimal) { }

  buy(state: State): void {
    state.energy = state.energy.sub(this.cost());
    this.number = this.number.add(1);
    this.numberBought += 1;
  }

  buyTo10(state: State): void {
    let num = 10 - (this.numberBought % 10);
    for (let i = 0; i < num; i++) {
      this.buy(state);
    }
  }

  power(): number {
    return Math.floor(this.numberBought / 10);
  }

  purchased(): number {
    return Math.floor(this.numberBought % 10);
  }

  cost(): Decimal {
    return this.baseCost.mul(
      this.costMultiplier.pow(this.power()));
  }

  costTo10(): Decimal {
    let num = 10 - (this.numberBought % 10);
    return this.cost().mul(num);
  }

  production(): Decimal {
    return this.baseProduction.mul(
      new Decimal(2).pow(this.power()));
  }

  isBuyEnabled(state: State): boolean {
    return state.energy.greaterThanOrEqualTo(this.cost());
  }

  isBuyTo10Enabled(state: State): boolean {
    return state.energy.greaterThanOrEqualTo(this.costTo10());
  }

  isVisible(state: State): boolean {
    if (this.tier < 1) {
      return true;
    }

    return state.dimensions[this.tier - 1].number.greaterThan(0);
  }
}

class State {
  public lastUpdate: number;
  public energy = new Decimal(10);
  public output = new Decimal(0);
  public interval = new Decimal(1000);
  public dimensions = [
    new Dimension(
      0,
      'Generator',
      new Decimal(1e1),
      new Decimal(1e3),
      new Decimal(1)),
    new Dimension(
      1,
      'Booster',
      new Decimal(1e2),
      new Decimal(1e4),
      new Decimal(1)),
    new Dimension(
      2,
      'Hyper Booster',
      new Decimal(1e3),
      new Decimal(1e5),
      new Decimal(1)),
    new Dimension(
      3,
      'Enhanced Sensors',
      new Decimal(1e5),
      new Decimal(1e7),
      new Decimal(1)),
    new Dimension(
      4,
      '6DoF Stabilizers',
      new Decimal(1e8),
      new Decimal(1e9),
      new Decimal(1)),
    new Dimension(
      5,
      'Deep Learning',
      new Decimal(1e13),
      new Decimal(1e12),
      new Decimal(1)),
    new Dimension(
      6,
      'Nano Servos',
      new Decimal(1e19),
      new Decimal(1e14),
      new Decimal(1)),
    new Dimension(
      7,
      'Gravity Shift',
      new Decimal(1e25),
      new Decimal(1e18),
      new Decimal(1)),
  ];
}

const refspeed = 1000;
const tickspeed = 1000;
const rate = 10;
const interval = 1000 / rate;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Sandbox';
  state = new State();

  core(): Dimension {
    return this.state.dimensions[0];
  }

  meta(): Dimension[] {
    return this.state.dimensions.slice(1);
  }

  dimensions(): Dimension[] {
    let state = this.state;
    return this.state.dimensions.filter(function (x) {
      return x.isVisible(state);
    });
  }

  warp(): number {
    return refspeed / tickspeed;
  }

  max(): void {
    for (let dim of this.dimensions()) {
      if (this.state.energy.greaterThanOrEqualTo(dim.costTo10())) {
        dim.buyTo10(this.state);
      }
    }
  }

  isMaxEnabled(): boolean {
    let state = this.state;
    let dims = this.dimensions();
    return dims.some(function (x) {
      return x.isBuyTo10Enabled(state);
    });
  }

  constructor() {
    this.state.lastUpdate = performance.now();
    setInterval(() => {
      const thisUpdate = performance.now();
      this.update(thisUpdate - this.state.lastUpdate);
      this.state.lastUpdate = thisUpdate;
    }, interval);
  }

  update(dt: number) {
    // The value of `dt` should be around 1000 / rate. 
    // With rate of 20 this boils down to 50 millisecods.
    // However, it might be a bit shorter or longer.

    // First we need to find out if we under- or overshot our
    // intended interval. We expect this method to be called
    // every `interval` of time (which is a number in milliseconds)
    // so we need to see how much of the interval we have (especially
    // when we are lagging).

    // If we are running exactly on schedule then `r` should be 1.0.
    // If we are lagging then `r` will be greater than 1.0.
    // If we are running too fast (usually only happens due to tiny
    // browser scheduling variations) then `r` will be less than 1.0.
    let r = dt / interval;
    r = r < 1.0 ? 1.0 : r;

    // Now we just need to compensate this with either a higher
    // or lower tickspeed. The `tickspeed` value starts of at 1000
    // but can be dynamically adjusted. The `refspeed` value never
    // changes but it should probably be equal to the `tickspeed`
    // starting value for normal purposes.

    // First we convert our scaled unit value `r` into "speed" domain.
    // If we are running exactly on time then `r` should be very close
    // to 1.0 and to normalize it we want it to be around a 1000.
    let s = r * refspeed;

    // Now we scale `s` with our actual tickspeed. If the tickspeed
    // is lower than a 1000 then time should be progressing faster
    // scorewise even though we're not actually decreasing `interval`.
    // If tickspeed is 1000 and we are running on time then this should
    // return back into a scale unit of around 1.0.
    s = s / tickspeed;

    // Now we can finally scale our production with time and tickspeed.
    let gen = this.core();
    let grossEnergy = gen.number.mul(gen.production());
    this.state.energy = this.state.energy.add(grossEnergy);
    this.state.output = grossEnergy.mul(rate).floor();

    let gens = this.meta();
    for (let g of gens) {
      let x = g.number.mul(g.production()).mul(s);
      let downstream = this.state.dimensions[g.tier - 1];
      downstream.number = downstream.number.add(x);
    }
  }
}
