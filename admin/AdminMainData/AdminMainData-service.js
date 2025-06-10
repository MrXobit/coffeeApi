const admin = require('firebase-admin');
const ApiError = require('../../error/ApiError');
const { popularSocialNetworks } = require('../utils/popularSocialNetworks');

class AdminMainDataService {
    async updateName(uid, name, cafeId, isSuperAdmin) {
        try {
            const cafeRef = admin.firestore().collection('cafe').doc(cafeId);
            const cafeSnapshot = await cafeRef.get();
            if(!isSuperAdmin) {
                const userRef = admin.firestore().collection('users').doc(uid);
                const userSnapshot = await userRef.get();
      
                if (!cafeSnapshot.exists) {
                    throw ApiError.BadRequest('Cafe not found.');
                }
        
                const userData = userSnapshot.data();
                if (!userSnapshot.exists) {
                  throw ApiError.BadRequest('User not found.');
              }
           const getaccess = admin.firestore().collection('accessAdmin').doc(userData.email)
              const getaccessDoc = await getaccess.get()
              if (!getaccessDoc.exists) {
                  throw ApiError.BadRequest('Access not granted');
              }
              const getaccessData = getaccessDoc.data()
              const allowedCafeIds = getaccessData.allowedCafeIds || []; 
      
              if (!allowedCafeIds.includes(cafeId)) {
                  throw ApiError.BadRequest('Access not granted');
              }
      
            }

        if (typeof name !== 'string' || name.trim() === '' || name.length > 100) {
          throw ApiError.BadRequest('Cafe name must be a non-empty string and not exceed 100 characters.');
      }

        const cafeData = cafeSnapshot.data();
        const adminData = cafeData.adminData || {}; 


        await cafeRef.set(
            {
                adminData: {
                    ...adminData, 
                    name 
                }
            },
            { merge: true } 
        );

        const updatedCafeSnapshot = await cafeRef.get();
        return updatedCafeSnapshot.data().adminData;
        }  catch (e) {
            if (e instanceof ApiError) {
              throw e;
            }
            throw ApiError.InternalError('Internal server error. Please try again later.');
          }
    }

  
   async updateAddress(address ,cafeId, uid) {
    const userRef = admin.firestore().collection('users').doc(uid);
    const userSnapshot = await userRef.get();
    
    if (!userSnapshot.exists) {
        throw ApiError.BadRequest('User not found.');
    }
    const cafeRef = admin.firestore().collection('cafe').doc(cafeId);
    const cafeSnapshot = await cafeRef.get();

 
    if (!cafeSnapshot.exists) {
        throw ApiError.BadRequest('Cafe not found.');
    }
    const userData = userSnapshot.data();
    
  if (userData.privileges !== 'admin') {
      throw ApiError.Forbidden('Access denied. Admin privileges required.');
  }

const getaccess = admin.firestore().collection('accessAdmin').doc(userData.email)
        const getaccessDoc = await getaccess.get()
        if (!getaccessDoc.exists) {
            throw ApiError.BadRequest('Access not granted');
        }

        const getaccessData = getaccessDoc.data()
        const allowedCafeIds = getaccessData.allowedCafeIds || []; 

        if (!allowedCafeIds.includes(cafeId)) {
            throw ApiError.BadRequest('Access not granted');
        }
        try {
          if (typeof address !== 'object' || address === null) {
            throw ApiError.BadRequest("Адреса повинна бути об'єктом.");
        }

        if (!address.hasOwnProperty('lat') || !address.hasOwnProperty('lng')) {
            throw ApiError.BadRequest("Адреса повинна містити поля lat і lng.");
        }
        const { lat, lng } = address;
        if (typeof lat !== 'number' || typeof lng !== 'number') {
            throw ApiError.BadRequest("Широта (lat) та довгота (lng) повинні бути числами.");
        }

        if (lat < -90 || lat > 90) {
            throw ApiError.BadRequest("Широта (lat) повинна бути в межах від -90 до 90.");
        }

        if (lng < -180 || lng > 180) {
            throw ApiError.BadRequest("Довгота (lng) повинна бути в межах від -180 до 180.");
        }

        const cafeData = cafeSnapshot.data();
        const adminData = cafeData.adminData || {}; 

        await cafeRef.set(
            {
                adminData: {
                    ...adminData, 
                    address
                }
            },
            { merge: true } 
        );

        const updatedCafeSnapshot = await cafeRef.get();
        return updatedCafeSnapshot.data().adminData;
        }  catch (e) {
            if (e instanceof ApiError) {
              throw e;
            }
            throw ApiError.InternalError('Internal server error. Please try again later.');
          }
    }

   
  async updateDescription(uid, description, cafeId, isSuperAdmin) {
    try {
        const cafeRef = admin.firestore().collection('cafe').doc(cafeId);
        const cafeSnapshot = await cafeRef.get();
        if(!isSuperAdmin) {
            const userRef = admin.firestore().collection('users').doc(uid);
            const userSnapshot = await userRef.get();
  
            if (!cafeSnapshot.exists) {
                throw ApiError.BadRequest('Cafe not found.');
            }
    
            const userData = userSnapshot.data();
            if (!userSnapshot.exists) {
              throw ApiError.BadRequest('User not found.');
          }
       const getaccess = admin.firestore().collection('accessAdmin').doc(userData.email)
          const getaccessDoc = await getaccess.get()
          if (!getaccessDoc.exists) {
              throw ApiError.BadRequest('Access not granted');
          }
          const getaccessData = getaccessDoc.data()
          const allowedCafeIds = getaccessData.allowedCafeIds || []; 
  
          if (!allowedCafeIds.includes(cafeId)) {
              throw ApiError.BadRequest('Access not granted');
          }
        }


        if (typeof description !== 'string' || description.trim() === '' || description.length > 500) {
          throw ApiError.BadRequest('Description must be a non-empty string and not exceed 500 characters.');
      }
        const cafeData = cafeSnapshot.data();
        const adminData = cafeData.adminData || {}; 

        await cafeRef.set(
            {
                adminData: {
                    ...adminData, 
                    description 
                }
            },
            { merge: true }
        );

        const updatedCafeSnapshot = await cafeRef.get();
        return updatedCafeSnapshot.data().adminData;

    } catch (e) {
        if (e instanceof ApiError) {
            throw e;
        }
        throw ApiError.InternalError('Internal server error. Please try again later.');
    }
}




    
   async updateContacts(phone, email, website, socials, uid, cafeId, isSuperAdmin) {
        try {
            const cafeRef = admin.firestore().collection('cafe').doc(cafeId);
            const cafeSnapshot = await cafeRef.get();
            if(!isSuperAdmin) {
                const userRef = admin.firestore().collection('users').doc(uid);
                const userSnapshot = await userRef.get();
      
                if (!cafeSnapshot.exists) {
                    throw ApiError.BadRequest('Cafe not found.');
                }
        
                const userData = userSnapshot.data();
                if (!userSnapshot.exists) {
                  throw ApiError.BadRequest('User not found.');
              }
           const getaccess = admin.firestore().collection('accessAdmin').doc(userData.email)
              const getaccessDoc = await getaccess.get()
              if (!getaccessDoc.exists) {
                  throw ApiError.BadRequest('Access not granted');
              }
              const getaccessData = getaccessDoc.data()
              const allowedCafeIds = getaccessData.allowedCafeIds || []; 
      
              if (!allowedCafeIds.includes(cafeId)) {
                  throw ApiError.BadRequest('Access not granted');
              }
      
            }


          if (phone && typeof phone !== 'string') {
            throw ApiError.BadRequest('Phone must be a string.');
        }
        if (email && (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
            throw ApiError.BadRequest('Invalid email format.');
        }
        if (website && (typeof website !== 'string' || !/^https?:\/\/[^\s]+$/.test(website))) {
            throw ApiError.BadRequest('Invalid website URL.');
        }
        if (socials && typeof socials !== 'object') {
            throw ApiError.BadRequest('Socials must be an object (e.g., { instagram: "...", facebook: "..." }).');
        }



      const contacts = {};
      if (phone) contacts.phone = phone;
      if (email) contacts.email = email;
      if (website) contacts.website = website;
      if (socials) contacts.socials = socials;

      const cafeData = cafeSnapshot.data();
      const adminData = cafeData.adminData || {}; 

      await cafeRef.set(
          {
              adminData: {
                  ...adminData, 
                  contacts: contacts  
              }
          },
          { merge: true }  
      );

      const updatedCafeSnapshot = await cafeRef.get();
      return updatedCafeSnapshot.data().adminData;
        }  catch (e) {
          console.log(e)
            if (e instanceof ApiError) {
              throw e;
            }
            throw ApiError.InternalError('Internal server error. Please try again later.');
          }
    }

  
   async updateWorkingHours(uid, cafeId, workingHours, isSuperAdmin) {
        try {
            const cafeRef = admin.firestore().collection('cafe').doc(cafeId);
        const cafeSnapshot = await cafeRef.get();
        if(!isSuperAdmin) {
            const userRef = admin.firestore().collection('users').doc(uid);
            const userSnapshot = await userRef.get();
  
            if (!cafeSnapshot.exists) {
                throw ApiError.BadRequest('Cafe not found.');
            }
    
            const userData = userSnapshot.data();
            if (!userSnapshot.exists) {
              throw ApiError.BadRequest('User not found.');
          }
       const getaccess = admin.firestore().collection('accessAdmin').doc(userData.email)
          const getaccessDoc = await getaccess.get()
          if (!getaccessDoc.exists) {
              throw ApiError.BadRequest('Access not granted');
          }   
          const getaccessData = getaccessDoc.data()
          const allowedCafeIds = getaccessData.allowedCafeIds || []; 
  
          if (!allowedCafeIds.includes(cafeId)) {
              throw ApiError.BadRequest('Access not granted');
          }
        }
          const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
          validDays.forEach(day => {
            const hours = workingHours[day];
            
            if (hours !== 'closed' && (typeof hours !== 'object' || !hours.open || !hours.close)) {
                throw new ApiError.BadRequest(`Invalid format for ${day}. Expected object with 'open' and 'close' or 'closed'.`);
            }
            if (typeof hours === 'object') {
                if (!/^\d{2}:\d{2}$/.test(hours.open) || !/^\d{2}:\d{2}$/.test(hours.close)) {
                    throw new ApiError.BadRequest(`${day} has invalid time format. Expected HH:MM.`);
                }
            }
        });
        const cafeData = cafeSnapshot.data();
        const adminData = cafeData.adminData || {}; 
  
        await cafeRef.set(
            {
                adminData: {
                    ...adminData, 
                    workingHours
                }
            },
            { merge: true }  
        );
  
        const updatedCafeSnapshot = await cafeRef.get();
        return updatedCafeSnapshot.data().adminData;
        }  catch (e) {
          console.log(e)
            if (e instanceof ApiError) {
              throw e;
            }
            throw ApiError.InternalError('Internal server error. Please try again later.');
          }
    }
}
module.exports = new AdminMainDataService();
