"use server";
import { createSupabaseServerClient } from "@/lib/supabase";
import { IBlog, IModule } from "@/lib/types";
import { revalidatePath  } from "next/cache";
import { BlogFormSchemaType } from "@/lib/schema";
const DASHBOARD = "/dashboard/blog";
export async function createEmail(data: {
	name: string,
    email: string,
    phone: string,
	state:string
	city:string
	admission_seeking:string
    message: string
	country:string
}) {
	const supabase = await createSupabaseServerClient();
	const emailresult = await supabase
		.from("admissionbestpre")
		.insert(data)
		.single();

	console.log("Email result:", emailresult);

    return emailresult;
}


export async function createFranchise(data: {
    name: string;
    email: string;
    phone: string;
    city: string;
    budget: string;
    property: string;
}) {
    const supabase = await createSupabaseServerClient();
    
    // Inserting into a separate 'franchises' table
    const result = await supabase
        .from("franchise_bestpre") 
        .insert(data)
        .select()
        .single();
    return result;
}

export async function createBlog(data: {
	content: string;
	title: string;
	image: string;
	author:string;
	meta_title: string;
	meta_description: string;
	slug: string;
	status: boolean;
	created_at: string;
	coments_enabled: boolean;
	
}) {

	const supabase = await createSupabaseServerClient();
	const blogResult = await supabase
		.from("blog")
		.insert(data)
		.single();

    return blogResult;
}

export async function createlesson(data: {
	catagory_id: number
	chapter_name: string
	content: string 
	course_id: string 
	created_at: string
	description: string 
	instructor: string
	module_id: string 
	chapterno:string 
	slug: string 
	
}) {

	const supabase = await createSupabaseServerClient();
	const blogResult = await supabase
		.from("chapters")
		.insert(data)
		.single();

    return blogResult;
}

export async function createModule(data: {
	created_at?: string;
	module_name: string;
	module_description: string;
	module_number: number;
	course_id: string;
	slug: string;
	
}) {

	const supabase = await createSupabaseServerClient();
	const blogResult = await supabase
		.from("modules")
		.insert(data)
		.single();
	revalidatePath("/dashbaord/course/build");	
    return blogResult;
}

export async function createCourse(data: {
	banner_image: string;
	Catogory_id: string;
	created_at: string;
	Description: string;
	instructor: string;
	Name: string;
	price: string;
	slug: string;
	
}) {

	const supabase = await createSupabaseServerClient();
	const CourseResult = await supabase
		.from("course")
		.insert(data)
		.single();
	console.log(CourseResult);	

    return CourseResult;
}


export async function readCatogries() {
	await new Promise((resolve) => setTimeout(resolve, 2000));
	const supabase = await createSupabaseServerClient();
	return supabase
		.from("catagory")
		.select("*")
		.order("created_at", { ascending: true });
}
export async function readmodulescourse(id: string) {
	await new Promise((resolve) => setTimeout(resolve, 2000));
	const supabase = await createSupabaseServerClient();
	return supabase
		.from("modules")
		.select("*")
		.eq("slug", id)
		.single();
}	



export async function readBlog() {
	const supabase = await createSupabaseServerClient();
	return supabase
		.from("blog")
		.select("*")
		.eq("status", true)
		.range(0, 7)
		.order("created_at", { ascending: true });
}
export async function readmoreblog() {
	const supabase = await createSupabaseServerClient();
	return supabase
		.from("blog")
		.select("*")
		.eq("status", true)
		.range(0, 35)
		.order("created_at", { ascending: true });
}



export async function readcourse() {
	const supabase = await createSupabaseServerClient();
	return supabase
		.from("course")
		.select("*")
		.order("created_at", { ascending: true });
}

export async function readBlogAdmin() {
	await new Promise((resolve) => setTimeout(resolve, 2000));

	const supabase = await createSupabaseServerClient();
	const { data: { user } } = await supabase.auth.getUser()
	const id = user?.id



	return supabase
		.from("blog")
		.select("*")
		.eq('author', id || " " )
		.order("created_at", { ascending: true });
		
}

export async function Coursebyadmin() {
	await new Promise((resolve) => setTimeout(resolve, 2000));

	const supabase = await createSupabaseServerClient();

	return supabase
		.from("course")
		.select("*")
		.eq('instructor', '5023e815-5c4a-4cfe-8607-18c263d0fbe3' )
		.order("created_at", { ascending: true });
		
}
export async function readBlogIds() {
	const supabase = await createSupabaseServerClient();
	return supabase.from("blog").select("id");
}

export async function readBlogDeatailById(id : string) {
	const supabase = await createSupabaseServerClient();
	return await supabase
		.from("blog")
		.select("*")
		.eq("slug", id)
		.single();
}

export async function updateBlogById(blogId: string, data: IBlog) {
	const supabase = await createSupabaseServerClient();
	const result = await supabase.from("blog").update(data).eq("id", blogId);
	revalidatePath(DASHBOARD);
	revalidatePath("/blog/" + blogId);
	return JSON.stringify(result);
}

export async function updateBlogDetail(
	id: string,
	data: BlogFormSchemaType
) {
	const supabase = await createSupabaseServerClient();
	const resultBlog = await supabase
		.from("blog")
		.update(data)
		.eq("id", id);
	if (resultBlog) {
		return (resultBlog);
	} else {
		revalidatePath(DASHBOARD);
	}
}

export async function deleteBlogById(blogId: string) {
	console.log("deleting blog post")
	const supabase = await createSupabaseServerClient();
	const result = await supabase.from("blog").delete().eq("id", blogId);
	console.log(result);
	revalidatePath(DASHBOARD);
	revalidatePath("/blog/" + blogId);	
	return JSON.stringify(result);
}
export async function deleteCoursebyid(course_id: string) {
	const supabase = await createSupabaseServerClient();
	const result = await supabase.from("course").delete().eq("id", course_id);
	console.log(result);
	revalidatePath(DASHBOARD);
	revalidatePath("/course/" + course_id);	
	return JSON.stringify(result);
}
export async function deleteModulebyid(mdoule_id: number) {
	const supabase = await createSupabaseServerClient();
	const result = await supabase.from("modules").delete().eq("id", mdoule_id);
	console.log(result);
	revalidatePath(DASHBOARD);
	revalidatePath("/course/" + mdoule_id);	
	return JSON.stringify(result);
}
export async function deletechapterbyid(chapter_id: number) {
	const supabase = await createSupabaseServerClient();
	const result = await supabase.from("chapters").delete().eq("id", chapter_id);
	console.log(result);
	revalidatePath(DASHBOARD);
	revalidatePath("/course/" + chapter_id);
	return JSON.stringify(result);
}



export async function readmodulesbycourseId(courseId: string) {
	await new Promise((resolve) => setTimeout(resolve, 2000));
	const supabase = await createSupabaseServerClient();
	return supabase.from("modules").select("*").eq("course_id", courseId).order("module_number", { ascending: true });

}
export async function readchaptersbymodule(courseId: string) {
	await new Promise((resolve) => setTimeout(resolve, 2000));
	const supabase = await createSupabaseServerClient();
	return supabase.from("chapters").select("*").eq("module_id", courseId).order("chapterno", { ascending: true });

}


export async function updatemodulebyid(id: number, data: IModule) {
	await new Promise((resolve) => setTimeout(resolve, 2000));
	const supabase = await createSupabaseServerClient();
	const result = await supabase.from("modules").update(data).eq("id", id);
	revalidatePath(DASHBOARD);
	return JSON.stringify(result);
}