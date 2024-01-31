import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/posts.js";
import { register } from "./controllers/auth.js";
import { createPost } from "./controllers/posts.js";
import { verifyToken } from "./middleware/auth.js";
import User from "./models/User.js";
import Post from "./models/Post.js";
import { users, posts } from "./data/index.js";

/* CONFIGURATIONS */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();
const app = express();
//use() method in express is a middleware handler
app.use(express.json());																	// Express is a node js web application framework 
app.use(helmet());                                                                          //Helmet can help protect your app from some well-known web vulnerabilities by setting HTTP headers appropriately
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));         															//Morgan is basically a logger, on any requests being made,it generates logs automatically.
app.use(bodyParser.json({ limit: "30mb", extended: true }));								//used to process data sent in an HTTP request body. 
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());																			//Cross-origin resource sharing (CORS) in Express Gateway. CORS defines a way in which a browser and server can interact
app.use("/assets", express.static(path.join(__dirname, "public/assets")));

/* FILE STORAGE */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/assets");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

/* ROUTES WITH FILES (separeate because here we also saving pic) */
app.post("/auth/register", upload.single("picture"), register);                     //post is request method              //upload.single("picture") is middleware , rigister is controller
app.post("/posts", verifyToken, upload.single("picture"), createPost);             //

/* ROUTES */
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/posts", postRoutes);

/* MONGOOSE SETUP */
// password :- trilog@sdmcujire.in should be written :- trilog%40sdmcujire.in
const PORT = process.env.PORT || 6001;
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(PORT, () => console.log(`Server Port: ${PORT}`));

    /* ADD DATA ONE TIME */
    // User.insertMany(users);
    // Post.insertMany(posts);
  })
  .catch((error) => console.log(`${error} did not connect`));
