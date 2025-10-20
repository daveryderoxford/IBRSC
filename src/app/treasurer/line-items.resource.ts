import { HttpContext, HttpParams } from '@angular/common/http';
import { HttpResource, createHttpResource } from '@angular/common/http/primitives';
import { Injectable, Signal, inject } from '@angular/core';

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

export type FinancialYear = '2024 - 2025' | '2023 - 2024' | '2022 - 2023';

export interface LineItemParams {
  financial_year: FinancialYear;
  account_to_show?: number;
  opening_balance?: boolean;
  deferred?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class LineItemResource {
  private lineItems: Signal<HttpResource<AccountLineItem[]>>;

  constructor() {
    this.lineItems = createHttpResource<AccountLineItem[]>({
      // The request function is lazy, it won't execute until the resource is read.
      request: (params: LineItemParams) => ({
        url: BASE_URL,
        params: new HttpParams({ fromObject: { ...params } }),
      }),
    });
  }

  get(params: LineItemParams): Signal<HttpResource<AccountLineItem[]>> {
    return this.lineItems.get(params);
  }
}