const { default: axios } = require('axios');
const admin = require('firebase-admin');
const ApiError = require('../error/ApiError');




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
        
            // Окремо запит для отримання загальної кількості роастерів
            const totalSnapshot = await db.collection('roasters').get();
            const totalRoasters = totalSnapshot.size;  // Загальна кількість роастерів
        
            const snapshot = await query.get();
        
            if (snapshot.empty) {
                return { roasters: [], totalCount: totalRoasters }; // Повертаємо загальну кількість разом з пустим списком
            }
        
            const roasters = [];
            snapshot.forEach(doc => {
                roasters.push({ id: doc.id, ...doc.data() });
            });
        
            return { roasters, totalCount: totalRoasters }; // Повертаємо списки роастерів і загальну кількість
        } catch (e) {
            if (e instanceof ApiError) {
                throw e;
            }
            throw ApiError.InternalError('Internal server error. Please try again later.');
        }
    }
    
    

    async getAllCoffe(count, offset) {
        try {
            const db = admin.firestore();
            let query = db.collection('cafe');
        
            if (!isNaN(offset) && offset > 0) {
                query = query.offset(offset);
            }
            if (!isNaN(count) && count > 0) {
                query = query.limit(count);
            }
        
   
            const totalSnapshot = await db.collection('cafe').get();
            const totalRoasters = totalSnapshot.size;  
        
            const snapshot = await query.get();
        
            if (snapshot.empty) {
                return { roasters: [], totalCount: totalRoasters }; 
            }
        
            const roasters = [];
            snapshot.forEach(doc => {
                roasters.push({ id: doc.id, ...doc.data() });
            });
        
            return { roasters, totalCount: totalRoasters }; 
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
    





 
    async getCafeDataByUrl(url, apiKey) {
        try {
            function extractCoordinates(url) {
                const matchD = url.match(/!3d([\d.-]+)!4d([\d.-]+)/);
                if (matchD) {
                    return { lat: parseFloat(matchD[1]), lng: parseFloat(matchD[2]) };
                }
                const matchAt = url.match(/@([\d.-]+),([\d.-]+)/);
                if (matchAt) {
                    return { lat: parseFloat(matchAt[1]), lng: parseFloat(matchAt[2]) };
                }
                return null;
            }
    
            function extractNameFromUrl(url) {
                const match = url.match(/maps\/place\/([^/]+)/);
                if (match) {
                    let name = match[1];
                    return decodeURIComponent(decodeURIComponent(name.replace(/\+/g, ' ')));
                }
                return null;
            }
    
            const normalize = str => str
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-z0-9]/gi, '');
    
            const coordinates = extractCoordinates(url);
            const placeName = extractNameFromUrl(url);
    
            if (!coordinates || !placeName) {
                throw new Error('Could not extract both coordinates and place name from URL');
            }
    
            const query = encodeURIComponent(`${placeName} near ${coordinates.lat},${coordinates.lng}`);
            const textSearchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${apiKey}`;
    
            const textSearchRes = await axios.get(textSearchUrl);
    
            if (textSearchRes.data.results?.length) {
                const targetName = normalize(placeName);
    
                const exactMatch = textSearchRes.data.results.find(result => {
                    const resultName = normalize(result.name);
                    const distLat = Math.abs(result.geometry.location.lat - coordinates.lat);
                    const distLng = Math.abs(result.geometry.location.lng - coordinates.lng);
                    return resultName.includes(targetName) && distLat < 0.002 && distLng < 0.002;
                });
    
                if (exactMatch) {
                    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${exactMatch.place_id}&key=${apiKey}`;
                    const detailsRes = await axios.get(detailsUrl);
                    return detailsRes.data.result;
                }
            }
    
            const nearbySearchUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${coordinates.lat},${coordinates.lng}&radius=150&keyword=${encodeURIComponent(placeName)}&key=${apiKey}`;
            const nearbyRes = await axios.get(nearbySearchUrl);
    
            if (nearbyRes.data.results?.length) {
                const targetName = normalize(placeName);
    
                const fallbackMatch = nearbyRes.data.results.find(result => {
                    const resultName = normalize(result.name);
                    return resultName.includes(targetName);
                });
    
                if (fallbackMatch) {
                    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${fallbackMatch.place_id}&key=${apiKey}`;
                    const detailsRes = await axios.get(detailsUrl);
                    return detailsRes.data.result;
                }
            }
    
            throw new Error('Place not found via text or nearby search');
        } catch (e) {
            throw new Error('Internal server error. Please try again later.');
        }
    }
    


    
    
    


    

    async getCoffeeByInput(coffeeName) {
        try {
            const coffeeSet = new Set();
            const lowArch = coffeeName.charAt(0).toUpperCase() + coffeeName.slice(1);
            const upperCase = coffeeName.charAt(0).toLowerCase() + coffeeName.slice(1);
    
            const coffeeRefFullWords = admin.firestore().collection('cafe').where('name', '==', lowArch);
            const coffeeRefFullWordsUpper = admin.firestore().collection('cafe').where('name', '==', upperCase);
    
            const [snapshotLower, snapshotUpper] = await Promise.all([
                coffeeRefFullWords.get(),
                coffeeRefFullWordsUpper.get()
            ]);
    
            snapshotLower.forEach(doc => coffeeSet.add(doc.id)); 
            snapshotUpper.forEach(doc => coffeeSet.add(doc.id)); 
    
            const coffeeRefLower = admin.firestore().collection('cafe')
                .orderBy('name')
                .startAt(upperCase)
                .endAt(upperCase + '\uf8ff');
    
            const coffeeRefUpper = admin.firestore().collection('cafe')
                .orderBy('name')
                .startAt(lowArch)
                .endAt(lowArch + '\uf8ff');
    
            const [snapshotPartialLower, snapshotPartialUpper] = await Promise.all([
                coffeeRefLower.get(),
                coffeeRefUpper.get()
            ]);
    
            snapshotPartialLower.forEach(doc => coffeeSet.add(doc.id)); 
            snapshotPartialUpper.forEach(doc => coffeeSet.add(doc.id)); 
    
            const coffees = [];
            for (const coffeeId of coffeeSet) {
                const coffeeDoc = await admin.firestore().collection('cafe').doc(coffeeId).get();
                if (coffeeDoc.exists) {
                    coffees.push({ id: coffeeId, ...coffeeDoc.data() });
                }
            }
    
            return coffees;
    
        } catch (e) {
            console.log(e);
            if (e instanceof ApiError) {
                throw e;
            }
            throw ApiError.InternalError(e.message);
        }
    }
    


    

    

    
    

}

module.exports = new dataService();