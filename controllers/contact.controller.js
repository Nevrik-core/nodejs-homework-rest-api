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
        
        const data = await Contact.findOne({ "_id": contactId, "owner": _id });
    
        if (!data) {
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
            return next(HttpError(404, "Wrong ID", "NotFound"));
        }

        const data = await Contact.findOneAndDelete({ _id: contactId, owner: _id });
        if (!data) {
            return next(HttpError(404, "Contact not found", "NotFound"));
        }
        console.log(`Contact ${contactId} was deleted`);
        res.status(200).json({ message: "Contact deleted" });
    } catch (err) {
        next(err);
    }
};


const updateContact = async (req, res, next) => {
    try {
        const { _id } = req.user;
        const { error } = validationSchema.validate(req.body);
        if (error) {
            return next(HttpError(400, error.details[0].message, "ValidationError"));
        }

        const contactId = req.params.contactId;
        const updatedContact = await Contact.findOneAndUpdate({ _id: contactId, owner: _id }, req.body, { new: true });
        if (!updatedContact) {
            return next(HttpError(404, "Contact not found", "NotFound"));
        }
        res.status(200).json({ message: "Contact updated successfully", updatedContact });
    } catch (err) {
        next(err);
    }
};


const updateFavoriteStatus = async (req, res, next) => {
    try {
        const { error } = updateFavoriteSchema.validate(req.body);
        if (error) {
            return next(HttpError(400, error.details[0].message, "ValidationError"));
        }

        const contactId = req.params.contactId;
        const updatedContact = await Contact.findByIdAndUpdate(contactId, req.body, { new: true });
        if (!updatedContact) {
            return next(HttpError(404, "Contact not found", "NotFound"));
        }
        res.status(200).json({ message: "Favorite status updated successfully", updatedContact });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getAll,
    getContactById,
    addContact,
    removeContact,
    updateContact,
    updateFavoriteStatus
}