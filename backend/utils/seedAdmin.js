import bcrypt from 'bcryptjs';
import Admin from '../models/admin.model.js';
import { connectDB, sequelize } from '../config/db.js';

const seedAdmin = async () => {
    try {
        await connectDB();
        await sequelize.sync(); // Ensure table exists

        const email = "admin@jobportal.com";
        const password = "admin123";
        const fullName = "Super Admin";

        const existingAdmin = await Admin.findOne({ where: { email } });
        const hashedPassword = await bcrypt.hash(password, 10);

        if (existingAdmin) {
            existingAdmin.password = hashedPassword;
            await existingAdmin.save();
            console.log("Admin password reset successfully!");
        } else {
            await Admin.create({
                fullName,
                email,
                password: hashedPassword,
                role: 'super_admin'
            });
            console.log("Super Admin Registered Successfully!");
        }
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        console.log("-----------------------------------------");
        process.exit(0);
    } catch (error) {
        console.error("Error seeding admin:", error);
        process.exit(1);
    }
};

seedAdmin();
