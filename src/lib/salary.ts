// Salary components auto-calculated from monthlyWage. Percentages per Important wireframe.
export function calcSalary(wage: number) {
  const basic = wage * 0.5;
  const hra = basic * 0.5;
  const standard = 4167;
  const perfBonus = wage * 0.0833;
  const lta = wage * 0.0833;
  const fixed = Math.max(0, wage - (basic + hra + standard + perfBonus + lta));
  return { basic, hra, standard, perfBonus, lta, fixed, total: basic + hra + standard + perfBonus + lta + fixed };
}
export const PF_RATE = 0.12;
export const PROF_TAX = 200;
