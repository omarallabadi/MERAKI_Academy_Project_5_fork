const express = require("express");
const auth = require("../middleware/authentication");
const authz = require("../middleware/authorization");
const {
  createProduct,
  updateProduct,
  removeProduct,
  getAllProducts,
  getProductById,
  getSellerProduct,
} = require("../controllers/products");

const productRouter = express.Router();

productRouter.post("/", auth, authz("create_product"), createProduct);
productRouter.put("/:pId", auth, authz("update_product"), updateProduct);
productRouter.delete("/:pId", auth, authz("delete_product"), removeProduct);
productRouter.get("/", getAllProducts);
productRouter.get("/:pId", getProductById);
productRouter.get("/seller", auth, getSellerProduct);
module.exports = productRouter;
