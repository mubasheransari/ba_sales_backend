const router = require('express').Router();
const { readDb, writeDb, nextId } = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

// All authenticated users can view locations
router.get('/', requireAuth, (req, res) => {
  const { cityId, city } = req.query;
  const db = readDb();
  let list = db.locations || [];
  if (cityId) list = list.filter((x) => String(x.cityId) === String(cityId));
  if (city) list = list.filter((x) => String(x.cityName || '').toLowerCase() === String(city).toLowerCase());
  return res.json({ isSuccess: true, message: 'OK', result: list });
});

// Admin adds locations
router.post('/', requireAuth, requireRole('admin'), (req, res) => {
  const { martName, area, cityId, city, lat, lng } = req.body || {};
  if (!martName || !area || (!cityId && !city) || lat === undefined || lng === undefined) {
    return res.status(400).json({
      isSuccess: false,
      message: 'martName, area, city/cityId, lat, lng are required',
    });
  }

  const db = readDb();
  db.locations = db.locations || [];
  db.cities = db.cities || [];

  let cityObj = null;
  if (cityId) cityObj = db.cities.find((c) => String(c.id) === String(cityId));
  if (!cityObj && city) {
    cityObj = db.cities.find((c) => String(c.name).toLowerCase() === String(city).toLowerCase());
  }

  const loc = {
    id: nextId(db.locations),
    martName,
    area,
    cityId: cityObj ? cityObj.id : cityId,
    cityName: cityObj ? cityObj.name : city,
    lat: Number(lat),
    lng: Number(lng),
    createdAt: new Date().toISOString(),
  };
  db.locations.push(loc);
  writeDb(db);
  return res.json({ isSuccess: true, message: 'Location added', result: loc });
});

module.exports = router;
