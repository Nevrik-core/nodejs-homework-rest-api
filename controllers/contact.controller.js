const { HttpError } = require("../helpers");
const { Contact, validationSchema, updateFavoriteSchema } = require("../schemas/contact");

const getAll = async (req, res, next) => {
    const { _id } = req.user;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const data = await Contact.find({ owner: _id }).skip(skip).limit(limit).populate("owner", "_id email subscription");
    res.status(200).json(data);
};


const getContactById = async (req, res, next) => {
    const { _id } = req.user;
    try {
        const contactId = req.params.contactId;
        if (contactId.length !== 24) {
            return next(HttpError(404, "wrong ID", "NotFound"));
        }
        
        const data = await Contact.findById(contactId);
    
        if (!data) {
            return next(HttpError(404, "Not found", "NotFound"));
        }
        if (!data.owner) {
            return next(HttpError(404, "Not found", "NotFound"));
        }
        if (data.owner.toString() !== _id.toString()) {
            return next(HttpError(404, "Not found", "NotFound"));
        }
        
        res.status(200).json({ data });
    } catch (err) {
        next(err);
    }
};


const addContact = async (req, res, next) => {
    try {
        const { error } = validationSchema.validate(req.body);
        if (error) {
            return next(HttpError(400, "missing fields", "ValidationError"));
        }
        const { _id } = req.user;
        const data = await Contact.create({ ...req.body, owner: _id });;
        const message = "User added successfully!";
        res.status(201).json({ message, data });
    } catch (err) {
        next(err);
    }
};


const removeContact = async (req, res, next) => {
    try {
        const { _id } = req.user;
        const { contactId } = req.params;
        if (contactId.length !== 24) {
            return next(HttpError(404, "wrong ID", "NotFound"));
        }

        // owner check before delete
        const check = await Contact.findById(contactId);
        if (!check) {
            return next(HttpError(404, "Not found", "NotFound"));
        }
        if (!check.owner) {
            return next(HttpError(404, "Not found", "NotFound"));
        }

        if (check.owner.toString() === _id.toString()) {
            // delete
            const data = await Contact.findByIdAndDelete(contactId);
            console.log(`contact ${data} was deleted`);
            res.status(200).json({ message: "contact deleted" });
        } else HttpError(404, "Not found", "NotFound");
    } catch (err) {
        next(err);
    }
};


const updateContact = async (req, res, next) => {
    try {
        const { _id } = req.user;
        const { error } = validationSchema.validate(req.body);
        if (error) {
            return next(HttpError(400, "missing field name", "ValidationError"));
        }

        const contactId = req.params.contactId;
        const message = "User updated successfully!";

        // owner check before update
        const check = await Contact.findById(contactId);
        if (!check) {
            return next(HttpError(404, "Not found", "NotFound"));
        }
        if (!check.owner) {
            return next(HttpError(404, "Not found", "NotFound"));
        }
        if (check.owner.toString() === _id.toString()) {
            // update
            const updatedContact = await Contact.findByIdAndUpdate(contactId, req.body, { new: true });
        
            res.status(200).json({ message, updatedContact })
        } else HttpError(404, "Not found", "NotFound");
    } catch (err) {
    
    };
};


const updateFavoriteStatus = async (req, res, next) => {
    try {
        const { error } = updateFavoriteSchema.validate(req.body);
        if (error) {
            return next(HttpError(400, "missing field favorite", "ValidationError"));
        }

        const contactId = req.params.contactId;
        const message = "Favorite status updated successfully!";

        const updatedContact = await Contact.findByIdAndUpdate(contactId, req.body, { new: true });
        if (!updatedContact) {
            return next(HttpError(404, "Not found", "NotFound"));
        }
        res.status(200).json({ message, updatedContact });
    } catch (err) {
    
    };
};

module.exports = {
    getAll,
    getContactById,
    addContact,
    removeContact,
    updateContact,
    updateFavoriteStatus
}