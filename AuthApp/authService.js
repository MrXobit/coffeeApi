const admin = require('firebase-admin');
const ApiError = require('../error/ApiError');
const { v4: uuidv4 } = require('uuid');
const mailService = require('../mail/mailService');



class CoreService { 

  async registration (email, password) {
    try {
      const userRecord = await admin.auth().createUser({ 
        email,
        password,
      });
      return { uid: userRecord.uid, email: userRecord.email };
    } catch (e) {
      if (e.code === 'auth/email-already-exists') {
        throw ApiError.BadRequest('Email already in use.');
      } else if (e.code === 'auth/weak-password') {
        throw ApiError.BadRequest('Password is too weak.');
      }
      throw ApiError.InternalError('Internal server error. Please try again later.');
    }
  }

async registerWithGoogle(idToken) {
  try {
    const remoteConfig = admin.remoteConfig();
    const template = await remoteConfig.getTemplate();
    const apiKey = template.parameters['API_KEY'] ? template.parameters['API_KEY'].defaultValue.value : null;

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
    return response.data;
  } catch (error) {
    throw new ApiError(400, error.response?.data?.error?.message || 'Google registration failed');
  }
}

async logout (uid, privileges) {
  try {
    if (privileges !== 'roasters' && privileges !== 'cafe') {
      throw ApiError.BadRequest('Invalid privileges. User must have either "roasters" or "cafe" privileges.');
    }
    const userRef = admin.firestore().collection(privileges).doc(uid);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      throw ApiError.BadRequest("User not found in Firestore.");
    }
    let userRecord;
    try {
      userRecord = await admin.auth().getUser(uid);
    } catch (error) {
      throw ApiError.BadRequest("User not found in Firebase Authentication.");
    }
    await admin.auth().deleteUser(uid);
    await userRef.delete();
    return {
      email: userRecord.email,
      uid: userRecord.uid,
      message: `User ${userRecord.email} deleted successfully.`,
    };
} catch (e) {
  if (e instanceof ApiError) {
    throw e;
  }
  throw ApiError.InternalError('Internal server error. Please try again later.');
}
}


async grantUserAccess (uid, privileges) {
  try {
    if (privileges !== 'roasters' && privileges !== 'cafe') {
      throw ApiError.BadRequest('Invalid privileges. User must have either "roasters" or "cafe" privileges.');
    }
    let userRecord;
    try {
      userRecord = await admin.auth().getUser(uid);
    } catch (error) {
      throw ApiError.BadRequest('User not found.');
    }
    const userRef = admin.firestore().collection(privileges).doc(uid);
    const userDoc = await userRef.get();
    if (userDoc.exists) {
      throw ApiError.BadRequest('User is already registered with these privileges.');
    }
    const otherCollection = privileges === 'roasters' ? 'cafe' : 'roasters';
    const otherRef = admin.firestore().collection(otherCollection).doc(uid);
    const otherDoc = await otherRef.get();
    if (otherDoc.exists) {
      throw ApiError.BadRequest('User is already registered with different privileges.');
    }
    const resetPasswordLink = null; 
    const resetIsActivated = false;
    const resetPasswordExpiry = null; 
    
    await userRef.set({
      uid: userRecord.uid,
      email: userRecord.email,
      privileges: privileges,
      resetPasswordLink: resetPasswordLink,
      resetIsActivated: resetIsActivated,
      resetPasswordExpiry: resetPasswordExpiry,
    });
    return { uid: userRecord.uid, email: userRecord.email, privileges: privileges};
  } catch (e) {
    if (e instanceof ApiError) {
      throw e;
    }
    throw ApiError.InternalError('Internal server error. Please try again later.');
  }
}

async resetPasswordEmail(email, privileges) {
  try {
    if (privileges !== 'roasters' && privileges !== 'cafe') {
      throw ApiError.BadRequest('Invalid privileges. User must have either "roasters" or "cafe" privileges.');
    }
    if(!email) {
      throw ApiError.BadRequest('Email is required.');
    }
    const userRef = admin.firestore().collection(privileges).where('email', '==', email);
    const userSnapshot = await userRef.get();     
    if (userSnapshot.empty) {
      throw ApiError.BadRequest('User not found.');
    }
    const userDoc = userSnapshot.docs[0];
    const resetPasswordLink = uuidv4();
    const resetPasswordExpiry = new Date(Date.now() + 600000); 
    await userDoc.ref.update({
      resetPasswordLink: resetPasswordLink,
      resetIsActivated: false,
      resetPasswordExpiry: resetPasswordExpiry,
    });
    await mailService.initialize();
    await mailService.sendActivationMail(email, `https://us-central1-coffee-bee.cloudfunctions.net/resetpasswordLink?resetPasswordLink=${resetPasswordLink}&privileges=${privileges}`);
    return { message: 'Password reset link has been sent to your email.' };
  } catch (e) {
    if (e instanceof ApiError) {
      throw e;
    }
    if (e.message.includes('Failed to send activation mail')) {
      throw ApiError.InternalError('Failed to send activation mail. Please try again later.');
    }
    throw ApiError.InternalError('Internal server error. Please try again later.');
  }
}

async resetpasswordLink(resetPasswordLink, privileges) {
  try {
    if (privileges !== 'roasters' && privileges !== 'cafe') {
      throw ApiError.BadRequest('Invalid privileges. User must have either "roasters" or "cafe" privileges.');
    }
    if (!resetPasswordLink) {
      throw ApiError.BadRequest('Reset password link is required.');
    }
    const userRef = admin.firestore().collection(privileges).where('resetPasswordLink', '==', resetPasswordLink);
    const userSnapshot = await userRef.get();
    if (userSnapshot.empty) {
      throw ApiError.BadRequest('User does not have a valid reset password link.');
    }
    const userDoc = userSnapshot.docs[0];
    const userdata = userDoc.data();
    if (!userdata) {
      throw ApiError.BadRequest('User data not found.');
    }
    const resetPasswordExpiryMillis = userdata.resetPasswordExpiry.toMillis();
    if (Date.now() >= resetPasswordExpiryMillis) {
      throw ApiError.BadRequest('The reset password link has expired.');
    }
    if (userdata.resetIsActivated) {
      throw ApiError.BadRequest('Password reset has already been activated.');
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

async resetPasswordFinal (password, uid, privileges) {
  try {
  if (!password || !uid || !privileges) {
    throw ApiError.BadRequest('Password, UID, and privileges are required.');
  }
  if (privileges !== 'roasters' && privileges !== 'cafe') {
    throw ApiError.BadRequest('Invalid privileges. User must have either "roasters" or "cafe" privileges.');
  }
  const userRef = admin.firestore().collection(privileges).doc(uid);
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
  await admin.auth().updateUser(uid, {
    password: password
  });
  await userRef.update({
    resetPasswordLink: null,
    resetIsActivated: false,
    resetPasswordExpiry: null,
  });
  return { message: 'Password has been successfully reset.' };
}catch (e) {
  if (e instanceof ApiError) {
    throw e;
  }
  throw ApiError.InternalError('Internal server error. Please try again later.');
}

  
}



  
}

module.exports = new CoreService();