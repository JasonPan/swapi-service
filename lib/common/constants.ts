export const MICROSERVICE_SUBJECTS = {
  MESSAGES: {
    QUERY_CREATE: 'swapi.query.create',
    QUERY_READ: 'swapi.query.read',
    RATE_LIMIT_USAGE_READ: 'swapi.rate-limit-usage.read',
    CACHE_READ: 'swapi.cache.read',
  },
  EVENTS: {
    DATA_RESULT_SCHEDULE_FETCH: 'swapi.data.result.schedule-fetch',
    DATA_RESULT_FETCH: 'swapi.data.result.fetch',
    DATA_RESULT_RECEIVE: 'swapi.data.result.receive',
  },
} as const;
