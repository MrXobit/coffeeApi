const admin = require('firebase-admin');
const ApiError = require('../error/ApiError');
const paymentsService = require('./payments-service');
const { getUidFromToken } = require('../utils/auth-utils');


class PaymentsController { 
    async subscriptionsCreate(req, res) {
        // Продавец создаёт подписку, указывая параметры
        try {
            // const uid = await getUidFromToken(req);
            // if (!uid) {
            //     return res.status(400).json({ error: 'Invalid UID' });
            // } 
            const uid = "r0NiBNhCCseXoonu6eXBrkinyq02"
            const { title, duration, cups, price, currency, coffeeTypes, cafeId} = req.body;
            const subscriptionsData = await paymentsService.subscriptionsCreate(
                title, duration, cups, price, currency, uid, coffeeTypes, cafeId
            );
    
            return res.json(subscriptionsData);
        } catch (e) {
            if (e instanceof ApiError) {
                return res.status(e.status).json({ 
                    message: e.message, 
                    errors: e.errors 
                });
            }

            return res.status(500).json({ 
                message: "Internal server error. Please try again later." 
            });
        }
    }


    async subscriptionsEdit(req, res) {
        // Продавец создаёт подписку, указывая параметры
        try {
            // const uid = await getUidFromToken(req);
            // if (!uid) {
            //     return res.status(400).json({ error: 'Invalid UID' });
            // } 
            const uid = "r0NiBNhCCseXoonu6eXBrkinyq02"
            const {title, duration, cups, price, currency, coffeeTypes, cafeId, subscriptionId} = req.body;
            const subscriptionsEditData = await paymentsService.subscriptionsEdit(
                title, duration, cups, price, currency, coffeeTypes, cafeId, subscriptionId, uid
            );
    
            return res.json(subscriptionsEditData);
        } catch (e) {
            if (e instanceof ApiError) {
                return res.status(e.status).json({ 
                    message: e.message, 
                    errors: e.errors 
                });
            }

            return res.status(500).json({ 
                message: "Internal server error. Please try again later." 
            });
        }
    }
    
        
    async getSubscriptions(req, res) {
        // Получение списка всех подписок конкретного продавца.
        try {
            // const uid = await getUidFromToken(req);
            // if (!uid) {
            //     return res.status(400).json({ error: 'Invalid UID' });
            // } 
            const count = parseInt(req.query.count);
            const offset = parseInt(req.query.offset);
            const uid = "MfsZIVVtKHeEO97QbGrHO0cpDYt1";
    
            const subscriptionsData = await paymentsService.getSubscriptions(uid, count, offset);
    
            return res.json(subscriptionsData);
        } catch (e) {
            if (e instanceof ApiError) {
                return res.status(e.status).json({
                    message: e.message,
                    errors: e.errors
                });
            }
    
            return res.status(500).json({
                message: "Internal server error. Please try again later."
            });
        }
    }
    
        
    async deleterSubscriptions(req, res) {
        // Удаление подписки продавцом.
        try {
            // const uid = await getUidFromToken(req);
            // if (!uid) {
            //     return res.status(400).json({ error: 'Invalid UID' });
            // } 
            const uid = "MfsZIVVtKHeEO97QbGrHO0cpDYt1";
            const pathSegments = req.path.split('/');
            const DeleterSubscriptionId = pathSegments[pathSegments.length - 1];
            console.log("DeleterSubscriptionId" + DeleterSubscriptionId)
            const DeleterSubscription = await paymentsService.deleterSubscriptions(uid, DeleterSubscriptionId);
            return res.json(DeleterSubscription);
        } catch (e) {
            if (e instanceof ApiError) {
                return res.status(e.status).json({
                    message: e.message,
                    errors: e.errors
                });
            }
            return res.status(500).json({
                message: "Internal server error. Please try again later."
            });
        }
    }
    
        
           async paymentsPurchase (req, res) {
        //Создаёт платёж в PayPal, обрабатывает оплату и автоматически переводит 95% продавцу.
        try {
            // const uid = await getUidFromToken(req);
            // if (!uid) {
            //     return res.status(400).json({ error: 'Invalid UID' });
            // } 
            const {amount, currency, seller_email} = req.body
            const paymentsPurchase1 = await paymentsService.paymentsPurchase(amount, currency, seller_email);
            return res.json(paymentsPurchase1);
        } catch (e) {
            if (e instanceof ApiError) {
                return res.status(e.status).json({
                    message: e.message,
                    errors: e.errors
                });
            }
            return res.status(500).json({
                message: "Internal server error. Please try again later."
            });
        }
           }
        
           async paymentsWebhook (req, res) {
        // Принимает уведомления от PayPal о статусе платежей.
        try {
            const { event_type, resource } = req.body;
            const paymentsWebhook1 = await paymentsService.paymentsWebhook(event_type, resource);
            return res.json(paymentsWebhook1);
        } catch (e) {
            if (e instanceof ApiError) {
                return res.status(e.status).json({
                    message: e.message,
                    errors: e.errors
                });
            }
            return res.status(500).json({
                message: "Internal server error. Please try again later."
            });
        }
           }
        
        //    async payoutsSend () {
        // // Отправляет 95% суммы подписки продавцу.
        //    }
        
           async payoutsStatus (req, res) {
        // Проверяет статус выплаты продавцу.
        try {
            const { payout_id } = req.body;
            const payoutsStatus1 = await paymentsService.payoutsStatus(payout_id);
            return res.json(payoutsStatus1);
        } catch (e) {
            if (e instanceof ApiError) {
                return res.status(e.status).json({
                    message: e.message,
                    errors: e.errors
                });
            }
            return res.status(500).json({
                message: "Internal server error. Please try again later."
            });
        }
           }
}

module.exports = new PaymentsController(); 