export function descendingComparator<T>(
  a: T,
  b: T,
  orderBy: (data: T) => string | number,
): number {
  if (orderBy?.(b) < orderBy?.(a)) {
    return -1;
  } else if (orderBy?.(b) > orderBy?.(a)) {
    return 1;
  }
  return 0;
}

export type SortOrder = 'asc' | 'desc';

export interface Comparable<T> {
  sortKey: (toCompare: T) => string | number;
}

export function getComparator<T>(
  order: SortOrder,
  orderBy: Comparable<T>,
): (a: any, b: any) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy.sortKey)
    : (a, b) => -descendingComparator(a, b, orderBy.sortKey);
}

export function stableSort<T>(
  array: T[],
  comparator: (a: T, b: T) => number,
): T[] {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}
