import React, { useEffect, useState } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';
import FontIcon from 'react-md/lib/FontIcons';
import Paper from 'react-md/lib/Papers';
import './styles.scss';
import Skeleton from '@material-ui/lab/Skeleton';
import {
  DataTable,
  TableBody,
  TableColumn,
  TableHeader,
  TablePagination,
  TableRow,
} from 'react-md';
import store from '../../../../store';
// import commonActions from '../../../../actions';
// import SimpleSelect from '../../../common/SimpleSelect';
// import uiActions from '../../../../uiActions';
import messages from './_i18n';
import { getAgreements } from './functions';

const Agreements = (props) => {
  const [loading, setLoading] = useState(false);
  const [agreementList, setAgreementList] = useState([]);
  const [pagination, setPagination] = useState({
    rows: 0, // Общее кол-во строк
    offset: 0, // сколько строк пропускаем
    limit: 10, // Кол-во выводимых строк
    page: 1, // Текущая страница
  });
  const { intl } = props;
  const clearPagination = () => {
    setPagination({
      ...pagination,
      // rows: 0, // Общее кол-во строк
      offset: 0, // сколько строк пропускаем
      limit: 10, // Кол-во выводимых строк
      page: 1, // Текущая страница
    });
  };
  const getData = async () => {
    if (loading) return;
    setLoading(true);
    let data;
    try {
      data = await getAgreements(pagination.offset, pagination.limit);
      // -------------------------------------------------
      console.log(data)
    } catch (e) {
      console.error(e);
    }

    const content = data && data.data && data.data.data && data.data.data.data;
    const count = data && data.data && data.data.data && data.data.data.rows;
    const status = data && data.data && data.data.status;
    if (status && status === 'OK') {
      setAgreementList(content);
      setPagination({
        ...pagination,
        rows: count || 0,
      });
    } else if (status && status === 'ERROR') {
      store.dispatch(uiActions.showSnackbar({ message: content }));
      console.error(content);
    } else {
      store.dispatch(
        uiActions.showSnackbar({
          message: intl.formatMessage(messages.loadingError),
        })
      );
      console.error(content);
    }

    setLoading(false);
  };

  const getStatus = (type) => {
    return messages[`STATUS_${type}`]
      ? intl.formatMessage(messages[`STATUS_${type}`])
      : false;
  };

  const getTypes = (type) => {
    return messages[`TYPES_${type}`]
      ? intl.formatMessage(messages[`TYPES_${type}`])
      : false;
  };

  const getLink = (el, key) => {
    if (!el[key]) return null;
    if (!el.id) return el[key];
    return (
      <Link
        to={{
          state: { number: el.number },
          pathname: `/incidents/detail/${el.id}`,
        }}
      >
        {el[key]}
      </Link>
    );
  };

  const getTableColumns = () => {
    return [
      {
        columnName: `${intl.formatMessage(messages.contractNumber)}`,
        columnValue: (el) => getLink(el, 'number') || ' - ',
        style: {
          width: '150px',
        },
      },
      {
        columnName: `${intl.formatMessage(messages.barcode)}`,
        columnValue: (el) => getLink(el, 'theme') || ' - ',
      },
      {
        columnName: `${intl.formatMessage(messages.companyName)}`,
        columnValue: (el) => getStatus(el.status) || ' - ',
      },
      {
        columnName: `${intl.formatMessage(messages.currentStatus)}`,
        columnValue: (el) => el.date || ' - ',
      },
      {
        columnName: `${intl.formatMessage(messages.dateOfStatus)}`,
        columnValue: (el) => getTypes(el.type) || ' - ',
      },

      // {
      //   style: {
      //     width: '250px',
      //   },
      //   columnName: `${intl.formatMessage(messages.tableColumnResponsible)}`,
      //   columnValue: (el) => el.responsible || ' - ',
      // },
      //
    ];
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
  const getRowsWithPagination = () => {
    return agreementList || [];
    // const rows = incidentsList || [];
    // if (!(rows && rows.length)) return [];
    // const length = pagination.limit * pagination.page || 10;
    // const start = pagination.offset || 0;
    // return rows.slice(start, length);
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


  useEffect(() => {
    getData();
    // eslint-disable-next-line react/destructuring-assignment,react/prop-types
  }, [pagination]);


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
)(Agreements);

export default AgreementsHOC;
