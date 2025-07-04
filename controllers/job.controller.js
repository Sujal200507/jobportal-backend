import { Job } from "../models/job.model.js";

export const postJob = async (req, res) => {
    try {
        const { title, description, requirements, salary, location, industry, jobType, experience, position, companyId } = req.body;

        const userId = req.id;

        if (!title || !description || !requirements || !salary || !location || !industry || !jobType || !experience || !position || !companyId) {
            return res.status(400).json({
                message: "All fields are required",
                success: false
            });
        }
        const job = await Job.create({
            title,
            description,
            requirements: requirements.split(","),
            salary: Number(salary),
            location,
            industry,
            jobType,
            experienceLevel: experience,
            position,
            company: companyId,
            created_by: userId
        });
        return res.status(201).json({
            message: "New job created successfully.",
            job,
            success: true
        })
    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: "Failed to creating a new job." })
    }
};
export const getAllJobs = async (req, res) => {
    try {
        const keyword = req.query.keyword || "";
        
        let query = {};
        
        // Only apply keyword filtering if keyword is provided
        if (keyword.trim() !== "") {
            query = {
                $or: [
                    { title: { $regex: keyword, $options: "i" } },
                    { description: { $regex: keyword, $options: "i" } }
                ]
            };
        }
        
        const jobs = await Job.find(query).populate({ path: "company" }).sort({createdAt:-1});

        return res.status(200).json({ jobs, success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Failed to get jobs", success: false });
    }
}
export const getJobById = async (req,res) => {
    try {
        const jobId = req.params.id;
        const job = await Job.findById(jobId).populate([
            {
                path: "company"
            },
            {
                path: "applications"
            }
        ]);
        if(!job) return res.status(404).json({
            message:"Job not found.",
            success:false
        }) 
        return res.status(200).json({success:true, job});
    } catch (error) {
        return res.status(400).json({message:"Failed to get job"});
    }
}

// admin
export const getJobByLoggedAdminUser = async (req, res) => {
    try {
        const userId = req.id;
        const jobs = await Job.find({ created_by: userId }).populate({path:'company', createdAt:-1});
        if (!jobs) return res.status(404).json({ message: "Jobs are not found", success: false });
        
        return res.status(200).json({
            jobs,
            success:true
        });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: error });
    }
}
