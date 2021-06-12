const express = require('express');
const postsRouter = express.Router();

const { getAllPosts , createPost, updatePost, getPostById } = require('../db');
const { requireUser } = require('./utils')

postsRouter.use((req, res, next) => {
    console.log("A request is being made to /posts");

    next();
});


postsRouter.get('/', async (req, res) => {
    try {
      const allPosts = await getAllPosts();
  
      const posts = allPosts.filter(post => {
        return post.active || (req.user && post.author.id === req.user.id);
        // keep a post if it is either active, or if it belongs to the current user
      });
  
      res.send({
        posts
      });
    } catch ({ name, message }) {
      next({ name, message });
    }
  });



postsRouter.post('/', requireUser, async ( req, res, next ) => {
    console.log("CURRENT USER", req.user)

    const { title, content, tags = '' } = req.body;
    console.log("Testing WHAT REQ.BODY IS:", req.body)
    const tagArr = tags.trim().split(/\s+/)
    console.log("tagARR:", tagArr)
    const postData = {};

    // ONLY SEND THE TAGS IF THEY EXIST
    if ( tagArr.length ) {
        postData.tags = tagArr
    }

    try {
    // add authorId, title, content to postData object
    //get authorId by currentUser
         postData.authorId = req.user.posts[0].author.id
         postData.title = req.body.title
         postData.content = req.body.content

       

    
    console.log("BUILDING OUT postData:", postData)
     // this will create the post and the tags for us
    const post = await createPost(postData);
   
    // if the post comes back, res.send({ post });
        res.send({ post })
    // otherwise, next an appropriate error object 

    } catch ({ name, message }) {
        next ({ name, message })
    }
    // res.send({ message: 'under construction '});
});

postsRouter.patch('/:postId', requireUser, async (req, res, next ) => {
    const { postId } = req.params;
    const { title, content, tags } = req.body;

    const updateFields = {};

    if ( tags && tags.length > 0 ) {
        updateFields.tags = tags.trim().split(/\s+/);
    }

    if ( title ) {
        updateFields.title = title;
    }

    if ( content ) {
        updateFields.content = content;
    }

    try {
        const originalPost = await getPostById( postId );

        if ( originalPost.author.id === req.user.id ) {
            const updatedPost = await updatePost( postId, updateFields );
            res.send({ post: updatedPost })
        } else {
            next ({
                name: 'UnauthorizedUserError',
                message: ' You cannot update a post that is not yours'
            })
        }
    } catch ({ name, message }) {
        next({ name, message });
    }
})

postsRouter.delete('/:postId', requireUser, async (req, res, next) => {
    try {
      const post = await getPostById(req.params.postId);
  
      if (post && post.author.id === req.user.id) {
        const updatedPost = await updatePost(post.id, { active: false });
  
        res.send({ post: updatedPost });
      } else {
        // if there was a post, throw UnauthorizedUserError, otherwise throw PostNotFoundError
        next(post ? { 
          name: "UnauthorizedUserError",
          message: "You cannot delete a post which is not yours"
        } : {
          name: "PostNotFoundError",
          message: "That post does not exist"
        });
      }
  
    } catch ({ name, message }) {
      next({ name, message })
    }
  });


module.exports = postsRouter;