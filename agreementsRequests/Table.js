import React, { useEffect, useState } from 'react';
import { compose } from 'redux';
import { injectIntl } from 'react-intl';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import {
  DataTable,
  TableBody,
  TableColumn,
  TableHeader,
  TablePagination,
  TableRow,
} from 'react-md';
import Skeleton from '@material-ui/lab/Skeleton';
import Paper from 'react-md/lib/Papers';
import moment from 'moment';
import messages from './_i18n';
import {
  messageFromEDO,
  messageFromPaper,
} from '../../../agreements/components/AgreementsUnderApproval/messages/_i18n';
import API from '../../../../utils/API';
import uiActions from '../../../../uiActions';
import store from '../../../../store';

const AdminAgreementsTable = (props) => {
  const [loading, setLoading] = useState(false);
  const [agreementList, setAgreementList] = useState([]);
  const [pagination, setPagination] = useState({
    rows: 0, // Общее кол-во строк
    offset: 0, // сколько строк пропускаем
    limit: 10, // Кол-во выводимых строк
    page: 1, // Текущая страница
  });
  const { intl } = props;

  useEffect(() => {
    getData();
  }, [pagination]);

  const clearPagination = () => {
    setPagination({
      ...pagination,
      offset: 0,
      limit: 20,
      page: 1,
    });
  };
  const getData = async () => {
    if (loading) return;
    setLoading(true);
    const { data } = await API.get(
      `/admin/agreements/?offset=${pagination.offset}&limit=${pagination.limit}`
    );
    console.log(data);
    console.log(data.data);
    if (data.status !== 'OK') {
      store.dispatch(uiActions.showSnackbar({ message: data.message }));
      return;
    }
    setAgreementList(data.data);
    setPagination({
      ...pagination,
      rows: Number(data.data[0].rows) || 0,
    });
    setLoading(false);
  };

  // Вывод нужного статуса из response
  const findStatus = (el) => {
    let maxTimestamp = 0;
    let status = '-';
    for (const [key, value] of Object.entries(el)) {
      if (key === 'canceled')
        return intl.formatMessage(messageFromEDO.canceled);
      if (value > maxTimestamp) {
        maxTimestamp = value;
        // Если есть расшифровка статуса, то используем ее иначе прочерк
        messageFromEDO[key] || messageFromPaper[key]
          ? (status = intl.formatMessage(
              messageFromEDO[key] || messageFromPaper[key]
            ))
          : (status = '-');
        // if (messageFromEDO[key] || messageFromPaper[key]) {
        //   status = intl.formatMessage(
        //     messageFromEDO[key] ||
        //       messageFromPaper[key]
        //   );
        // } else {
        //   status = '-';
        // }
      }
    }
    return status.split('.')[0];
  };

  const getRowsWithPagination = () => {
    return agreementList || [];
  };

  const renderTableRow = (el, fake = false) => {
    const columns = getTableColumns();
    return columns.map((col, index) => {
      return (
        <TableColumn key={Number(index)}>
          {fake ? <Skeleton animation="wave" /> : col.columnValue(el)}
        </TableColumn>
      );
    });
  };

  const renderPreloadTable = () => {
    return [0, 1, 2, 3].map((el, index) => {
      return (
        <TableRow key={`table-${Number(index)}`}>
          {renderTableRow(el, true)}
        </TableRow>
      );
      return (
        <TableRow key={`preload-${index}`}>
          <TableColumn
            colSpan={7}
            className="preload-column md-text--secondary"
          >
            <Skeleton animation="wave" variant="rect" height="98%" />
          </TableColumn>
        </TableRow>
      );
    });
  };

  const renderTableContent = (data = []) => {
    if (loading) {
      return renderPreloadTable();
    }
    if (!data.length) {
      return (
        <TableRow key={1}>
          <TableColumn colSpan={7} className="empty-column md-text--secondary">
            {intl.formatMessage(messages.dataEmpty)}
          </TableColumn>
        </TableRow>
      );
    }
    const rows = getRowsWithPagination();
    return rows.map((el, index) => {
      return (
        <TableRow key={`table-${Number(index)}`} className={`row-${el.status}`}>
          {renderTableRow(el)}
        </TableRow>
      );
    });
  };

  const getTableColumns = () => {
    return [
      {
        columnName: `${intl.formatMessage(messages.agreementNumber)}`,
        columnValue: (el) => el.number || ' - ',
        style: {
          width: '150px',
        },
      },
      {
        columnName: `${intl.formatMessage(messages.barcode)}`,
        columnValue: (el) => el.barcode || ' - ',
      },
      {
        columnName: `${intl.formatMessage(messages.companyName)}`,
        columnValue: (el) => el.fullname || ' - ',
      },
      {
        columnName: `${intl.formatMessage(messages.currentStatus)}`,
        columnValue: (el) => findStatus(el.status) || ' - ',
      },
      {
        columnName: `${intl.formatMessage(messages.dateOfStatus)}`,
        columnValue: (el) =>
          moment(Number(el.last_status_timestamp)).format(
            'DD-MM-YYYY, h:mm:ss a'
          ),
      },
    ];
  };
  const renderTableColumn = () => {
    const columns = getTableColumns();
    return columns.map((col, index) => {
      return (
        <TableColumn key={Number(index)} style={col.style || {}}>
          <span dangerouslySetInnerHTML={{ __html: col.columnName }} />
        </TableColumn>
      );
    });
  };

  const renderTable = (data) => {
    return (
      <DataTable baseId="incidents-list-table" plain>
        <TableHeader>
          <TableRow>{renderTableColumn()}</TableRow>
        </TableHeader>
        <TableBody>{renderTableContent(data)}</TableBody>
        <TablePagination
          page={pagination.page}
          rowsPerPageLabel={intl.formatMessage(messages.rowsPerPage)}
          rows={pagination.rows}
          onPagination={(offset, limit, page) => {
            if (pagination.limit !== limit) {
              clearPagination();
            }
            setPagination({
              ...pagination,
              offset,
              limit,
              page,
            });
          }}
        />
      </DataTable>
    );
  };

  return (
    <div className="incidents">
      <Paper zDepth={1} className="incidents-list">
        {renderTable(agreementList)}
      </Paper>
    </div>
  );
};

const AgreementsHOC = compose(
  injectIntl,
  withRouter,
  connect((state) => ({}))
)(AdminAgreementsTable);

export default AgreementsHOC;
