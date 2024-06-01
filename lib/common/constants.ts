export const MICROSERVICE_SUBJECTS = {
  MESSAGES: {
    QUERY_CREATE: 'swapi.query.create',
    QUERY_READ: 'swapi.query.read',
    RATE_LIMIT_USAGE_READ: 'swapi.rate-limit-usage.read',
    CACHE_READ: 'swapi.cache.read',
  },
  EVENTS: {
    DATA_RESULTS_SCHEDULE_FETCH: 'swapi.data.results.schedule-fetch',
    DATA_RESULTS_FETCH: 'swapi.data.results.fetch',
    DATA_RESULTS_RECEIVE: 'swapi.data.results.receive',
    DATA_RESULT_RECEIVE: 'swapi.data.result.receive',
  },
} as const;
