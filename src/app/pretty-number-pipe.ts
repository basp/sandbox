import { Pipe, PipeTransform } from '@angular/core';
import Decimal from 'break_infinity.js'

const suffixes = [
  {
    size: new Decimal(1e3),
    unit: 'K'
  },
  {
    size: new Decimal(1e6),
    unit: 'M'
  },
  {
    size: new Decimal(1e9),
    unit: 'B'
  },
  {
    size: new Decimal(1e12),
    unit: 'T'
  },
  {
    size: new Decimal(1e15),
    unit: 'Qa'
  },
  {
    size: new Decimal(1e18),
    unit: 'Qt'
  },
  {
    size: new Decimal(1e21),
    unit: 'Sx'
  },
  {
    size: new Decimal(1e24),
    unit: 'Sp'
  },
  {
    size: new Decimal(1e27),
    unit: 'Oc'
  },
  {
    size: new Decimal(1e30),
    unit: 'No'
  }
];

const lastSuffixSize = suffixes[suffixes.length - 1].size;
function hasKnownSuffix(value: Decimal): boolean {
  return value.lessThanOrEqualTo(lastSuffixSize);
}

function shorten(value: Decimal): [Decimal, string ] {
  let suffix: { size: Decimal, unit: string };
  for(let s of suffixes) {
    if(value.greaterThanOrEqualTo(s.size)) {
      suffix = s;
    }
  }

  let val = value.div(suffix.size);
  return [val, suffix.unit];
}

function formatBignumber(value: Decimal): string {
  let mantissa = value.mantissa;
  let exponent = value.exponent;
  if (mantissa >= 10) {
    exponent += 1;
    mantissa /= 10;
  }
  return `${mantissa.toFixed(1)}e${exponent}`;
}

@Pipe({ name: 'formatNumber'})
export class FormatNumberPipe implements PipeTransform {
  transform(value: Decimal) {
    if (value.lessThan(1e4)) {
      return value.toFixed(0);
    }
  
    if (!hasKnownSuffix(value)) {
      return formatBignumber(value);
    }
  
    let [val, suffix] = shorten(value);
    return `${val.toFixed(1)} ${suffix}`;
  }
}

@Pipe({ name: 'formatProduction'})
export class FormatProductionPipe implements PipeTransform {
  transform(value: Decimal) {
    if (value.lessThan(1e4)) {
      return value.toFixed(1);
    }
  
    if (!hasKnownSuffix(value)) {
      return formatBignumber(value);
    }
  
    let [val, suffix] = shorten(value);
    return `${val.toFixed(1)} ${suffix}`;
  }
}

@Pipe({ name: 'formatCost' })
export class FormatCostPipe implements PipeTransform {
  transform(value: Decimal) {
    if (value.lessThan(1e4)) {
      return value.toString();
    }
  
    if (!hasKnownSuffix(value)) {
      return `${value.mantissa}e${value.exponent}`;
    }
  
    let [val, suffix] = shorten(value);
    return `${val.toFixed(0)} ${suffix}`;
  }
}