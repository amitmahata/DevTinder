const validator = require("validator");

const validateSignUpData = (req) => {
    const { firstName, lastName, emailId, password } = req.body;

    if (!firstName || !lastName) {
        throw new Error("First name and last name are required");
    }
    else if (!validator.isEmail(emailId)) {
        throw new Error("Email is not valid");
    }
    else if (!validator.isStrongPassword(password)) {
        throw new Error("Password must be strong");
    }
};

const validateEditProfileData = (req) => {
    const allowedEditFields = ["firstName",
        "lastName",
        "emailId",
        "age",
        "gender",
        "photoUrl",
        "about",
        "skills"];
    const isEditAllowed = Object.keys(req.body).every((update) =>
        allowedEditFields.includes(update)
    );

    return isEditAllowed;
};

const validatePasswordChangeData = (req) => {
    if(!req.body.oldPassword || !req.body.newPassword) {
        throw new Error("Both old and new passwords are required.");
    }

    if(!validator.isStrongPassword(req.body.newPassword)) {
        throw new Error("New password must be strong.");
    }
};

module.exports = {
    validateSignUpData,
    validateEditProfileData,
    validatePasswordChangeData
};