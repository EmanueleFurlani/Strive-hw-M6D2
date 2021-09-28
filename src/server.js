import express from "express"; 
import cors from "cors"; 
import listEndpoints from "express-list-endpoints"; 
import {
  notFoundHandler,
  badRequestHandler,
  forbiddenHandler,
  genericServerErrorHandler,
} from "./errorHandlers.js";
import productsRouter from "./services/products/index.js";
import reviewsRouter from "./services/reviews/index.js";
import createTables from "./scripts/create-tables.js";

const server = express(); 
const { PORT } = process.env; 

// GLOBAL MIDDLEWARES 
server.use(cors());
server.use(express.json()); 

// ROUTES 
server.use("/products", productsRouter);
server.use("/reviews", reviewsRouter); 

// ERROR HANDLING 

server.use(notFoundHandler);
server.use(badRequestHandler);
server.use(forbiddenHandler);
server.use(genericServerErrorHandler);

console.table(listEndpoints(server));

server.listen(PORT, async () => {
  await createTables();
  console.log(`Server is listening to the port ${PORT}.`);
});
