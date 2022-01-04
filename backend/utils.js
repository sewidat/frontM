import jwt from "jsonwebtoken";

export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id.S,
      name: user.name.S,
      email: user.email.S,
      isAdmin: user.isAdmin.BOOL,
      isSeller: user.isSeller.BOOL,
    },
    // eslint-disable-next-line no-undef
    process.env.JWT_SECRET || "somethingsecret", // if u get source code and run it there will be no error ;)
    {
      expiresIn: "30d",
    }
  );
};

export const isAuth = (req, res, next) => {
  // this for authintcate user
  const authorization = req.headers.authorization;
  if (authorization) {
    const token = authorization.slice(7, authorization.length); // Adel XXXXX  we need token part which starts after 7
    jwt.verify(
      token,
      // eslint-disable-next-line no-undef
      process.env.JWT_SECRET || "somethingsecret", // jwt to decrypt the token
      (err, decode) => {
        if (err) {
          res.status(401).send({ message: "Invalid Token" }); // need to sign in again
        } else {
          req.user = decode; // when token is correct
          next();
        }
      }
    );
  } else {
    res.status(401).send({ message: "No Token" });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401).send({ message: "Invalid Admin Token" });
  }
};

export const isSeller = (req, res, next) => {
  if (req.user && req.user.isSeller) {
    next();
  } else {
    res.status(401).send({ message: "Invalid Seller Token" });
  }
};
export const isSellerOrAdmin = (req, res, next) => {
  if (req.user && (req.user.isSeller || req.user.isAdmin)) {
    next();
  } else {
    res.status(401).send({ message: "Invalid Admin/Seller Token" });
  }
};
