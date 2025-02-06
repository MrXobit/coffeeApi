const admin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');
const ApiError = require('../error/ApiError');




class AddService { 
    async addNewRoaster(uid, name) {
        try {
            const userRef = await admin.firestore()
                .collection('cafe')
                .where('uid', '==', uid)
                .get();
            if (userRef.empty) {
                throw ApiError.BadRequest('User not found');
            }
            const userDoc = userRef.docs[0]; 
            const userData = userDoc.data();
            const newRoasterId = uuidv4();
            const newRoaster = {
                id: newRoasterId,
                name: name
            };
            await admin.firestore().collection('roasters').doc(newRoasterId).set(newRoaster);
            let updatedRoasters = [];
            if (userData.roasters && Array.isArray(userData.roasters)) {
                updatedRoasters = [...userData.roasters, newRoasterId]; 
            } else {
                updatedRoasters = [newRoasterId]; 
            }
            await admin.firestore().collection('cafe').doc(userDoc.id).update({
                roasters: updatedRoasters
            });
            return { message: 'Roaster added successfully', roaster: newRoaster };
        } catch (e) {
            if (e instanceof ApiError) {
                throw e;
            }
            throw ApiError.InternalError(e.message);
        }
    }


}

module.exports = new AddService();