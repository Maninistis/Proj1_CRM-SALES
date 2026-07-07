export type PaginationParams = {
  page: number;
  pageSize: number;
};

export type PaginationResult<T> = {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export function parsePagination(searchParams: URLSearchParams): PaginationParams {
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const pageSize = Math.min(
    100,
    Math.max(1, Number(searchParams.get("pageSize")) || 20)
  );
  return { page, pageSize };
}

export function paginate<T>(
  data: T[],
  total: number,
  params: PaginationParams
): PaginationResult<T> {
  return {
    data,
    page: params.page,
    pageSize: params.pageSize,
    total,
    totalPages: Math.ceil(total / params.pageSize),
  };
}

export function skipTake(params: PaginationParams) {
  return {
    skip: (params.page - 1) * params.pageSize,
    take: params.pageSize,
  };
}
