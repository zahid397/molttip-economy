/**
 * Tip Service
 *
 * Provides methods for sending tips and retrieving tip history.
 * Supports request cancellation via AbortSignal.
 */

import { api } from '@/shared/utils/api';
import { API_ENDPOINTS, DEFAULT_PAGE_SIZE } from '@/shared/constants';
import type { Tip, SendTipData, PaginatedResponse } from '@/shared/types';

/* =====================================================
   Types
===================================================== */

export interface GetTipsOptions {
  page?: number;
  pageSize?: number;
  signal?: AbortSignal;
}

/* =====================================================
   Helpers
===================================================== */

const buildPaginationQuery = (options?: GetTipsOptions) => {
  const params = new URLSearchParams();

  if (options?.page !== undefined) {
    params.append('page', options.page.toString());
  }

  if (options?.pageSize !== undefined) {
    params.append('pageSize', options.pageSize.toString());
  } else {
    params.append('pageSize', DEFAULT_PAGE_SIZE.toString());
  }

  return params.toString();
};

/* =====================================================
   Service
===================================================== */

export const tipService = {
  /**
   * Send a tip to a post or user.
   */
  sendTip: async (
    data: SendTipData,
    signal?: AbortSignal
  ): Promise<Tip> => {
    return api.post<Tip>(API_ENDPOINTS.TIPS, data, { signal });
  },

  /**
   * Retrieve tips received by a specific user.
   */
  getTipsReceived: async (
    userId: string,
    options?: GetTipsOptions
  ): Promise<PaginatedResponse<Tip>> => {
    const queryString = buildPaginationQuery(options);
    const url = `${API_ENDPOINTS.USER_TIPS_RECEIVED(userId)}${
      queryString ? `?${queryString}` : ''
    }`;

    return api.get<PaginatedResponse<Tip>>(url, {
      signal: options?.signal,
    });
  },

  /**
   * Retrieve tips sent by a specific user.
   */
  getTipsSent: async (
    userId: string,
    options?: GetTipsOptions
  ): Promise<PaginatedResponse<Tip>> => {
    const queryString = buildPaginationQuery(options);
    const url = `${API_ENDPOINTS.USER_TIPS_SENT(userId)}${
      queryString ? `?${queryString}` : ''
    }`;

    return api.get<PaginatedResponse<Tip>>(url, {
      signal: options?.signal,
    });
  },

  /**
   * Retrieve all tips (admin only).
   */
  getAllTips: async (
    options?: GetTipsOptions
  ): Promise<PaginatedResponse<Tip>> => {
    const queryString = buildPaginationQuery(options);
    const url = `${API_ENDPOINTS.TIPS}${
      queryString ? `?${queryString}` : ''
    }`;

    return api.get<PaginatedResponse<Tip>>(url, {
      signal: options?.signal,
    });
  },
};
