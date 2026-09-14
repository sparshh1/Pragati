// Simple class merge utility (no tailwind-merge needed for this project)
export function cn(...inputs: string[]) {
  return inputs.filter(Boolean).join(' ');
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-IN').format(n);
}

export function formatCurrency(n: number): string {
  return '₹' + new Intl.NumberFormat('en-IN').format(n);
}

export function formatPercent(n: number): string {
  const sign = n >= 0 ? '+' : '';
  return `${sign}${n}%`;
}

export function formatMonth(monthStr: string): string {
  const [year, month] = monthStr.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[parseInt(month) - 1]} '${year.slice(2)}`;
}
