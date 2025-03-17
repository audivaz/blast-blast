// Initial admin configuration
const adminConfig = {
    defaultAdmin: {
        username: "admin",
        email: "admin@banshee.com",
        password: "Admin@Banshee2024", // This will be hashed in production
        role: "admin"
    },
    testAccounts: {
        regularUser: {
            username: "testuser",
            email: "user@test.com",
            password: "Test@User2024",
            role: "user"
        },
        artistUser: {
            username: "testartist",
            email: "artist@test.com",
            password: "Test@Artist2024",
            role: "artist"
        },
        premiumUser: {
            username: "testpremium",
            email: "premium@test.com",
            password: "Test@Premium2024",
            role: "premium"
        }
    }
};

module.exports = adminConfig;
