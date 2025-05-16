const admin = require('firebase-admin');
const addService = require('./add-service');
const ApiError = require('../error/ApiError');
const multiparty = require('multiparty');
const Busboy = require("busboy");
const path = require("path");
const os = require("os");
const fs = require("fs");
const { getUidFromToken } = require('../utils/auth-utils');
const { default: axios } = require('axios');
const { finished } = require('stream/promises');


class AddController { 
    async addNewRoaster (req, res) {
        try {
            const uid = await getUidFromToken(req);
            if (!uid) {
                return res.status(400).json({ error: 'Invalid UID' });
            } 
            
            const name = req.body.name;
            if (!name) {
                return res.status(400).json({ error: 'Invalid name' });
            } 
            
        const RoasterData = await addService.addNewRoaster(uid, name);
        return res.json(RoasterData)
        }  catch(e) {
            if (e instanceof ApiError) {
              return res.status(e.status).json({ message: e.message, errors: e.errors });
            }
            return res.status(500).json({ message: 'Internal server error. Please try again later.' });
          }
    }


    async addBeans (req, res) {
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
        const {country, high, process, producer, roasterId, roasting, variety} = req.body
        const BeansData = await addService.addBeans(country, high, process, producer, roasterId, roasting, variety, uid);
        return res.json(BeansData)
        }  catch(e) {
            if (e instanceof ApiError) {
              return res.status(e.status).json({ message: e.message, errors: e.errors });
            }
            return res.status(500).json({ message: 'Internal server error. Please try again later.' });
          }
    
    } 


    async findBeans (req, res) {
        try {
            const count = parseInt(req.query.count);
            const offset = parseInt(req.query.offset);
    
            // Перевірка на наявність search в req.body
            const search = req.body ? req.body.search : undefined;
    
            // Викликаємо метод findBeans, передаючи search, count та offset
            const findBeansData = await addService.findBeans(search, count, offset);
            return res.json(findBeansData);
        } catch (e) {
            if (e instanceof ApiError) {
                return res.status(e.status).json({ message: e.message, errors: e.errors });
            }
            return res.status(500).json({ message: 'Internal server error. Please try again later.' });
        }
    }
    

    async findRoaster  (req, res)  {
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
        const { roasterName, cafeId
             }= req.body
        const findRoasterData = await addService.findRoaster(roasterName, 
            uid, cafeId
        );
        return res.json(findRoasterData);
       }catch (e) {
        console.log(e)
        if (e instanceof ApiError) {
            return res.status(e.status).json({ message: e.message, errors: e.errors });
        }
        return res.status(500).json({ message: 'Internal server error. Please try again later.' });
    }
    }




async uploadImage(req, res) {
  try {
    // let uid;
    // try {
    //   uid = await getUidFromToken(req);
    //   if (!uid) {
    //     throw ApiError.BadRequest("Некорректный UID");
    //   }
    // } catch (e) {
    //   throw ApiError.BadRequest("Некорректный UID");
    // }

    // const userDoc = await admin.firestore().collection('users').doc(uid).get();
    // if (!userDoc.exists) {
    //   throw ApiError.BadRequest("Користувача не знайдено");
    // }

    // const userData = userDoc.data();
    // if (userData.privileges !== 'superAdmin') {
    //   throw ApiError.Forbidden("Access forbidden: you are not a super admin");
    // }

    const cafeData = req.body.cafeData;
    if (!cafeData) {
      throw ApiError.BadRequest('Missing cafeData in body');
    }

    const remoteConfig = admin.remoteConfig();
    const template = await remoteConfig.getTemplate();
    const apiKey = template.parameters['API_KEY_MAP']?.defaultValue?.value;

    if (!apiKey) {
      throw ApiError.BadRequest('API_KEY is not set in Remote Config');
    }

    const cafeRef = admin.firestore().collection('cafe').doc(cafeData.place_id);
    const cafeSnapshot = await cafeRef.get();

    if (cafeSnapshot.exists) {
      throw ApiError.BadRequest('Cafe already exists');
    }

    const cafe = { adminData: {}, ...cafeData };
    await cafeRef.set(cafe);

    const photoReference = cafeData.photos?.[0]?.photo_reference;
    if (!photoReference) {
      throw ApiError.BadRequest('Photo reference is missing');
    }

    const url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${apiKey}`;
    const response = await axios.get(url, { responseType: 'stream', maxRedirects: 5 });

    const bucket = admin.storage().bucket();
    const file = bucket.file(`cafe/${cafeData.place_id}/photos/cafe`);
    const writeStream = file.createWriteStream({
      metadata: {
        contentType: response.headers['content-type'],
      },
    });

    response.data.pipe(writeStream);
    await finished(writeStream); 

    await file.makePublic();
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;

    await cafeRef.update({
      'adminData.photos.cafePhoto': publicUrl,
    });

    return res.status(200).json({
      message: 'Cafe added and image uploaded successfully',
      photoUrl: publicUrl,
    });

  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.status).json({ message: error.message, errors: error.errors });
    }

    return res.status(500).json({ message: 'Internal server error' });
  }
}




}

module.exports = new AddController();




















// async uploadImage(req, res) {
//   try {
//     const busboy = new Busboy({ headers: req.headers });

//     busboy.on("file", (fieldname, file, info) => {
//       console.log("Отримано файл. Логи інформації:");
//       console.log("Fieldname:", fieldname);
//       console.log("Info об'єкт:", info);

//       const mimeType = 'application/octet-stream'; // Тип контенту, якщо його немає

//       // Використовуємо admin.storage для доступу до Firebase Storage
//       const bucket = admin.storage().bucket(); // Отримуємо стандартний bucket Firebase
//       const fileUpload = bucket.file(`testing/${info}`); // Додаємо правильний шлях

//       const writeStream = fileUpload.createWriteStream({
//         metadata: {
//           contentType: mimeType,
//         },
//         public: true, // За бажанням, можна зробити файл публічним
//       });

//       // Прокачуємо потік безпосередньо до Firebase Storage
//       file.pipe(writeStream);

//       writeStream.on('finish', () => {
//         console.log("Файл завантажено успішно в Firebase Storage.");
//         res.status(200).json({ message: "File uploaded to Firebase Storage successfully!" });
//       });

//       writeStream.on('error', (error) => {
//         console.error("Error uploading file to Firebase:", error);
//         res.status(500).json({ message: "Internal server error. Please try again later." });
//       });
//     });

//     busboy.on("finish", () => {
//       console.log("Обробка файлу завершена.");
//     });

//     // Викликаємо busboy.end для обробки rawBody запиту
//     busboy.end(req.rawBody);

//   } catch (error) {
//     console.error("Error:", error);
//     return res.status(500).json({ message: "Internal server error. Please try again later." });
//   }
// }