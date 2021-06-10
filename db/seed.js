// Starting module 3 with the provided code 

const {  
    client,
    createUser,
    updateUser,
    getAllUsers,
    getUserById,
    createPost,
    updatePost,
    getAllPosts,
    getPostsByUser,
    getPostsByTagName,
    addTagsToPost,
    createTags,
    getPostById
  } = require('./index');
  
  async function dropTables() {
    try {
      console.log("Starting to drop tables...");
  
      // have to make sure to drop in correct order
      await client.query(`
        DROP TABLE IF EXISTS post_tags;
        DROP TABLE IF EXISTS tags;
        DROP TABLE IF EXISTS posts;
        DROP TABLE IF EXISTS users;
      `);
  
      console.log("Finished dropping tables!");
    } catch (error) {
      console.error("Error dropping tables!");
      throw error;
    }
  }
  
  async function createTables() {
    try {
      console.log("Starting to build tables...");
  
      await client.query(`
        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          username varchar(255) UNIQUE NOT NULL,
          password varchar(255) NOT NULL,
          name varchar(255) NOT NULL,
          location varchar(255) NOT NULL,
          active boolean DEFAULT true
        );
        CREATE TABLE posts (
          id SERIAL PRIMARY KEY,
          "authorId" INTEGER REFERENCES users(id),
          title varchar(255) NOT NULL,
          content TEXT NOT NULL,
          active BOOLEAN DEFAULT true
        );
        CREATE TABLE tags (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) UNIQUE NOT NULL
        );
        CREATE TABLE post_tags (
            "postId" INTEGER REFERENCES posts(id),
            "tagId" INTEGER REFERENCES tags(id),
            CONSTRAINT uc_post_tages UNIQUE("postId", "tagId") 
        );
      `);
  
      console.log("Finished building tables!");
    } catch (error) {
      console.error("Error building tables!");
      throw error;
    }
  }
  
  async function createInitialUsers() {
    try {
      console.log("Starting to create users...");
  
      await createUser({ 
        username: 'albert', 
        password: 'bertie99',
        name: 'Al Bert',
        location: 'Sidney, Australia' 
      });
      await createUser({ 
        username: 'sandra', 
        password: '2sandy4me',
        name: 'Just Sandra',
        location: 'Ain\'t tellin\''
      });
      await createUser({ 
        username: 'glamgal',
        password: 'soglam',
        name: 'Joshua',
        location: 'Upper East Side'
      });
  
      console.log("Finished creating users!");
    } catch (error) {
      console.error("Error creating users!");
      throw error;
    }
  }
  
  async function createInitialPosts() {
    try {
      const [albert, sandra, glamgal] = await getAllUsers();
  
      console.log("Starting to create posts...");
      await createPost({
        authorId: albert.id,
        title: "First Post",
        content: "This is my first post. I hope I love writing blogs as much as I love writing them.",
        tags: ["#happy", "#youcandoanything"]
      });
  
      await createPost({
        authorId: sandra.id,
        title: "How does this work?",
        content: "Seriously, does this even do anything?",
        tags: ["#happy", "#worst-day-ever"]
      });
  
      await createPost({
        authorId: glamgal.id,
        title: "Living the Glam Life",
        content: "Do you even? I swear that half of you are posing.",
        tags: ["#happy", "#youcandoanything", "#canmandoeverything"]
      });
      console.log("Finished creating posts!");
    } catch (error) {
      console.log("Error creating posts!");
      throw error;
    }
  }

  async function createInitialTags() {
    try {
      console.log("Starting to create tags...");
  
      const [happy, sad, inspo, catman] = await createTags([
        '#happy', 
        '#worst-day-ever', 
        '#youcandoanything',
        '#catmandoeverything'
      ]);
  
      const [postOne, postTwo, postThree] = await getAllPosts();
  
      await addTagsToPost(postOne.id, [happy, inspo]);
      await addTagsToPost(postTwo.id, [sad, inspo]);
      await addTagsToPost(postThree.id, [happy, catman, inspo]);
  
      console.log("Finished creating tags!");
    } catch (error) {
      console.log("Error creating tags!");
      throw error;
    }
  }

  
  async function rebuildDB() {
    try {
      client.connect();
  
      await dropTables();
      await createTables();
      await createInitialUsers();
      await createInitialPosts();
    } catch (error) {
      console.log("Error during rebuildDB")
      throw error;
    }
  }
  
  async function testDB() {
    try {
      console.log("Starting to test database...");
  
      console.log("Calling getAllUsers");
      const users = await getAllUsers();
      console.log("Result:", users);
  
      console.log("Calling updateUser on users[0]");
      const updateUserResult = await updateUser(users[0].id, {
        name: "Newname Sogood",
        location: "Lesterville, KY"
      });
      console.log("Result:", updateUserResult);
  
      console.log("Calling getAllPosts");
      const posts = await getAllPosts();
      console.log("Result:", posts);
  
      console.log("Calling updatePost on posts[0]");
      const updatePostResult = await updatePost(posts[0].id, {
        title: "New Title",
        content: "Updated Content"
      });
      console.log("Result:", updatePostResult);
  
      console.log("Calling getUserById with 1");
      const albert = await getUserById(1);
      console.log("Result:", albert);

      console.log("Calling updatePost on posts[1], only updating tags");
      const updatePostTagsResult = await updatePost(posts[1].id, {
        tags: ["#youcandoanything", "#redfish", "#bluefish"]
      });
      console.log("Result:", updatePostTagsResult);

      console.log("Calling getPostsByTagName with #happy");
      const postsWithHappy = await getPostsByTagName("#happy");
      console.log("Result:", postsWithHappy);
  
      console.log("Finished database tests!");
    } catch (error) {
      console.log("Error during testDB");
      throw error;
    }
  }
  
  
  rebuildDB()
    .then(testDB)
    .catch(console.error)
    .finally(() => client.end());


// //How Travis did it
// const { client, getAllUsers, createUser, updateUser, 
//     getAllPosts, createPost, updatePost, getPostsByUser } = require('./index')
// const chalk = require('chalk')

// async function testDB() {
//   try {
//     let rows = await getAllUsers()
//     console.log(rows)
//   } catch (error) {
//     console.error(error) // console log errors
//   }
// }

// async function dropTables() {
//   await client.query(`
//             DROP TABLE IF EXISTS posts;
//             DROP TABLE IF EXISTS users;
//     `)
// }
// async function createTables() {
//   await client.query(`
//             CREATE TABLE users (
//                 id SERIAL PRIMARY KEY,
//                 username varchar(255) UNIQUE NOT NULL,
//                 password varchar(255) NOT NULL,
//                 name varchar(255) NOT NULL,
//                 location varchar(255) NOT NULL,
//                 active BOOLEAN DEFAULT true
//             );
//             CREATE TABLE posts (
//                 id SERIAL PRIMARY KEY,
//                 "authorId" INTEGER REFERENCES users(id) NOT NULL,
//                 title VARCHAR(255) NOT NULL,
//                 content TEXT NOT NULL,
//                 active BOOLEAN DEFAULT true
//             );
//         `)
// }

// async function populateDB() {
//   //   await client.query(`
//   //         INSERT INTO users (username, password)
//   //         VALUES
//   //           ('albert', 'bertie99'),
//   //           ('sandra', '2sandy4me'),
//   //           ('glamgal', 'soglam');
//   //     `)

//   let users = [
//     {
//       username: 'albert',
//       password: 'bertie99',
//       name: 'Al Bert',
//       location: 'Chicago, IL',
//     },
//     {
//       username: 'sandra',
//       password: '2sandy4me',
//       name: 'Sandy',
//       location: 'Los Angeles, CA',
//     },
//     {
//       username: 'glamgal',
//       password: 'soglam',
//       name: 'Glammy',
//       location: 'Phoenix, AZ',
//     },
//   ]

//   await Promise.all(
//     users.map((user) => {
//       return createUser(user)
//     })
//   )
// }

// async function createInitialPosts() {
//     try {
//         const [ albert, sandra, glamgal ] = await getAllUsers();

//         await createPost({
//             authorId: albert.id,
//             title: "First Post",
//             content: "This is my first post",
//         });

//         await createPost({
//             authorId: albert.id,
//             title: "Second Post",
//             content: "This is my SECOND post",
//         });

//         await createPost({
//             authorId: sandra.id,
//             title: "First Post",
//             content: "i shall rule the world?",
//         });

//         await createPost({
//             authorId: glamgal.id,
//             title: " Glam time",
//             content: "Top ten ways to glam it up",
//         });

//     } catch (error ) {
//         throw error;
//     }
// }

// async function rebuildDB() {
//   try {
//     console.log(chalk.yellow('\n\nConnecting to DB...\n'))

//     client.connect()

//     console.log(chalk.blueBright('Dropping Tables...\n'))

//     await dropTables()

//     console.log(chalk.blueBright('Creating Tables...\n'))
//     await createTables()

//     console.log(chalk.greenBright('Tables Created!\n'))

//     console.log(chalk.magenta('Adding users...\n'))
//     await populateDB()
//     console.log(chalk.magenta('Added users success\n'))

//     console.log(chalk.bgCyanBright('Adding Posts...\n'))
//     await createInitialPosts()
//     console.log(chalk.bgCyanBright('Inital Posts success\n'))

//     const updatedUser = await updateUser(3, {
//       name: 'travis',
//       location: 'Tucson, AZ',
//       active: false,
//     })

//     console.log('updatedUser:', updatedUser)

//     const updatedPost = await updatePost(1, {
//         title: 'NEW TITLE',
//         content: "The fresh content",
//     })
//     console.log('updatedPost', updatedPost)
//     // await testDB()
//   } catch (error) {
//     console.error(error)
//   } finally {
//     client.end()
//     console.log(chalk.redBright('Closing connection to DB\n\n'))
//   }
// }

// rebuildDB()

