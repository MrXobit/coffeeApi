const admin = require('firebase-admin');
const addService = require('./add-service');
const ApiError = require('../error/ApiError');





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

}

module.exports = new AddController();