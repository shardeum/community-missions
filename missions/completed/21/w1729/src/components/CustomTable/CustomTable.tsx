import React, { ReactChild } from 'react';
import { Box, useMediaQuery, TableRow, TableCell } from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import { ArrowUpward, ArrowDownward } from '@material-ui/icons';
import { DataTable } from 'components';
import 'components/styles/CustomTable.scss';

export interface CustomTableProps<T> {
  emptyMessage?: string;
  showPagination?: boolean;
  rowsPerPage?: number;
  headCells: any;
  data: any;
  defaultOrderBy?: T;
  defaultOrder?: 'asc' | 'desc';
  mobileHTML: (item: any, index: number) => ReactChild;
  desktopHTML: (
    item: any,
    index: number,
    page: number,
    rowsPerPage: number,
  ) => any;
}

const CustomTable: React.FC<CustomTableProps<any>> = ({
  rowsPerPage = 5,
  showPagination = true,
  emptyMessage,
  headCells,
  data,
  defaultOrderBy,
  defaultOrder,
  mobileHTML,
  desktopHTML,
}) => {
  const theme = useTheme();
  const mobileWindowSize = useMediaQuery(theme.breakpoints.down('xs'));

  return (
    <Box className='tableContainer'>
      {mobileWindowSize ? (
        <>
          {data.map((item: any, index: number) => (
            <Box key={index}>{mobileHTML(item, index)}</Box>
          ))}
        </>
      ) : (
        <DataTable
          defaultOrderBy={defaultOrderBy}
          defaultOrder={defaultOrder}
          emptyMesage={emptyMessage}
          showPagination={showPagination}
          headCells={headCells}
          data={data}
          rowPerPage={rowsPerPage}
          sortUpIcon={<ArrowUpward />}
          sortDownIcon={<ArrowDownward />}
          showEmptyRows={false}
          renderRow={(item, index, page, rowsPerPage) => {
            return (
              <TableRow key={index}>
                {desktopHTML(item, index, page, rowsPerPage).map(
                  (cellItem: any, ind: number) => (
                    <TableCell
                      key={ind}
                      className={cellItem.button ? 'buttonCell' : ''}
                    >
                      {cellItem.html}
                    </TableCell>
                  ),
                )}
              </TableRow>
            );
          }}
        />
      )}
    </Box>
  );
};

export default CustomTable;
