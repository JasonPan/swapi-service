export const MICROSERVICE_SUBJECTS = {
  MESSAGES: {
    QUERY_CREATE: 'swapi.query.create',
    QUERY_READ: 'swapi.query.read',
    RATE_LIMIT_USAGE_READ: 'swapi.rate-limit-usage.read',
    CACHE_READ: 'swapi.cache.read',
  },
  EVENTS: {
    SUBQUERY_RESULT_SCHEDULE_FETCH: 'swapi.subquery.result.schedule-fetch',
    SUBQUERY_RESULT_FETCH: 'swapi.subquery.result.fetch',
    SUBQUERY_RESULT_RECEIVE: 'swapi.subquery.result.receive',
  },
} as const;
