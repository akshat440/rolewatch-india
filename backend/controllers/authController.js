const User = require("../models/User");const AuditLog = require("../models/AuditLog");
const jwt = require("jsonwebtoken");
const blockchain = require("../services/blockchain/blockchainService");

exports.login = async (req, res) => {
  try {
    const { email, password, biometric } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password"
      });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is deactivated"
      });
    }

    const isValidPassword = await user.comparePassword(password);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    const riskScore = await calculateLoginRisk(user, req);

    await AuditLog.create({
      userId: user.id,
      action: "login",
      resource: "system",
      status: "success",
      ipAddress: req.ip,
      location: user.city,
      device: req.get("user-agent"),
      riskScore
    });

    blockchain.logEvent("USER_LOGIN", user.id, {
      email: user.email,
      role: user.role,
      industry: user.industry,
      ipAddress: req.ip,
      riskScore
    });

    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      { 
        id: user.id,
        email: user.email,
        role: user.role,
        industry: user.industry
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        userId: user.userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        industry: user.industry,
        department: user.department,
        city: user.city
      },
      permissions: {
        granted: user.permissions || [],
        isAdmin: user.role === "admin"
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login"
    });
  }
};

async function calculateLoginRisk(user, req) {
  try {
    const recentLogins = await AuditLog.findAll({
      where: {
        userId: user.id,
        action: "login",
        status: "success"
      },
      order: [["createdAt", "DESC"]],
      limit: 10
    });

    let riskScore = 0;
    const currentHour = new Date().getHours();
    
    if (currentHour >= 22 || currentHour <= 6) {
      riskScore += 30;
    }

    return Math.min(riskScore, 100);
  } catch (error) {
    return 0;
  }
}

exports.enrollBiometric = async (req, res) => {
  try {
    const { type, data } = req.body;
    const user = await User.findByPk(req.user.id);

    user.biometricEnabled = true;
    user.biometricType = type;
    await user.save();

    blockchain.logEvent("BIOMETRIC_ENROLLED", user.id, {
      type,
      email: user.email
    });

    res.json({
      success: true,
      message: `${type} enrolled successfully`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error enrolling biometric"
    });
  }
};

exports.getUsersByIndustry = async (req, res) => {
  try {
    const { industry } = req.params;

    const users = await User.findAll({
      where: { 
        industry,
        isActive: true,
        role: { [require("sequelize").Op.ne]: "admin" }
      },
      attributes: ["id", "userId", "email", "firstName", "lastName", "role", "department"],
      order: [["firstName", "ASC"]]
    });

    res.json({
      success: true,
      users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching users"
    });
  }
};
