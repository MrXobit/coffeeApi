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


    async addBeans(country, high, process, producer, roasterId, roasting, variety, ) {
        try {
            // const userRef = admin.firestore().collection('users').doc(uid);
            // const userDoc = await userRef.get();
            
            // if (!userDoc.exists) {
            //     throw ApiError.BadRequest("User not found");
            // }
    
            // const userData = userDoc.data();
    
            // const accessRef = admin.firestore().collection('accessAdmin').doc(userData.email);
            // const accessDoc = await accessRef.get();
            
            // if (!accessDoc.exists) {
            //     throw ApiError.BadRequest("Access denied");
            // }

    
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

    async findBeans(search, count, offset) {
        try {
            if (!search) {
                // Пошук без параметрів
                let beansRef = admin.firestore().collection('beans'); 
                const totalSnapshot = await beansRef.get();
                const totalCount = totalSnapshot.size;
    
                if (!isNaN(offset) && offset > 0) {
                    beansRef = beansRef.offset(offset);
                }
                if (!isNaN(count) && count > 0) {
                    beansRef = beansRef.limit(count);
                }
                
                const snapshot = await beansRef.get();
                const beans = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
                return { beans, totalCount };
            } else {
                // Пошук за параметром
                const beansRef = admin.firestore().collection('beans'); // Тут теж Firestore
                const snapshot = await beansRef.get();
                const results = [];
            
                snapshot.docs.forEach(doc => {
                    const data = { id: doc.id, ...doc.data() };
            
                    for (const key in data) {
                        if (data.hasOwnProperty(key)) {
                            const value = data[key];
            
                            if (typeof value === 'string' && value.toLowerCase().includes(search.toLowerCase())) {
                                results.push(data);
                            }
            
                            if (typeof value === 'number' && value.toString() === search) {
                                results.push(data);
                            }
                        }
                    }
                });
            
                // Видаляємо дублікати
                const uniqueResults = Array.from(new Map(results.map(item => [item.id, item])).values());
                const totalCount = uniqueResults.length;
                const beans = uniqueResults
            
                return { beans, totalCount };
            }
        } catch (e) {
            console.log(e);
            if (e instanceof ApiError) {
                throw e;
            }
            throw ApiError.InternalError(e.message);
        }
    }

    async findRoaster(roasterName, uid, cafeId) {
        try {
            const userRef = admin.firestore().collection('users').doc(uid);
            const userSnapshot = await userRef.get();
    
            const userData = userSnapshot.data();
            if (!userSnapshot.exists) {
                throw ApiError.BadRequest('User not found.');
            }
    
            const getaccess = admin.firestore().collection('accessAdmin').doc(userData.email);
            const getaccessDoc = await getaccess.get();
            if (!getaccessDoc.exists) {
                throw ApiError.BadRequest('Access not granted');
            }
            const getAccessData = getaccessDoc.data();
            if (!getAccessData.allowedCafeIds.includes(cafeId)) {
                throw ApiError.BadRequest('Access not granted');
            }
    
            const roasterSet = new Set();
            const lowArch = roasterName.charAt(0).toUpperCase() + roasterName.slice(1);
            const UpperCase = roasterName.charAt(0).toLowerCase() + roasterName.slice(1);
    
            const roasterRefFullWorlds = admin.firestore().collection('roasters').where('name', '==', lowArch);
            const roasterRefFullWorldsUpper = admin.firestore().collection('roasters').where('name', '==', UpperCase);
    
            const [snapshotLower, snapshotUpper] = await Promise.all([
                roasterRefFullWorlds.get(),
                roasterRefFullWorldsUpper.get()
            ]);
    
            snapshotLower.forEach(doc => roasterSet.add(doc.id)); 
            snapshotUpper.forEach(doc => roasterSet.add(doc.id)); 
    
            const roasterRefLower = admin.firestore().collection('roasters')
                .orderBy('name')
                .startAt(UpperCase)
                .endAt(UpperCase + '\uf8ff');
    
            const roasterRefUpper = admin.firestore().collection('roasters')
                .orderBy('name')
                .startAt(lowArch)
                .endAt(lowArch + '\uf8ff');
    
            const [snapshotPartialLower, snapshotPartialUpper] = await Promise.all([
                roasterRefLower.get(),
                roasterRefUpper.get()
            ]);
    
            snapshotPartialLower.forEach(doc => roasterSet.add(doc.id)); 
            snapshotPartialUpper.forEach(doc => roasterSet.add(doc.id)); 
    
            const roasters = [];
            for (const roasterId of roasterSet) {
                const roasterDoc = await admin.firestore().collection('roasters').doc(roasterId).get();
                if (roasterDoc.exists) {
                    roasters.push({ id: roasterId, ...roasterDoc.data() });
                }
            }
    
            return roasters;
    
        } catch (e) {
            console.log(e);
            if (e instanceof ApiError) {
                throw e;
            }
            throw ApiError.InternalError(e.message);
        }
    }

    
    

    

}

module.exports = new AddService();    