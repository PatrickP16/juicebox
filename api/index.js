const express = require('express');

const jwt = require('jsonwebtoken');
const{ getUserById } = require('../db');
const { JWT_SECRET } = process.env;

const apiRouter = express.Router();

//SETTING 'reg.user' IF POSSIBLE
apiRouter.use( async ( req, res, next ) => {
    const prefix = 'Bearer ';
    const auth = req.header('Authorization');

    if ( !auth ) { //JUST MOVING ON IF THEY ARE NOT AUTHORIZED
        next();
    } else if ( auth.startsWith( prefix )) { //SLICE JUST THE TOKEN OFF
        const token = auth.slice(prefix.length);
        console.log("HERE", token, JWT_SECRET)
        try{
            const { id } = jwt.verify( token, JWT_SECRET);

            if ( id ) {
                req.user = await getUserById( id );
                next();
            }
        } catch ({ name, message }) {
            next ({ name, message });
        }
    } else {
        next ({
            name: 'AuthorizationHeaderError',
            message: `Authorization token must start with ${ prefix }`
        })
    }
})

apiRouter.use(( req, res, next ) => {
    if ( req.user ) {
        console.log("User is set", req.user);
        
    }
    next();
})

const usersRouter = require('./users');
apiRouter.use('/users', usersRouter);

const postsRouter = require('./posts');
apiRouter.use('/posts', postsRouter);

const tagsRouter = require('./tags');
apiRouter.use('/tags', tagsRouter);

apiRouter.use(( error, req, res, next ) => {
    res.send(error)
});

module.exports = apiRouter;