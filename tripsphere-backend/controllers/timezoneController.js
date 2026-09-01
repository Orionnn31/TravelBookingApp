const axios = require('axios');
const pool = require('../config/db');

// GET local time for a package's destination timezone
const getPackageTime = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query('SELECT timezone_id, destination_city FROM travel_packages WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Package not found' });
    }

    const { timezone_id, destination_city } = rows[0];

    const response = await axios.get('http://api.timezonedb.com/v2.1/get-time-zone', {
      params: {
        key: process.env.TIMEZONEDB_API_KEY,
        format: 'json',
        by: 'zone',
        zone: timezone_id
      }
    });

    const tzData = response.data;

    if (tzData.status !== 'OK') {
      return res.status(502).json({ success: false, error: 'Timezone lookup failed', details: tzData.message });
    }

    res.json({
      success: true,
      destination_city,
      timezone: tzData.zoneName,
      abbreviation: tzData.abbreviation,
      local_time: tzData.formatted,
      gmt_offset_seconds: tzData.gmtOffset,
      dst: tzData.dst === '1'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { getPackageTime };