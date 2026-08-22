// Advanced salary engine — monthlyWage is the CTC base.
// Breakdown mirrors Indian payroll with basic/HRA/allowances + statutory deductions.
export const PF_RATE = 0.12;
export const PROF_TAX = 200;
export const GRATUITY_RATE = 0.0481; // 4.81% of basic (employer)

export interface SalaryBreakdown {
  wage: number;
  basic: number;
  hra: number;
  standard: number;
  conveyance: number;
  medical: number;
  perfBonus: number;
  lta: number;
  special: number;
  fixed: number;
  gross: number;
  // deductions - employee
  pfEmployee: number;
  profTax: number;
  incomeTax: number; // placeholder 0 until slab logic
  totalDeductionEmp: number;
  netPay: number;
  // employer cost
  pfEmployer: number;
  gratuity: number;
  ctcMonthly: number;
  ctcAnnual: number;
}

export function calcSalary(wage: number): { basic: number; hra: number; standard: number; perfBonus: number; lta: number; fixed: number; total: number } {
  const basic = wage * 0.5;
  const hra = basic * 0.5;
  const standard = 4167;
  const perfBonus = wage * 0.0833;
  const lta = wage * 0.0833;
  const fixed = Math.max(0, wage - (basic + hra + standard + perfBonus + lta));
  return { basic, hra, standard, perfBonus, lta, fixed, total: basic + hra + standard + perfBonus + lta + fixed };
}

export function calcAdvanced(wage: number): SalaryBreakdown {
  const s = calcSalary(wage);
  const conveyance = 1600;
  const medical = 1250;
  // adjust fixed to account for conveyance/medical if wage large enough, otherwise absorb
  // keep legacy fixed as residual after mandated items; conveyance/medical are informational splits of fixed
  const special = Math.max(0, s.fixed - conveyance - medical);
  const gross = wage; // gross = wage (CTC without employer extras)
  const pfEmployee = Math.round(s.basic * PF_RATE);
  const profTax = wage > 15000 ? PROF_TAX : 0;
  const incomeTax = 0; // TODO slab — keep 0 for now, shown as 0
  const totalDeductionEmp = pfEmployee + profTax + incomeTax;
  const netPay = Math.max(0, gross - totalDeductionEmp);
  const pfEmployer = pfEmployee;
  const gratuity = Math.round(s.basic * GRATUITY_RATE);
  const ctcMonthly = wage + pfEmployer + gratuity;
  const ctcAnnual = ctcMonthly * 12;
  return {
    wage,
    basic: s.basic,
    hra: s.hra,
    standard: s.standard,
    conveyance,
    medical,
    perfBonus: s.perfBonus,
    lta: s.lta,
    special,
    fixed: s.fixed,
    gross,
    pfEmployee,
    profTax,
    incomeTax,
    totalDeductionEmp,
    netPay,
    pfEmployer,
    gratuity,
    ctcMonthly,
    ctcAnnual,
  };
}

export function prorateForMonth(wage: number, presentDays: number, totalWorkingDays: number) {
  if (totalWorkingDays <= 0) return { payable: wage, lossOfPay: 0, perDay: wage };
  const perDay = wage / totalWorkingDays;
  const payable = Math.round(perDay * presentDays);
  const lossOfPay = Math.round(wage - payable);
  return { payable, lossOfPay, perDay };
}

export function workingDaysInMonth(year: number, month: number, daysPerWeek: number) {
  // month: 0-11, approximate working days excluding Sundays if 6 days, etc.
  // For simplicity: count weekdays Mon-Sat vs Mon-Fri based on daysPerWeek
  const d = new Date(year, month, 1);
  let count = 0;
  while (d.getMonth() === month) {
    const day = d.getDay(); // 0 Sun
    if (daysPerWeek >= 6) {
      if (day !== 0) count++; // Mon-Sat
    } else if (daysPerWeek === 5) {
      if (day >= 1 && day <= 5) count++; // Mon-Fri
    } else {
      // fallback: count all days except Sundays proportionally
      if (day !== 0) count++;
      else if (daysPerWeek === 7) count++;
    }
    d.setDate(d.getDate() + 1);
  }
  return count;
}
