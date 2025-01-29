const admin = require('firebase-admin');
const bcrypt = require('bcrypt');
const UserDto = require('../dto/user-dto');
const tokenService = require('../token/tokenService');
const ApiError = require('../error/ApiError');
const uuid = require('uuid');



class CoreService { 

  async registration (email, password) {
    try {
      const user = admin.firestore().collection('users').where('email', '=', email);
      const snapshot = await user.get();
      if (!snapshot.empty) {
          throw ApiError.BadRequest(`A user with the email address ${email} already exists`);
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const id = uuid.v4()
      const newUser = {
          email,
          password: hashedPassword,
          id
      };

      const userDocRef = await admin.firestore().collection('users').doc(id).set(newUser);
      const userDto = new UserDto({ email, id });
      const refreshToken = tokenService.generateTokens({ ...userDto });

      await tokenService.saveToken(userDto.id, refreshToken);

      return {
          refreshToken,
          userDto: userDto
      };
  } catch (e) {
      if (e instanceof ApiError) {
          throw e;
      }
      throw ApiError.InternalError('Internal server error. Please try again later.');
  }
}



  async login (email, password) {
    try {
      const user = admin.firestore().collection('users').where('email', '=', email)
      const snapshot = await user.get();
    
      if (snapshot.empty) {
        throw ApiError.BadRequest(`A user with the email address ${email} is not registered yet`);
      }
    
      const userDoc = snapshot.docs[0]; 
      const userData = userDoc.data();
    
      const isPassValid = await bcrypt.compare(password, userData.password);
      if (!isPassValid) {
        throw ApiError.BadRequest('Incorrect password');
      }
    
      const userDto = new UserDto({ ...userData, id: userDoc.id }); 
      const refreshToken = tokenService.generateTokens({ ...userDto });
      await tokenService.saveToken(userDto.id, refreshToken)
    
      return {
        refreshToken, 
        userDto: userDto
            }
    } catch (error) {
      console.error(error);
      throw ApiError.InternalError('Internal server error. Please try again later.');
    }
  }
  
  async logout (refreshToken) {
    const token = await tokenService.removeToken(refreshToken)
    return token
  }



  async refresh(token) {
    try {
      const tokenRef = admin.firestore().collection('tokens').where('refreshToken', '==', token);
      const tokenFromDb = await tokenRef.get();
      const validToken = tokenService.validateRefreshToken(token);
      if (tokenFromDb.empty || !validToken) {
        throw ApiError.UnauthorizedError('Invalid or missing refresh token');
      }
  

      const tokenData = tokenFromDb.docs[0].data();
      console.log('Token found:', tokenData);
      const userRef = admin.firestore().collection('users').doc(tokenData.userId);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        throw ApiError.BadRequest('User not found');
      }
  
      const userData = userDoc.data();
      console.log('User found:', userData);
  
      const userDto = new UserDto(userData);
      const refreshToken = tokenService.generateTokens({ ...userDto });
      await tokenService.saveToken(userDto.id, refreshToken)
  
      return {
        refreshToken,
        user: userDto,
        
      };
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw ApiError.InternalError('Failed to refresh token');
    }
  }
  

  
}

module.exports = new CoreService();