const jwt = require("jsonwebtoken");


module.exports = function(req, res, next) {
  const token = req.headers.authorization.split('Bearer ')[1];
  //console.log(token);
  let isExpire=false;
    const decoded = jwt.verify(token, "randomString");
    const dateNow = new Date();  
    if(decoded.exp < dateNow.getTime()/1000)
    
    {
           isExpire = true;
    }
  if (!token || isExpire) return res.status(401).json({ message: "Auth Error" });

  try {
    const decoded = jwt.verify(token, "randomString");
    req.userID = decoded.user.id;
    next();
  } catch (e) {
    //console.error(e);
    res.status(500).send({ message: "Invalid Token" });
  }
};