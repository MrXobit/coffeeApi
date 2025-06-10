const { admin } = require("../../config/firebaseConfig");
const ApiError = require("../../error/ApiError");
const { getUidFromToken } = require("../../utils/auth-utils");
const AdminMainDataService = require("./AdminMainData-service");


class AdminMainDataController{
   async updateName(req, res) {
        try {
                  let uid;
            try {
                uid = await getUidFromToken(req);
                if (!uid) {
                    throw ApiError.BadRequest("Некорректный UID");
                }
            } catch (e) {
                throw ApiError.BadRequest("Некорректный UID");
            }

            const userDoc = await admin.firestore().collection('users').doc(uid).get();
            if (!userDoc.exists) {
              throw ApiError.BadRequest("Користувача не знайдено");
            }
            
            const userData = userDoc.data();
            let isSuperAdmin = false
            isSuperAdmin = userData.privileges === 'superAdmin';

            const { name, cafeId } = req.body;
            if (!name || !cafeId) {
                throw ApiError.BadRequest("The 'Cafe name' and 'Cafe ID' fields are required.");
            }
            const updateNameData = await AdminMainDataService.updateName(uid, name, cafeId, isSuperAdmin)
            return res.json(updateNameData)
        }  catch(e) {
            if (e instanceof ApiError) {
              return res.status(e.status).json({ message: e.message, errors: e.errors });
            }
            return res.status(500).json({ message: 'Internal server error. Please try again later.' });
          }
    }

  
   async updateAddress(req, res) {
        try {
            let uid;
            try {
                uid = await getUidFromToken(req);
                if (!uid) {
                    throw ApiError.BadRequest("Некорректный UID");
                }
            } catch (e) {
                throw ApiError.BadRequest("Некорректный UID");
            }

            const userDoc = await admin.firestore().collection('users').doc(uid).get();
            if (!userDoc.exists) {
              throw ApiError.BadRequest("Користувача не знайдено");
            }
            
            const userData = userDoc.data();
            let isSuperAdmin = false
            isSuperAdmin = userData.privileges === 'superAdmin';

            const { address, cafeId} = req.body;
            if (!address) {
                throw ApiError.BadRequest("Адрес обязателен");
            }
            const updateAddressData = await AdminMainDataService.updateAddress(address ,cafeId, uid, isSuperAdmin)
            return res.json(updateAddressData)
        }  catch(e) {
            if (e instanceof ApiError) {
              return res.status(e.status).json({ message: e.message, errors: e.errors });
            }
            return res.status(500).json({ message: 'Internal server error. Please try again later.' });
          }
    }

   
   async updateDescription(req, res) {
        try {
            let uid;
            try {
                uid = await getUidFromToken(req);
                if (!uid) {
                    throw ApiError.BadRequest("Некорректный UID");
                }
            } catch (e) {
                throw ApiError.BadRequest("Некорректный UID");
            }

            const userDoc = await admin.firestore().collection('users').doc(uid).get();
            if (!userDoc.exists) {
              throw ApiError.BadRequest("Користувача не знайдено");
            }
            
            const userData = userDoc.data();
            let isSuperAdmin = false
            isSuperAdmin = userData.privileges === 'superAdmin';

            const { description, cafeId } = req.body;
            if (!description || !cafeId) {
                throw ApiError.BadRequest("The 'Description' and 'Cafe ID' fields are required.");
            }            
            const updateDescriptionData = await AdminMainDataService.updateDescription(uid, description, cafeId, isSuperAdmin)
            return res.json(updateDescriptionData)
        } catch(e) {
            if (e instanceof ApiError) {
              return res.status(e.status).json({ message: e.message, errors: e.errors });
            }
            return res.status(500).json({ message: 'Internal server error. Please try again later.' });
          }
    }

    

    
   async updateContacts(req, res) {
        try {
            let uid;
            try {
                uid = await getUidFromToken(req);
                if (!uid) {
                    throw ApiError.BadRequest("Некорректный UID");
                }
            } catch (e) {
                throw ApiError.BadRequest("Некорректный UID");
            }

            
            const userDoc = await admin.firestore().collection('users').doc(uid).get();
            if (!userDoc.exists) {
              throw ApiError.BadRequest("Користувача не знайдено");
            }
            
            const userData = userDoc.data();
            let isSuperAdmin = false
            isSuperAdmin = userData.privileges === 'superAdmin';

            const { phone, email, website, socials, cafeId} = req.body;
            if (!phone && !email && !website && !socials) {
              throw ApiError.BadRequest('At least one contact detail (phone, email, website, or social media) is required.');
          }
            const updateContactsData = await AdminMainDataService.updateContacts(phone ,email, website, socials, uid, cafeId, isSuperAdmin)
            return res.json(updateContactsData)
        }  catch(e) {
            if (e instanceof ApiError) {
              return res.status(e.status).json({ message: e.message, errors: e.errors });
            }
            return res.status(500).json({ message: 'Internal server error. Please try again later.' });
          }
    }

  
   async updateWorkingHours(req, res) {
        try {
              let uid;
            try {
                uid = await getUidFromToken(req);
                if (!uid) {
                    throw ApiError.BadRequest("Некорректный UID");
                }
            } catch (e) {
                throw ApiError.BadRequest("Некорректный UID");
            }

                  
            const userDoc = await admin.firestore().collection('users').doc(uid).get();
            if (!userDoc.exists) {
              throw ApiError.BadRequest("Користувача не знайдено");
            }
            
            const userData = userDoc.data();
            let isSuperAdmin = false
            isSuperAdmin = userData.privileges === 'superAdmin';

            const { cafeId, workingHours} = req.body;
            if (!cafeId || !workingHours) {
                throw ApiError.BadRequest('Cafe ID and working hours are required.');
            }
            const updateWorkingHoursData = await AdminMainDataService.updateWorkingHours(uid, cafeId, workingHours, isSuperAdmin)
            return res.json(updateWorkingHoursData)
        }  catch(e) {
            console.log(e)
            if (e instanceof ApiError) {
              return res.status(e.status).json({ message: e.message, errors: e.errors });
            }
            return res.status(500).json({ message: 'Internal server error. Please try again later.' });
          }
    }
}

module.exports = new AdminMainDataController();
