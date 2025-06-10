const ApiError = require('../error/ApiError');
const validate = require('../utils/validate');
const authService = require('./authService');
const admin = require('firebase-admin');

class authController {

async registration (req, res) {
  try {
    const {email, password} = req.body
    if(!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    await validate.validateEmail(email)
    await validate.validatePassword(password)
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





async resetPasswordEmail(req, res) {
  try {
    const { email } = req.body;
    const userData = await authService.resetPasswordEmail(email);
    return res.json(userData);
  } catch (e) {
    if (e instanceof ApiError) {
      return res.status(e.status).json({ message: e.message, errors: e.errors });
    }
    return res.status(500).json({ message: 'Internal server error. Please try again later.' });
  }
}


async resetpasswordLink(req, res) {
  try {
    const { resetPasswordLink } = req.query;  
    console.log('resetPasswordLink:', resetPasswordLink);
    await authService.resetpasswordLink(resetPasswordLink);
    return res.redirect(`https://coffee-bee.web.app/update-password`); 
  } catch (e) {
    if (e instanceof ApiError) {
      return res.status(e.status).json({ message: e.message, errors: e.errors });
    }
    return res.status(500).json({ message: 'Internal server error. Please try again later.' });
  }
}



async resetPasswordFinal(req, res) {
  try {
    const { password, uid } = req.body;
    const userData = await authService.resetPasswordFinal(password, uid);
    return res.json(userData);
  } catch (e) {
    if (e instanceof ApiError) {
      return res.status(e.status).json({ message: e.message, errors: e.errors });
    }
    return res.status(500).json({ message: 'Internal server error. Please try again later.' });
  }
}

async checkAuth (req, res) {
  try {
    const token = req.headers.authorization.split(' ')[1]; 

    if (!token) {
      throw new ApiError(401, 'No token provided');
    }
    console.log('Authorization Header:', req.headers.authorization);

  
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    const uid = decodedToken.uid;
    const userRef = admin.firestore().collection('users').doc(uid);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      throw new ApiError(404, 'User not found');
    }

    const userData = userDoc.data();
    const responseData = {
      email: userData.email,
      uid: userData.uid,
      privileges: userData.privileges,
      registrationMethod: userData.registrationMethod
    };

    return res.json(responseData); 
} catch (e) {
  console.log(e)
  if (e instanceof ApiError) {
    return res.status(e.status).json({ message: e.message, errors: e.errors });
  }
  return res.status(500).json({ message: 'Internal server error. Please try again later.' });
}
}

}
module.exports = new authController();
