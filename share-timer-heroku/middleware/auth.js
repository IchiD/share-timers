import jwt from 'jsonwebtoken';

const auth = async (req, res, next) => {
  try {
    if(!req.headers.authorization) {
      req.userId = null;
      return next();
    } else {
      const token = req.headers.authorization.split(" ")[1];
      let decodedData;
      if (token) {      
        decodedData = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decodedData?.userId;
      }
      next();
    }
  } catch (error) {
    console.log(error);
  }
};

export default auth;
