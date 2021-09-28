import db from "../db/connection.js";

const query =`

    DROP TABLE IF EXISTS products CASCADE;
    CREATE TABLE 
        IF NOT EXISTS
            products(
                product_id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
                name VARCHAR(55) NOT NULL,
                description VARCHAR(55) NOT NULL,
                brand VARCHAR (55) NOT NULL,
                image_url TEXT NOT NULL,
                price INTEGER NOT NULL,
                category VARCHAR (55) NOT NULL,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        DROP TABLE IF EXISTS reviews CASCADE;
        CREATE TABLE 
        IF NOT EXISTS
            reviews(
                review_id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
                comment VARCHAR(55) NOT NULL,
                rate INTEGER NOT NULL,
                product_id INTEGER REFERENCES products ON DELETE CASCADE,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
        )
`

const createTables = async () =>{
    try {
        await db.query(query)
        console.log("default table are created ✅")
    } catch (error) {
        console.log(error)
        console.log("default table are not created ❌")
    }
}

export default createTables