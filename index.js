const { initializeFirebase } = require('./config/firebaseConfig');
initializeFirebase();
const { onRequest } = require('firebase-functions/v2/https');
const logger = require('firebase-functions/logger');
const authController = require('./AuthApp/authController');

exports.handleRegistrationRequest = onRequest((req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Метод не дозволений, використовуйте POST' });
  }

  logger.info('Handling registration...', { structuredData: true });
  return authController.registration(req, res);
});


exports.handleLoginRequest = onRequest((req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Метод не дозволений, використовуйте POST' });
  }

  logger.info('Handling login...', { structuredData: true });
  return authController.login(req, res);
});


exports.handleLogoutRequest = onRequest((req, res) => {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Метод не дозволений, використовуйте POST' });
  }

  logger.info('Handling logout...', { structuredData: true });
  return authController.logout(req, res);
});



exports.handleRefreshRequest = onRequest((req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Метод не дозволений, використовуйте POST' });
  }

  logger.info('Handling token refresh...', { structuredData: true });
  return authController.refresh(req, res);
});

