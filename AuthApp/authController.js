const ApiError = require('../error/ApiError');
const validate = require('../utils/validate');
const authService = require('./authService');


class authController {

async registration (req, res) {
  try {
    const {email, password} = req.body
    if(!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const userData = await authService.registration(email, password)
    return res.json(userData)
  } catch(e) {
    if (e instanceof ApiError) {
      return res.status(e.status).json({ message: e.message, errors: e.errors });
    }
    return res.status(500).json({ message: 'Internal server error. Please try again later.' });
  }
}

async registerWithGoogle (req, res) {
  try {
    const { idToken } = req.body; 
    const userData = await authService.registerWithGoogle(idToken);
    return res.json(userData)
  } catch(e) {
    if (e instanceof ApiError) {
      return res.status(e.status).json({ message: e.message, errors: e.errors });
    }
    return res.status(500).json({ message: 'Internal server error. Please try again later.' });
  }
}

async grantUserAccess (req, res) {
  try {
    const {uid} = req.body
    const {privileges} = req.body  
    const userData = await authService.grantUserAccess(uid, privileges);
    return res.json(userData)
  } catch(e) {
    if (e instanceof ApiError) {
      return res.status(e.status).json({ message: e.message, errors: e.errors });
    }
    return res.status(500).json({ message: 'Internal server error. Please try again later.' });
  }
}



}
module.exports = new authController();
