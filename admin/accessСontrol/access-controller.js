const AccessService = require("./access-service");
const ApiError = require('../../error/ApiError');
class AccessController {
    async accessAddAdmin (req, res) {
     try {
         const {email, cafeId} = req.body
         if (!email || !cafeId) {
             throw ApiError.BadRequest("The 'email' and 'Cafe ID' fields are required.");
         }
            const accessAddAdminData = await AccessService.accessAddAdmin(email ,cafeId)
            return res.json(accessAddAdminData)
 }  catch(e) {
     if (e instanceof ApiError) {
       return res.status(e.status).json({ message: e.message, errors: e.errors });
     }
     return res.status(500).json({ message: 'Internal server error. Please try again later.' });
   }
    }

    async accessRemoveAdmin (req, res) {
      try {
        const {email, cafeId} = req.body
        if (!email || !cafeId) {
            throw ApiError.BadRequest("The 'email' and 'Cafe ID' fields are required.");
        }
           const accessRemoveAdmin = await AccessService.accessRemoveAdmin(email ,cafeId)
           return res.json(accessRemoveAdmin)
      }  catch(e) {
        if (e instanceof ApiError) {
          return res.status(e.status).json({ message: e.message, errors: e.errors });
        }
        return res.status(500).json({ message: 'Internal server error. Please try again later.' });
      }
    }

    async createCoffeeChain (req, res) {
      try {
      const {name, cafeId} = req.body    
      if (!name || !cafeId) {
        throw ApiError.BadRequest("The 'email' and 'Cafe ID' fields are required.");
    }
    const createCoffeeChainData = await AccessService.createCoffeeChain(name,cafeId)
    return res.json(createCoffeeChainData)
  }  catch(e) {
    if (e instanceof ApiError) {
      return res.status(e.status).json({ message: e.message, errors: e.errors });
    }
    return res.status(500).json({ message: 'Internal server error. Please try again later.' });
  }

    }
 }
 module.exports = new AccessController();
 