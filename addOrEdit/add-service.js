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


    async addBeans(country, high, process, producer, roasterId, roasting, variety) {
        try {
            if (!country && !high && !process && !producer && !roasterId && !roasting && !variety) {
                throw ApiError.BadRequest('At least one parameter is required');
            }
    
            let queryRef = admin.firestore().collection('beans');
    
            if (country) queryRef = queryRef.where('country', '==', country);
            if (high) queryRef = queryRef.where('high', '==', high);
            if (process) queryRef = queryRef.where('process', '==', process);
            if (producer) queryRef = queryRef.where('producer', '==', producer);
            if (roasterId) queryRef = queryRef.where('roasterId', '==', roasterId);
            if (roasting) queryRef = queryRef.where('roasting', '==', roasting);
            if (variety) queryRef = queryRef.where('variety', '==', variety);
    
            const existingBeansSnapshot = await queryRef.get();
            const existingBeans = existingBeansSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
            if (existingBeans.length > 0) {
                const updatedBeans = [];
                
                for (const bean of existingBeans) {
                    if (!bean.isVerified) {
                        await admin.firestore().collection('beans').doc(bean.id).update({ isVerified: true });
                    }
                    updatedBeans.push(bean.id);
                }
    
                return { beanIds: updatedBeans };
            }
    
            const newBeanRef = await admin.firestore().collection('beans').add({
                ...query,
                isVerified: true,
            });
    
            return { beanIds: [newBeanRef.id] };
        } catch (e) {
            if (e instanceof ApiError) {
                throw e;
            }
            throw ApiError.InternalError(e.message);
        }
    }
    

}

module.exports = new AddService();