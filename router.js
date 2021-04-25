import { Router } from 'express';
import bodyParser from 'body-parser';
import moment from 'moment';
import { missingService } from '../../common/services';
import { Statistics } from '../statistics';
import { FescoTrans } from '../orders/fescoTrans';

export const adminRouter = (services) => {
  const router = Router({ mergeParams: true });
  const {
    postgres = missingService('postgres'),
    orders: ordersService = missingService('orders'),
  } = services;
  const rights = require('../../services/rights/index').default(services);
  const statistics = new Statistics(services);

  router.get('/agreements', bodyParser.json(), async (req, res) => {
    try {
      const params = req.query || {};
      const { offset, limit } = params;

      const { rows: selectResult } = await postgres.exec({
        statement: `SELECT number,barcode,data,status,last_status_timestamp FROM agreements
        ORDER BY last_status_timestamp DESC
        OFFSET ${offset} LIMIT ${limit};`,
      });

      const { ...rows } = await postgres.exec({
        statement: `SELECT COUNT(*) FROM agreements`,
      });


      console.log(rows);
      res.json({ data: selectResult, rows });
    } catch (e) {
      console.error('error', e);
      res.json({ status: 'error', data: 'Ошибка запроса' });
    }
  });

  // Переотправка письма по заявке
  router.post('/resendMessage', bodyParser.json(), async (req, res) => {
    const context = req.context ? req.context : req.user;
    const { orderId, isShipping } = req.body;
    if (!orderId) {
      res.json({ status: 'error', data: 'Некорректные данные' });
      return;
    }
    try {
      // Проверяем, что пользователь действительно администратор
      const isAdmin = await rights._isAdminLK(context);
      if (isAdmin) {
        // Проверяем наличие такой заявки
        const { rows: selectResult } = await postgres.exec({
          context,
          statement: `SELECT * FROM orders WHERE requid=$1`,
          params: [orderId],
        });
        const data = (selectResult && selectResult[0]) || false;
        // Если такая заявка есть, отправляем письмо
        if (data) {
          if (!isShipping) {
            console.debug(`resend message for requid ${orderId}`);
            ordersService._sendNotification(data, context);
          } else {
            console.debug(`resend shipping message for requid ${orderId}`);
            ordersService.sendSecondStageNotification({
              reqUid: orderId,
              userEmail: data.email,
              userName: data.username,
              selectedData: data.data,
              context,
            });
          }

          res.json({
            status: 'ok',
            data: 'Письмо поставлено в очередь на отправку',
          });
        } else {
          res.json({
            status: 'error',
            data: 'Заявка с таким идентификатором отсутствует в базе ЛК',
          });
          return;
        }
      } else {
        res.json({
          status: 'error',
          data: 'У вас нет прав на выполнение запроса',
        });
        return;
      }
    } catch (e) {
      console.error('error', e);
      res.json({ status: 'error', data: 'Ошибка запроса' });
    }
  });
  // Получение статистики по письмам
  router.post('/getStatistics', bodyParser.json(), async (req, res) => {
    const context = req.context ? req.context : req.user;
    const { dateFilter } = req.body;

    try {
      // Проверяем, что пользователь действительно администратор
      const isAdmin = await rights._isAdminLK(context);
      if (isAdmin) {
        let result = {};
        // Если установлен фильтр по дате, то проверяем больше ли она сегодняшнего дня
        if (dateFilter) {
          const date = moment(dateFilter).format('YYYY-MM-DD');
          const nowDate = moment().format('YYYY-MM-DD');
          // Если дата указана за сегодня
          if (nowDate === date) {
            // Отдаем данные на лету
            result = await statistics.collect(date);
            // если выбрали дату из прошлого, отдаем статистику из кэша
          } else if (new Date(nowDate) > new Date(date)) {
            result = await statistics.getStatistics(date);
            // Если дата - это будущее, то отдаем пустой объект
          } else {
            result = {};
          }
        } else {
          // Если фильтр по дате не передан, нужно отдать полную статистику за все время(из кэша)
          result = await statistics.getStatistics();
        }
        if (result) {
          const resultData = {
            'my@fesco.com': {
              emails: result.count_message_my,
              recipients: result.count_recipient_my,
            },
            'my2@fesco.com': {
              emails: result.count_message_my2,
              recipients: result.count_recipient_my2,
            },
            'my3@fesco.com': {
              emails: result.count_message_my3,
              recipients: result.count_recipient_my3,
            },
            'my4@fesco.com': {
              emails: result.count_message_my4,
              recipients: result.count_recipient_my4,
            },
            'my5@fesco.com': {
              emails: result.count_message_my5,
              recipients: result.count_recipient_my5,
            },
          };
          res.json({ status: 'ok', data: resultData });
        } else {
          res.json({ status: 'ok', data: {} });
        }
        return;
      }
      res.json({
        status: 'error',
        data: 'У вас нет прав на выполнение запроса',
      });
      return;
    } catch (e) {
      console.error('error', e);
      res.json({ status: 'error', data: 'Ошибка запроса' });
    }
  });
  router.post('/getOrders', bodyParser.json(), async (req, res) => {
    const context = req.context ? req.context : req.user;
    const { orderId, offset, limit, statusMessage, dateFilter } = req.body;
    try {
      // Проверяем, что пользователь действительно администратор
      const isAdmin = await rights._isAdminLK(context);
      const params = [];
      const paramsCount = [];
      let paramIdx = 1;
      if (isAdmin) {
        let select = `select *`;
        // Берем только заявки из ЛК
        let where = ' WHERE 1=1 ';
        if (orderId && orderId.length) {
          where += ` AND requid::text LIKE $${paramIdx++} `;
          params.push(`%${orderId.trim()}%`);
          paramsCount.push(`%${orderId.trim()}%`);
        }
        if (dateFilter) {
          const data = new Date(dateFilter);
          if (data) {
            const month =
              data.getMonth() + 1 >= 1 && data.getMonth() + 1 <= 9
                ? `0${data.getMonth() + 1}`
                : data.getMonth() + 1;
            const day =
              data.getDate() >= 1 && data.getDate() <= 9
                ? `0${data.getDate()}`
                : data.getDate();
            const dateFrom = `${data.getFullYear()}-${month}-${day} 00:00:00`;
            const dateTo = `${data.getFullYear()}-${month}-${day} 23:59:59`;
            where += ` AND (created_at >= $${paramIdx++}::timestamp AND created_at <= $${paramIdx++}::timestamp) `;
            params.push(`${dateFrom}`);
            paramsCount.push(`${dateFrom}`);
            params.push(`${dateTo}`);
            paramsCount.push(`${dateTo}`);
          }
        }

        select += ', count(*) OVER() ';

        if (statusMessage && statusMessage.length) {
          switch (statusMessage) {
            case 'Отправлено':
              where += ` AND ( status = 'Отправлено' ) `;
              break;
            case 'Отправляется':
              where += ` AND ( status = 'Отправляется' ) `;
              break;
            case 'Не отправлено':
              where += ` AND ( status = 'Не отправлено' )
             `;
              break;
          }
        }

        const offsetQuery = ` OFFSET $${paramIdx++} `;
        params.push(parseInt(offset));

        const limitQuery = ` LIMIT $${paramIdx++} `;
        params.push(parseInt(limit));

        const request = `
        ${select} from state_orders_cache
        ${where}
        order by created_at desc
        ${offsetQuery}
        ${limitQuery}
       `;
        const { rows: selectResult } = await postgres.exec({
          context,
          statement: request,
          params,
        });
        // Если такая заявка есть, отправляем письмо
        if (selectResult && selectResult.length) {
          const data = selectResult.map((request) => {
            const requestResultData = {
              StatusOrderMessage: request.max_sendordermessage,
              StatusCreateOrderMessage: request.max_createordermessage,
              StatusAttemptOrderMessage: request.count_attemptordermessage || 0,
              StatusShippingMessage: request.max_sendshippingmessage,
              StatusCreateShippingMessage: request.max_createshippingmessage,
              StatusAttemptShippingMessage:
                request.count_attemptshippingmessage || 0,
              StatusExternalOrder: request.max_externalorderscreate,
              StatusSendShipping: request.sendshipping,
              StatusSendOrder: request.sendorder,
              email: request.email,
              domains: {},
              cc_emails: request.cc_emails,
              type: request.request_type,
              requid: request.requid,
              requidLK: request.id,
              created: request.created_at,
            };
            if (request.domain_order) {
              requestResultData.domains.order = request.domain_order;
            }
            if (request.domain_shipping) {
              requestResultData.domains.shipping = request.domain_shipping;
            }
            return requestResultData;
          });
          res.json({
            status: 'ok',
            data: {
              orders: data,
              count: selectResult && selectResult[0] && selectResult[0].count,
            },
          });
        } else {
          res.json({ status: 'ok', data: { orders: [], count: 0 } });
          return;
        }
      } else {
        res.json({
          status: 'error',
          data: 'У вас нет прав на выполнение запроса',
        });
        return;
      }
    } catch (e) {
      console.error('error', e);
      res.json({ status: 'error', data: 'Ошибка запроса' });
    }
  });
  router.post('/getStationsAndPoints', bodyParser.json(), async (req, res) => {
    const context = req.context ? req.context : req.user;
    const {} = req.body;
    try {
      // Проверяем, что пользователь действительно администратор
      const isAdmin = await rights._isAdminLK(context);
      if (isAdmin) {
        const request = `
        select loc_uid,
           (CASE
               WHEN type = 'Station' AND parent_loc_name IS NOT NULL AND loc_softship_code IS NOT NULL
                   THEN concat_ws(', ', concat(loc_name, '(', loc_softship_code , ')'), parent_loc_name)
               WHEN type = 'Station' AND parent_loc_name IS NOT NULL
                   THEN concat_ws(', ', loc_name, parent_loc_name)
               WHEN type in ('City', 'Port') AND loc_softship_code IS NOT NULL
                    THEN concat(loc_name, '(', loc_softship_code , ')')
               ELSE loc_name
               END) as text,
           type
        from external_locations
        where type IN ('City', 'Station', 'Port')`;
        const { rows: selectResult } = await postgres.exec({
          context,
          statement: request,
        });

        if (selectResult && selectResult.length) {
          const stations = [];
          const points = [];
          selectResult.map((el) => {
            if (el.type === 'Station') {
              stations.push({
                value: el.loc_uid,
                text: el.text,
              });
            } else if (el.type === 'City' || el.type === 'Port') {
              points.push({
                value: el.loc_uid,
                text: el.text,
              });
            }
          });
          res.json({
            status: 'ok',
            data: {
              points,
              stations,
            },
          });
        } else {
          res.json({ status: 'ok', data: { points: [], stations: [] } });
          return;
        }
      } else {
        res.json({
          status: 'error',
          data: 'У вас нет прав на выполнение запроса',
        });
        return;
      }
    } catch (e) {
      console.error('error', e);
      res.json({ status: 'error', data: 'Ошибка запроса' });
    }
  });
  router.post('/getClients', bodyParser.json(), async (req, res) => {
    const context = req.context ? req.context : req.user;
    const {} = req.body;
    try {
      // Проверяем, что пользователь действительно администратор
      const isAdmin = await rights._isAdminLK(context);
      if (isAdmin) {
        const request = `
        select
           clnt_code as code,
           concat(company_name, ' (',clnt_code, ')') as text
        from external_clients
        where clnt_code IS NOT NULL

        `;
        const { rows: selectResult } = await postgres.exec({
          context,
          statement: request,
        });

        if (selectResult && selectResult.length) {
          const clients = [];
          selectResult.map((el) => {
            clients.push({
              value: el.code,
              text: el.text,
            });
          });
          res.json({
            status: 'ok',
            data: {
              clients,
            },
          });
        } else {
          res.json({ status: 'ok', data: { clients: [] } });
          return;
        }
      } else {
        res.json({
          status: 'error',
          data: 'У вас нет прав на выполнение запроса',
        });
        return;
      }
    } catch (e) {
      console.error('error', e);
      res.json({ status: 'error', data: 'Ошибка запроса' });
    }
  });
  router.post('/saveRuleMails', bodyParser.json(), async (req, res) => {
    const context = req.context ? req.context : req.user;
    const {
      containerType, // Тип контейнера
      emails, // Email адреса для рассылки
      lineType, // Тип линии
      pointFrom, // Пункт отправления
      pointTo, // Пункт назначения
      requestType, // Тип заявки
      stationFrom, // Станция отправления
      stationTo, // Станция назначения
      transportType, // Виде перевозки(импорт, экспорт)
      issetRoUid, // Наличие у заявки КП
      client, // Клиент
      country_from, // Страна
      country_to, // Страна
      vtt = null, // Признак ВТТ, 1- DDU, 0-DDP, null - не определено
      additional_service, // Доп услуга
      ruleId, // Если приходит параметр, значит нужно обновить правило
    } = req.body;
    try {
      // Проверяем, что пользователь действительно администратор
      const isAdmin = await rights._isAdminLK(context);
      if (isAdmin) {
        const params = [
          stationFrom,
          stationTo,
          pointFrom,
          pointTo,
          requestType,
          containerType,
          transportType,
          lineType,
          emails,
          issetRoUid,
          client,
          country_from,
          country_to,
          vtt,
          additional_service,
        ];
        let request = `insert into mailings_orders(station_from, station_to, point_from, point_to, request_type, container_type, transport_type, line_type, emails, isset_ro_uid, client,country_from, country_to, vtt, additional_service) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9, $10, $11, $12, $13, $14, $15)  RETURNING id`;
        if (ruleId && ruleId > 0) {
          params.push(ruleId);
          request = `UPDATE mailings_orders SET (station_from, station_to, point_from, point_to, request_type, container_type, transport_type, line_type, emails, isset_ro_uid, client, country_from, country_to, vtt, additional_service) = ($1,$2,$3,$4,$5,$6,$7,$8,$9, $10, $11, $12, $13, $14, $15) WHERE id=$16::int  RETURNING id`;
        }
        const { rows: selectResult } = await postgres.exec({
          context,
          statement: request,
          params,
        });

        if (selectResult && selectResult.length) {
          res.json({
            status: 'ok',
            data: selectResult[0].id,
          });
        } else {
          res.json({
            status: 'error',
            data: 'Произошла ошибка при сохранении правила',
          });
          return;
        }
      } else {
        res.json({
          status: 'error',
          data: 'У вас нет прав на выполнение запроса',
        });
        return;
      }
    } catch (e) {
      console.error('error', e);
      res.json({ status: 'error', data: 'Ошибка запроса' });
    }
  });
  router.post('/deleteRuleMails', bodyParser.json(), async (req, res) => {
    const context = req.context ? req.context : req.user;
    const {
      ruleId, // Если приходит параметр, значит нужно обновить правило
    } = req.body;
    try {
      // Проверяем, что пользователь действительно администратор
      const isAdmin = await rights._isAdminLK(context);
      if (isAdmin) {
        if (ruleId) {
          const params = [];
          params.push(ruleId);
          const request = `UPDATE mailings_orders SET active = FALSE WHERE id = $1::int`;
          const { rows: selectResult } = await postgres.exec({
            context,
            statement: request,
            params,
          });
          return res.json({
            status: 'ok',
            data: [],
          });
        }
        res.json({
          status: 'error',
          data: 'Передан некорректный идентификатор правила',
        });
        return;
      }
      res.json({
        status: 'error',
        data: 'У вас нет прав на выполнение запроса',
      });
      return;
    } catch (e) {
      console.error('error', e);
      res.json({ status: 'error', data: 'Ошибка запроса' });
    }
  });
  router.post('/getRulesMails', bodyParser.json(), async (req, res) => {
    const context = req.context ? req.context : req.user;
    const { offset, limit, filter } = req.body;

    try {
      // Проверяем, что пользователь действительно администратор
      const isAdmin = await rights._isAdminLK(context);
      if (isAdmin) {
        const params = [];
        const paramsCount = [];
        let paramIdx = 1;
        let where = ` where active <> FALSE `;

        if (filter && filter.station_from) {
          where += ` AND  station_from = $${paramIdx++}`;
          params.push(filter.station_from);
          paramsCount.push(filter.station_from);
        }
        if (filter && filter.station_to) {
          where += ` AND  station_to = $${paramIdx++}`;
          params.push(filter.station_to);
          paramsCount.push(filter.station_to);
        }
        if (filter && filter.point_from) {
          where += ` AND  point_from = $${paramIdx++}`;
          params.push(filter.point_from);
          paramsCount.push(filter.point_from);
        }
        if (filter && filter.point_to) {
          where += ` AND  point_to = $${paramIdx++}`;
          params.push(filter.point_to);
          paramsCount.push(filter.point_to);
        }
        if (filter && filter.request_type) {
          where += ` AND  request_type = $${paramIdx++}`;
          params.push(filter.request_type);
          paramsCount.push(filter.request_type);
        }
        if (filter && filter.container_type) {
          where += ` AND  container_type = $${paramIdx++}`;
          params.push(filter.container_type);
          paramsCount.push(filter.container_type);
        }
        if (filter && filter.line_type) {
          where += ` AND  line_type = $${paramIdx++}`;
          params.push(filter.line_type);
          paramsCount.push(filter.line_type);
        }
        if (filter && filter.isset_ro_uid) {
          where += ` AND  isset_ro_uid = $${paramIdx++}`;
          params.push(filter.isset_ro_uid);
          paramsCount.push(filter.isset_ro_uid);
        }
        if (filter && filter.client) {
          where += ` AND  client = $${paramIdx++}`;
          params.push(filter.client);
          paramsCount.push(filter.client);
        }
        if (filter && filter.email) {
          where += ` AND emails::varchar ILIKE $${paramIdx++}::varchar `;
          params.push(`%${filter.email}%`);
          paramsCount.push(`%${filter.email}%`);
        }
        if (filter && filter.country_from) {
          where += ` AND country_from = $${paramIdx++} `;
          params.push(filter.country_from);
          paramsCount.push(filter.country_from);
        }
        if (filter && filter.country_to) {
          where += ` AND country_to = $${paramIdx++} `;
          params.push(filter.country_to);
          paramsCount.push(filter.country_to);
        }
        if (
          filter &&
          filter.additional_service &&
          filter.additional_service.length
        ) {
          const addFilter = [];
          filter.additional_service.map((service) => {
            addFilter.push(
              `(additional_service::varchar ILIKE $${paramIdx++}::varchar )`
            );
            params.push(`%${service}%`);
            paramsCount.push(`%${service}%`);
          });

          where += ` AND ( ${addFilter.join(' OR ')} ) `;
        }
        const vttType = {
          0: 'DDP',
          1: 'DDU',
          2: 'ВРП',
        };
        if (filter && vttType[filter.vtt]) {
          where += ` AND vtt = $${paramIdx++} `;
          params.push(vttType[filter.vtt]);
          paramsCount.push(vttType[filter.vtt]);
        }
        const offsetQuery = ` OFFSET $${paramIdx++} `;
        params.push(parseInt(offset));

        const limitQuery = ` LIMIT $${paramIdx++} `;
        params.push(parseInt(limit));
        const request = `with locations as (
          SELECT loc_uid, loc_name from external_locations
          ), clients as (
          SELECT clnt_code, company_name from external_clients
          where clnt_code IS NOT NULL
          ), country as (
              SELECT country_name, country_latin_name,country_code from external_country
          )
          select
             (SELECT loc_name from locations where loc_uid = mo.station_from limit 1) as station_from,
             station_from as station_from_id,
             (SELECT loc_name from locations where loc_uid = mo.station_to limit 1) as station_to,
             station_to as station_to_id,
             (SELECT loc_name from locations where loc_uid = mo.point_from limit 1) as point_from,
             point_from as point_from_id,
             (SELECT loc_name from locations where loc_uid = mo.point_to limit 1) as point_to,
             point_to as point_to_id,
             request_type,
             container_type,
             transport_type,
             line_type,
             emails,
             (SELECT company_name from clients where clnt_code = mo.client limit 1) as client,
             (SELECT clnt_code from clients where clnt_code = mo.client limit 1) as client_id,
             (SELECT country_name from country where country_latin_name = mo.country_from limit 1) as country_from,
             (SELECT country_latin_name from country where country_latin_name = mo.country_from limit 1) as country_from_latin,
             (SELECT country_name from country where country_latin_name = mo.country_to limit 1) as country_to,
             (SELECT country_latin_name from country where country_latin_name = mo.country_to limit 1) as country_to_latin,
             isset_ro_uid,
             vtt,
             additional_service,
             id
          from mailings_orders mo
          ${where}
          order by created DESC
          ${offsetQuery}
          ${limitQuery}
        `;
        const requestCount = `select count(id) as cnt from mailings_orders ${where}`;

        const { rows: selectResult } = await postgres.exec({
          context,
          statement: request,
          params,
        });
        const { rows: selectCount } = await postgres.exec({
          context,
          statement: requestCount,
          params: paramsCount,
        });
        if (selectResult && selectResult.length) {
          res.json({
            status: 'ok',
            data: {
              rules: selectResult,
              count:
                (selectCount &&
                  selectCount[0] &&
                  selectCount[0].cnt &&
                  Number(selectCount[0].cnt)) ||
                0,
            },
          });
        } else {
          res.json({ status: 'ok', data: { rules: [], count: 0 } });
          return;
        }
      } else {
        res.json({
          status: 'error',
          data: 'У вас нет прав на выполнение запроса',
        });
        return;
      }
    } catch (e) {
      console.error('error', e);
      res.json({ status: 'error', data: 'Ошибка запроса' });
    }
  });

  return router;
};
