// imports here for express and pg
const express = require('express');
const app = express();
const path = require('path')
const pg = require('pg');

const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/acme_notes_db')
// static routes here (you only need these for deployment)
app.get('/', (req, res)=> res.sendFile(path.join(__dirname, '../client/dist/index.html')));

app.use(express.static(path.join(__dirname, '../client/dist')));


// app routes here
app.get('/api/notes', async (req,res,next) => {
    try {

        const getSQL = `SELECT * FROM notes;`;
        const response = await client.query(getSQL);
        res.send(response.rows);

    } catch (error) {
        next(error);
    }
})
// create your init function

const init = async () => {
    await client.connect();
    const SQL = `
        DROP TABLE IF EXISTS notes;
        CREATE TABLE notes(
            id SERIAL PRIMARY KEY,
            txt VARCHAR(255),
            starred BOOLEAN DEFAULT FALSE
        );
        INSERT INTO notes(txt, starred) VALUES('learn express', false);
        INSERT INTO notes(txt, starred) VALUES('write SQL queries', true);
        INSERT INTO notes(txt) VALUES('create routes');
    `;
    await client.query(SQL);
    console.log('data seed');

    const PORT = process.env.PORT || 3000;
    app.listen(PORT,()=> console.log(`Listening on port ${PORT}`));


}

// init function invocation
init();