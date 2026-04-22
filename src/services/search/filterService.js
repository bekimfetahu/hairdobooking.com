import axios from 'axios';

/**
 * Search Filter Service
 * Handles fetching available filter options (categories, audiences)
 * Calls through Next.js proxy: /api/search/filters
 */

export const filterService = {
  /**
   * Fetch available filter options
   * @returns {Promise} Object with categories and audiences
   */
  async getFilterOptions() {
    try {
      const response = await axios.get('/api/search/filters');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch filter options:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },
};
