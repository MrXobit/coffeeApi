const admin = require('firebase-admin');
const ApiError = require('../../error/ApiError');
const { v4: uuidv4 } = require('uuid');

class AccessService {
    async accessAddAdmin(email, cafeId) {
        try {
            const cafeRef = admin.firestore().collection('cafe').doc(cafeId);
            const cafeSnapshot = await cafeRef.get();

            if (!cafeSnapshot.exists) {
                throw ApiError.BadRequest('Cafe not found.');
            }

            const adminAccessRef = admin.firestore().collection('accessAdmin').doc(email);
            const adminAccessSnapshot = await adminAccessRef.get();
            let allowedCafeIds = [];

            if (adminAccessSnapshot.exists) {
                allowedCafeIds = adminAccessSnapshot.data().allowedCafeIds || [];

                if (allowedCafeIds.includes(cafeId)) {
                    return { message: 'Cafe already granted to this admin.' };
                } else {
                    allowedCafeIds.push(cafeId);
                }
            } else {
                allowedCafeIds = [cafeId];
            }
            await adminAccessRef.set({
                email: email,
                allowedCafeIds: allowedCafeIds
            }, { merge: true });

            return { message: 'Admin access added successfully', allowedCafeIds };

        } catch (e) {
            if (e instanceof ApiError) {
                throw e;
            }
            throw ApiError.InternalError('Internal server error. Please try again later.');
        }
    }
    async accessRemoveAdmin(email, cafeId) {
        try {
            const cafeRef = admin.firestore().collection('cafe').doc(cafeId);
            const cafeSnapshot = await cafeRef.get();
    
            if (!cafeSnapshot.exists) {
                throw ApiError.BadRequest('Cafe not found.');
            }
    
            const adminAccessRef = admin.firestore().collection('accessAdmin').doc(email);
            const adminAccessSnapshot = await adminAccessRef.get();
    
            if (!adminAccessSnapshot.exists) {
                throw ApiError.BadRequest('Admin access record not found.');
            }
    
            let allowedCafeIds = adminAccessSnapshot.data().allowedCafeIds || [];
            if (!allowedCafeIds.includes(cafeId)) {
                throw ApiError.BadRequest('Admin does not have access to this cafe.');
            }
    
            allowedCafeIds = allowedCafeIds.filter(id => id !== cafeId);
    
            await adminAccessRef.update({ allowedCafeIds });
    
            return { message: 'Admin access removed successfully', allowedCafeIds };
        } catch (e) {
            if (e instanceof ApiError) {
                throw e;
            }
            throw ApiError.InternalError('Internal server error. Please try again later.');
        }
    }
    
    async createCoffeeChain(name, cafeId) {
        try {
            if (typeof name !== 'string' || name.length > 100) {
                throw ApiError.BadRequest('Name must be a string and less than 100 characters');
            }            
            if (!Array.isArray(cafeId)) {
                throw ApiError.BadRequest('cafeId must be an array');
            }
            for (let i = 0; i < cafeId.length; i++) {
                const cafeRef = admin.firestore().collection('cafe').doc(cafeId[i]);
                const cafeDoc = await cafeRef.get();
            
                if (!cafeDoc.exists) {
                    throw ApiError.BadRequest(`Cafe with ID ${cafeId[i]} does not exist`);
                }
            }
            const id = uuidv4();
            await admin.firestore().collection('coffeeChain').doc(id).set({
                id,       
                name,     
                cafeId    
            });
    
            return { id, name, cafeId }; 
    
        } catch (e) {
            if (e instanceof ApiError) {
                throw e;
            }
            throw ApiError.InternalError('Internal server error. Please try again later.');
        }
    }
   
}

module.exports = new AccessService();

