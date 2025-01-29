const jwt = require('jsonwebtoken');
const admin = require('firebase-admin');
const ApiError = require('../error/ApiError');

class TokenService {

    generateTokens(payload) {
        const refreshToken = jwt.sign(payload, 'your-secret-key', {expiresIn: '30d'})
        return refreshToken
    }

    async saveToken(userId, refreshToken) {
      try {
        const tokenRef = admin.firestore().collection('tokens').where('userId', '==', userId);
        const tokenSnapshot = await tokenRef.get();
        if (!tokenSnapshot.empty) {
          const tokenDoc = tokenSnapshot.docs[0];
          await tokenDoc.ref.update({ refreshToken });
          console.log(`Token for user ${userId} updated.`);
        } else {
          const tokenData = { userId, refreshToken };
          await admin.firestore().collection('tokens').add(tokenData);
          console.log(`New token for user ${userId} created.`);
        }
        return { userId, refreshToken };
      } catch (error) {
        console.error('Error saving token: ', error);
        throw new Error('Failed to save token');
      }
    }
    
      
  async removeToken(refreshToken) {
    try {
        const tokenRef = admin.firestore().collection('tokens').where('refreshToken', '==', refreshToken);
        const snapshot = await tokenRef.get();

        if (snapshot.empty) {
            throw ApiError.BadRequest('Token not found');
        }
        snapshot.forEach(async (doc) => {
            await doc.ref.delete(); 
        });

        return { message: 'Token successfully deleted' };
    } catch (error) {
        console.error('Error removing token:', error);
        if (error instanceof ApiError) {
            throw error; 
        }
        throw ApiError.InternalError('Failed to remove token');
    }
}
      
async validateRefreshToken(token) {
  try {
     const userData = jwt.verify(token, 'your-secret-key')
     return userData
  } catch(e) {
      return null
  }
}  
      
      
      


}


module.exports = new TokenService();

