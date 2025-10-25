/**
 * Download URL
 https://membership.islandbarn.org.uk/accounts/account_line_summary.json?financial_year=2023-2024&account_to_show=1&opening_balance=undefined&deferred=
https://membership.islandbarn.org.uk/accounts/account_line_summary.json?financial_year=2023%20-%202024
 */

export const BASE_URL = 'https://membership.islandbarn.org.uk/accounts/account_line_summary.json';

export type FinancialYear = '2024-2025' | '2023-2024' | '2022-2023';
export const FINANCIAL_YEARS: FinancialYear[] = [
   '2024-2025',
   '2023-2024',
   '2022-2023',
];



export interface Account {
   id: string;
   name: string;
}

export const accounts: Account[] = [
   { id: 'All', name: 'All' },
   { id: '1', name: 'Current' }
];
