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
  validate.validateEmail(email);
  validate.validatePassword(password);
    const userData = await authService.registration(email, password);
    res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
    return res.json(userData)
  } catch(e) {
    if (e instanceof ApiError) {
      return res.status(e.status).json({ message: e.message, errors: e.errors });
    }
    return res.status(500).json({ message: 'Internal server error. Please try again later.' });
  }
}

async login (req, res) {
  try {
    const {email, password} = req.body
    if(!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    validate.validateEmail(email);
    validate.validatePassword(password);
    const userData = await authService.login(email, password)
    res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
    return res.json(userData)
} catch (e) {
    if (e instanceof ApiError) {
        return res.status(e.status).json({ message: e.message, errors: e.errors });
    }
    console.error(e); 
    return res.status(500).json({ message: 'Внутрішня помилка сервера. Спробуйте ще раз пізніше.' })
}
}

async logout (req, res) {
  try {
  const cookies = req.headers.cookie;
  const refreshToken = cookies ? cookies.split('; ').find(row => row.startsWith('refreshToken=')).split('=')[1] : null;

  if (!refreshToken) {
    return res.status(400).json({ error: 'refresh token are required' });
  }
  const token = await authService.logout(refreshToken)
  res.clearCookie('refreshToken')
  return res.json(token)
  }catch (e) {
    if (e instanceof ApiError) {
        return res.status(e.status).json({ message: e.message, errors: e.errors });
    }
    console.error(e); 
    return res.status(500).json({ message: 'Внутрішня помилка сервера. Спробуйте ще раз пізніше.' })
}
}


async refresh (req, res) {
  try {
  const cookies = req.headers.cookie;
  const refreshToken = cookies ? cookies.split('; ').find(row => row.startsWith('refreshToken=')).split('=')[1] : null;

  if (!refreshToken) {
    throw ApiError.BadRequest('Refresh token is required');
  }
  const userData = await authService.refresh(refreshToken)
  res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
  return res.json(userData)
} catch (e) {
  if (e instanceof ApiError) {
      return res.status(e.status).json({ message: e.message, errors: e.errors });
  }
  console.error(e); 
  return res.status(500).json({ message: 'Внутрішня помилка сервера. Спробуйте ще раз пізніше.' })
}

}

}
module.exports = new authController();
