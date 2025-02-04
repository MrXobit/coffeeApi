const admin = require('firebase-admin');
const dataService = require('./dataService');
const { getUidFromToken } = require('../utils/auth-utils');
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
        const uid = await getUidFromToken(req);
        if (!uid) {
            return res.status(400).json({ error: 'Некорректный uid' });
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


}

module.exports = new dataController();