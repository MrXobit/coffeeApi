const admin = require('firebase-admin');
const ApiError = require('../error/ApiError');
const uuid = require('uuid');



class CoreService { 

  async registration (email, password) {
    try {
      const userRecord = await admin.auth().createUser({ 
        email,
        password,
      });
      return { uid: userRecord.uid, email: userRecord.email };
    } catch (e) {
      console.error("Error during registration:", e);
      
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
    await userRef.set({
      uid: userRecord.uid,
      email: userRecord.email,
      privileges: privileges,
    });
    return { uid: userRecord.uid, email: userRecord.email, privileges: privileges};
  } catch (e) {
    if (e instanceof ApiError) {
      throw e;
    }
    throw ApiError.InternalError('Internal server error. Please try again later.');
  }
}



  
}

module.exports = new CoreService();