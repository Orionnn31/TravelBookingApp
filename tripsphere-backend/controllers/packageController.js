const pool = require('../config/db');

// CREATE — agent/admin only
const createPackage = async (req, res) => {
  try {
    const {
      title, description, destination_city, destination_country,
      timezone_id, price, duration_days, max_capacity, image_url
    } = req.body;

    if (!title || !destination_city || !price || !duration_days) {
      return res.status(400).json({ success: false, error: 'title, destination_city, price, and duration_days are required' });
    }

    const created_by = req.user.id; // from JWT

    const [result] = await pool.query(
      `INSERT INTO travel_packages
       (title, description, destination_city, destination_country, timezone_id, price, duration_days, max_capacity, image_url, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description, destination_city, destination_country, timezone_id, price, duration_days, max_capacity, image_url || null, created_by]
    );

    res.status(201).json({ success: true, packageId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// READ ALL — public
const getAllPackages = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM travel_packages ORDER BY created_at DESC');
    res.json({ success: true, packages: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// READ ONE — public
const getPackageById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM travel_packages WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Package not found' });
    }

    res.json({ success: true, package: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// UPDATE — agent/admin only
const updatePackage = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title, description, destination_city, destination_country,
      timezone_id, price, duration_days, max_capacity, image_url
    } = req.body;

    const [existing] = await pool.query('SELECT id FROM travel_packages WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, error: 'Package not found' });
    }

    await pool.query(
      `UPDATE travel_packages SET
       title = ?, description = ?, destination_city = ?, destination_country = ?,
       timezone_id = ?, price = ?, duration_days = ?, max_capacity = ?, image_url = ?
       WHERE id = ?`,
      [title, description, destination_city, destination_country, timezone_id, price, duration_days, max_capacity, image_url || null, id]
    );

    res.json({ success: true, message: 'Package updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// DELETE — admin only
const deletePackage = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query('SELECT id FROM travel_packages WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, error: 'Package not found' });
    }

    await pool.query('DELETE FROM travel_packages WHERE id = ?', [id]);
    res.json({ success: true, message: 'Package deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { createPackage, getAllPackages, getPackageById, updatePackage, deletePackage };