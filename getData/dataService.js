const admin = require('firebase-admin');




class dataService { 
    async getAllBeans(count, offset) {
        try {
            const db = admin.firestore();
            let query = db.collection('beans');

            if (!isNaN(offset) && offset > 0) {
                query = query.offset(offset);
            }
            if (!isNaN(count) && count > 0) {
                query = query.limit(count);
            }

            const snapshot = await query.get();

            if (snapshot.empty) {
                return []; 
            }

            const beans = [];
            snapshot.forEach(doc => {
                beans.push({ id: doc.id, ...doc.data() });
            });

            return beans;
        } catch (e) {
            if (e instanceof ApiError) {
              throw e;
            }
            throw ApiError.InternalError('Internal server error. Please try again later.');
          }
    }
    async getAllParameters() {
        try {
            const db = admin.firestore();
            const parametersRef = db.collection('parameters');
            const snapshot = await parametersRef.get();

            let responseData = {};

            snapshot.forEach(doc => {
                responseData[doc.id] = doc.data();
            });

            return responseData;
        } catch (e) {
            console.log('err' + e)
            console.error("Error fetching parameters:", e);
            if (e instanceof ApiError) {
                throw e;
            }
            throw ApiError.InternalError('Internal server error. Please try again later.');
        }
    }
    
    
    

    async getAllRoasters(count, offset) {
        try {
            const db = admin.firestore();
            let query = db.collection('roasters');
    
            if (!isNaN(offset) && offset > 0) {
                query = query.offset(offset);
            }
            if (!isNaN(count) && count > 0) {
                query = query.limit(count);
            }
    
            const snapshot = await query.get();
    
            if (snapshot.empty) {
                return []; 
            }
    
            const roasters = [];
            snapshot.forEach(doc => {
                roasters.push({ id: doc.id, ...doc.data() });
            });
    
            return roasters;
        } catch (e) {
            if (e instanceof ApiError) {
                throw e;
            }
            throw ApiError.InternalError('Internal server error. Please try again later.');
        }
    }

    async getAllUsersCoffeeLogs() {
        try {
            const db = admin.firestore();
            const usersSnapshot = await db.collection('users').get();
            
            if (usersSnapshot.empty) {
                return [];
            }
    
            let coffeeLogs = [];
    
            for (const userDoc of usersSnapshot.docs) {
                const coffeeLogSnapshot = await db.collection('users')
                    .doc(userDoc.id)
                    .collection('coffee_log')
                    .get();
    
                if (!coffeeLogSnapshot.empty) {
                    const userCoffeeLogs = coffeeLogSnapshot.docs.map(doc => ({
                        id: doc.id,
                        userId: userDoc.id,
                        ...doc.data()
                    }));
                    coffeeLogs.push(...userCoffeeLogs);
                }
            }
    
            return coffeeLogs;
        } catch (e) {
            if (e instanceof ApiError) {
                throw e;
            }
            throw ApiError.InternalError('Internal server error. Please try again later.');
        }
    }
    
    

}

module.exports = new dataService();