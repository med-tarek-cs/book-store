import express from 'express';
import Author from '../models/author';

const authorRouter = express.Router();

authorRouter.get('/', async (_req, res, next) => {
    try {
        const authors = await Author.find({});
        res.json(authors);
    } catch (err) {
        next(err);
    }
});

authorRouter.get('/:ssn', async (req, res, next) => {
    try {
        const author = await Author.findOne({ ssn: req.params.ssn });
        if (author) {
            res.json(author);
        } else {
            res.status(404).end();
        }
    } catch (err) {
        next(err);
    }
});

authorRouter.post('/', async (req, res, next) => {
    const body = req.body;
    try {
        const author = new Author({
            ssn: body.ssn,
            name: body.name,
            gender: body.gender,
            birth: body?.birth,
            address: body?.address,
        });
        
        const savedAuthor = await author.save();
        res.json(savedAuthor);
    } catch (err) {
        next(err);
    }
});

authorRouter.delete('/:ssn', async (req, res, next) => {
    try {
        await Author.findOneAndRemove({ ssn: req.params.ssn });
        res.status(204).end();
    } catch (err) {
        next(err);
    }
});

export default authorRouter;