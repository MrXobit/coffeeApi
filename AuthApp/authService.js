const admin = require('firebase-admin');
const ApiError = require('../error/ApiError');
const { v4: uuidv4 } = require('uuid');
const mailService = require('../mail/mailService');
const axios = require('axios');


class CoreService { 

  async registration(email, password) {
    try {
      // Перевірка чи вже існує користувач з таким email у Firebase Authentication
      try {
        await admin.auth().getUserByEmail(email);
        throw ApiError.BadRequest('A user with this email already exists');
      } catch (error) {
        if (error.code !== 'auth/user-not-found') {
          throw error; // Якщо це інша помилка, кидаємо її
        }
      }
  
      // Створення нового користувача через Firebase Authentication
      const userRecord = await admin.auth().createUser({
        email,
        password,
      });
  
      // Додавання інформації про користувача у Firestore
      const userRef = admin.firestore().collection('users').doc(userRecord.uid);
      await userRef.set({
        uid: userRecord.uid,
        email: userRecord.email,
        privileges: null,
        resetPasswordLink: null,
        resetIsActivated: false,
        resetPasswordExpiry: null,
        registrationMethod: 'email',
      });
  
      // Перевірка чи документ користувача створено в Firestore
      const userDoc = await userRef.get();
      if (!userDoc.exists) {
        throw new ApiError(404, 'User not found');
      }
  
      const userData = userDoc.data();
  
      // Генерація кастомного токену для автоматичного входу
   
      // Повернення даних користувача та токену
      const responseData = {
        email: userData.email,
        uid: userData.uid,
        privileges: userData.privileges,
        registrationMethod: userData.registrationMethod,
      };
  
      return responseData;
  
    } catch (e) {
      console.log(e);
      if (e instanceof ApiError) {
        throw e;
      }
      throw new ApiError.InternalError('Internal server error. Please try again later.');
    }
  }


  async registerWithGoogle(idToken) {
    try {
      const remoteConfig = admin.remoteConfig();
      const template = await remoteConfig.getTemplate();
      const apiKey = template.parameters['API_KEY']?.defaultValue?.value;
  
      if (!apiKey) {
        throw ApiError.BadRequest('API_KEY is not set in Remote Config');
      }
  
      const response = await axios.post(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=${apiKey}`,
        {
          postBody: `id_token=${idToken}&providerId=google.com`,
          requestUri: "https://us-central1-coffee-bee.cloudfunctions.net/registerWithGoogle",
          returnIdpCredential: true,
          returnSecureToken: true,
        }
      );
  
      const { localId, email } = response.data;
      const existingUser = await admin.firestore().collection('users').where('email', '==', email).get();
      if (!existingUser.empty) {
        throw ApiError.BadRequest('A user with this email already exists');

      }
      const userRef = admin.firestore().collection('users').doc(localId);
      
      await userRef.set(
        {
          uid: localId,
          email,
          privileges: null,
          registrationMethod: 'google',
        }
      );
  
      return { uid: localId, email };
    } catch (e) {
      if (e instanceof ApiError) {
        throw e;
      }
      throw ApiError.InternalError('Internal server error. Please try again later.');
    }
  }
  



  // async resetPasswordEmail(email) {
  //   try {
  //     if (!email) {
  //       throw ApiError.BadRequest('Email is required.');
  //     }
  //     const userRef = admin.firestore().collection('users').where('email', '==', email);
  //     const userSnapshot = await userRef.get();
  
  //     if (userSnapshot.empty) {
  //       throw ApiError.BadRequest('User not found.');
  //     }
  
  //     const userDoc = userSnapshot.docs[0];
  //     const userData = userDoc.data();
  
  //     if (userData.registrationMethod === 'google') {
  //       throw ApiError.BadRequest('Cannot reset password for Google registered users.');
  //     }
  
  //     const resetPasswordLink = uuidv4();
  //     const resetPasswordExpiry = new Date(Date.now() + 600000);
  
  //     const updatedFields = {
  //       resetPasswordLink,
  //       resetIsActivated: false,
  //       resetPasswordExpiry,
  //     };
  
  //     await userDoc.ref.update(updatedFields);
  
  //     await mailService.initialize();
  //     await mailService.sendActivationMail(
  //       email,
  //       `https://us-central1-coffee-bee.cloudfunctions.net/resetpasswordLink?resetPasswordLink=${resetPasswordLink}`
  //     );
  
  //     return {
  //       resetPasswordLink,
  //       resetIsActivated: false,
  //       resetPasswordExpiry,
  //     };
  
  //   } catch (e) {
  //     if (e instanceof ApiError) {
  //       throw e;
  //     }
  //     throw ApiError.InternalError('Internal server error. Please try again later.');
  //   }
  // }


  async resetPasswordEmail(email) {
    try {
      if (!email) {
        throw ApiError.BadRequest('Email is required.');
      }
      
      const userRef = admin.firestore().collection('users').where('email', '==', email);
      const userSnapshot = await userRef.get();
  
      if (userSnapshot.empty) {
        throw ApiError.BadRequest('User not found.');
      }
  
      const userDoc = userSnapshot.docs[0];
      const userData = userDoc.data();
  
      if (userData.registrationMethod === 'google') {
        throw ApiError.BadRequest('Cannot reset password for Google registered users.');
      }
  
      const resetPasswordLink = uuidv4();
      const resetPasswordExpiry = new Date(Date.now() + 600000);
  
      const updatedFields = {
        resetPasswordLink,
        resetIsActivated: false,
        resetPasswordExpiry,
      };
  
      await userDoc.ref.update(updatedFields);
  
      await mailService.initialize();
      await mailService.sendActivationMail(
        email,
        `https://us-central1-coffee-bee.cloudfunctions.net/resetpasswordLink?resetPasswordLink=${resetPasswordLink}`
      );
  
      return {
        resetPasswordLink,
        resetIsActivated: false,
        resetPasswordExpiry,
        uid: userDoc.id // Додаємо поле uid
      };
  
    } catch (e) {
      if (e instanceof ApiError) {
        throw e;
      }
      throw ApiError.InternalError('Internal server error. Please try again later.');
    }
  }
  
  
  
  
  
  

async resetpasswordLink(resetPasswordLink) {
  try {
    if (!resetPasswordLink) {
      throw ApiError.BadRequest('Reset password link is required.');
    }

    const userRef = admin.firestore().collection('users').where('resetPasswordLink', '==', resetPasswordLink);
    const userSnapshot = await userRef.get();

    if (userSnapshot.empty) {
      throw ApiError.BadRequest('User does not have a valid reset password link.');
    }

    const userDoc = userSnapshot.docs[0];
    const userdata = userDoc.data();

    if (!userdata) {
      throw ApiError.BadRequest('User data not found.');
    }

    if (userdata.resetIsActivated) {
      throw ApiError.BadRequest('Password reset has already been activated.');
    }

    const resetPasswordExpiryMillis = userdata.resetPasswordExpiry.toMillis();
    if (Date.now() >= resetPasswordExpiryMillis) {
      throw ApiError.BadRequest('The reset password link has expired.');
    }

    if (userdata.registrationMethod === 'google') {
      throw ApiError.BadRequest('Cannot reset password for Google registered users.');
    }

    await userDoc.ref.update({
      resetIsActivated: true,
    });

    return { message: 'Password reset has been successfully activated.' };

  } catch (e) {
    if (e instanceof ApiError) {
      throw e;
    }
    throw ApiError.InternalError('Internal server error. Please try again later.');
  }
}
async resetPasswordFinal(password, uid) {
  try {
    if (!password || !uid) {
      throw ApiError.BadRequest('Password and UID are required.');
    }

    const userRef = admin.firestore().collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      throw ApiError.BadRequest('User not found.');
    }

    const userdata = userDoc.data();

    if (!userdata.resetPasswordLink) {
      throw ApiError.BadRequest('Reset password link is required.');
    }

    if (!userdata.resetIsActivated) {
      throw ApiError.BadRequest('Password reset has not been activated yet.');
    }

    if (userdata.registrationMethod === 'google') {
      throw ApiError.BadRequest('Cannot reset password for Google registered users.');
    }

    await admin.auth().updateUser(uid, {
      password: password
    });

    const updatedFields = {
      resetPasswordLink: null,
      resetIsActivated: false,
      resetPasswordExpiry: null,
    };

    await userRef.update(updatedFields);

    return {
      resetPasswordLink: null,
      resetIsActivated: false,
      resetPasswordExpiry: null,
      uid: userDoc.id // Додаємо uid
    };

  } catch (e) {
    if (e instanceof ApiError) {
      throw e;
    }
    throw ApiError.InternalError('Internal server error. Please try again later.');
  }
}




async checkAuth () {
  
}


  
}

module.exports = new CoreService();