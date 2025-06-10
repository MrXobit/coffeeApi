const admin = require('firebase-admin');
const ApiError = require('../error/ApiError');
const paymentsService = require('./payments-service');
const { getUidFromToken } = require('../utils/auth-utils');

class PaymentsController { 
    async subscriptionsCreate(req, res) {
        // Продавец создаёт подписку, указывая параметры
        try {
            let uid;
            try {
                uid = await getUidFromToken(req);
                if (!uid) {
                    throw ApiError.BadRequest("Некорректный UID");
                }
            } catch (e) {
                throw ApiError.BadRequest("Некорректный UID");
            }
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
        try {
            let uid;
            try {
                uid = await getUidFromToken(req);
                if (!uid) {
                    throw ApiError.BadRequest("Некорректный UID");
                }
            } catch (e) {
                throw ApiError.BadRequest("Некорректный UID");
            }
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
            let uid;
            try {
                uid = await getUidFromToken(req);
                if (!uid) {
                    throw ApiError.BadRequest("Некорректный UID");
                }
            } catch (e) {
                throw ApiError.BadRequest("Некорректный UID");
            }
            const count = parseInt(req.query.count);
            const offset = parseInt(req.query.offset);
            const cafeId = req.query.cafeId;
            const subscriptionsData = await paymentsService.getSubscriptions(uid, count, offset, cafeId);
    
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
            let uid;
            try {
                uid = await getUidFromToken(req);
                if (!uid) {
                    throw ApiError.BadRequest("Некорректный UID");
                }
            } catch (e) {
                throw ApiError.BadRequest("Некорректный UID");
            }
            const {cafeId, DeleterSubscriptionId} = req.body
            if (!cafeId || !DeleterSubscriptionId) {  
                throw ApiError.BadRequest("Некорректные данные");
            }
            const DeleterSubscription = await paymentsService.deleterSubscriptions(uid, DeleterSubscriptionId, cafeId);
            return res.json(DeleterSubscription);
        } catch (e) {
            console.log(e)
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
        
    
           async payoutsStatus (req, res) {
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

          

           async paymentsPurchaseWithCard (req, res) {
            try {
                const { amount, currency, cardDetails, billingAddress, seller_email } = req.body;
        
                if (!amount || !currency || !cardDetails || !billingAddress || !seller_email) {
                    return res.status(400).json({ message: "Missing required fields." });
                }
        
                const paymentsPurchaseWithCardData = await paymentsService.paymentsPurchaseWithCard(
                    amount, currency, cardDetails, billingAddress, seller_email
                );
        
                return res.json(paymentsPurchaseWithCardData);
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


    //     async pay(req, res) {
    //         try {
    //             const { amount, currency, sellerStripeAccount } = req.body;
        
    //             // Комісія 7%
    //             const feeAmount = Math.round(amount * 0.07 * 100);
    //             const totalAmount = Math.round(amount * 100); // Повна сума (100%)
        
    //             // Створюємо Checkout Session
    //             const session = await stripe.checkout.sessions.create({
    //                 payment_method_types: ["card"],
    //                 mode: "payment",
    //                 line_items: [
    //                     {
    //                         price_data: {
    //                             currency: currency,
    //                             product_data: { name: "Payment" },
    //                             unit_amount: totalAmount
    //                         },
    //                         quantity: 1
    //                     }
    //                 ],
    //                 metadata: { sellerStripeAccount }, // ✅ Передаємо ID акаунта продавця
    //                 success_url: "https://www.youtube.com/",
    //                 cancel_url: "https://chatgpt.com/"
    //             });
        
    //             res.json({ checkoutUrl: session.url });
    //         } catch (error) {
    //             console.error(error);
    //             return res.status(500).json({ message: `Error processing payment: ${error.message}` });
    //         }
    //     }
        

    //     async payWebhookDouble (req, res) {
    //         const sig = req.headers['stripe-signature'];
    // let event;

    // try {
    //     // Перевірка підпису події
    //     event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    // } catch (err) {
    //     console.error('Webhook signature verification failed.', err);
    //     return res.status(400).send(`Webhook Error: ${err.message}`);
    // }

    // // Обробка події checkout.session.completed
    // if (event.type === 'checkout.session.completed') {
    //     const session = event.data.object;

    //     // Отримуємо суму та sellerStripeAccount з метаданих
    //     const amountReceived = session.amount_total; // В сумі найчастіше вказується в центрах
    //     const sellerStripeAccount = session.metadata.sellerStripeAccount;

    //     // Розрахунок 93% від суми для продавця
    //     const amountToSeller = Math.round(amountReceived * 0.93); // 93%

    //     try {
    //         // Переведення коштів на рахунок продавця
    //         await stripe.transfers.create({
    //             amount: amountToSeller,
    //             currency: session.currency,
    //             destination: sellerStripeAccount, // Ідентифікатор акаунта продавця
    //             transfer_group: session.id, // Додатково для відстеження
    //         });

    //         console.log(`Successfully transferred ${amountToSeller / 100} to seller ${sellerStripeAccount}`);
    //         return res.status(200).send('Success');
    //     } catch (err) {
    //         console.error('Transfer failed:', err);
    //         return res.status(500).send(`Transfer failed: ${err.message}`);
    //     }
    //     }}







    async pay(req, res) {
        try {
            const { amount, currency, connectedAccountId, tokenId } = req.body;
    
            // Створюємо payment_method через токен
            const paymentMethod = await stripe.paymentMethods.create({
                type: 'card',
                card: { token: tokenId },
            });
    
            // Визначаємо розмір комісії
            const applicationFee = Math.round(amount * 0.07); // 7% від суми
    
            // Створюємо paymentIntent
            const paymentIntent = await stripe.paymentIntents.create({
                amount,
                currency,
                payment_method: paymentMethod.id,
                confirm: true,
                application_fee_amount: applicationFee, // Вказуємо 7% комісії для вас
                transfer_data: {
                    destination: connectedAccountId // Продавець отримає залишок суми
                },
                // Якщо платіжний метод потребує редиректу, додайте return_url
                return_url: 'https://www.youtube.com/',
                // або використовуйте автоматичні платіжні методи
                automatic_payment_methods: {
                    enabled: true,
                    allow_redirects: 'never' // Вимикає редиректи, якщо вам не потрібні
                }
            });
    
            // Якщо потрібно, обробляємо ситуацію з 3D Secure
            if (paymentIntent.status === 'requires_action' || paymentIntent.status === 'requires_source_action') {
                // Повертаємо інформацію для завершення платіжного процесу
                return res.status(200).json({
                    requiresAction: true,
                    paymentIntentClientSecret: paymentIntent.client_secret,
                });
            }
    
            // Якщо платіжний процес завершено успішно
            return res.status(200).json({ paymentIntent });
    
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: `Error processing payment: ${error.message}` });
        }
    }
    

    async payWebhookDouble (req, res) {

try {

    } catch (err) {
        console.error('Transfer failed:', err);
        return res.status(500).send(`Transfer failed: ${err.message}`);
    }
    }















        // async payWebhook(req, res) {
        //     // Перевірка методу запиту
        //     if (req.method !== 'POST') {
        //       return res.status(405).json({ error: 'Метод не дозволений, використовуйте POST' });
        //     }
          
        //     // Читання сирого тіла запиту для перевірки підпису
        //     const sig = req.headers['stripe-signature'];
          
        //     let rawBody = '';
        //     req.on('data', chunk => {
        //       rawBody += chunk;
        //     });
          
        //     req.on('end', async () => {
        //       let event;
          
        //       console.log("Webhook received, checking signature...");
          
        //       try {
        //         // Перевірка підпису за допомогою сирого тіла
        //         event = stripe.webhooks.constructEvent(rawBody, sig, 'whsec_yjzhO4OVp960IBXOMvr91eRHY8WCHPbn');
        //         console.log("Event successfully constructed:", event);
        //       } catch (err) {
        //         console.error("⚠️ Webhook signature verification failed.", err.message);
        //         return res.status(400).send(`Webhook Error: ${err.message}`);
        //       }
          
        //       // Обробка подій
        //       switch (event.type) {
        //         case 'checkout.session.completed':
        //           const session = event.data.object;
        //           console.log("Checkout session completed, processing...");
          
        //           try {
        //             let totalAmount = 0;
        //             let currency = "usd"; // Default currency
          
        //             // Якщо є payment_intent, отримуємо його деталі
        //             if (session.payment_intent) {
        //               const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent);
        //               totalAmount = paymentIntent.amount;
        //               currency = paymentIntent.currency;
        //             } else {
        //               totalAmount = session.amount_total;
        //               currency = session.currency;
        //             }
          
        //             const sellerAmount = Math.round(totalAmount * 0.93); // Сума для продавця
        //             const sellerStripeAccount = session.metadata.sellerStripeAccount;
          
        //             if (!sellerStripeAccount) {
        //               console.error("❌ Seller Stripe Account is missing in metadata!");
        //               return res.status(400).json({ message: "Seller Stripe Account is missing!" });
        //             }
          
        //             console.log("Processing transfer to seller:", sellerStripeAccount);
          
        //             // Виконуємо переказ
        //             await stripe.transfers.create({
        //               amount: sellerAmount,
        //               currency: currency,
        //               destination: sellerStripeAccount
        //             });
          
        //             console.log(`✅ Переведено ${sellerAmount / 100} ${currency} продавцю ${sellerStripeAccount}`);
        //             return res.status(200).json({ received: true });
        //           } catch (error) {
        //             console.error("❌ Error processing transfer:", error);
        //             return res.status(500).json({ message: `Error processing transfer: ${error.message}` });
        //           }
                  
        //         default:
        //           console.log(`Unhandled event type ${event.type}`);
        //           return res.status(200).json({ received: true });
        //       }
        //     });
        //   }
          
        
        


        
        // async pay(req, res) {
        //     try {
        //         const { amount, currency } = req.body;
        
        //         const lineItems = [
        //             {
        //                 price_data: {
        //                     currency: currency,
        //                     product_data: {
        //                         name: "Payment"
        //                     },
        //                     unit_amount: Math.round(amount * 100)
        //                 },
        //                 quantity: 1
        //             }
        //         ];
        
        //         // Створення сесії Stripe
        //         const session = await stripe.checkout.sessions.create({
        //             payment_method_types: ["card"],
        //             line_items: lineItems,
        //             mode: "payment",
        //             success_url: "https://www.youtube.com/",  // Успішне завершення
        //             cancel_url: "https://chatgpt.com/"      // Скасування
        //         });
        
        //         // Відправляємо URL для переходу на сторінку Stripe Checkout
        //         res.json({ checkoutUrl: session.url });
        //     } catch (e) {
        //         if (e instanceof ApiError) {
        //             return res.status(e.status).json({
        //                 message: e.message,
        //                 errors: e.errors
        //             });
        //         }
        //         console.error(e);
        //         return res.status(500).json({
        //             message: `Internal server error. Please try again later  ${e.message || e}`
        //         });
        //     }
        // }
        
         
           
}

module.exports = new PaymentsController(); 