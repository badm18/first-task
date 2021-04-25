import React from 'react'
import {Route, Switch, Redirect} from 'react-router'
import {BrowserRouter, withRouter} from 'react-router-dom'
import {ToastContainer} from "react-toastify";

import RouteHook from './RouteHook';
import Layout from './Layout'
import LayoutNoBreadcrumps from './LayoutNoBreadcrumps'
import BreadcrumbRoute from '../components/exp/BreadcrumbRoute';
import Breadcrumb from '../components/exp/Breadcrumb';
import LiveTex from './LiveTex';

import {Loader as LoginLoader, Screen as LoginScreen} from '../modules/user';
import {Loader as ResetLoader, Screen as ResetScreen} from '../modules/user/reset';
import {Loader as SetLoader, Screen as SetScreen} from '../modules/user/set';
import userActions from '../modules/user/actions';
import {Loader as OffersLoader, Screen as OffersScreen} from '../modules/offers';

import {Loader as AgreementsLoader, Screen as AgreementsScreen} from '../modules/agreements';
import {Loader as NewAgreementLoader, Screen as NewAgreementScreen} from '../modules/agreements/components/NewAgreement';
import {Loader as NewStandardAgreementLoader, Screen as NewStandardAgreementScreen} from '../modules/agreements/components/NewStandardAgreement';
import {Loader as NewNonStandardAgreementLoader, Screen as NewNonStandardAgreementScreen} from '../modules/agreements/components/NewNonStandardAgreement';
import {Loader as AgreementsUnderApprovalLoader, Screen as AgreementsUnderApprovalScreen} from '../modules/agreements/components/AgreementsUnderApproval';
import {Loader as RequestClarificationOrRefusalLoader, Screen as RequestClarificationOrRefusalScreen} from '../modules/agreements/components/RequestClarificationOrRefusal';
import {Loader as ContactingManagerLoader, Screen as ContactingManagerScreen} from '../modules/agreements/components/ContactingManager';

import {Loader as InvoicesLoader, Screen as InvoicesScreen} from '../modules/invoices';
import {Loader as StatementsHistoryLoader, Screen as StatementsHistoryScreen} from "../modules/statements/StatementsHistory";
import {Loader as StatementsLoader, Screen as StatementsScreen} from "../modules/statements";
import {Loader as RegistrationsLoader, Screen as RegistrationsScreen} from '../modules/registrations';
import {RequestLoader, RequestScreen, RequestsLoader,RequestListLoader, RequestsScreen} from '../modules/requests';
import {Screen as AdminOrdersScreen, Loader as AdminOrdersLoader} from '../modules/admin/components/orders';
import {Screen as AdminFTHistoryScreen, Loader as AdminFTHistoryLoader} from '../modules/admin/components/ft_history';

import {Screen as AdminAgreementsScreen, Loader as AdminAgreementsLoader } from '../modules/admin/components/ApprovalRequests';

import {Screen as AdminMonitoringScreen, Loader as AdminMonitoringLoader} from '../modules/admin/components/monitoring';
import {Screen as AdminDistributionScreen, Loader as AdminDistributionLoader} from '../modules/admin/components/distribution';
import {
  ScreenDetail as AdminBannersDetailScreen,
  LoaderDetail as AdminBannersDetailLoader,
  ScreenNew as AdminBannersNewScreen,
  LoaderNew as AdminBannersNewLoader,
  ScreenList as AdminBannersListScreen,
  LoaderList as AdminBannersListLoader,
} from '../modules/admin/components/banners';
import {Loader as NewOrderLoader, Screen as NewOrderScreen, DraftLoader} from '../modules/requests/components/NewOrder';
import {Screen as UploadScreen} from '../modules/upload';
import CompaniesLoader from '../modules/company/loader';
import { Screen as PersonalDataScreen } from '../modules/personal-data';
import { Screen as RegistrationByInvitationScreen } from '../modules/user/RegistrationByInvitation';
import { Screen as PrivacyPolicyScreen } from '../modules/privacy-policy';
import { Screen as CookiesScreen } from '../modules/cookies';
import { Loader as VGMLoader, Screen as VGMScreen } from '../modules/vgm';
import { CustomsDeclarationLoader, CustomsDeclarationScreen, CustomsDeclarationDetailLoader, CustomsDeclarationDetailScreen } from '../modules/customs-declaration';
import { CustomsDeclarationManagerLoader, CustomsDeclarationManagerScreen, CustomsDeclarationDetailManagerLoader, CustomsDeclarationDetailManagerScreen } from '../modules/customs-declaration';
import { Loader as CustomsDeclarationManagerChartsLoader, Screen as CustomsDeclarationManagerChartsScreen } from '../modules/customs-declaration/manager/Charts';
import { Loader as CustomsDeclarationManagerAccessRightsLoader, Screen as CustomsDeclarationManagerAccessRightsScreen } from '../modules/customs-declaration/manager/AccessRights';
import { Loader as ScheduleLoader, Screen as ScheduleScreen } from '../modules/schedule';
import { Loader as ArchiveLoader, Screen as ArchiveScreen } from '../modules/archive';
import { LoaderList as IncidentsLoader, ScreenList as IncidentsScreen, LoaderNew as IncidentNewLoader, ScreenNew as IncidentNewScreen, LoaderDetail as IncidentDetailLoader, ScreenDetail as IncidentDetailScreen } from '../modules/incidents';
import { Loader as ReconciliationLoader, Screen as ReconciliationScreen } from '../modules/reconciliation-report';
import {
  Loader as ReconciliationReportsLoader,
  Screen as ReconciliationReportsScreen,
} from '../modules/reconciliation-reports';
import {
  Loader as ReconciliationReportsDetailedLoader,
  Screen as ReconciliationReportsDetailedScreen,
} from '../modules/reconciliation-reports-detailed';
import { Loader as ReconciliationDetailLoader, Screen as ReconciliationDetailScreen } from '../modules/reconciliation-report-detail';
import { Loader as DuplicateDocumentsLoader, Screen as DuplicateDocumentsScreen } from '../modules/duplicate-documents';
import { Loader as ReconciliationReportRequestsLoader, Screen as ReconciliationReportRequestsScreen } from '../modules/reconciliation-report-requests';
import { Loader as DuplicateDocumentsRequestsLoader, Screen as DuplicateDocumentsRequestsScreen } from '../modules/duplicate-documents-requests';
import { Loader as DuplicateDocumentsDetailLoader, Screen as DuplicateDocumentsDetailScreen } from '../modules/duplicate-documents-detail';
import { Loader as TrackingExportLoader, Screen as TrackingExportScreen } from '../modules/tracking-export/TrackingExportPage';
import { Loader as PaymentsLoader, Screen as PaymentsScreen } from '../modules/payments';
import { TaskQueueManagerLoader, TaskQueueManagerScreen, TaskQueueManagerDetailScreen } from '../modules/task-queue-manager';
import { Loader as UsersLoader, Screen as UserScreen} from '../modules/user-substitution';
import { TransitDeclarationListLoader } from '../modules/transit-declaration';
import { Loader as ChangePasswordLoader, Screen as ChangePasswordScreen } from '../modules/user/ChangePassword';
import { Loader as ChartsLoader, Screen as ChartsScreen } from '../modules/charts';
import { TrackingExportListLoader } from '../modules/tracking-export/TrackingExportTasks';
import { ArchiveTasksListLoader } from '../modules/archive/components/ArchiveTasks';
import { TplExportListLoader } from '../modules/tracking-export/TplExportTasks';
import { Loader as SubscriptionsLoader, Screen as SubscriptionsScreen } from '../modules/subscriptions';
import { Loader as AnonymousSubscriptionsLoader, Screen as AnonymousSubscriptionsScreen } from '../modules/subscriptions/anonymous';
import { Loader as SubscriptionsConfirmLoader, Screen as SubscriptionsConfirmScreen} from '../modules/subscriptions/confirm';
import { Loader as TrackingExportTemplatesLoader, Screen as TrackingExportTemplatesScreen } from '../modules/tracking-export/TrackingExportTemplates';
import { AutosuggestionsDetailLoader, AutosuggestionsDetailScreen, AutosuggestionsTableLoader, AutosuggestionsTableScreen } from '../modules/autosuggestions';

// import { Loader as MyRightsLoader, Screen as MyRightsScreen } from '../modules/my-rights/my-rights';
import {
  Loader as MyRightsLoader,
  Screen as MyRightsScreen,
} from '../modules/my-rights/MyRights';
import {
  Loader as NewRequestAccessFitLoader,
  Screen as NewRequestAccessFitScreen,
} from '../modules/my-rights/RequestAccessFit/NewRequestAccessFit';
import {
  Loader as RequestConnectMasterAccountsForCompanyLoader,
  Screen as RequestConnectMasterAccountsForCompanyScreen,
} from '../modules/my-rights/RequestAccessFit/RequestConnectMasterAccounts';
import {
  Loader as DetailedRequestsConnectMasterAccountsLoader,
  Screen as DetailedRequestsConnectMasterAccountsScreen,
} from '../modules/access-management/detailed-request-connect-master-accounts';
import {
  Loader as RequestConnectMasterAccountsLoader,
  Screen as RequestConnectMasterAccountsScreen,
} from '../modules/access-management/request-connect-master-accounts';
import { Loader as GenerateSALoader, Screen as GenerateSAScreen } from '../modules/my-rights/generate-sa';
import { Loader as GenerateMasterAccountLoader, Screen as GenerateMasterAccountScreen } from '../modules/my-rights/RequestAccessFit/GenerateMasterAccount';
import { Loader as NewCompanyLoader, Screen as NewCompanyScreen } from '../modules/my-rights/new-company';
import { Loader as UploadSALoader, Screen as UploadSAScreen } from '../modules/my-rights/upload-sa';
import {
  Loader as ListOfUsersLoader,
  Screen as ListOfUsersScreen,
} from '../modules/access-management/list-of-users';
import {
  Loader as DetailedUserPageLoader,
  Screen as DetailedUserPageScreen,
} from '../modules/access-management/detailed-user-page';
import {
  Loader as InviteUserPageLoader,
  Screen as InviteUserPageScreen,
} from '../modules/access-management/invite-user-page';
import {
  Loader as DetailedRequestsConnectManagerLoading,
  Screen as DetailedRequestsConnectManagerScreen,
} from '../modules/access-management/detailed-requests-connect-manager';
import {
  Loader as RequestConnectManagersLoader,
  Screen as RequestConnectManagersScreen,
} from '../modules/access-management/request-connect-managers';
import {
  Loader as HistoryChangesMyProfileLoader,
  Screen as HistoryChangesMyProfileScreen,
} from '../modules/user/HistoryChangesMyProfile';
import {
  Loader as HistoryChangesProfileLoader,
  Screen as HistoryChangesProfileScreen,
} from '../modules/access-management/history-changes-profile';

import { Loader as Order_23_2_Loader, Screen as Order_23_2_Screen } from '../modules/order-23.2'

import { default as NewUserPopup } from '../components/newUserPopup';
import { default as NewUserAgreement } from '../components/newUserAgreement';

import {compose} from 'redux'
import {connect} from 'react-redux'
import {isExpert, isSupervisor} from "../modules/customs-declaration/manager/Rights";

import {HistoryControlFromSubApp} from '../mixedApp/mixedAppInit'

import mixedApp from '../../lib/mixed-app-manager/dist'
import store from "../store";
import commonActions from "../actions";
import {
  CUSTOMS_INFORMATION_RIGHT, VIEW_ALL_REQUEST_RIGHT,
  VIEW_UNION_REQUEST_RIGHT,
} from '../common/accessmask';

/**
 * Переключает экраны, на основе значения redux store screen.type.  Ничего не показывает если значение отсутствует.
 */
const ScreenSwitcher = props => {

  const {screen} = props;

  // Это не лучший вариант
  // При переключении с калькулятора, сбрасываем фильтр
  if(screen && screen.type && screen.type !== "offers") {
    store.dispatch(commonActions.set([
      'calcForm', {},
    ]));
  }

  switch (screen && screen.type) {

    case 'login':
      return <LoginScreen {...props} />;

    case 'reset':
      return <ResetScreen {...props} />;

    case 'setPassword':
      return <SetScreen {...props} />;


    case 'offers':
      // mode.iframe - режим работы в iframe в форме CRM
      if (screen.mode) {
        if (screen.mode.iframe) {
          return <OffersScreen {...props} />;
        } else {
          return null;
        }
      } else {
        return (
          <Layout>
            <NewUserPopup {...props} />
            <NewUserAgreement {...props} />
            <OffersScreen {...props} />
          </Layout>
        );
      }

    // Zork: Мы решили отказаться от отдельного раздела для запросов на квотирование. Оно будет частью создания Заявки
    // case 'quota':
    //   return <Layout><QuotaScreen {...props} /></Layout>;
    // case 'quotas':
    //   return <Layout><QuotasScreen {...props} /></Layout>;

    case 'agreements':
      return (
        <Layout>
          <NewUserAgreement {...props} />
          <AgreementsScreen {...props} />
        </Layout>
      );
    case 'newAgreement':
      return <Layout><NewAgreementScreen {...props}/></Layout>;
    case 'newStandardAgreement':
      return <Layout><NewStandardAgreementScreen {...props}/></Layout>;
    case 'newNonStandardAgreement':
      return <Layout><NewNonStandardAgreementScreen {...props}/></Layout>;
    case 'agreementsUnderApproval':
      return (
        <Layout>
          <AgreementsUnderApprovalScreen {...props} />
        </Layout>
      );
    case 'requestClarificationOrRefusal':
      return (
        <Layout>
          <RequestClarificationOrRefusalScreen {...props} />
        </Layout>
      );
    case 'contactingManager':
      return (
        <Layout>
          <ContactingManagerScreen {...props} />
        </Layout>
      );

    case 'invoices':
      return <Layout><InvoicesScreen {...props} /></Layout>;
    case 'statementsHistory':
      console.log("rendering this");
      return <Layout><StatementsHistoryScreen {...props}/></Layout>;
    case 'statements':
      return <Layout><StatementsScreen {...props}/></Layout>;
    case 'registrations':
      return <Layout><RegistrationsScreen {...props} /></Layout>;
    case 'setuser':
      return <Layout><UserScreen {...props} /></Layout>;
    case 'request':
      return <Layout><RequestScreen {...props} /></Layout>;
    case 'requests':
      return <Layout><RequestsScreen {...props} /></Layout>;
    case 'adminOrders':
      return <Layout><AdminOrdersScreen {...props} /></Layout>;
    case 'adminFtHistory':
      return <Layout><AdminFTHistoryScreen {...props} /></Layout>;
    case 'adminAgreements':
      return <Layout><AdminAgreementsScreen {...props} /></Layout>;
    case 'adminMonitoring':
      return <Layout><AdminMonitoringScreen {...props} /></Layout>;
    case 'adminDistribution':
      return <Layout><AdminDistributionScreen {...props} /></Layout>;
    case 'adminBannersList':
      return <Layout><AdminBannersListScreen {...props} /></Layout>;
    case 'adminBannersDetail':
      return <Layout><AdminBannersDetailScreen {...props} /></Layout>;
    case 'adminBannersNew':
      return <Layout><AdminBannersNewScreen {...props} /></Layout>;
    case 'newOrder':
      return <Layout><NewOrderScreen {...props}/></Layout>;
    case 'vgm':
      return <Layout><NewUserPopup {...props} /><VGMScreen {...props}/></Layout>;
    case 'customs-declaration':
      return <Layout><CustomsDeclarationScreen {...props}/></Layout>;
    case 'customs-declaration-detail':
      return <Layout><CustomsDeclarationDetailScreen {...props}/></Layout>;
    case 'customs-declaration-manager':
      return <Layout><CustomsDeclarationManagerScreen {...props}/></Layout>;
    case 'customs-declaration-manager-charts':
      return <Layout><CustomsDeclarationManagerChartsScreen {...props}/></Layout>;
    case 'customs-declaration-manager-access-rights':
      return <Layout><CustomsDeclarationManagerAccessRightsScreen {...props}/></Layout>;
    case 'customs-declaration-detail-manager':
      return <Layout><CustomsDeclarationDetailManagerScreen {...props}/></Layout>;
    case 'schedule':
      return <Layout><ScheduleScreen {...props}/></Layout>;
    case 'archive':
      return <Layout><ArchiveScreen {...props}/></Layout>;
    case 'incidents':
      return <Layout><IncidentsScreen {...props}/></Layout>;
    case 'newIncident':
      return <Layout><IncidentNewScreen {...props}/></Layout>;
    case 'incident':
      return <Layout><IncidentDetailScreen {...props}/></Layout>;
    case 'reconciliation':
      return <Layout><ReconciliationScreen {...props}/></Layout>;
    case 'reconciliation-reports':
      return (
        <Layout>
          <ReconciliationReportsScreen {...props} />
        </Layout>
      );
    case 'reconciliation-reports-detailed':
      return (
        <Layout>
          <ReconciliationReportsDetailedScreen {...props} />
        </Layout>
      );
    case 'reconciliationDocument':
      return <Layout><ReconciliationDetailScreen {...props}/></Layout>;
    case 'duplicateDocuments':
      return <Layout><DuplicateDocumentsScreen {...props}/></Layout>;
    case 'reconciliationReportRequests':
      return <Layout><ReconciliationReportRequestsScreen {...props}/></Layout>;
    case 'duplicateDocumentsRequests':
      return <Layout><DuplicateDocumentsRequestsScreen {...props}/></Layout>;
    case 'duplicateDocument':
      return <Layout><DuplicateDocumentsDetailScreen {...props}/></Layout>;
    case 'taskQueueManager':
      return <Layout><TaskQueueManagerScreen {...props}/></Layout>;
    case 'taskQueueManagerDetail':
      return <Layout><TaskQueueManagerDetailScreen {...props}/></Layout>;
    case 'trackingExport':
      return <Layout><TrackingExportScreen {...props}/></Layout>;
    case 'trackingExportTemplates':
      return <Layout><TrackingExportTemplatesScreen {...props}/></Layout>;
    case 'autosuggestions':
      return <Layout><AutosuggestionsTableScreen {...props}/></Layout>;
    case 'autosuggestion':
      return <Layout><AutosuggestionsDetailScreen {...props}/></Layout>;
    case 'payments':
      return <Layout><PaymentsScreen {...props}/></Layout>;
    case 'changePassword':
      return <Layout><ChangePasswordScreen {...props}/></Layout>;
    case 'charts':
      return <Layout><ChartsScreen {...props}/></Layout>;
    case 'my-rights':
      return (
        <Layout>
          <MyRightsScreen {...props} />
        </Layout>
      );
    case 'generate-master-account':
      return (
        <Layout>
          <GenerateMasterAccountScreen {...props} />
        </Layout>
      );
    case 'new-request-access-fit':
      return (
        <Layout>
          <NewRequestAccessFitScreen {...props} />
        </Layout>
      );
    case 'request-connect-master-accounts-for-company':
      return (
        <Layout>
          <RequestConnectMasterAccountsForCompanyScreen {...props} />
        </Layout>
      );
    case 'request-connect-master-accounts':
      return (
        <Layout>
          <RequestConnectMasterAccountsScreen {...props} />
        </Layout>
      );
    case 'detailed-requests-connect-master-accounts':
      return (
        <Layout>
          <DetailedRequestsConnectMasterAccountsScreen {...props} />
        </Layout>
      );
    case 'list-of-users':
      return (
        <Layout>
          <ListOfUsersScreen {...props} />
        </Layout>
      );
    case 'detailed-user-page':
      return (
        <Layout>
          <DetailedUserPageScreen {...props} />
        </Layout>
      );
    case 'invite-user-page':
      return (
        <Layout>
          <InviteUserPageScreen {...props} />
        </Layout>
      );
    case 'request-connect-managers':
      return (
        <Layout>
          <RequestConnectManagersScreen {...props} />
        </Layout>
      );
    case 'detailed-requests-connect-manager':
      return (
        <Layout>
          <DetailedRequestsConnectManagerScreen {...props} />
        </Layout>
      );
    case 'history-changes-my-profile':
      return (
        <Layout>
          <HistoryChangesMyProfileScreen {...props} />
        </Layout>
      );
    case 'history-changes-profile':
      return (
        <Layout>
          <HistoryChangesProfileScreen {...props} />
        </Layout>
      );
    case 'subscriptions':
      return <Layout><SubscriptionsScreen {...props}/></Layout>;
    case 'subscriptions-anonymous':
      return <Layout><AnonymousSubscriptionsScreen {...props}/></Layout>;
    case 'generate-sa':
      return <Layout><GenerateSAScreen {...props}/></Layout>;
    case 'new-company':
      return <Layout><NewCompanyScreen {...props}/></Layout>;
    case 'upload-sa':
      return <Layout><UploadSAScreen {...props}/></Layout>;
    case 'subscription-confirm':
      return <Layout><SubscriptionsConfirmScreen {...props}/></Layout>;
    case 'order-23.2':
      return <LayoutNoBreadcrumps><Order_23_2_Screen {...props}/></LayoutNoBreadcrumps>;
  }
  return null;
};
const ScreenSwitcherHOC = compose(
  withRouter, // need to prevent update blocking
  connect(state => (
    {
      screen: state.app.screen,
      state: state.app
    }
  )),
)(ScreenSwitcher);
ScreenSwitcherHOC.displayName = 'ScreenSwitcherHOC';

const RoutingTable = props => {
  let hideLiveTex = mixedApp.storage.getItem('hideLiveTex');

  const {screen, user, rights, userRight} = props;

  const { accessMask: access = {} } = user || {};
  const isRequestsDisabled = ((access.CL & VIEW_UNION_REQUEST_RIGHT) === 0)
    && ((access.SS & VIEW_UNION_REQUEST_RIGHT) === 0);
  const isCustomsInformationDisabled = (access.CL & CUSTOMS_INFORMATION_RIGHT) === 0;
  const isAllRequestsDisabled = ((access.CL & VIEW_ALL_REQUEST_RIGHT) === 0)
  && ((access.SS & VIEW_ALL_REQUEST_RIGHT) === 0);

  return (
    <BrowserRouter>
      <div>
        <HistoryControlFromSubApp />
        <Switch> {/*при переходе на выбранный route, не поисходит изменение экрана - а только начинается загрузка данных для экрана*/}
          {!user && <Route path="/login" component={LoginLoader}/>}
          {!user && <Route path="/registration" component={LoginLoader}/>}
          {!user && <Route path="/forgot" component={LoginLoader}/>}
          <Route path="/reset/:token" component={ResetLoader}/>
          <Route path="/setpassword" component={SetLoader}/>
          <Route path="/personal-data" component={PersonalDataScreen}/>
          <Route
            path="/invitation/:id"
            component={RegistrationByInvitationScreen}
          />
          <Route path="/privacy-policy" component={PrivacyPolicyScreen}/>
          <Route path="/cookies" component={CookiesScreen}/>

          <Route path='/upload' component={UploadScreen}/> {/*// TODO: zork: У нас отдельный экран для загрузки файлов?*/}
          <Route path="/subscription-confirm" component={SubscriptionsConfirmLoader}/>
          <Route path="/manage-subscriptions/:token" component={AnonymousSubscriptionsLoader}/>

          {!user &&
            <Switch>
              <Route exact path="/" render={(props) => {
                return (
                  <Breadcrumb level={1} path="/offers" {...props}>
                    <OffersLoader {...props} viewMode="public" />
                  </Breadcrumb>
                )
              }} />
              <Route path="/offers" render={(props) => {
                return (
                  <Breadcrumb level={1} path="/offers" {...props}>
                    <OffersLoader {...props} viewMode="public" />
                  </Breadcrumb>
                )
              }} />
              <BreadcrumbRoute level={1} path='/vgm' component={VGMLoader}/>
              <BreadcrumbRoute level={1} path='/vgm-public' component={VGMLoader}/>
              <Redirect to={`/login?url=${encodeURIComponent(window.location.pathname + window.location.search)}`} />
            </Switch>
          }

          {/* Если нет даты задания пароля */}
          {user && !user.passChangeDate && <Switch>
            <Route path="/setpassword" component={SetLoader}/>

            <Redirect to="/setpassword"/>
          </Switch>}

          {/* Если есть дата задания пароля */}
          {user && (user.passChangeDate || !user.hasOwnProperty('passChangeDate')) && <Switch>

            <Route exact path="/" render={(props) => {
              return (
                <Breadcrumb level={1} path="/offers" {...props}>
                  <OffersLoader {...props} viewMode={props.location.state && props.location.state.viewMode} />
                </Breadcrumb>
              )
            }} />

            <Route path="/offers" render={(props) => {
              return (
                <Breadcrumb level={1} path="/offers" {...props}>
                  <OffersLoader {...props} viewMode={props.location.state && props.location.state.viewMode} />
                </Breadcrumb>
              )
            }} />
            // Администрирование ЛК
            {userRight && userRight.lkAdmin && userRight.lkAdmin.all && <BreadcrumbRoute level={2} path='/administrator/orders' component={AdminOrdersLoader}/>}
            {userRight && userRight.lkAdmin && (userRight.lkAdmin.all || userRight.lkAdmin.ft) && <BreadcrumbRoute level={2} path='/administrator/ft_history' component={AdminFTHistoryLoader}/>}
            {userRight && userRight.lkAdmin && (userRight.lkAdmin.all || userRight.lkAdmin.ft) && <BreadcrumbRoute level={2} path='/administrator/agreement' component={AdminAgreementsLoader}/>}
            {userRight && userRight.lkAdmin && userRight.lkAdmin.all && <BreadcrumbRoute level={2} path='/administrator/distribution' component={AdminDistributionLoader}/>}
            {userRight && userRight.lkAdmin && userRight.lkAdmin.all && <BreadcrumbRoute level={3} path='/administrator/banners/new' component={AdminBannersNewLoader}/>}
            {userRight && userRight.lkAdmin && userRight.lkAdmin.all && <BreadcrumbRoute level={3} path='/administrator/banners/edit/:id' component={AdminBannersDetailLoader}/>}
            {userRight && userRight.lkAdmin && userRight.lkAdmin.all && <BreadcrumbRoute level={2} path='/administrator/banners' component={AdminBannersListLoader}/>}
            {/*{userRight && userRight.lkAdmin && userRight.lkAdmin.all && <BreadcrumbRoute level={2} path='/administrator/monitoring' component={AdminMonitoringLoader}/>}*/}
            {/*{user && user.manager === true && <BreadcrumbRoute level={1} path='/administrator/registrations' component={RegistrationsLoader}/>}*/}
            {userRight && userRight.lkAdmin && userRight.lkAdmin.all && <BreadcrumbRoute level={1} path='/administrator' component={AdminOrdersLoader}/>}
            }
            // Мои заявки
            // Из-за ДРТ заявок, несколько маршрутов пришлось вынести и дать к ним доступ без прав
            {<BreadcrumbRoute level={2} path='/requests/new/drt' component={NewOrderLoader} isDrt={true} />}
            {<BreadcrumbRoute level={2} path="/requests/drt/:reqUid" component={RequestLoader} isDrt={true}/>}
            {<BreadcrumbRoute level={2} path="/requests/q/:id" component={DraftLoader} />}
            {!isRequestsDisabled && <BreadcrumbRoute level={3} path='/requests/autosuggestions/:id' component={AutosuggestionsDetailLoader}/>}
            {!isRequestsDisabled && <BreadcrumbRoute level={2} path='/requests/autosuggestions' component={AutosuggestionsTableLoader}/>}
            {!isRequestsDisabled && <BreadcrumbRoute level={1} path='/requests' component={RequestsLoader}/>}
            {<BreadcrumbRoute level={1} path='/requests/' component={RequestListLoader}/>}

            <BreadcrumbRoute level={2} path='/agreements/standard/:id?/:step?' component={NewStandardAgreementLoader}/>
            <BreadcrumbRoute level={2} path='/agreements/nonstandard' component={NewNonStandardAgreementLoader}/>
            <BreadcrumbRoute level={2} path='/agreements/new' component={NewAgreementLoader}/>
            <BreadcrumbRoute level={2} path='/agreements/approval' component={AgreementsUnderApprovalLoader}/>
            <BreadcrumbRoute level={2} path='/agreements/explanation/:id?' component={RequestClarificationOrRefusalLoader}/>
            <BreadcrumbRoute level={2} path='/agreements/communication/:id?' component={ContactingManagerLoader}/>
            <BreadcrumbRoute level={1} path='/agreements' component={AgreementsLoader}/>

            <BreadcrumbRoute level={1} path='/invoices/statements/history/:client' component={StatementsHistoryLoader} />

            {!isAllRequestsDisabled && <BreadcrumbRoute level={1} path='/invoices/statements' component={StatementsLoader} />}
            {!isAllRequestsDisabled && <BreadcrumbRoute level={1} path='/invoices/binding' component={PaymentsLoader}/>}

            <BreadcrumbRoute level={1} path='/invoices/:type?' component={InvoicesLoader}/>
            {false ? <BreadcrumbRoute level={1} path='/setuser' component={UsersLoader}/>: null}
            <BreadcrumbRoute level={1} path='/vgm' component={VGMLoader}/>

            {Boolean(user && (!isCustomsInformationDisabled || user.manager)) && <BreadcrumbRoute level={1} path='/customs-declaration/export-jobs' component={TransitDeclarationListLoader}/>}
            {Boolean(user && user.features && user.features.declarant) && <BreadcrumbRoute level={1} path='/manager/customs-declaration/export-jobs' component={TplExportListLoader}/>}
            {Boolean(user && user.features && user.features.declarant && user.features.declarant.supervisor) && <BreadcrumbRoute exact level={1} path='/manager/customs-declaration/access-rights' component={CustomsDeclarationManagerAccessRightsLoader}/>}
            {Boolean(user && user.features && user.features.declarant) && <BreadcrumbRoute exact level={1} path='/manager/customs-declaration/charts' component={CustomsDeclarationManagerChartsLoader}/>}
            {Boolean(user && user.features && user.features.declarant) && <BreadcrumbRoute level={2} path="/manager/customs-declaration/detail/:id" component={CustomsDeclarationDetailManagerLoader}/>}
            {Boolean(user && user.features && user.features.declarant) && <BreadcrumbRoute exact level={1} path='/manager/customs-declaration' component={CustomsDeclarationManagerLoader}/>}
            {Boolean(user && (!isCustomsInformationDisabled || user.manager)) && <BreadcrumbRoute level={1} path='/customs-declaration' component={CustomsDeclarationLoader}/>}
            {/*<BreadcrumbRoute level={1} path='/manager' component={CustomsDeclarationManagerLoader}/>*/}

            <BreadcrumbRoute level={1} path='/schedule' component={ScheduleLoader}/>
            <BreadcrumbRoute level={1} path='/archive/jobs' component={ArchiveTasksListLoader}/>
            <BreadcrumbRoute level={2} path='/archive/duplicate-documents-requests/:id' component={DuplicateDocumentsDetailLoader}/>
            <BreadcrumbRoute level={1} path='/archive/duplicate-documents' component={DuplicateDocumentsLoader}/>
            <BreadcrumbRoute level={2} path='/archive/reconciliation-report-requests/:id' component={ReconciliationDetailLoader}/>

            <BreadcrumbRoute level={1} path='/archive/reconciliation-report-requests' component={ReconciliationReportRequestsLoader}/>
            <BreadcrumbRoute level={1} path='/archive/duplicate-documents-requests' component={DuplicateDocumentsRequestsLoader}/>
            <BreadcrumbRoute level={1} path='/archive/duplicate-documents' component={DuplicateDocumentsLoader}/>
            <BreadcrumbRoute level={1} path='/archive/reconciliation' component={ReconciliationLoader}/>
            <BreadcrumbRoute level={2} path='/archive/reconciliation-reports/:id' component={ReconciliationReportsDetailedLoader}/>
            <BreadcrumbRoute level={1} path='/archive/reconciliation-reports' component={ReconciliationReportsLoader}/>
            <BreadcrumbRoute level={1} path='/archive' component={ArchiveLoader}/>
            <BreadcrumbRoute level={2} path='/incidents/detail/:id' component={IncidentDetailLoader}/>
            <BreadcrumbRoute level={2} path='/incidents/new' component={IncidentNewLoader}/>
            <BreadcrumbRoute level={1} path='/incidents' component={IncidentsLoader}/>

            <BreadcrumbRoute level={1} path='/tasks' component={TaskQueueManagerLoader}/>

            <BreadcrumbRoute level={1} path='/terminal-tracking-export/templates' component={TrackingExportTemplatesLoader}/>
            <BreadcrumbRoute level={1} path='/terminal-tracking-export/newjob' component={TrackingExportLoader}/>
            <BreadcrumbRoute level={1} path='/terminal-tracking-export' component={TrackingExportListLoader}/>
            <BreadcrumbRoute level={1} path='/change-password' component={ChangePasswordLoader}/>

            <BreadcrumbRoute level={1} path='/history-changes-to-my-profile' component={HistoryChangesMyProfileLoader}/>

            {false ? <BreadcrumbRoute level={1} path='/charts' component={ChartsLoader}/>: null}

            <BreadcrumbRoute level={2} path='/my-access/generate-master-account/:id?/:step?' component={GenerateMasterAccountLoader}/>
            <BreadcrumbRoute level={2} path='/my-access/new-request-access-fit' component={NewRequestAccessFitLoader}/>
            <BreadcrumbRoute level={2} path='/my-access/request/master-account/:company_id' component={RequestConnectMasterAccountsForCompanyLoader}/>
            <BreadcrumbRoute level={2} path='/my-access/generate-sa' component={GenerateSALoader}/>
            <BreadcrumbRoute level={2} path='/my-access/new-company' component={NewCompanyLoader}/>
            <BreadcrumbRoute level={2} path='/my-access/upload-sa/:id' component={UploadSALoader}/>
            <BreadcrumbRoute level={1} path='/my-access' component={MyRightsLoader}/>

            <BreadcrumbRoute level={2} path='/access-management/list-of-users/invite-user' component={InviteUserPageLoader}/>
            <BreadcrumbRoute level={2} path='/access-management/list-of-users/user-page/:id' component={DetailedUserPageLoader}/>
            <BreadcrumbRoute level={1} path='/access-management/list-of-users' component={ListOfUsersLoader}/>
            <BreadcrumbRoute level={1} path='/access-management/requests-connect-master-accounts/:id' component={DetailedRequestsConnectMasterAccountsLoader}/>
            <BreadcrumbRoute level={1} path='/access-management/requests-connect-master-accounts' component={RequestConnectMasterAccountsLoader}/>
            <BreadcrumbRoute level={2} path='/access-management/requests-connect-managers/:id' component={DetailedRequestsConnectManagerLoading}/>
            <BreadcrumbRoute level={1} path='/access-management/requests-connect-managers' component={RequestConnectManagersLoader}/>
            <BreadcrumbRoute level={1} path='/access-management/history-changes-profile' component={HistoryChangesProfileLoader}/>

            <BreadcrumbRoute level={1} exact path='/subscriptions' component={SubscriptionsLoader}/>

            <Route path="/232" component={Order_23_2_Loader}/>

            <Redirect to="/"/>
          </Switch>}
        </Switch>

        <ScreenSwitcherHOC />
        <RouteHook />
        <CompaniesLoader refreshParam={props.refreshParam}/>
        {!hideLiveTex && user && <LiveTex />}

        <ToastContainer />

      </div>
    </BrowserRouter>
  );
};

const RoutingTableHOC = compose(
  connect(userActions._injectUser),
  connect(state => ({
      screen: state.app.screen,
      refreshParam: state.app.refreshParam,
      token: state.app && state.app.session && state.app.session.token,
      userRight: state.app && state.app.rights
    }
    )),
  (Component) => props => {
    const rights = [];
    if (props.user) {
      rights.push('offers', 'request', 'agreements', 'invoices', 'quotas');
    } else {
      rights.push('offers');
    }

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
)(RoutingTable);
RoutingTableHOC.displayName = 'RoutingTable';

export default RoutingTableHOC;

