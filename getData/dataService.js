const { default: axios } = require('axios');
const admin = require('firebase-admin');
const ApiError = require('../error/ApiError');
const { FieldPath } = require('firebase-admin/firestore');


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


    async getAllNetworks(count, offset) {
        try {
          const db = admin.firestore();
          let query = db.collection('coffeeChain');
      
          if (!isNaN(offset) && offset > 0) {
            query = query.offset(offset);
          }
          if (!isNaN(count) && count > 0) {
            query = query.limit(count);
          }
      
          const totalSnapshot = await db.collection('coffeeChain').get();
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
    


    
    
    


    
    // async getCoffeeByInput(coffeeName, country) {
    //     try {
    //         if (!coffeeName) {
    //             throw ApiError.BadRequest('Coffee name is required');
    //         }
    
    //         const coffeeSet = new Set();
    
    //         const nameLower = coffeeName.charAt(0).toLowerCase() + coffeeName.slice(1);
    //         const nameUpper = coffeeName.charAt(0).toUpperCase() + coffeeName.slice(1);
    
    //         const cafeCollection = admin.firestore().collection('cafe');
    
    //         const matchQueries = [];
    
    //         // Повний збіг
    //         if (country) {
    //             matchQueries.push(
    //                 cafeCollection.where('name', '==', nameLower).where('country', '==', country).get(),
    //                 cafeCollection.where('name', '==', nameUpper).where('country', '==', country).get()
    //             );
    //         } else {
    //             matchQueries.push(
    //                 cafeCollection.where('name', '==', nameLower).get(),
    //                 cafeCollection.where('name', '==', nameUpper).get()
    //             );
    //         }
    
    //         const [fullMatchLowerSnap, fullMatchUpperSnap] = await Promise.all(matchQueries);
    
    //         fullMatchLowerSnap.forEach(doc => coffeeSet.add(doc.id));
    //         fullMatchUpperSnap.forEach(doc => coffeeSet.add(doc.id));
    
    //         // Частковий збіг
    //         const partialMatchQueries = [];
    
    //         if (country) {
    //             partialMatchQueries.push(
    //                 cafeCollection
    //                     .where('country', '==', country)
    //                     .orderBy('name')
    //                     .startAt(nameLower)
    //                     .endAt(nameLower + '\uf8ff')
    //                     .get(),
    
    //                 cafeCollection
    //                     .where('country', '==', country)
    //                     .orderBy('name')
    //                     .startAt(nameUpper)
    //                     .endAt(nameUpper + '\uf8ff')
    //                     .get()
    //             );
    //         } else {
    //             partialMatchQueries.push(
    //                 cafeCollection
    //                     .orderBy('name')
    //                     .startAt(nameLower)
    //                     .endAt(nameLower + '\uf8ff')
    //                     .get(),
    
    //                 cafeCollection
    //                     .orderBy('name')
    //                     .startAt(nameUpper)
    //                     .endAt(nameUpper + '\uf8ff')
    //                     .get()
    //             );
    //         }
    
    //         const [partialMatchLowerSnap, partialMatchUpperSnap] = await Promise.all(partialMatchQueries);
    
    //         partialMatchLowerSnap.forEach(doc => coffeeSet.add(doc.id));
    //         partialMatchUpperSnap.forEach(doc => coffeeSet.add(doc.id));
    
    //         // Завантажити документи
    //         const coffees = [];
    //         for (const id of coffeeSet) {
    //             const doc = await cafeCollection.doc(id).get();
    //             if (doc.exists) {
    //                 coffees.push({ id: doc.id, ...doc.data() });
    //             }
    //         }
    
    //         return coffees;
    
    //     } catch (e) {
    //         console.error(e);
    //         if (e instanceof ApiError) throw e;
    //         throw ApiError.InternalError(e.message);
    //     }
    // }

   
    

        async searchCafes(coffeeName, country) {
        try {
            if (!coffeeName) {
                throw ApiError.BadRequest('Coffee name is required');
            }
    
            const coffeeSet = new Set();
    
            const nameLower = coffeeName.charAt(0).toLowerCase() + coffeeName.slice(1);
            const nameUpper = coffeeName.charAt(0).toUpperCase() + coffeeName.slice(1);
    
            const cafeCollection = admin.firestore().collection('cafe');
    
            const matchQueries = [];
    
            // Повний збіг
            if (country) {
                matchQueries.push(
                    cafeCollection.where('name', '==', nameLower).where('country', '==', country).get(),
                    cafeCollection.where('name', '==', nameUpper).where('country', '==', country).get()
                );
            } else {
                matchQueries.push(
                    cafeCollection.where('name', '==', nameLower).get(),
                    cafeCollection.where('name', '==', nameUpper).get()
                );
            }
    
            const [fullMatchLowerSnap, fullMatchUpperSnap] = await Promise.all(matchQueries);
    
            fullMatchLowerSnap.forEach(doc => coffeeSet.add(doc.id));
            fullMatchUpperSnap.forEach(doc => coffeeSet.add(doc.id));
    
            // Частковий збіг
            const partialMatchQueries = [];
    
            if (country) {
                partialMatchQueries.push(
                    cafeCollection
                        .where('country', '==', country)
                        .orderBy('name')
                        .startAt(nameLower)
                        .endAt(nameLower + '\uf8ff')
                        .get(),
    
                    cafeCollection
                        .where('country', '==', country)
                        .orderBy('name')
                        .startAt(nameUpper)
                        .endAt(nameUpper + '\uf8ff')
                        .get()
                );
            } else {
                partialMatchQueries.push(
                    cafeCollection
                        .orderBy('name')
                        .startAt(nameLower)
                        .endAt(nameLower + '\uf8ff')
                        .get(),
    
                    cafeCollection
                        .orderBy('name')
                        .startAt(nameUpper)
                        .endAt(nameUpper + '\uf8ff')
                        .get()
                );
            }
    
            const [partialMatchLowerSnap, partialMatchUpperSnap] = await Promise.all(partialMatchQueries);
    
            partialMatchLowerSnap.forEach(doc => coffeeSet.add(doc.id));
            partialMatchUpperSnap.forEach(doc => coffeeSet.add(doc.id));
    
            // Завантажити документи
            const coffees = [];
            for (const id of coffeeSet) {
                const doc = await cafeCollection.doc(id).get();
                if (doc.exists) {
                    coffees.push({ id: doc.id, ...doc.data() });
                }
            }
    
            return coffees;
    
        } catch (e) {
            console.error(e);
            if (e instanceof ApiError) throw e;
            throw ApiError.InternalError(e.message);
        }
    }



    
    async getNetworkByInput(networkName) {
        try {
          const coffeeSet = new Set();
          const lowArch = networkName.charAt(0).toUpperCase() + networkName.slice(1);
          const upperCase = networkName.charAt(0).toLowerCase() + networkName.slice(1);
      
          const coffeeRefFullWords = admin.firestore().collection('coffeeChain').where('name', '==', lowArch);
          const coffeeRefFullWordsUpper = admin.firestore().collection('coffeeChain').where('name', '==', upperCase);
      
          const [snapshotLower, snapshotUpper] = await Promise.all([
            coffeeRefFullWords.get(),
            coffeeRefFullWordsUpper.get()
          ]);
      
          snapshotLower.forEach(doc => coffeeSet.add(doc.id)); 
          snapshotUpper.forEach(doc => coffeeSet.add(doc.id)); 
      
          const coffeeRefLower = admin.firestore().collection('coffeeChain')
            .orderBy('name')
            .startAt(upperCase)
            .endAt(upperCase + '\uf8ff');
      
          const coffeeRefUpper = admin.firestore().collection('coffeeChain')
            .orderBy('name')
            .startAt(lowArch)
            .endAt(lowArch + '\uf8ff');
      
          const [snapshotPartialLower, snapshotPartialUpper] = await Promise.all([
            coffeeRefLower.get(),
            coffeeRefUpper.get()
          ]);
      
          snapshotPartialLower.forEach(doc => coffeeSet.add(doc.id)); 
          snapshotPartialUpper.forEach(doc => coffeeSet.add(doc.id)); 
      
          const networks = [];
          for (const networkId of coffeeSet) {
            const networkDoc = await admin.firestore().collection('coffeeChain').doc(networkId).get();
            if (networkDoc.exists) {
              networks.push({ id: networkId, ...networkDoc.data() });
            }
          }
      
          return networks;
      
        } catch (e) {
          console.log(e);
          if (e instanceof ApiError) {
            throw e;
          }
          throw ApiError.InternalError(e.message);
        }
      }
      

    
      async getModerationsBeans () {
         try {
       const moderBeansQuery = admin.firestore().collection('beans')
      .where('isVerified', '==', false);

    const snapshot = await moderBeansQuery.get();

    const beans = [];

    snapshot.forEach(doc => {
      beans.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return beans;
         } catch (e) {
          console.log(e);
          if (e instanceof ApiError) {
            throw e;
          }
          throw ApiError.InternalError(e.message);
        }
      }



      async getCafesByCountry(country, limitCount, offset) {
        try {
          const cafeCollection = admin.firestore().collection('cafe').where('country', '==', country);
          limitCount = limitCount || 10
       
          const docIdField = FieldPath.documentId();

          let query = cafeCollection.orderBy(docIdField).limit(limitCount);
      
          if (offset > 0) {
            const offsetSnapshot = await cafeCollection.orderBy(docIdField).limit(offset).get();
      
            if (!offsetSnapshot.empty) {
              const lastDoc = offsetSnapshot.docs[offsetSnapshot.docs.length - 1];
              query = query.startAfter(lastDoc);
            }
          }
      
          const snapshot = await query.get();
      
          const cafes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
         
          const countAggregate = await cafeCollection.count().get();
          const totalCount = countAggregate.data().count;
          return {
            cafes,
            totalCount,
          };
        } catch (e) {
          console.error('[getCafesByCountry] ❌ Error:', e);
          if (e instanceof ApiError) {
            throw e;
          }
          throw ApiError.InternalError(e.message);
        }
      }
      
      

}

module.exports = new dataService();