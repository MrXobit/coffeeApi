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
const cors = require('cors')({ origin: true });
const functions = require('firebase-functions'); 


// exports.handleRegistrationRequest = functions.https.onRequest((req, res) => {
//   cors(req, res, () => {
//     if (req.method !== 'POST') {
//       return res.status(405).json({ error: 'Метод не дозволений, використовуйте POST' });
//     }

//     logger.info('Handling registration...', { structuredData: true });
//     return authController.registration(req, res);
//   });
// });

// exports.checkAuth = functions.https.onRequest((req, res) => {
//   cors(req, res, () => {
//     if (req.method !== 'POST') {
//       return res.status(405).json({ error: 'Метод не дозволений, використовуйте POST' });
//     }

//     logger.info('Handling checkAuth...', { structuredData: true });
//     return authController.checkAuth(req, res);
//   });
// });


// exports.registerWithGoogle = onRequest((req, res) => {
//   if (req.method !== 'POST') {
//     return res.status(405).json({ error: 'Метод не дозволений, використовуйте POST' });
//   }

//   logger.info('Handling user registration via Google...', { structuredData: true });
//   return authController.registerWithGoogle(req, res);
// });







exports.resetPasswordEmail = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Метод не дозволений, використовуйте POST" });
    }

    logger.info("Handling password reset request...", { structuredData: true });
    return authController.resetPasswordEmail(req, res);
  });
});

exports.resetpasswordLink = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Метод не дозволений, використовуйте GET" });
    }

    logger.info("Handling password reset link request...", { structuredData: true });
    return authController.resetpasswordLink(req, res);
  });
});

exports.resetPasswordFinal = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Метод не дозволений, використовуйте POST" });
    }

    logger.info("Handling password reset final request...", { structuredData: true });
    return authController.resetPasswordFinal(req, res);
  });
});






// exports.resetPasswordEmail = onRequest((req, res) => {
//   if (req.method !== 'POST') {
//     return res.status(405).json({ error: 'Метод не дозволений, використовуйте POST' });
//   }

//   logger.info('Handling password reset request...', { structuredData: true });
//   return authController.resetPasswordEmail(req, res);
// });


// exports.resetpasswordLink = onRequest((req, res) => {
//   if (req.method !== 'GET') {
//     return res.status(405).json({ error: 'Метод не дозволений, використовуйте POST' });
//   }

//   logger.info('Handling password reset link request...', { structuredData: true });
//   return authController.resetpasswordLink(req, res);
// });


// exports.resetPasswordFinal = onRequest((req, res) => {
//   if (req.method !== 'POST') {
//     return res.status(405).json({ error: 'Метод не дозволений, використовуйте POST' });
//   }

//   logger.info('Handling password reset link request...', { structuredData: true });
//   return authController.resetPasswordFinal(req, res);
// });




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




exports.subscriptionsCreate = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Метод не дозволений, використовуйте POST" });
    }

    logger.info("Handling subscriptionsCreate request...", { structuredData: true });
    return paymentsController.subscriptionsCreate(req, res);
  });
});

exports.subscriptionsEdit = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Метод не дозволений, використовуйте POST" });
    }

    logger.info("Handling subscriptionsEdit request...", { structuredData: true });
    return paymentsController.subscriptionsEdit(req, res);
  });
});

exports.deleterSubscriptions = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Метод не дозволений, використовуйте POST" });
    }

    logger.info("Handling deleterSubscriptions request...", { structuredData: true });
    return paymentsController.deleterSubscriptions(req, res);
  });
});

exports.getSubscriptions = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Метод не дозволений, використовуйте GET" });
    }

    logger.info("Handling getSubscriptions request...", { structuredData: true });
    return paymentsController.getSubscriptions(req, res);
  });
});














exports.paymentsPurchase = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Метод не дозволений, використовуйте POST' });
    }

    logger.info('Handling paymentsPurchase request...', { structuredData: true });
    return paymentsController.paymentsPurchase(req, res);
  });
});


exports.paymentsWebhook = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Метод не дозволений, використовуйте POST' });
    }

    logger.info('Handling paymentsWebhook request...', { structuredData: true });
    return paymentsController.paymentsWebhook(req, res);
  });
});


exports.payoutsSend = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Метод не дозволений, використовуйте POST' });
    }

    logger.info('Handling payoutsSend request...', { structuredData: true });
    return paymentsController.payoutsSend(req, res);
  });
});


exports.payoutsStatus = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Метод не дозволений, використовуйте GET' });
    }

    logger.info('Handling payoutsStatus request...', { structuredData: true });
    return paymentsController.payoutsStatus(req, res);
  });
});


exports.pay = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Метод не дозволений, використовуйте POST' });
    }

    logger.info('Handling pay request...', { structuredData: true });
    return paymentsController.pay(req, res);
  });
});


exports.payWebhook = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Метод не дозволений, використовуйте POST' });
    }

    logger.info('Handling payWebhook request...', { structuredData: true });
    return paymentsController.payWebhook(req, res);
  });
});

exports.payWebhookDouble  = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Метод не дозволений, використовуйте POST' });
    }

    logger.info('Handling payWebhookDouble  request...', { structuredData: true });
    return paymentsController.payWebhookDouble(req, res);
  });
});













exports.updateName = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Метод не дозволений, використовуйте POST' });
    }

    logger.info('Handling updateName request...', { structuredData: true });
    return AdminMainDataController.updateName(req, res);
  });
});


exports.updateDescription = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Метод не дозволений, використовуйте POST' });
    }

    logger.info('Handling updateDescription request...', { structuredData: true });
    return AdminMainDataController.updateDescription(req, res);
  });
});


exports.updateContacts = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Метод не дозволений, використовуйте POST' });
    }

    logger.info('Handling updateContacts request...', { structuredData: true });
    return AdminMainDataController.updateContacts(req, res);
  });
});



exports.updateWorkingHours = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Метод не дозволений, використовуйте POST' });
    }

    logger.info('Handling updateWorkingHours request...', { structuredData: true });
    return AdminMainDataController.updateWorkingHours(req, res);
  });
});


exports.updateAddress = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Метод не дозволений, використовуйте POST' });
    }

    logger.info('Handling updateAddress request...', { structuredData: true });
    return AdminMainDataController.updateAddress(req, res);
  });
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
















exports.uploadImage = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Метод не дозволений, використовуйте POST" });
    }

    logger.info("Handling subscriptionsCreate request...", { structuredData: true });
    return addController.uploadImage(req, res);
  });
});



exports.createNewBean = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Метод не дозволений, використовуйте POST" });
    }

    logger.info("Handling subscriptionsCreate request...", { structuredData: true });
    return addController.createNewBean(req, res);
  });
});



exports.findBeans  = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Метод не дозволений, використовуйте POST" });
    }

    logger.info("Handling findBeans  request...", { structuredData: true });
    return addController.findBeans (req, res);
  });
});


exports.findRoaster  = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Метод не дозволений, використовуйте POST" });
    }

    logger.info("Handling findRoaster  request...", { structuredData: true });
    return addController.findRoaster (req, res);
  });
});




exports.superUser  = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Метод не дозволений, використовуйте POST" });
    }

    logger.info("Handling superUser request...", { structuredData: true });
    return addController.superUser (req, res);
  });
});


exports.getCafeDataByUrl  = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Метод не дозволений, використовуйте POST" });
    }

    logger.info("Handling getCafeDataByUrl request...", { structuredData: true });
    return dataController.getCafeDataByUrl (req, res);
  });
});



exports.getRoasterByInput  = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Метод не дозволений, використовуйте POST" });
    }

    logger.info("Handling getRoasterByInput request...", { structuredData: true });
    return dataController.getRoasterByInput (req, res);
  });
});


exports.getCoffeByInput  = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Метод не дозволений, використовуйте POST" });
    }

    logger.info("Handling getCoffeByInput request...", { structuredData: true });
    return dataController.getCoffeByInput (req, res);
  });
});



exports.getAllRoasters  = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Метод не дозволений, використовуйте POST" });
    }

    logger.info("Handling getAllRoasters request...", { structuredData: true });
    return dataController.getAllRoasters (req, res);
  });
});


exports.getAllCoffe  = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Метод не дозволений, використовуйте POST" });
    }

    logger.info("Handling getAllCoffe request...", { structuredData: true });
    return dataController.getAllCoffe (req, res);
  });
});



exports.validAccesAdmin = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Метод не дозволений, використовуйте POST" });
    }

    logger.info("Handling validAccesAdmin request...", { structuredData: true });
    return dataController.validAccesAdmin (req, res);
  });
});

