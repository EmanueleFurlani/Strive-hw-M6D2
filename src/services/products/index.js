import express from "express";
import { productsValidation } from "./validation.js";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import db from "../../db/connection.js";

const productsRouter = express.Router();

//GET PRODUCTS
productsRouter.get("/", async (req, res, next) => {
  try {
    const products = await db.query(`SELECT * FROM products`);
    res.send(products.rows);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

//GET SINGLE PRODUCT
// productsRouter.get("/:product_id", async (req, res, next) => {
//   try {
//     const paramsID = req.params.product_id;
//     const product = await db.query(
//       `SELECT * FROM products WHERE product_id=${paramsID}`
//     );
//     if (product.rows.length > 0) {
//       res.send(product.rows[0]);
//     } else {
//       res.send(
//         createHttpError(
//           404,
//           `The Product with the id: ${paramsID} was not found.`
//         )
//       );
//     }
//   } catch (error) {
//     next(error);
//   }
// });

//GET SINGLE PRODUCT with reviews
productsRouter.get("/:product_id", async (req, res, next) => {
  try {
    const paramsID = req.params.product_id;
    const query = `SELECT * FROM products WHERE product_id=${paramsID}`
    const result = await db.query(query);
    if (result.rows.length > 0) {
        const product = result.rows[0]
        const reviewsQuery = `SELECT * FROM reviews WHERE product_id=${paramsID}`
        const reviewResult = await db.query(reviewsQuery)
        const reviews = reviewResult.rows
      res.send({product, reviews});
    } else {
      res.send(
        createHttpError(
          404,
          `The Product with the id: ${paramsID} was not found.`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

//POST PRODUCT
productsRouter.post("/", productsValidation, async (req, res, next) => {
  try {
    const errorList = validationResult(req);
    if (errorList.isEmpty()) {
      const { name, description, brand, image_url, price, category } = req.body;

      const newProduct = await db.query(
        `INSERT INTO products(name,description,brand,image_url,price,category) VALUES('${name}','${description}','${brand}','${image_url}','${price}','${category}') RETURNING *;`
      );

      res.status(201).send(newProduct.rows[0]);
    } else {
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

//UP PRODUCT
productsRouter.put("/:product_id", productsValidation, async (req, res, next) => {
    try {
      const errorList = validationResult(req);
      if (errorList.isEmpty()) {
        const paramsID = req.params.product_id;
        const product = await db.query(
          `SELECT * FROM products WHERE product_id=${paramsID}`
        );
        if (product.rows.length > 0) {
          const { name, description, brand, price, category } = req.body;
          const updatedProduct = await db.query(
            `UPDATE products SET name='${name}',
                                description='${description}',
                                brand='${brand}',
                                price='${price}',
                                category='${category}',
                                updated_at=NOW()
                                WHERE product_id=${paramsID} RETURNING *;`
          );
          res.send(updatedProduct.rows[0]);
        } else {
          next(
            createHttpError(
              404,
              `The Product with the id: ${paramsID} was not found.`
            )
          );
        }
      } else {
        next(createHttpError(400, { errorList }));
      }
    } catch (error) {
      next(error);
    }
  }
);

//DEL PRODUCT
productsRouter.delete("/:product_id", async (req, res, next) => {
  try {
    const paramsID = req.params.product_id;
    const product = await db.query(
      `SELECT * FROM products WHERE product_id=${paramsID}`
    );
    if (product.rows.length > 0) {
      const deletedProduct = await db.query(
        `DELETE FROM products WHERE product_id=${paramsID};`
      );
      console.log(deletedProduct);
      res.send(`The product with the id ${paramsID} was deleted.`);
    } else {
      next(
        createHttpError(
          404,
          `The Product with the id: ${paramsID} was not found.`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

export default productsRouter;
