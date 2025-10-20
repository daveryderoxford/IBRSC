/**
 * Download URL
 * https://membership.islandbarn.org.uk/accounts/account_line_summary.json?financial_year=2023-2024&account_to_show=1&opening_balance=undefined&deferred=
 Example response
*/

import { HttpParams } from '@angular/common/http';
import { httpResource } from '@angular/common/http/primitives';
import { Injectable, Resource, Signal } from '@angular/core';

const BASE_URL = 'https://membership.islandbarn.org.uk/accounts/account_line_summary.json';

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

export interface LineItemParams {
   financial_year: FinancialYear;
   account_to_show?: number;
   opening_balance?: boolean;
   deferred?: boolean;
}

export type FinancialYear = '2024 - 2025' | '2023 - 2024' | '2022 - 2023';

@Injectable({
   providedIn: 'root'
})
export class LineItemService {

   getLineItemsResource(params: Signal<LineItemParams>): Resource<AccountLineItem[]> {
      return httpResource<LineItemParams>(
         () => ({
            url: `BASE_URL`,
            params: {
               params: new HttpParams({ fromObject: { ...params() } }),
            },
         }),
         { defaultValue: [] }
      );
   }

}
