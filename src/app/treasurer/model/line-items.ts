/**
 * Download URL
 https://membership.islandbarn.org.uk/accounts/account_line_summary.json?financial_year=2023-2024&account_to_show=1&opening_balance=undefined&deferred=
https://membership.islandbarn.org.uk/accounts/account_line_summary.json?financial_year=2023%20-%202024
 */

import { isAfter, isBefore, isWithinInterval, parse } from 'date-fns';
import { Account, BASE_URL,  FinancialYear } from './odin';

export interface AccountLineItem {
   ibrsc_account_line: string;
   account: string;
   amount: number;
   cbId: string;
   date: Date;
   subcategory: string;
   memo: string;
   adjustment: null;
   filing_ref: string;
   to_from: string;
   notes: string;
}

interface RawAccountLine {
   ibrsc_account_line: string;
   account: string;
   amount: string;
   cbId: string;
   date: string;
   subcategory: string;
   memo: string;
   adjustment: null;
   filing_ref: string;
   to_from: string;
   notes: string;
}

export interface LineItemParams {
   financial_year: FinancialYear;
   account_to_show: Account;
   opening_balance?: boolean;
}

export function lineItemURL(params: LineItemParams ): string {
   return`${BASE_URL}?financial_year=${params.financial_year}&account_to_show=${params.account_to_show.id}`;
}

export function processRaw(text: string| null, year: FinancialYear): AccountLineItem[] {
   if (!text) {
      return <AccountLineItem[]>[];
   } else {
      
      const raw = JSON.parse(text) as RawAccountLine[];
      const parsed = raw.map<AccountLineItem>(r => ({
        ...r,
        amount: Number.parseFloat(r.amount),
        date: parse(r.date, 'dd/MM/yyyy', new Date()) // "12/09/2024"
      }));

      // Filter out the 'extra day' that is present in the 
      const {start, end} = getFinancialYearDates(year);

      const filtered = parsed.filter(item => isWithinInterval(item.date, {start, end}));

      return filtered.sort((a, b) => Number.parseInt(a.cbId) - Number.parseInt(b.cbId))
    }
}

export interface FinancialYearDates {
  start: Date;
  end: Date;
}

/**
 * Returns the start and end dates for a given financial year.
 * A financial year like '2023-2024' starts on 1st Oct 2023 and ends on 30th Sep 2024.
 * @param fy The financial year string (e.g., '2023-2024').
 * @returns An object containing the start and end dates.
 */
export function getFinancialYearDates(fy: FinancialYear): FinancialYearDates {
  const startYear = parseInt(fy.substring(0, 4), 10);
  const start = new Date(startYear, 9, 1); // Month is 0-indexed, so 9 is October.
  const end = new Date(startYear + 1, 8, 30); // 8 is September.
  return { start, end };
}
