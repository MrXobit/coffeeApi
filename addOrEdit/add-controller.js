const admin = require('firebase-admin');
const addService = require('./add-service');
const ApiError = require('../error/ApiError');
const multiparty = require('multiparty');
const Busboy = require("busboy");
const path = require("path");
const os = require("os");
const fs = require("fs");
const { getUidFromToken } = require('../utils/auth-utils');



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