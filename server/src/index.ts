import {app} from "./app.js"
import connectDB from "./db/dbConnect.js";

connectDB()
.then(() => {
          app.listen(process.env.PORT || 8000, () => {
                    console.log(`Server is running on port ${process.env.PORT || 8000}`);
          })
})
.catch((error) => {
  console.error("Error connecting to MongoDB:", error);
  process.exit(1);
});