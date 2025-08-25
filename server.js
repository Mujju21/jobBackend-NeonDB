import express from "express";
import dotenv from "dotenv";
import {neon} from "@neondatabase/serverless";

dotenv.config();

const app = express();
app.use(express.json());

const sql = neon(process.env.DB_URL);

app.get('/', (req,res) => {
    return res.send("Okkk");
});

app.get('/jobs',async (req,res) => {
    const jobs = await sql`SELECT * FROM tbljobs`;
    return res.status(200).json({jobs})
});

app.post('/jobs', async(req,res) => {
    try{
        const{  
            title,
            type,
            location,
            description,
            salary,
            company_name,
            company_desc,
            company_email,
            company_phone
        } = req.body;

        const jobs = await sql `INSERT INTO tbljobs
        (title, type, location, description, salary, company_name, company_desc, company_email, company_phone)
        VALUES
        (${title}, ${type}, ${location}, ${description}, ${salary}, ${company_name}, ${company_desc}, ${company_email}, ${company_phone})
        RETURNING *;
        `;
        return res.status(201).json({
            message:"JOb ADDED DONE",
            jobs: jobs[0]
        });
        }catch(error){
            console.error("Error inserting job:", error); 
            return res.status(500).json({ error: "Failed to create job" });
        }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, ()=> console.log(`runnnig on server: ${PORT}`)
)