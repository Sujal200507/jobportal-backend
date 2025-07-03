import jwt from "jsonwebtoken";
const isAuthenticated = async (req,res, next)=>{
    try {
        const token = req.cookies.token;
        console.log("Auth Middleware - Token:", token ? "Present" : "Missing");
        
        if(!token){
            return res.status(401).json({
                message:"User not authenticated",
                success:false
            })
        };
        
        const secretKey = process.env.SECRET_KEY || "fallback_secret_key_for_testing";
        console.log("Auth Middleware - SECRET_KEY present:", !!process.env.SECRET_KEY);
        
        const decode = await jwt.verify(token, secretKey);
        console.log("Auth Middleware - Decoded token:", decode);
        
        if(!decode){
            return res.status(401).json({
                message:"Invalid token",
                success:false
            });
        }
        
        req.id = decode.userId;
        console.log("Auth Middleware - Set req.id to:", req.id);
        next();
    } catch (error) {
        console.log("Auth Middleware Error:", error);
        return res.status(401).json({
            message:"Invalid token",
            success:false
        });
    }
}
export default isAuthenticated;