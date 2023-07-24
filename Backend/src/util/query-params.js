export const nonWhereParams = ['page', 'pageSize', 'startDate', 'endDate'];

export const removeNonWhereParams = (query) => {
  if (query.page) delete query['page'];
  if (query.pageSize) delete query['pageSize'];
  if (query.startDate) delete query['startDate'];
  if (query.endDate) delete query['endDate'];

  return query;
};

export const getQueryParams = (query) => ({
  ...(query.page ? { page: query.page } : {}),
  ...(query.pageSize ? { pageSize: query.pageSize } : {}),

  where: Object.keys(query).reduce((where, key) => {
    if (!nonWhereParams.includes(key)) {
      if (key === 'isAdmin') where['is_admin'] = JSON.parse(query[key]);
      else if (key === 'isActive') where['is_active'] = JSON.parse(query[key]);
      else where[key] = query[key];
    }
    return where;
  }, {}),

  ...(query.startDate && query.endDate
    ? { whereBetween: { startDate: query.startDate, endDate: query.endDate } }
    : {}),
});
