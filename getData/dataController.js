const admin = require('firebase-admin');
const dataService = require('./dataService');
const { getUidFromToken, getUidFromTokenMainAdmin } = require('../utils/auth-utils');
const ApiError = require('../error/ApiError');




class dataController { 
    async getAllBeans (req, res) {
        try {
            const uid = await getUidFromToken(req);
            if (!uid) {
                return res.status(400).json({ error: 'Некоректний uid' });
              }          
            const count = parseInt(req.query.count); 
            const offset = parseInt(req.query.offset);
            const BeansData = await dataService.getAllBeans(count, offset);
            return res.json(BeansData)
        }  catch(e) {
          if (e instanceof ApiError) {
            return res.status(e.status).json({ message: e.message, errors: e.errors });
          }
          return res.status(500).json({ message: 'Internal server error. Please try again later.' });
        }
      }
      

      
async getAllParameters (req, res) {
    try {
        const uid = await getUidFromToken(req);
        if (!uid) {
            return res.status(400).json({ error: 'Некоректний uid' });
          }          
        const count = parseInt(req.query.count); 
        const offset = parseInt(req.query.offset);
        const BeansData = await dataService.getAllBeans(count, offset);
        return res.json(BeansData)
    }  catch(e) {
      if (e instanceof ApiError) {
        return res.status(e.status).json({ message: e.message, errors: e.errors });
      }
      return res.status(500).json({ message: 'Internal server error. Please try again later.' });
    }
}

async getAllParameters (req, res) {
    try {
        const uid = await getUidFromToken(req);
        if (!uid) {
            return res.status(400).json({ error: 'Некоректний uid' });
          }          
     
        const ParametersData = await dataService.getAllParameters();
        return res.json(ParametersData)
    }  catch(e) {
      if (e instanceof ApiError) {
        return res.status(e.status).json({ message: e.message, errors: e.errors });
      }
      return res.status(500).json({ message: 'Internal server error. Please try again later.' });
    }
}

async getAllRoasters(req, res) {
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
        const count = parseInt(req.query.count); 
        const offset = parseInt(req.query.offset);
        const roastersData = await dataService.getAllRoasters(count, offset);
        return res.json(roastersData);
    } catch(e) {
        if (e instanceof ApiError) {
            return res.status(e.status).json({ message: e.message, errors: e.errors });
        }
        return res.status(500).json({ message: 'Internal server error. Please try again later.' });
    }
}


async getAllCoffe(req, res) {
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
        const count = parseInt(req.query.count); 
        const offset = parseInt(req.query.offset);
        const caffeData = await dataService.getAllCoffe(count, offset);
        return res.json(caffeData);
    } catch(e) {
        if (e instanceof ApiError) {
            return res.status(e.status).json({ message: e.message, errors: e.errors });
        }
        return res.status(500).json({ message: 'Internal server error. Please try again later.' });
    }
}

async getAllNetworks(req, res) {
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
        const count = parseInt(req.query.count); 
        const offset = parseInt(req.query.offset);
        const NetData = await dataService.getAllNetworks(count, offset);
        return res.json(NetData);
    } catch(e) {
        if (e instanceof ApiError) {
            return res.status(e.status).json({ message: e.message, errors: e.errors });
        }
        return res.status(500).json({ message: 'Internal server error. Please try again later.' });
    }
}







async getAllUsersCoffeeLogs(req, res) {
    try {
        const uid = await getUidFromToken(req);
        if (!uid) {
            return res.status(400).json({ error: 'Некоректний uid' });
        }

        const coffeeLogs = await dataService.getAllUsersCoffeeLogs();
        return res.json(coffeeLogs);
    } catch (e) {
        if (e instanceof ApiError) {
            return res.status(e.status).json({ message: e.message, errors: e.errors });
        }
        return res.status(500).json({ message: 'Internal server error. Please try again later.' });
    }
}


async getCafeDataByUrl (req, res) {
  try {
      const {url} = req.body
      if(!url) {
        throw ApiError.BadRequest('Url not found');
      }
      const remoteConfig = admin.remoteConfig();
      const template = await remoteConfig.getTemplate();
      const apiKey = template.parameters['API_KEY_MAP']?.defaultValue?.value;
  
      if (!apiKey) {
        throw ApiError.BadRequest('API_KEY is not set in Remote Config');
      }
    const getCafeDataByUrlData = await dataService.getCafeDataByUrl(url, apiKey);
    return res.json(getCafeDataByUrlData);
} catch (e) {
  console.log(e)
    if (e instanceof ApiError) {
        return res.status(e.status).json({ message: e.message, errors: e.errors });
    }
    return res.status(500).json({ message: 'Internal server error. Please try again later.' });
}
}





async getRoasterByInput (req, res)  {
       try {
        const {roasterName} = req.body
   
        const getRoasterByInputData = await dataService.getRoasterByInput(roasterName);
        return res.json(getRoasterByInputData);
      } catch (e) {
        console.log(e)
          if (e instanceof ApiError) {
              return res.status(e.status).json({ message: e.message, errors: e.errors });
          }
          return res.status(500).json({ message: 'Internal server error. Please try again later.' });
      }
}


// async getCoffeByInput (req, res)  {
//     try {
//      const {coffeName, country} = req.body

//      const getCoffeByInputData = await dataService.getCoffeeByInput(coffeName, country);
//      return res.json(getCoffeByInputData);
//    } catch (e) {
//      console.log(e)
//        if (e instanceof ApiError) {
//            return res.status(e.status).json({ message: e.message, errors: e.errors });
//        }
//        return res.status(500).json({ message: 'Internal server error. Please try again later.' });
//    }
// }



async searchCafes (req, res)  {
    try {
     const {coffeName, country} = req.body

     const getCoffeByInputData = await dataService.searchCafes(coffeName, country);
     return res.json(getCoffeByInputData);
   } catch (e) {
     console.log(e)
       if (e instanceof ApiError) {
           return res.status(e.status).json({ message: e.message, errors: e.errors });
       }
       return res.status(500).json({ message: 'Internal server error. Please try again later.' });
   }
}



async getNetworkByInput (req, res)  {
    try {
     const {networkName} = req.body
    

     const getNetworkByInputData = await dataService.getNetworkByInput(networkName);
     return res.json(getNetworkByInputData);
   } catch (e) {
     console.log(e)
       if (e instanceof ApiError) {
           return res.status(e.status).json({ message: e.message, errors: e.errors });
       }
       return res.status(500).json({ message: 'Internal server error. Please try again later.' });
   }
}



 async validAccesAdmin (req, res) {
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
      if (userData.privileges !== 'superAdmin') {
          return res.json({ access: false });
      } else {
          return res.json({ access: true });
      }
     } catch (e) {
      console.log(e)
        if (e instanceof ApiError) {
            return res.status(e.status).json({ message: e.message, errors: e.errors });
        }
        return res.status(500).json({ message: 'Internal server error. Please try again later.' });
    }
}


async getModerationsBeans (req, res) {
    try {
       const ModerationsBeansData = await dataService.getModerationsBeans()
      return res.json(ModerationsBeansData);
    } catch(e) {
      console.log(e)
        if (e instanceof ApiError) {
            return res.status(e.status).json({ message: e.message, errors: e.errors });
        }
        return res.status(500).json({ message: 'Internal server error. Please try again later.' });
    }
}


async getCafesByCountry (req, res) {
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
        if (!isSuperAdmin) {
            throw ApiError.Forbidden("Недостатньо прав доступу");
        }

        const { country, limitCount, offset } = req.body;
        if (!country) {
            throw ApiError.BadRequest("Поле 'country' є обов'язковим для пошуку кафе.");
          }
          
        const getCafes = await dataService.getCafesByCountry(country, limitCount, offset)
               
        return res.status(200).json(getCafes);


    } catch(e) {
        console.log(e)
          if (e instanceof ApiError) {
              return res.status(e.status).json({ message: e.message, errors: e.errors });
          }
          return res.status(500).json({ message: 'Internal server error. Please try again later.' });
      }
}


  

}

module.exports = new dataController();















































