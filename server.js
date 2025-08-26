import express from "express";
import dotenv from "dotenv";
import {neon} from "@neondatabase/serverless";
import cors from "cors"; 

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const sql = neon(process.env.DB_URL);

app.get('/', (req,res) => {
    return res.send("Jobs backend API is running");
});

//read all jobs
app.get('/jobs',async (req,res) => {
    const jobs = await sql`SELECT * FROM tbljobs`;
    return res.status(200).json({jobs})
});

//Read job by ID
app.get('/jobs/:id', async(req,res) => {
    const {id} = req.params
    try{
    const jobs = await sql`SELECT * FROm tbljobs WHERE id=${id}`

    if (jobs.length === 0) {
        return res.status(404).json({ message: "Job not found" });
    }

    return res.status(200).json({jobs: jobs[0]})
    }catch(error){
        console.error("Error fetching job by ID:", error);
        return res.status(500).json({ error: "Failed to fetch job" });
    }
});

//Add Job
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
            message:"JOB ADDED DONE",
            jobs: jobs[0]
        });
        }catch(error){
            console.error("Error inserting job:", error); 
            return res.status(500).json({ error: "Failed to create job" });
        }
});

//Update Job
app.put('/jobs/:id', async (req,res) => {
    const {id} = req.params;
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
        const jobs = await sql` UPDATE tbljobs SET 
        title = ${title},
        type = ${type},
        location = ${location},
        description = ${description},
        salary = ${salary},
        company_name = ${company_name},
        company_desc = ${company_desc},
        company_email = ${company_email},
        company_phone = ${company_phone}
        WHERE id = ${id}
        RETURNING *;
        `;
        if (jobs.length === 0) {
            return res.status(404).json({ message: "Job not found" });
         };
        return res.status(200).json({
            message: "Job updated successfully",
            jobs : jobs[0]
        });
    }catch(error){
        return res.status(500).json({error:"Failed to update job"});
    }
});

//Delete Job
app.delete('/jobs/:id', async(req,res) => {
    const {id} = req.params;
    try{
    const jobs = await sql` DELETE FROM tbljobs WHERE id=${id} RETURNING *`
    if (jobs.length === 0) {
        return res.status(404).json({ message: "Job not found" });
    };
    return res.status(200).json({
        message:"Job deleted successfully",
        jobs:jobs[0]
    });
    }catch(error){
        return res.status(500).json({error:"Failed to delete job"})
}
});

const PORT = 7000 || 8000;
app.listen(PORT, ()=> console.log(`runnnig on server: http://localhost:${PORT}`)
);
