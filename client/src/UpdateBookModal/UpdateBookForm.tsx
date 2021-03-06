import React from 'react';
import { BookFormProps, BookInput } from '../types';
import { Formik, Form, Field } from 'formik';
import { Grid, Button } from 'semantic-ui-react';
import { TextField, NumberField } from '../Form';
import { useStateValue } from '../state';
import { useParams } from 'react-router-dom';
import { dateRegex } from '../constants';

type Props = Omit<BookFormProps, 'errMsg' | 'modalOpen'>;

const UpdateBookForm: React.FC<Props> = ({ onSubmit, onClose }: Props): JSX.Element => {
    const [ { books }, ] = useStateValue();
    const { isbn } = useParams<{ isbn: string }>();

    const initValue: BookInput = {
        ...books[isbn],
        genres: books[isbn].genres.join(','),
    };

    const checkForm = (values: BookInput) => {
        const errFill = 'You must fill out form';
        const errInvalid = 'Invalid date format';
        const errors: {
            [field: string]: string;
        } = {};

        if (!values.title) {
            errors.title = errFill;
        }
        if (!values.published?.match(dateRegex)) {
            errors.published = errInvalid;
        }
        if (!values.author) {
            errors.author = errFill;
        }

        return errors;
    };

    return (
        <Formik initialValues={ initValue } onSubmit={ onSubmit } validate={ checkForm }>
        {
            ({ isValid, dirty }) => {
                return (
                    <Form className='form ui'>
                        <Field label='Book Title' placeholder='Title' name='title' component={ TextField }/>
                        <Field label='Published Date' placeholder='YYYY-MM-DD' name='published' component={ TextField }/>
                        <Field label='Author name' placeholder='Author' name='author' component={ TextField }/>
                        <Field label='Genres' placeholder='Thriller, Adventure, Horror (optional)' name='genres' component={ TextField }/>
                        <Field label='Description' placeholder='Description (optional)' name='description' component={ TextField }/>
                        <Field label='Rating' placeholder='Rating' name='rating' min={ 0 } max={ 5 } component={ NumberField }/>
                        <Grid>
                            <Grid.Column floated='left'>
                                <Button type='button' color='red' onClick={ onClose }>Cancel</Button>
                            </Grid.Column>
                            <Grid.Column floated='right'>
                                <Button type='submit' floated='right' color='blue' disabled={ !dirty || !isValid }>Save</Button>
                            </Grid.Column>
                        </Grid>
                    </Form>
                );
            }
        }
        </Formik>
    );
};

export default UpdateBookForm;