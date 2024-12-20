const e = require("express");
const pool = require("../models/db.js");
const cloudinary = require("cloudinary").v2;
const { uploadToCloudinary } = require("../services/cloudinary");

const createProduct = async (req, res) => {
  const seller_id = req.token.userId;

  const {
    title,
    description,
    price,
    stock_status,
    stock_quantity,
    color_options,
    size_options,
    product_image,
    category_id,
    subcategory_id,
  } = req.body;

  if (req.file) {
    const fileSizeLimit = 5 * 1024 * 1024;
    const allowedTypes = ["image/jpeg", "image/png"];

    if (req.file.size > fileSizeLimit) {
      return res
        .status(400)
        .json({ success: false, message: "File is too large" });
    }

    if (!allowedTypes.includes(req.file.mimetype)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid file type" });
    }
  }

  if (req.file) {
    try {
      const uploadResponse = await uploadToCloudinary(req.file.buffer);
      const productImageUrl = uploadResponse.url;
      const trimmedPrductImageUrl =
        productImageUrl.length > 500
          ? productImageUrl.substring(0, 500)
          : productImageUrl;

      console.log("Trimmed Profile Image URL:", trimmedPrductImageUrl);

      product_image = trimmedPrductImageUrl;
      
    } catch (error) {
      console.error("Error uploading profile image:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  const query = `INSERT INTO products( title,
  description,
  price,
  stock_status,stock_quantity,color_options,size_options,seller_id,category_id,subcategory_id,product_image)
  VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`;

  const data = [
    title,
    description,
    price,
    stock_status,
    stock_quantity,
    color_options,
    size_options,
    seller_id,
    category_id,
    subcategory_id,
    product_image,
  ];

  try {
    const result = await pool.query(query, data);
    res.json({
      success: true,
      message: "product Added",
      product: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      err: error,
    });
  }
};

const updateProduct = async (req, res) => {
  const seller_id = req.token.userId;
  const productId = req.params.pId;
  const {
    title,
    description,
    price,
    stock_status,
    stock_quantity,
    color_options,
    size_options,
    product_image,
    category_id,
    subcategory_id,
  } = req.body;

  console.log("productId :", productId);
  console.log("seller_id :", seller_id);
  console.log("req.body :", req.body);

  const query = `UPDATE products SET
                 title = COALESCE($1, title),
                 description = COALESCE($2, description),
                 price = COALESCE($3, price),
                 stock_status = COALESCE($4, stock_status),
                 stock_quantity = COALESCE($5, stock_quantity),
                 color_options = COALESCE($6, color_options),
                 size_options = COALESCE($7, size_options),
                 product_image = COALESCE($8, product_image),
                 category_id = COALESCE($9, category_id),
                 subcategory_id = COALESCE($10, subcategory_id)
                 WHERE id = $11 AND seller_id = $12
                 RETURNING *;`;

  const data = [
    title,
    description,
    price,
    stock_status,
    stock_quantity,
    color_options,
    size_options,
    product_image,
    category_id,
    subcategory_id,
    productId,
    seller_id,
  ];

  try {
    const result = await pool.query(query, data);
    console.log("result :", result);

    if (result.rowCount > 0) {
      res.json({
        success: true,
        message: "Product updated successfully",
        product: result.rows[0],
      });
    } else {
      res.status(404).json({
        success: false,
        message:
          "Product not found or you are not authorized to update this product",
      });
    }
  } catch (error) {
    console.error("Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while updating product",
      err: error.message,
    });
  }
};

const removeProduct = async (req, res) => {
  const productId = req.params.pId;
  const seller_id = req.token.userId;
  console.log("productId :", productId);
  console.log("seller_id :", seller_id);

  const query = `DELETE FROM products WHERE id = $1 AND seller_id = $2;`;
  const data = [productId, seller_id];

  try {
    const result = await pool.query(query, data);
    console.log("result :", result);
    if (result.rowCount > 0) {
      res.json({
        success: true,
        message: "Product deleted successfully",
      });
    } else {
      res.status(404).json({
        success: false,
        message:
          "Product not found or you are not authorized to delete this product.",
      });
    }
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting product",
      err: error.message,
    });
  }
};

const getAllProducts = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const size = parseInt(req.query.size) || 8;
  const offset = (page - 1) * size;

  const query = `SELECT * FROM products LIMIT $1 OFFSET $2`;
  const data = [size, offset];
  const countQuery = `SELECT COUNT(*) FROM products`;
  const countData = [];

  try {
    const result = await pool.query(query, data);

    const countResult = await pool.query(countQuery, countData);

    const totalProducts = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalProducts / size);

    if (result.rows.length == 0) {
      res.json({
        success: false,
        message: "No products found",
      });
    } else {
      res.json({
        success: true,
        message: "All products retrieved successfully",
        totalPages: totalPages,
        totalProducts: totalProducts,
        products: result.rows,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      err: error,
    });
  }
};

// const getAllProducts = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1; // Current page (default is 1)
//     const pageSize = parseInt(req.query.size) || 10; // Items per page (default is 10)
//     const offset = (page - 1) * pageSize; // Calculate the offset

//     // Fetch products for the current page
//     const products = await pool.query(
//       "SELECT * FROM products LIMIT $1 OFFSET $2",
//       [pageSize, offset]
//     );

//     // Fetch total product count
//     const  count  = await pool.query(
//       "SELECT COUNT(*) AS count FROM products"
//     );

//     // Send response
//     res.json({
//       "products":products.rows,
//       totalPages: Math.ceil(count / pageSize),
//       currentPage: page,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to fetch products" });
//   }
// };

const getProductById = async (req, res) => {
  const productId = req.params.pId;
  const query = `SELECT * FROM products WHERE id = $1`;

  const data = [productId];
  try {
    const result = await pool.query(query, data);
    if (result.rows.length !== 0) {
      res.json({
        success: true,
        message: "product Details",
        product: result.rows[0],
      });
    } else {
      throw new Error("Error happened while updating Category");
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      err: error,
    });
  }
};

const getSellerProduct = async (req, res) => {
  const seller_id = req.token.userId;

  const query = `SELECT * FROM products WHERE seller_id = $1`;
  const data = [seller_id];
  try {
    const result = await pool.query(query, data);
    if (result.rows.length !== 0) {
      res.json({
        success: true,
        message: "seller products Details",
        products: result.rows,
      });
    } else {
      res.json({
        success: true,
        message: "seller has no products",
        products: result.rows,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      err: error,
    });
  }
};

const getProductsByCategory = async (req, res) => {
  const category_id = req.params.cId;
  const page = parseInt(req.query.page) || 1;
  const size = parseInt(req.query.size) || 5;
  const offset = (page - 1) * size;

  const query = `SELECT * FROM products WHERE category_id = $1 LIMIT $2 OFFSET $3`;
  const data = [category_id, size, offset];
  const countQuery = `SELECT COUNT(*) FROM products WHERE category_id = $1`;
  const countData = [category_id];

  try {
    const result = await pool.query(query, data);
    const countResult = await pool.query(countQuery, countData);

    const totalProducts = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalProducts / size);

    res.json({
      success: true,
      message: "Products retrieved successfully",
      totalPages: totalPages,
      totalProducts: totalProducts,
      products: result.rows,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      err: error,
    });
  }
};

const getProductByName = async (req, res) => {
  const name = req.params.title;
  const query = `SELECT * FROM products WHERE title LIKE '%${name}%' `;

  try {
    const result = await pool.query(query);
    if (result.rows.length == 0) {
      res.json({
        success: false,
        message: "no product with this title",
      });
    } else {
      res.json({
        success: true,
        message: "product Details",
        product: result.rows,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server error",
      err: error,
    });
  }
};

module.exports = {
  createProduct,
  updateProduct,
  removeProduct,
  getAllProducts,
  getProductById,
  getSellerProduct,
  getProductsByCategory,
  getProductByName,
};
