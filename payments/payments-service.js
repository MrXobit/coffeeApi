const admin = require('firebase-admin');
const ApiError = require('../error/ApiError');
const { v4: uuidv4 } = require('uuid');
const paypal = require('@paypal/checkout-server-sdk');
const PAYPAL_API = 'https://api-m.paypal.com'; 
const axios = require('axios');


let CLIENT_ID = null;
let CLIENT_SECRET = null;
let client = null;

async function initializePayPal() {
    const remoteConfig = admin.remoteConfig();
    const template = await remoteConfig.getTemplate();
    
    CLIENT_ID = template.parameters['CLIENT_ID']?.defaultValue?.value;
    CLIENT_SECRET = template.parameters['CLIENT_SECRET']?.defaultValue?.value;

    if (!CLIENT_ID || !CLIENT_SECRET) {
        throw new Error('CLIENT_ID или CLIENT_SECRET отсутствуют в Remote Config');
    }

    const environment = new paypal.core.SandboxEnvironment(CLIENT_ID, CLIENT_SECRET);
    client = new paypal.core.PayPalHttpClient(environment);
}

const paypalInitPromise = initializePayPal()
    .then(() => console.log("PayPal Client успешно инициализирован"))
    .catch(err => console.error("Ошибка инициализации PayPal:", err));

module.exports = { paypalInitPromise, getClient, getCredentials };


async function getClient() {
    await paypalInitPromise; 
    return client;
}

async function getCredentials() {
    await paypalInitPromise; 
    return { CLIENT_ID, CLIENT_SECRET };
}
class PaymentsService { 

     
   
    async subscriptionsCreate(title, duration, cups, price, currency, uid, coffeeTypes, cafeId) {
        try {
            const userRef = admin.firestore().collection('users').doc(uid);
            const userDoc = await userRef.get();
        
            if (!userDoc.exists) {
                throw ApiError.BadRequest("User not found");
            }
    
            const userData = userDoc.data();
            const accessRef = admin.firestore().collection('accessAdmin').doc(userData.email);
            const accessDoc = await accessRef.get();
            
            if (!accessDoc.exists) {
                throw ApiError.BadRequest("Access denied");
            }
    
            const accessData = accessDoc.data();
    
            if (!Array.isArray(accessData.allowedCafeIds) || !accessData.allowedCafeIds.includes(cafeId)) {
                throw ApiError.BadRequest("Access denied");
            }
    
            const cafeRef = admin.firestore().collection('cafe').doc(cafeId);
            const cafeDoc = await cafeRef.get();
        
            if (!cafeDoc.exists) {
                throw ApiError.BadRequest("Cafe not found");
            }
    
            const validCoffeeTypes = [
                "Espresso", "Double Espresso (Doppio)", "Ristretto", "Lungo", "Americano", "Macchiato", 
                "Cortado", "Cappuccino", "Flat White", "Latte", "Mocha", "Brewed Coffee (Фільтр-кава)",
                "Batch Brew", "Pour Over (V60, Chemex, Kalita Wave)", "French Press", "AeroPress", 
                "Cold Brew", "Drip Coffee", "Siphon Coffee", "Turkish Coffee", "Moka Pot", 
                "Cold Coffee Drinks (Холодні кавові напої)", "Iced Coffee", "Iced Latte", "Iced Cappuccino", 
                "Nitro Cold Brew", "Frappé", "Affogato"
            ];
    
            const validDurations = ["month", "3 months", "half-year", "year"];
    
            if (!Array.isArray(coffeeTypes)) {
                throw ApiError.BadRequest("coffeeTypes must be an array.");
            }
    
            if (!coffeeTypes.every(type => validCoffeeTypes.includes(type))) {
                throw ApiError.BadRequest("Invalid coffeeTypes: all elements must be from the predefined list.");
            }
    
            if (!title || !duration || !cups || !price || !currency || !coffeeTypes) {
                throw ApiError.BadRequest("All fields (title, duration, cups, price, currency, and coffeeTypes) are required.");
            }
    
            if (typeof title !== 'string' || title.trim() === '') {
                throw ApiError.BadRequest("Title must be a non-empty string.");
            }
    
            if (typeof duration !== 'string' || !validDurations.includes(duration)) {
                throw ApiError.BadRequest(`Invalid duration. Allowed values: ${validDurations.join(", ")}`);
            }
    
            if (typeof cups !== 'number' || cups <= 0) {
                throw ApiError.BadRequest("Cups must be a positive number.");
            }
    
            if (typeof price !== 'number' || price <= 0) {
                throw ApiError.BadRequest("Price must be a positive number.");
            }
    
            if (typeof currency !== 'string' || !['USD', 'EUR', 'GBP', 'AUD', 'BRL', 'CAD', 'CNY', 'CZK', 'DKK', 'HKD', 'HUF', 'ILS', 'JPY', 'MYR', 'MXN', 'TWD', 'NZD', 'NOK', 'PHP', 'PLN', 'SGD', 'SEK', 'CHF', 'THB'].includes(currency)) {
                throw ApiError.BadRequest("Invalid currency.");
            }
    
            const newSubId = uuidv4();
            const coffeePassRef = cafeRef.collection("coffee_pass").doc(newSubId);
            const currentDate = new Date();
            const formattedDate = `${currentDate.getDate().toString().padStart(2, '0')}.${(currentDate.getMonth() + 1).toString().padStart(2, '0')}.${currentDate.getFullYear()}`;
            
            await coffeePassRef.set({
                id: newSubId,
                title,
                duration,
                cups,
                price,
                currency,
                coffeeTypes,
                createdAt: formattedDate 
            });
    
            const coffeePassDoc = await coffeePassRef.get();
    
            return { message: "Subscription added successfully", data: coffeePassDoc.data() };
        } catch (e) {
            if (e instanceof ApiError) {
                throw e;
            }
            throw ApiError.InternalError(e.message);
        }
    }
    
    async subscriptionsEdit(title, duration, cups, price, currency, coffeeTypes, cafeId, subscriptionId, uid) {
        try {
            const userRef = admin.firestore().collection('users').doc(uid);
            const userDoc = await userRef.get();
        
            if (!userDoc.exists) {
                throw ApiError.BadRequest("User not found");
            }
    
            const userData = userDoc.data();
            const accessRef = admin.firestore().collection('accessAdmin').doc(userData.email);
            const accessDoc = await accessRef.get();
            
            if (!accessDoc.exists) {
                throw ApiError.BadRequest("Access denied");
            }
    
            const accessData = accessDoc.data();
    
            if (!Array.isArray(accessData.allowedCafeIds) || !accessData.allowedCafeIds.includes(cafeId)) {
                throw ApiError.BadRequest("Access denied");
            }
    
            const cafeRef = admin.firestore().collection('cafe').doc(cafeId);
            const cafeDoc = await cafeRef.get();
        
            if (!cafeDoc.exists) {
                throw ApiError.BadRequest("Cafe not found");
            }
            const validCoffeeTypes = [
                "Espresso", "Double Espresso (Doppio)", "Ristretto", "Lungo", "Americano", "Macchiato", 
                "Cortado", "Cappuccino", "Flat White", "Latte", "Mocha", "Brewed Coffee (Фільтр-кава)",
                "Batch Brew", "Pour Over (V60, Chemex, Kalita Wave)", "French Press", "AeroPress", 
                "Cold Brew", "Drip Coffee", "Siphon Coffee", "Turkish Coffee", "Moka Pot", 
                "Cold Coffee Drinks (Холодні кавові напої)", "Iced Coffee", "Iced Latte", "Iced Cappuccino", 
                "Nitro Cold Brew", "Frappé", "Affogato"
            ];
    
            const validDurations = ["month", "3 months", "half-year", "year"];
    
       
            if (!subscriptionId) {
                throw ApiError.BadRequest("Subscription ID is required");
            }
    
   
            const coffeePassRef = admin.firestore().collection('cafe').doc(cafeId).collection('coffee_pass').doc(subscriptionId);
            const coffeePassDoc = await coffeePassRef.get();
    
            if (!coffeePassDoc.exists) {
                throw ApiError.BadRequest("Subscription not found");
            }
    
   
            if (coffeeTypes && !coffeeTypes.every(type => validCoffeeTypes.includes(type))) {
                throw ApiError.BadRequest("Invalid coffeeTypes. All elements must be from the predefined list.");
            }
    
            if (duration && !validDurations.includes(duration)) {
                throw ApiError.BadRequest(`Invalid duration. Allowed values: ${validDurations.join(", ")}`);
            }
    
     
            const updatedFields = [];
            if (title) updatedFields.push('title');
            if (duration) updatedFields.push('duration');
            if (cups) updatedFields.push('cups');
            if (price) updatedFields.push('price');
            if (currency) updatedFields.push('currency');
            if (coffeeTypes && Array.isArray(coffeeTypes)) updatedFields.push('coffeeTypes');
    
            if (updatedFields.length === 0) {
                throw ApiError.BadRequest("At least one field must be provided for update");
            }
    
    
            const updatedData = {};
            if (title) updatedData.title = title;
            if (duration) updatedData.duration = duration;
            if (cups) updatedData.cups = cups;
            if (price) updatedData.price = price;
            if (currency) updatedData.currency = currency;
            if (coffeeTypes) updatedData.coffeeTypes = coffeeTypes;
    

            await coffeePassRef.update(updatedData);
    
            const updatedCoffeePassDoc = await coffeePassRef.get();
            return { message: "Subscription updated successfully", data: updatedCoffeePassDoc.data() };
        } catch (e) {
            if (e instanceof ApiError) {
                throw e;
            }
            throw ApiError.InternalError(e.message);
        }
    }
    
    

    async getSubscriptions(uid, count, offset, cafeId) {
        try {
            const userRef = admin.firestore().collection('users').doc(uid);
            const userDoc = await userRef.get();
            
            if (!userDoc.exists) {
                throw ApiError.BadRequest("User not found");
            }
    
            const userData = userDoc.data();
    
            const accessRef = admin.firestore().collection('accessAdmin').doc(userData.email);
            const accessDoc = await accessRef.get();
            
            if (!accessDoc.exists) {
                throw ApiError.BadRequest("Access denied");
            }
    
            const cafeRef = admin.firestore().collection('cafe').doc(cafeId);
            const cafeDoc = await cafeRef.get();
            
            if (!cafeDoc.exists) {
                throw ApiError.BadRequest("Cafe not found");
            }
    
            let query = cafeRef.collection("coffee_pass");
    
            if (!isNaN(offset) && offset > 0) {
                query = query.offset(offset);
            }
            if (!isNaN(count) && count > 0) {
                query = query.limit(count);
            }
    
            const subscriptionsSnapshot = await query.get();
    
            if (subscriptionsSnapshot.empty) {
                return { message: "User has no subscriptions", data: [] };
            }
    
            const subscriptions = [];
            subscriptionsSnapshot.forEach(doc => {
                subscriptions.push({ id: doc.id, ...doc.data() });
            });
    
            return { message: "Subscriptions fetched successfully", data: subscriptions };
    
        } catch (e) {
            if (e instanceof ApiError) {
                throw e;
            }
            throw ApiError.InternalError('Internal server error. Please try again later.');
        }
    }
    
      

    async deleterSubscriptions(uid, deleterSubscriptionId, cafeId) {
        try {
            const userRef = admin.firestore().collection('users').doc(uid);
            const userDoc = await userRef.get();
            
            if (!userDoc.exists) {
                throw ApiError.BadRequest("User not found");
            }
    
            const userData = userDoc.data();
    
            const accessRef = admin.firestore().collection('accessAdmin').doc(userData.email);
            const accessDoc = await accessRef.get();
            
            if (!accessDoc.exists) {
                throw ApiError.BadRequest("Access denied");
            }
            
            const cafeRef = admin.firestore().collection('cafe').doc(cafeId);
            const cafeDoc = await cafeRef.get();
    
            if (!deleterSubscriptionId) {
                throw ApiError.BadRequest("deleterSubscriptionId is required");
            }
    
            if (!cafeDoc.exists) {
                throw ApiError.BadRequest("Cafe not found");
            }
    
            const subscriptionRef = cafeRef.collection("coffee_pass").doc(deleterSubscriptionId);
            const subscriptionDoc = await subscriptionRef.get();
    
            if (!subscriptionDoc.exists) {
                throw ApiError.BadRequest("Subscription not found");
            }
    
            await subscriptionRef.delete();
    
            return { message: "Subscription deleted successfully", data: subscriptionDoc.data() };
        } catch (e) {
            console.log(e)
            if (e instanceof ApiError) {
                throw e;
            }
            throw ApiError.InternalError(e.message);
        }
    }

    async getAccessToken() {
        try {
            await paypalInitPromise;
            const response = await axios.post(`${PAYPAL_API}/v1/oauth2/token`, 'grant_type=client_credentials', {
                auth: {
                    username: CLIENT_ID,
                    password: CLIENT_SECRET
                },
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
            return response.data.access_token;
        } catch (e) {
            if (e instanceof ApiError) {
                throw e;
            }
            throw ApiError.InternalError(e.message);
        }
    }

    async paymentsPurchase (amount, currency, seller_email) {
        try {
            await paypalInitPromise;
            if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
                throw ApiError.BadRequest("Amount must be a valid number greater than 0.");
            }
        
            const allowedCurrencies = ['USD', 'EUR', 'GBP', 'AUD', 'BRL', 'CAD', 'CNY', 'CZK', 'DKK', 'HKD', 'HUF', 'ILS', 'JPY', 'MYR', 'MXN', 'TWD', 'NZD', 'NOK', 'PHP', 'PLN', 'SGD', 'SEK', 'CHF', 'THB'];
            if (typeof currency !== 'string' || !allowedCurrencies.includes(currency)) {
                throw ApiError.BadRequest("Invalid currency.");
            }

            const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
            if (typeof seller_email !== 'string' || !emailPattern.test(seller_email)) {
                throw ApiError.BadRequest("Invalid email address.");
            }

            const accessToken = await this.getAccessToken();
            const response = await axios.post(`${PAYPAL_API}/v2/checkout/orders`, {
                intent: 'CAPTURE',
                purchase_units: [{
                    amount: {
                        currency_code: currency,
                        value: amount.toFixed(2)
                    },
                    payee: { email_address: seller_email }
                }],
                application_context: {
                    "brand_name": "Coffee Bee",
                    "landing_page": "BILLING", // Сторінка після авторизації, наприклад, платіжна інформація
                    "user_action": "PAY_NOW", // Прямо пропонувати оплату
                    "return_url": "https://your-app.com/success", // URL після успішної оплати
                    "cancel_url": "https://your-app.com/cancel", // URL при відміні оплати
                    "payment_method_preference": "IMMEDIATE_PAYMENT_REQUIRED", // Необхідно платити одразу
                    "payment_method_selected": "PAYPAL", // Вибір PayPal як методу оплати
                    "allowed_payment_methods": "INSTANT_FUNDING_SOURCE" // Дозволити миттєві методи оплати (Google Pay, Apple Pay)
                }
            }, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });
            return { payment_url: response.data.links.find(link => link.rel === 'approve').href };
        } catch (e) {
            if (e instanceof ApiError) {
                throw e;
            }
            throw ApiError.InternalError(e.message);
        }
    }

    async paymentsWebhook(event_type, resource) {
        await paypalInitPromise;
        try {
            if (event_type === 'CHECKOUT.ORDER.APPROVED' || event_type === 'PAYMENT.CAPTURE.COMPLETED') {
                const orderId = resource.id;
                const accessToken = await this.getAccessToken();
                await axios.post(`${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`, {}, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                });
    
                const capture = resource.purchase_units[0].payments.captures[0];
                const seller_id = resource.purchase_units[0].payee.email_address; 
                const amount = parseFloat(capture.amount.value) * 0.95; 
                const currency = capture.amount.currency_code;
        
                const feeAmount = parseFloat(capture.amount.value) * 0.05; 
                await this.payoutsSend('cbee.finance@gmail.com', feeAmount, currency); 
                
                await this.payoutsSend(seller_id, amount, currency);
                
                return { status: 'success' };
            }
            return { status: 'failed' };
        } catch (e) {
            if (e instanceof ApiError) {
                throw e;
            }
            throw ApiError.InternalError(e.message);
        }
    }
    

async payoutsSend(seller_id, amount, currency) {
    await paypalInitPromise;
    try {
        const accessToken = await this.getAccessToken();
        const response = await axios.post(`${PAYPAL_API}/v1/payments/payouts`, {
            sender_batch_header: {
                email_subject: 'Ваша выплата'
            },
            items: [{
                recipient_type: 'EMAIL',
                receiver: seller_id, 
                amount: {
                    currency_code: currency,
                    value: amount.toFixed(2)
                }
            }]
        }, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.data.batch_header.payout_batch_id) {
            throw new ApiError(500, 'Ошибка: PayPal не вернул payout_batch_id');
        }

        const payoutStatus = await this.payoutsStatus(response.data.batch_header.payout_batch_id);
        if (payoutStatus.status !== 'SUCCESS') {
            throw new ApiError(500, 'Ошибка: Выплата не была успешной');
        }

        return { payout_id: response.data.batch_header.payout_batch_id };
    } catch (e) {
        throw new ApiError(500, `Ошибка отправки выплаты: ${e.message}`);
    }
}


   async payoutsStatus (payout_id) {
try {
    await paypalInitPromise;
    const accessToken = await this.getAccessToken();
    const response = await axios.get(`${PAYPAL_API}/v1/payments/payouts/${payout_id}`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });
    return { status: response.data.batch_header.batch_status };
} catch (e) {
    throw new ApiError(500, 'Ошибка проверки статуса выплаты');
}
   }




   async paymentsPurchaseWithCard(amount, currency, cardDetails, billingAddress, seller_email) {
    try {
        await paypalInitPromise;
        
        if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
            throw ApiError.BadRequest("Amount must be a valid number greater than 0.");
        }

        const allowedCurrencies = ['USD', 'EUR', 'GBP', 'AUD', 'BRL', 'CAD', 'CNY', 'CZK', 'DKK', 'HKD', 'HUF', 'ILS', 'JPY', 'MYR', 'MXN', 'TWD', 'NZD', 'NOK', 'PHP', 'PLN', 'SGD', 'SEK', 'CHF', 'THB'];
        if (typeof currency !== 'string' || !allowedCurrencies.includes(currency)) {
            throw ApiError.BadRequest("Invalid currency.");
        }

        const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if (typeof seller_email !== 'string' || !emailPattern.test(seller_email)) {
            throw ApiError.BadRequest("Invalid email address.");
        }

        const accessToken = await this.getAccessToken();

        // 1️⃣ Создаем заказ
        const orderResponse = await axios.post(`${PAYPAL_API}/v2/checkout/orders`, {
            intent: 'CAPTURE',
            purchase_units: [{
                amount: {
                    currency_code: currency,
                    value: amount.toFixed(2)
                }
            }],
            payment_source: {
                card: {
                    number: cardDetails.number,
                    expiry: cardDetails.expiry,
                    security_code: cardDetails.cvv,
                    name: cardDetails.name,
                    billing_address: billingAddress
                }
            }
        }, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        const orderId = orderResponse.data.id;

        // 2️⃣ Захватываем платёж (capture)
        const captureResponse = await axios.post(`${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`, {}, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!captureResponse.data.purchase_units || captureResponse.data.purchase_units.length === 0) {
            throw new ApiError(500, 'Ошибка: PayPal не вернул данные о платеже');
        }

        const capture = captureResponse.data.purchase_units[0].payments.captures[0];
        const totalAmount = parseFloat(capture.amount.value);
        const currencyCode = capture.amount.currency_code;

        // 3️⃣ Расчет выплат
        const sellerAmount = totalAmount * 0.95;
        const feeAmount = totalAmount * 0.05;

        // 4️⃣ Выплата 5% нам
        await this.payoutsSend('cbee.finance@gmail.com', feeAmount, currencyCode);

        // 5️⃣ Выплата 95% продавцу
        await this.payoutsSend(seller_email, sellerAmount, currencyCode);

        return { order_id: orderId, status: 'COMPLETED' };
    } catch (e) {
        if (e instanceof ApiError) {
            throw e;
        }
        throw ApiError.InternalError(e.message);
    }
}



}

module.exports = new PaymentsService();