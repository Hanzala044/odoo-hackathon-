export function companyInitials(companyName: string): string {
  const words = companyName.trim().split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return words.map((w) => w[0].toUpperCase()).join("");
}

function namePart(name: string): string {
  const clean = name.trim().replace(/[^a-zA-Z]/g, "");
  return (clean.slice(0, 2) || "XX").toUpperCase().padEnd(2, "X");
}

export function buildLoginId(companyName: string, firstName: string, lastName: string, year: number, serial: number): string {
  return `${companyInitials(companyName)}${namePart(firstName)}${namePart(lastName)}${year}${String(serial).padStart(4, "0")}`;
}

export function generatePassword(length = 10): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#$%";
  let pwd = "";
  for (let i = 0; i < length; i++) pwd += chars[Math.floor(Math.random() * chars.length)];
  return pwd;
}
