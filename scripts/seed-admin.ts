import bcrypt from "bcryptjs"
import connectDB from "../lib/db/mongodb"
import User from "../lib/db/models/User"

async function seedSuperAdmin() {
  try {
    await connectDB()

    const adminEmail = process.env.ADMIN_EMAIL || "admin@eventghor.com"
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123"
    const adminName = process.env.ADMIN_NAME || "EventGhor Administrator"

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail })

    if (existingAdmin) {
      console.log("✓ Super admin already exists")
      console.log(`  Email: ${adminEmail}`)
      process.exit(0)
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 12)

    // Create super admin
    await User.create({
      name: adminName,
      email: adminEmail,
      phone: "+880 1700 000000",
      address: "Dhaka, Bangladesh",
      password: hashedPassword,
      role: "SUPER_ADMIN",
    })

    console.log("✅ Super admin created successfully!")
    console.log(`  Email: ${adminEmail}`)
    console.log(`  Password: ${adminPassword}`)
    console.log("\n⚠️  Please change the password after first login")

    process.exit(0)
  } catch (error) {
    console.error("❌ Error seeding super admin:", error)
    process.exit(1)
  }
}

seedSuperAdmin()
