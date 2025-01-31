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

exports.grantUserAccess = onRequest((req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Метод не дозволений, використовуйте POST' });
  }

  logger.info('Handling user access grant...', { structuredData: true });
  return authController.grantUserAccess(req, res);
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


exports.logout = onRequest((req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Метод не дозволений, використовуйте POST' });
  }

  logger.info('Handling user logout request...', { structuredData: true });
  return authController.logout(req, res);
});




