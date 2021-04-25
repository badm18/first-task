import React from 'react';
import createReactClass from 'create-react-class';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {withRouter} from 'react-router';
import {injectIntl} from 'react-intl';
import {Link, Route} from 'react-router-dom';

import Drawer from 'react-md/lib/Drawers';
import FontIcon from 'react-md/lib/FontIcons';
import ListItem from 'react-md/lib/Lists/ListItem';
import Toolbar from 'react-md/lib/Toolbars';
import Button from 'react-md/lib/Buttons/Button';

import uiActions from '../uiActions';
import CompanySwitcher from '../modules/company';
import msg from './_i18n';
import './MainMenu.sass';
import classnames from 'classnames';

import OldAccountLink from '../components/exp/OldAccountLink';
import {isExpert, isSupervisor} from "../modules/customs-declaration/manager/Rights";
import {
  sendMenuItem
} from '../common/gtmEvents';
// TODO: I18n
// TODO: -> to stateless components

import isManagerAgent from '../rights/isManagerAgent';
import isManagerClient from '../rights/isManagerClient';
import isManagerFESCO from '../rights/isManagerFESCO';
import {
  CUSTOMS_INFORMATION_RIGHT,
  VIEW_ALL_REQUEST_RIGHT,
  VIEW_UNION_REQUEST_RIGHT,
  MASTER_ACCOUNT_RIGHT,
} from '../common/accessmask';

const NavItemLink = ({label, to, isExternal, icon, exact, subheader, redirect, isExternalAccountLink, disabled, wrapped}) => {

  //TODO: оптимизировать
  if (to === 'customsDeclaration' || to === 'vgm') {

    // return (<OldAccountLink {...{label, to, icon, exact, subheader, isExternalAccountLink}}/>);
    return (<OldAccountLink {...{label, to, icon, exact, subheader, redirect, isExternalAccountLink}}/>);

  } else {
    return (
      <Route path={to.replace(/\?/, '/')} exact={exact}>
        {
          ({match, location}) => {
            let leftIcon;
            if (icon) {
              leftIcon = <FontIcon>{icon}</FontIcon>;
            }

            const linkClassNames = classnames({
              'Common-MainMenu-Link--subheader': subheader,
              'Common-MainMenu-Link--disabled': disabled,
              'Common-MainMenu-Link--wrapped': wrapped,
            });

            return (
              <ListItem
                className={linkClassNames}
                component={Link}
                active={`${location.pathname}${location.search}` === to || !!match}
                target={isExternal ? `_blank` : ''}
                to={to}
                primaryText={label}
                leftIcon={leftIcon}
                disabled={disabled}
                visible={true}
                onClick={() => sendMenuItem({label, to})}
              />
            );
          }
        }
      </Route>
    );
  }
};

const drawerMenuItems = props => {
  const {intl, user, rights, rights2} = props;
  const {
    companies = [],
    elArchiveTemporaryCompanies = [],
    elArchiveCompanies = [],
    elArchiveCompaniesFull = [],
    companiesSoftShip = [],
    newAgreement = [],
  } = props;
  let access = {};
  if (user && user.accessMask) {
    access = user.accessMask;
  }

  // console.info(`user`, user);

  const order_23_2_hidden = ORDER_23_2_HIDDEN &&
    (!user ||
    [
      'exp3@forwel.net',
      'ved1@rzdlogistic.ru',
      'badg3r@mail.ru',
      'sshevelev@fesco.com',
    ].indexOf(user.email.toLowerCase()) === -1);

  let items = [{
    label: intl.formatMessage(msg.menuOffers),
    to: '/offers',
    icon: 'functions',
  }];

  if (!user || !user.username) {
    items.push({
      to: '/vgm',
      label: intl.formatMessage(msg.menuVGM),
      icon: 'directions_boat',
    });
    return [
      ...items.map(item => <NavItemLink key={item.to} {...item} />)
    ];
  }
  const isRequestsDisabled = ((access.CL & VIEW_UNION_REQUEST_RIGHT) === 0)
    && ((access.SS & VIEW_UNION_REQUEST_RIGHT) === 0);
  const isAllRequestsDisabled = ((access.CL & VIEW_ALL_REQUEST_RIGHT) === 0)
    && ((access.SS & VIEW_ALL_REQUEST_RIGHT) === 0);
  items.push({
    label: intl.formatMessage(msg.menuRequests),
    to: '/requests',
    icon: 'directions_boat',
    // disabled: !(companies && companies.length > 0) && !(companiesSoftShip && companiesSoftShip.length > 0)
    // disabled: isRequestsDisabled
    disabled: false
  });
  // if ((companies && companies.length > 0) || (companiesSoftShip && companiesSoftShip.length > 0)) {
  if (!isRequestsDisabled) {
    items.push({
      label: intl.formatMessage(msg.menuRequestsActive),
      subheader: true,
      to: '/requests?active',
    });
    items.push({
      label: intl.formatMessage(msg.menuRequestsDraft),
      subheader: true,
      to: '/requests?drafts',
    });
    items.push({
      label: intl.formatMessage(msg.menuRequestsArchived),
      subheader: true,
      to: '/requests?archived',
    });
    // items.push({
    //   label: intl.formatMessage(msg.menuRequestsTemplates),
    //   subheader: true,
    //   to: '/requests?templates',
    // });
    items.push({
      label: intl.formatMessage(msg.menuRequestsQuotas),
      subheader: true,
      to: '/requests?quotas',
    });
  }
  if (user && user.username && !isRequestsDisabled) {
    items.push({
      label: intl.formatMessage(msg.autosuggestions),
      to: '/requests/autosuggestions',
      subheader: true,
      disabled: !(companies && companies.length > 0)
    });
  }

  const isCLCompanyExists = companies && companies.length > 0;
  items.push({
    label: intl.formatMessage(msg.menuInvoices),
    to: '/invoices',
    icon: 'attach_money',
    disabled: !isCLCompanyExists
  });
  if (isCLCompanyExists) {
    items.push({
      label: intl.formatMessage(msg.menuInvoicesPaid),
      subheader: true,
      to: '/invoices/paid',
    });
    items.push({
      label: intl.formatMessage(msg.menuInvoicesUnpaid),
      subheader: true,
      to: '/invoices/unpaid',
    });
    if (!isAllRequestsDisabled) {
      items.push({
        label: intl.formatMessage(msg.menuStatements),
        subheader: true,
        to: "/invoices/statements"
      });
    }
  }

  // если у пользователя есть хоть одна компания с разрешением, то отображаем раздел
  // if (companies && companies.length && companies.filter((company) => company.pay_link_is_prohibited === 0).length) {
  //   items.push({
  //     label: intl.formatMessage(msg.payments),
  //     to: '/invoices/binding',
  //     subheader: true,
  //   });
  // }
  // если у пользователя есть хоть одна компания, то отображаем раздел
  if (isCLCompanyExists && !isAllRequestsDisabled) {
    items.push({
      label: intl.formatMessage(msg.payments),
      to: '/invoices/binding',
      subheader: true,
    });
  }
  if (companies.length > 0) {
    items.push({
      label: intl.formatMessage(msg.menuIncidents),
      to: `/incidents`,
      icon: 'announcement',
    });
  }
  if (companies.length === 1) {
    // Если компания только одна, то подзаголовки не выводим. Вместо этого
    // добавляем параметр поиска прямо в родительский пункт меню
    const company = companies[0];
    items.push({
      label: intl.formatMessage(msg.menuAgreements),
      to: `/agreements?company=${company.clnt_code_6}`,
      icon: 'content_paste',
    });
  } else {
    items.push({
      label: intl.formatMessage(msg.menuAgreements),
      to: '/agreements',
      icon: 'content_paste',
    });
  }

  if (rights2.agreements) {
    items.push({
      label: intl.formatMessage(msg.menuAgreementsForApproval),
      subheader: true,
      to: '/agreements/approval',
    });
  }

  // if (user && user.username) {
  const isCustomsInformationDisabled = (access.CL & CUSTOMS_INFORMATION_RIGHT) === 0;
  items.push({
    to: '/customs-declaration',
    label: intl.formatMessage(msg.menuCustomsDeclaration),
    icon: 'location_city',
    disabled: isCustomsInformationDisabled && user.manager !== true,
  });
  /*if (!isCustomsInformationDisabled) {
    items.push({
      label: intl.formatMessage(msg.menuRequestsTransitDeclaration),
      subheader: true,
      to: '/customs-declaration/export-jobs'
    });
  }*/

  // Переделал на обработку user.features, т.к. штука со state не сработала корректно
  if (Boolean(user.features && user.features.declarant)) {
    items.push({
      to: '/manager/customs-declaration',
      label: intl.formatMessage(msg.menuCustomsDeclarationManager),
      icon: 'computer',
    });

    items.push({
      to: '/manager/customs-declaration/export-jobs',
      label: intl.formatMessage(msg.menuCustomsDeclarationManagerExport),
      subheader: true,
    });

    if (user.features.declarant && user.features.declarant.supervisor) {
      items.push({
        to: '/manager/customs-declaration/access-rights',
        label: intl.formatMessage(msg.menuCustomsDeclarationManagerAccessRights),
        subheader: true,
      });
    }

    items.push({
      to: '/manager/customs-declaration/charts',
      label: intl.formatMessage(msg.menuCustomsDeclarationManagerCharts),
      subheader: true,
    });
  }

  // NOTE: 15.10.2018 - убрал ссылку
  /*
   items.push({
   to: 'customsDeclaration',
   label: intl.formatMessage(msg.menuCustomsDeclarationOLD),
   icon: 'location_city',
   isExternalAccountLink: true,
   redirect: '/client/customs-declaration/'
   });
   */

  // items.push({
  //   to: 'vgm',
  //   label: intl.formatMessage(msg.menuVGM),
  //   icon: 'directions_boat',
  //   isExternalAccountLink: true,
  //   redirect: '/client/vgm/'
  // });

  items.push({
    to: '/vgm',
    label: intl.formatMessage(msg.menuVGM),
    icon: 'directions_boat',
  });

  const isElArchiveCompanyExists = elArchiveCompaniesFull && elArchiveCompaniesFull.length > 0;
  let allowElarchive = (user.features && user.features.VGM) || isElArchiveCompanyExists;

  items.push({
    to: '/archive',
    label: intl.formatMessage(msg.menuElectronicArchive),
    icon: 'archive',
    disabled: !allowElarchive
  });

  if (allowElarchive) {
    /*items.push({
      to: '/archive/jobs',
      label: intl.formatMessage(msg.menuElectronicArchiveJobs),
      subheader: true,
    });*/
    if (isElArchiveCompanyExists) {
      items.push({
        label: intl.formatMessage(msg.menuReconciliationReports),
        subheader: true,
        to: '/archive/reconciliation-reports',
      });
      items.push({
        label: intl.formatMessage(msg.menuReconciliationReportRequests),
        subheader: true,
        to: '/archive/reconciliation-report-requests',
      });
      items.push({
        label: intl.formatMessage(msg.menuDuplicateDocumentsRequests),
        subheader: true,
        to: '/archive/duplicate-documents-requests',
        wrapped: true,
      });
    }
  }

  items.push({
    label: intl.formatMessage(msg.terminalTrackingExport),
    to: '/terminal-tracking-export',
    icon: 'assignment',
    disabled: !isCLCompanyExists,
  });

  if (isCLCompanyExists) {
    items.push({
      label: intl.formatMessage(msg.newJob),
      to: '/terminal-tracking-export/newjob',
      subheader: true,
    });

    items.push({
      label: intl.formatMessage(msg.templates),
      to: '/terminal-tracking-export/templates',
      subheader: true,
    });
  }

  if ((user && user.manager === true) || (rights2 && rights2.lkAdmin)) {
    items.push({
      label: intl.formatMessage(msg.administrator),
      to: '/administrator',
      icon: 'settings',
    });
    if (
      rights2 &&
      rights2.lkAdmin &&
      (rights2.lkAdmin.all || rights2.lkAdmin.ft)
    ) {
      items.push({
        label: intl.formatMessage(msg.fTHistory),
        subheader: true,
        to: '/administrator/ft_history',
      }),
        items.push({
          label: intl.formatMessage(msg.agreementAdmin),
          subheader: true,
          to: '/administrator/agreement',
        });
    }
    if (rights2 && rights2.lkAdmin && rights2.lkAdmin.all) {
      items.push({
        label: intl.formatMessage(msg.ordersAdmin),
        subheader: true,
        to: '/administrator/orders',
      });
      items.push({
        label: intl.formatMessage(msg.distribution),
        subheader: true,
        to: '/administrator/distribution',
      });
      items.push({
        label: intl.formatMessage(msg.banners),
        subheader: true,
        to: '/administrator/banners',
      });

      // items.push({
      //   label: intl.formatMessage(msg.monitoring),
      //   subheader: true,
      //   to: '/administrator/monitoring',
      // });
    }
    // if (user && user.manager === true) {
    //   items.push({
    //     label: intl.formatMessage(msg.menuRegistrations),
    //     subheader: true,
    //     to: '/administrator/registrations',
    //     // icon: 'group',
    //   });
    // }
  }
  if (user&& user.username) {
  items.push({
    label: intl.formatMessage(msg.menuRequestsTransitDeclaration),
    to: '/tasks',
    icon: 'toc',
    disabled: !isCLCompanyExists && !isElArchiveCompanyExists && !(user.email && user.email.indexOf('@fesco.com') !==-1)
  });
}
  // Управление правами
  if (rights2) {
    const _isManagerAgent = isManagerAgent(rights2);
    const _isManagerClient = isManagerClient(rights2);
    const _isManagerFESCO = isManagerFESCO(rights2);
    const {
      isRequestForFitMasterAccount,
      isRequestForFitManager,
    } = rights2;

    const isMasterAccountFit =
      user &&
      user.accessMask &&
      (user.accessMask.CL & MASTER_ACCOUNT_RIGHT) > 0;

    const menuRM_SenderToClient = _isManagerAgent || _isManagerClient || _isManagerFESCO;
    const menuRM_UserToClient = _isManagerAgent || _isManagerClient || _isManagerFESCO;
    const menuAgents = rights2.agentList;
    const menuManagers = rights2.managerList;
    const menuAccessByClients =
      _isManagerAgent || _isManagerClient || _isManagerFESCO;

    const isShowRightsManagement = () => {
      return (
        !order_23_2_hidden &&
        (menuRM_SenderToClient ||
          menuRM_UserToClient ||
          menuAgents ||
          menuManagers ||
          menuAccessByClients ||
          isMasterAccountFit ||
          isRequestForFitMasterAccount ||
          isRequestForFitManager)
      );
    };

    // наличие прав мастер-учетки ФИТ или ФОМЛ
    const hasRightsMasterAccountForFitOrFOML = () => {
      return (
        menuRM_SenderToClient ||
        menuRM_UserToClient ||
        menuAgents ||
        menuManagers ||
        menuAccessByClients ||
        isMasterAccountFit
      );
    };

    if (isShowRightsManagement()) {
      items.push({
        label: intl.formatMessage(msg.menuRM),
        to: hasRightsMasterAccountForFitOrFOML()
          ? '/access-management/list-of-users#top'
          : '/access-management/requests-connect-managers#top',
        icon: 'vpn_key',
      });
      if (hasRightsMasterAccountForFitOrFOML()) {
        items.push({
          label: intl.formatMessage(msg.menuRM_listOfUsers),
          to: '/access-management/list-of-users',
          subheader: true,
        });
      }
      if (user.manager || isMasterAccountFit) {
        items.push({
          label: intl.formatMessage(msg.menuRM_historyChangesProfile),
          to: '/access-management/history-changes-profile/',
          subheader: true,
        });
      }
      if (menuAccessByClients) {
        items.push({
          label: intl.formatMessage(msg.menuRM_AccessByClients),
          to: '/232/client/get-clients',
          subheader: true,
        });
      }
      if (menuAgents) {
        items.push({
          label: intl.formatMessage(msg.menuRM_Agents),
          to: '/232/agent',
          subheader: true,
        });
      }
      if (menuManagers) {
        items.push({
          label: intl.formatMessage(msg.menuRM_Managers),
          to: '/232/managers',
          subheader: true,
        });
      }
      items.push({
        label: intl.formatMessage(msg.menuRM_requestsConnectManagers),
        to: '/access-management/requests-connect-managers',
        subheader: true,
        wrapped: true,
      });
      if (isRequestForFitMasterAccount) {
        items.push({
          label: intl.formatMessage(
            msg.menuRM_AdditionalAgreementUnderApprovalForFit
          ),
          to: '/access-management/requests-connect-master-accounts',
          subheader: true,
          wrapped: true,
        });
      }
      if (menuRM_SenderToClient) items.push({
        label: intl.formatMessage(msg.menuRM_SenderToClient),
        to: '/232/request/sender-to-client/get-request',
        subheader: true,
        wrapped : true,
      });
      if (menuRM_UserToClient) items.push({
        label: intl.formatMessage(msg.menuRM_UserToClient),
        to: '/232/request/user-to-client',
        subheader: true,
        wrapped: true,
      });
    }
  }

  // items.push({
  //   label: intl.formatMessage(msg.menuMyRights),
  //   to: order_23_2_hidden ? '/my-access' : '/232/rights',
  //   icon: 'vpn_key',
  // });
  items.push({
    label: intl.formatMessage(msg.menuMyRights),
    to: '/my-access',
    icon: 'vpn_key',
  });

  items.push({
    label: intl.formatMessage(msg.subscriptions),
    to: '/subscriptions',
    icon: 'notifications',
  });

  return [
    ...items.map(item => <NavItemLink key={item.to} {...item} />)
  ];
};

const MainMenu = createReactClass({

  closeDrawer() {
    this.props.dispatch(uiActions.toggleDrawer({open: false}));
  },

  handleVisibilityChange(visible) {
    this.props.dispatch(uiActions.toggleDrawer({open: visible}));
  },

  render() {
    const {drawerIsOpen} = this.props;

    const closeButton = <Button icon onClick={this.closeDrawer}>arrow_back</Button>;

    return (
      <Drawer
        className="Common-MainMenu"
        defaultVisible={false}
        visible={drawerIsOpen}
        position="left"
        clickableDesktopOverlay
        constantType={false}
        overlay
        type={Drawer.DrawerTypes.TEMPORARY}
        desktopType={Drawer.DrawerTypes.TEMPORARY}
        tabletType={Drawer.DrawerTypes.TEMPORARY}
        mobileType={Drawer.DrawerTypes.TEMPORARY}
        onVisibilityChange={this.handleVisibilityChange}
        navItems={drawerMenuItems(this.props)}
        header={(
          <Toolbar
            colored
            nav={closeButton}
            className="md-divider md-divider-border-bottom"
          />
        )}
      />
    );
  }
});

const MainMenuHOC = compose(
  withRouter,
  injectIntl,
  connect((state) => ({
    drawerIsOpen: state.app.ui && state.app.ui.drawerIsOpen,
    companies: state.app.companies,
    companiesSoftShip: state.app.companiesSoftShip,
    elArchiveTemporaryCompanies: state.app.elArchiveTemporaryCompanies,
    elArchiveCompanies: state.app.elArchiveCompanies,
    elArchiveCompaniesFull: state.app.elArchiveCompaniesFull,
    user: state.app && state.app.user,
    token: state.app && state.app.session && state.app.session.token,
    rights2: state.app && state.app.rights,
  })),
  (Component) => (props) => {
    const rights = [];

    if (props.token) {
      if (isExpert(props.token) || isSupervisor(props.token)) {
        rights.push('customs-declaration-manager');
      }
    }

    const res = rights.reduce((s, v, i) => {
      s[v] = {name: v, index: i};
      return s;
    }, {});
    res._list = rights;

    return <Component {...props} rights={res}/>;
  }
)(MainMenu);

export default MainMenuHOC;
