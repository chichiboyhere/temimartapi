import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import Product from '../models/productModel.js';
import { isAuth, isAdmin } from '../utils.js';
import uploadToCloudinary from './uploadRoutes.js';

const productRouter = express.Router();

productRouter.get('/', async (req, res) => {
  const products = await Product.find();
  res.send(products);
});

productRouter.post(
  '/',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    //   const newProduct = new Product({

    //     name: 'sample name ' + Date.now(),
    //     slug: 'sample-name-' + Date.now(),
    //     image: '/images/p2.jpg',
    //     price: 0,
    //     category: 'sample category',
    //     brand: 'sample brand',
    //     countInStock: 0,
    //     rating: 0,
    //     numReviews: 0,
    //     description: 'sample description',
    //   });
    //   const product = await newProduct.save();
    //   res.send({ message: 'Product Created', product });
    // })

    try {
      const {
        name,
        slug,
        price,
        image,
        category,
        brand,
        countInStock,
        description,
        discount,
        numSold,
      } = req.body;
      let imageData = {};
      if (image) {
        const results = await uploadToCloudinary(image, 'my-profile');
        imageData = results;
      }
      const newProduct = new Product({
        name,
        slug,
        image: imageData,
        price,
        category,
        brand,
        countInStock,
        rating: 0,
        numReviews: 0,
        description,
        discount,
        numSold,
      });

      const product = await newProduct.save();
      res.send({ message: 'Product Created', product });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  })
);

productRouter.put(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (product) {
      product.name = req.body.name;
      product.slug = req.body.slug;
      product.price = req.body.price;
      product.image = req.body.image;
      product.images = req.body.images;
      product.category = req.body.category;
      product.brand = req.body.brand;
      product.countInStock = req.body.countInStock;
      product.description = req.body.description;
      product.discount = req.body.discount;
      product.numSold = req.body.numSold;
      await product.save();
      res.send({ message: 'Product Updated' });
    } else {
      res.status(404).send({ message: 'Product Not Found' });
    }
  })
);

productRouter.delete(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (product) {
      await product.remove();
      res.send({ message: 'Product Deleted' });
    } else {
      res.status(404).send({ message: 'Product Not Found' });
    }
  })
);

// productRouter.post(
//   '/:id/reviews',
//   isAuth,
//   expressAsyncHandler(async (req, res) => {
//     const productId = req.params.id;
//     const product = await Product.findById(productId);
//     if (product) {
//       if (product.reviews.find((x) => x.name === req.user.name)) {
//         return res
//           .status(400)
//           .send({ message: 'You already submitted a review' });
//       }

//       const review = {
//         name: req.user.name,
//         rating: Number(req.body.rating),
//         comment: req.body.comment,
//       };
//       product.reviews.push(review);
//       product.numReviews = product.reviews.length;
//       product.rating =
//         product.reviews.reduce((a, c) => c.rating + a, 0) /
//         product.reviews.length;
//       const updatedProduct = await product.save();
//       res.status(201).send({
//         message: 'Review Created',
//         review: updatedProduct.reviews[updatedProduct.reviews.length - 1],
//         numReviews: product.numReviews,
//         rating: product.rating,
//       });
//     } else {
//       res.status(404).send({ message: 'Product Not Found' });
//     }
//   })
// );

// productRouter.put(
//   '/:productId/reviews/:reviewId',
//   isAuth,
//   expressAsyncHandler(async (req, res) => {
//     const { productId, reviewId } = req.params;
//     const { rating, comment } = req.body;

//     const product = await Product.findById(productId);
//     if (!product) {
//       return res.status(404).send({ message: 'Product not found!' });
//     }

//     const review = product.reviews.find(
//       (rev) => rev._id.toString() === reviewId
//     );
//     if (!review) {
//       return res.status(404).send({ message: `Review not found!` });
//     }

//     // Ensure only the review owner can edit
//     if (review.name !== req.user.name) {
//       return res
//         .status(403)
//         .send({ message: 'Unauthorized to edit this review!' });
//     }

//     review.rating = rating;
//     review.comment = comment;
//     review.createdAt = Date.now();

//     // Update product
//     product.numReviews = product.reviews.length;
//     product.rating =
//       product.reviews.length > 0
//         ? product.reviews.reduce((a, c) => c.rating + a, 0) /
//           product.reviews.length
//         : 0; // Handle case with no reviews

//     await product.save();

//     res.status(200).send({
//       message: 'Review Updated',
//       product, // Return the updated product
//     });
//   })
// );

// productRouter.post(
//   '/:id/reviews',
//   isAuth,
//   expressAsyncHandler(async (req, res) => {
//     const productId = req.params.id;
//     const product = await Product.findById(productId);

//     if (!product) {
//       return res.status(404).send({ message: 'Product Not Found' });
//     }

//     const existingReview = product.reviews.find(
//       (x) => x.name === req.user.name
//     );

//     if (existingReview) {
//       // Update the existing review
//       existingReview.rating = Number(req.body.rating);
//       existingReview.title = req.body.title;
//       existingReview.comment = req.body.comment;
//       //existingReview.createdAt = Date.now(); // Update the timestamp

//       res.status(200).send({
//         message: 'Review Updated',
//         review: existingReview,
//       });
//     } else {
//       // Create a new review
//       const review = {
//         name: req.user.name,
//         rating: Number(req.body.rating),
//         title: req.body.title,
//         comment: req.body.comment,
//       };
//       product.reviews.push(review);
//       product.numReviews = product.reviews.length;
//       product.rating =
//         product.reviews.reduce((a, c) => c.rating + a, 0) /
//         product.reviews.length;

//       const updatedProduct = await product.save();
//       res.status(201).send({
//         message: 'Review Created',
//         review: updatedProduct.reviews[updatedProduct.reviews.length - 1],
//         numReviews: product.numReviews,
//         rating: product.rating,
//       });
//     }

//     // Update product ratings and number of reviews
//     product.numReviews = product.reviews.length;
//     product.rating =
//       product.reviews.length > 0
//         ? product.reviews.reduce((a, c) => c.rating + a, 0) /
//           product.reviews.length
//         : 0; // Handle case with no reviews

//     await product.save();
//   })
// );
productRouter.post(
  '/:id/reviews',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const productId = req.params.id;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).send({ message: 'Product Not Found' });
    }

    const existingReview = product.reviews.find(
      (x) => x.name === req.user.name
    );

    if (existingReview) {
      // Update the existing review
      existingReview.rating = Number(req.body.rating);

      existingReview.comment = req.body.comment;

      // Recalculate rating
      product.numReviews = product.reviews.length;
      product.rating =
        product.reviews.reduce((a, c) => c.rating + a, 0) /
        product.reviews.length;

      const updatedProduct = await product.save();

      res.status(200).send({
        message: 'Review Updated',
        review: existingReview,
        numReviews: updatedProduct.numReviews,
        rating: updatedProduct.rating,
      });
    } else {
      // Create a new review
      const review = {
        name: req.user.name,
        rating: Number(req.body.rating),
        comment: req.body.comment,
      };
      product.reviews.push(review);
      product.numReviews = product.reviews.length;
      product.rating =
        product.reviews.reduce((a, c) => c.rating + a, 0) /
        product.reviews.length;

      const updatedProduct = await product.save();
      res.status(201).send({
        message: 'Review Created',
        review: updatedProduct.reviews[updatedProduct.reviews.length - 1],
        numReviews: updatedProduct.numReviews,
        rating: updatedProduct.rating,
      });
    }
  })
);

productRouter.post(
  // To update a liked review
  '/:productId/reviews/:reviewId',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    // Fetch the product and review
    const { productId, reviewId } = req.params;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).send({ message: 'Product Not Found' });
    }

    const likedReview = product.reviews.findById((x) => x._id === reviewId);

    if (!likedReview) {
      return res.status(404).send({ message: 'Review Not Found' });
    }

    // If a review is liked, add the user to the likedBy array
    const like = req.body.liked;
    if (like) {
      likedReview.likedBy.push(req.user.name);
    }

    // If a review is unliked, remove the user from the likedBy array
    const unlike = req.body.unliked;
    if (unlike) {
      likedReview.likedBy.filter((x) => x !== req.user._id);
    }

    // Count the number of likes
    const numOfLikes = likedReview.likedBy.length;
    likedReview.numOfLikes = numOfLikes;

    // Update the product
    await product.save();
    res.send({ message: 'Review Liked', product, numOfLikes });
  })
);

productRouter.delete(
  '/:productId/reviews/:reviewId',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const { productId, reviewId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    const reviewIndex = product.reviews.findIndex(
      (rev) => rev._id.toString() === reviewId
    );
    if (reviewIndex === -1) {
      res.status(404);
      throw new Error('Review not found');
    }

    // Ensure only the review owner can delete
    if (product.reviews[reviewIndex].name !== req.user.name) {
      res.status(403);
      throw new Error('Unauthorized to delete this review');
    }

    product.reviews.splice(reviewIndex, 1); // Remove the review

    // Update product
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((a, c) => c.rating + a, 0) /
      product.reviews.length;
    await product.save();

    res.json({ message: 'Review deleted successfully', product });
  })
);

const PAGE_SIZE = 3;

productRouter.get(
  '/admin',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const { query } = req;
    const page = query.page || 1;
    const pageSize = query.pageSize || PAGE_SIZE;

    const products = await Product.find()
      .skip(pageSize * (page - 1))
      .limit(pageSize);
    const countProducts = await Product.countDocuments();
    res.send({
      products,
      countProducts,
      page,
      pages: Math.ceil(countProducts / pageSize),
    });
  })
);

productRouter.get(
  '/search',
  expressAsyncHandler(async (req, res) => {
    const { query } = req;
    const pageSize = query.pageSize || PAGE_SIZE;
    const page = query.page || 1;
    const category = query.category || '';
    const price = query.price || '';
    const rating = query.rating || '';
    const order = query.order || '';
    const searchQuery = query.query || '';

    const queryFilter =
      searchQuery && searchQuery !== 'all'
        ? {
            name: {
              $regex: searchQuery,
              $options: 'i',
            },
          }
        : {};
    const categoryFilter = category && category !== 'all' ? { category } : {};
    const ratingFilter =
      rating && rating !== 'all'
        ? {
            rating: {
              $gte: Number(rating),
            },
          }
        : {};
    const priceFilter =
      price && price !== 'all'
        ? {
            // 1-50
            price: {
              $gte: Number(price.split('-')[0]),
              $lte: Number(price.split('-')[1]),
            },
          }
        : {};
    const sortOrder =
      order === 'featured'
        ? { featured: -1 }
        : order === 'lowest'
        ? { price: 1 }
        : order === 'highest'
        ? { price: -1 }
        : order === 'toprated'
        ? { rating: -1 }
        : order === 'newest'
        ? { createdAt: -1 }
        : { _id: -1 };

    const products = await Product.find({
      ...queryFilter,
      ...categoryFilter,
      ...priceFilter,
      ...ratingFilter,
    })
      .sort(sortOrder)
      .skip(pageSize * (page - 1))
      .limit(pageSize);

    const countProducts = await Product.countDocuments({
      ...queryFilter,
      ...categoryFilter,
      ...priceFilter,
      ...ratingFilter,
    });
    res.send({
      products,
      countProducts,
      page,
      pages: Math.ceil(countProducts / pageSize),
    });
  })
);

productRouter.get(
  '/categories',
  expressAsyncHandler(async (req, res) => {
    const categories = await Product.find().distinct('category');
    res.send(categories);
  })
);

productRouter.get('/slug/:slug', async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug });
  if (product) {
    res.send(product);
  } else {
    res.status(404).send({ message: 'Product Not Found' });
  }
});
productRouter.get('/:id', async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    res.send(product);
  } else {
    res.status(404).send({ message: 'Product Not Found' });
  }
});

export default productRouter;
