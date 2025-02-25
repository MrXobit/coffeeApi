const { initializeFirebase } = require('./config/firebaseConfig');
initializeFirebase();
const { onRequest } = require('firebase-functions/v2/https');
const logger = require('firebase-functions/logger');
const authController = require('./AuthApp/authController');
const dataController = require('./getData/dataController');
const addController = require('./addOrEdit/add-controller');
const paymentsController = require('./payments/payments-controller');
const AdminMainDataController = require('./admin/AdminMainData/AdminMainData-controller');
const AccessController = require('./admin/accessСontrol/access-controller');

exports.handleRegistrationRequest = onRequest((req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Метод не дозволений, використовуйте POST' });
  }

  logger.info('Handling registration...', { structuredData: true });
  return authController.registration(req, res);
});




exports.registerWithGoogle = onRequest((req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Метод не дозволений, використовуйте POST' });
  }

  logger.info('Handling user registration via Google...', { structuredData: true });
  return authController.registerWithGoogle(req, res);
});

exports.resetPasswordEmail = onRequest((req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Метод не дозволений, використовуйте POST' });
  }

  logger.info('Handling password reset request...', { structuredData: true });
  return authController.resetPasswordEmail(req, res);
});


exports.resetpasswordLink = onRequest((req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Метод не дозволений, використовуйте POST' });
  }

  logger.info('Handling password reset link request...', { structuredData: true });
  return authController.resetpasswordLink(req, res);
});


exports.resetPasswordFinal = onRequest((req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Метод не дозволений, використовуйте POST' });
  }

  logger.info('Handling password reset link request...', { structuredData: true });
  return authController.resetPasswordFinal(req, res);
});




exports.getAllBeans = onRequest((req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Метод не дозволений, використовуйте GET" });
  }

  logger.info("Handling getAllBeans request...", { structuredData: true });
  return dataController.getAllBeans(req, res);
});

exports.getAllParameters = onRequest((req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Метод не дозволений, використовуйте GET" });
  }

  logger.info("Handling getAllParameters request...", { structuredData: true });
  return dataController.getAllParameters(req, res);
});

exports.getAllRoasters = onRequest((req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Метод не дозволений, використовуйте GET" });
  }

  logger.info("Handling getAllRoasters request...", { structuredData: true });
  return dataController.getAllRoasters(req, res);
});

exports.getAllUsersCoffeeLogs = onRequest((req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Метод не дозволений, використовуйте GET" });
  }

  logger.info("Handling getAllUsersCoffeeLogs request...", { structuredData: true });
  return dataController.getAllUsersCoffeeLogs(req, res);
});



exports.addNewRoaster = onRequest((req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Метод не дозволений, використовуйте GET" });
  }

  logger.info("Handling addNewRoaster request...", { structuredData: true });
  return addController.addNewRoaster(req, res);
});


exports.addBeans = onRequest((req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Метод не дозволений, використовуйте GET" });
  }

  logger.info("Handling addBeans request...", { structuredData: true });
  return addController.addBeans(req, res);
});





exports.subscriptionsCreate = onRequest((req, res) => {
  if (req.method !== "POST") {
      return res.status(405).json({ error: "Метод не дозволений, використовуйте POST" });
  }

  logger.info("Handling subscriptionsCreate request...", { structuredData: true });
  return paymentsController.subscriptionsCreate(req, res);
});


exports.subscriptionsEdit = onRequest((req, res) => {
  if (req.method !== "POST") {
      return res.status(405).json({ error: "Метод не дозволений, використовуйте POST" });
  }

  logger.info("Handling subscriptionsEdit request...", { structuredData: true });
  return paymentsController.subscriptionsEdit(req, res);
});


exports.getSubscriptions = onRequest((req, res) => {
  if (req.method !== "GET") {
      return res.status(405).json({ error: "Метод не дозволений, використовуйте GET" });
  }

  logger.info("Handling getSubscriptions request...", { structuredData: true });
  return paymentsController.getSubscriptions(req, res);
});

exports.deleterSubscriptions = onRequest((req, res) => {
  if (req.method !== "DELETE") {
      return res.status(405).json({ error: "Метод не дозволений, використовуйте DELETE" });
  }

  logger.info("Handling deleterSubscriptions request...", { structuredData: true });
  return paymentsController.deleterSubscriptions(req, res);
});

exports.paymentsPurchase = onRequest((req, res) => {
  if (req.method !== "POST") {
      return res.status(405).json({ error: "Метод не дозволений, використовуйте POST" });
  }

  logger.info("Handling paymentsPurchase request...", { structuredData: true });
  return paymentsController.paymentsPurchase(req, res);
});

exports.paymentsWebhook = onRequest((req, res) => {
  if (req.method !== "POST") {
      return res.status(405).json({ error: "Метод не дозволений, використовуйте POST" });
  }

  logger.info("Handling paymentsWebhook request...", { structuredData: true });
  return paymentsController.paymentsWebhook(req, res);
});

exports.payoutsSend = onRequest((req, res) => {
  if (req.method !== "POST") {
      return res.status(405).json({ error: "Метод не дозволений, використовуйте POST" });
  }

  logger.info("Handling payoutsSend request...", { structuredData: true });
  return paymentsController.payoutsSend(req, res);
});

exports.payoutsStatus = onRequest((req, res) => {
  if (req.method !== "GET") {
      return res.status(405).json({ error: "Метод не дозволений, використовуйте GET" });
  }

  logger.info("Handling payoutsStatus request...", { structuredData: true });
  return paymentsController.payoutsStatus(req, res);
});





exports.updateName = onRequest((req, res) => {
  if (req.method !== "POST") {
      return res.status(405).json({ error: "Метод не дозволений, використовуйте GET" });
  }

  logger.info("Handling updateName request...", { structuredData: true });
  return AdminMainDataController.updateName(req, res);
});



exports.updateDescription = onRequest((req, res) => {
  if (req.method !== "POST") {
      return res.status(405).json({ error: "Метод не дозволений, використовуйте GET" });
  }

  logger.info("Handling updateDescription request...", { structuredData: true });
  return AdminMainDataController.updateDescription(req, res);
});


exports.updateContacts = onRequest((req, res) => {
  if (req.method !== "POST") {
      return res.status(405).json({ error: "Метод не дозволений, використовуйте GET" });
  }

  logger.info("Handling updateContacts request...", { structuredData: true });
  return AdminMainDataController.updateContacts(req, res);
});



exports.updateWorkingHours = onRequest((req, res) => {
  if (req.method !== "POST") {
      return res.status(405).json({ error: "Метод не дозволений, використовуйте GET" });
  }

  logger.info("Handling updateWorkingHours request...", { structuredData: true });
  return AdminMainDataController.updateWorkingHours(req, res);
});



exports.updateAddress = onRequest((req, res) => {
  if (req.method !== "POST") {
      return res.status(405).json({ error: "Метод не дозволений, використовуйте GET" });
  }

  logger.info("Handling updateAddress request...", { structuredData: true });
  return AdminMainDataController.updateAddress(req, res);
});



exports.AccessAddAdmin = onRequest((req, res) => {
  if (req.method !== "POST") {
      return res.status(405).json({ error: "Метод не дозволений, використовуйте GET" });
  }

  logger.info("Handling AccessAddAdmin request...", { structuredData: true });
  return AccessController.accessAddAdmin(req, res);
});


exports.accessRemoveAdmin = onRequest((req, res) => {
  if (req.method !== "POST") {
      return res.status(405).json({ error: "Метод не дозволений, використовуйте GET" });
  }

  logger.info("Handling accessRemoveAdmin request...", { structuredData: true });
  return AccessController.accessRemoveAdmin(req, res);
});


exports.createCoffeeChain = onRequest((req, res) => {
  if (req.method !== "POST") {
      return res.status(405).json({ error: "Метод не дозволений, використовуйте GET" });
  }

  logger.info("Handling createCoffeeChain request...", { structuredData: true });
  return AccessController.createCoffeeChain(req, res);
});