import express, { Request, Response, NextFunction, Router } from 'express';
import { Document, MongooseFilterQuery } from 'mongoose';
import Book from '../models/book';
import User from '../models/user';
import middleware from '../utils/middlewares';
import logger from '../utils/logger';
import { bookValidation, validate } from '../utils/validator';

const booksRouter: Router = express.Router();

booksRouter.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { search, genre, page } = req.query;
    const filterQuery: MongooseFilterQuery<Pick<Document, "_id">> = {};
    if (search) {
        filterQuery.title = {
            $regex: search,
            $options: 'i'
        }
    }
    if (genre) {
        filterQuery.genres = {
            $in: genre.toString().toLowerCase().split(','),
        }
    }

    try {
        const books: Array<Document> = await Book.find(filterQuery)
                                                 .sort({ createdAt: -1 })
                                                 .limit(Number(page) ?? 0);
        res.json(books);
    } catch (err) {
        logger.error(err);
        next(err);
    }
});

booksRouter.get('/:isbn', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const book: Document | null = await Book.findOne({ isbn: req.params.isbn });
        if (book) {
            res.json(book);
        } else {
            res.status(404).end();
        }
    } catch (err) {
        logger.error(err);
        next(err);
    }
});

booksRouter.post('/', 
    middleware.isLoggedIn, validate(bookValidation),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const body: any = req.body;
    const session: Express.Session | undefined = req.session;
    try {
        const book: Document = new Book({
            isbn: body.isbn,
            title: body.title,
            published: body.published,
            author: body.author,
            genres: body.genres,
            rating: body?.rating,
            description: body?.description,
            uploader: session!.user.id,
        });
        
        const savedBook: Document = await book.save();
        await User.findByIdAndUpdate(session!.user.id, {
            $addToSet: { books: savedBook }
        }, { new: true });
        res.json(savedBook);
    } catch (err) {
        logger.error(err);
        next(err);
    }
});

booksRouter.delete('/:isbn', middleware.isLoggedIn, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const session: Express.Session | undefined = req.session;
    try {
        const deleted: Document | null = await Book.findOneAndDelete({ uploader: session!.user.id, isbn: req.params.isbn });
        if (deleted) {
            await User.findByIdAndUpdate(session!.user.id, {
                $pull: { books: deleted!.get('id') }
            });
            res.status(204).end();
        } else {
            res.status(400).end();
        }
    } catch (err) {
        logger.error(err);
        next(err);
    }
});

booksRouter.put('/:isbn',
    middleware.isLoggedIn, validate(bookValidation),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const body: any = req.body;
    const session: Express.Session | undefined = req.session;
    try {
        const book: Document = {
            ...body,
        };
        const updated: Document | null = await Book.findOneAndUpdate({ uploader: session!.user.id, isbn: req.params.isbn }, book, { new: true });
        if (updated) {
            res.status(200).end();
        } else {
            res.status(400).end();
        }
    } catch (err) {
        logger.error(err);
        next(err);
    }
});

export default booksRouter;