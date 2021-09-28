import express from "express";
import { productsReviewsValidation } from "./validation.js";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import db from "../../db/connection.js";

const reviewsRouter = express.Router();

//ALL REVIEWS
// reviewsRouter.get("/", async (req, res, next) => {
//   try {
//     const products = await db.query(`SELECT * FROM reviews`);
//     res.send(products.rows);
//   } catch (error) {
//     console.log(error);
//     next(error);
//   }
// });

//SINGLE REVIEWS
reviewsRouter.get("/:review_id", async (req, res, next) => {
  try {
    const paramsID = req.params.review_id;
    const review = await db.query(
      `SELECT * FROM reviews WHERE review_id=${paramsID}`
    );
    if (review.rows.length > 0) {
      res.send(review.rows[0]);
    } else {
      res.send(
        createHttpError(
          404,
          `The review with the id: ${paramsID} was not found.`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

// REVIEWS with prod id
reviewsRouter.get("/", async (req, res, next) => {
  try {
    const query = 
    `  SELECT 
          review.review_id,
          review.product_id ,
          review.comment,
          review.rate,
          review.created_at,
          review.updated_at,
          product.product_id,
          product.name,
          product.brand,
          product.image_url
          FROM reviews AS review
          INNER JOIN products AS product ON review.product_id =product.product_id ORDER BY review.created_at DESC;`
    const result = await db.query(query)
    res.send(result.rows)
  } catch (error) {
    next(error);
  }
});

//POST REVIEW
reviewsRouter.post("/product/:product_id", productsReviewsValidation, async (req, res, next) => {
    try {
      const errorList = validationResult(req);
      if (errorList.isEmpty()) {
        const paramsID = req.params.product_id;
        const product = await db.query(
          `SELECT * FROM products WHERE product_id=${paramsID}`
        );
        if (product.rows.length > 0) {
          const { comment, rate } = req.body;

          const newReview = await db.query(
            `INSERT INTO reviews(comment,rate,product_id) VALUES('${comment}','${rate}','${paramsID}') RETURNING *;`
          );

          res.status(201).send(newReview.rows[0]);
        } else {
          res.send(
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
      console.log(error);
      next(error);
    }
  }
);

//UP REVIEW
reviewsRouter.put("/:review_id", productsReviewsValidation, async (req, res, next) => {
    try {
      const errorList = validationResult(req);
      if (errorList.isEmpty()) {
        const paramsID = req.params.review_id;
        const review = await db.query(
          `SELECT * FROM reviews WHERE review_id=${paramsID}`
        );
        if (review.rows.length > 0) {
          const { comment, rate } = req.body;
          const updatedReview = await db.query(
            `UPDATE reviews SET comment='${comment}',
                                rate='${rate}',
                                updated_at=NOW()
                                WHERE review_id=${paramsID} RETURNING *;`
          );
          res.send(updatedReview.rows[0]);
        } else {
          next(
            createHttpError(
              404,
              `The Review with the id: ${paramsID} was not found.`
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

//DEL REVIEW
reviewsRouter.delete("/:review_id", async (req, res, next) => {
  try {
    const paramsID = req.params.review_id;
    const review = await db.query(
      `SELECT * FROM reviews WHERE review_id=${paramsID}`
    );
    if (review.rows.length > 0) {
      const deletedReview = await db.query(
        `DELETE FROM reviews WHERE review_id=${paramsID};`
      );
      console.log(deletedReview);
      res.send(`The review with the id ${paramsID} was deleted.`);
    } else {
      next(
        createHttpError(
          404,
          `The Review with the id: ${paramsID} was not found.`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

export default reviewsRouter;
