import { model, Schema } from "mongoose";

const userSchema = new Schema({
  id: {
    type: "string",
  },
 firstName: {
    type: "string",
    required: true,
  },
  lastName: {
    type: "string",
    required: true,
  },
  email: {
    type: "string",
    required: true,
  },
  password: {
    type: "string",
    required: true,
  },
  isVerified: {
    type: "boolean",
  },
  randomToken:{
    type: "string",
  }
});

const User = model("Url-app-users", userSchema);

export default User;
