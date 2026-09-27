    export type IBlog = {
		author: string | null
		coments_enabled: boolean | null
		content: string 
		created_at: string
		id: string
		image: string | null
		meta_description: string | null
		meta_tiltle: string | null
		published_at: string
		slug: string
		status: boolean
		title: string | null
};

export type IFranchiseDetail = {
    id?: string;
    created_at?: string;
    name: string;
    email: string;
    phone: string;
    city: string;
    budget: string;
    property: string;
};


export type IBlogDetial = {
	created_at: string;
	id: string;
	image: string;
	title: string;
	status:boolean;
	meta_description: string;
	meta_tiltle: string;
	coments_enabled: boolean;
	published_at: string;
	slug:string;
	content:string;
	author:string;
};


export type IEmaildetail = {
	id: string;
	name: string,
    email: string,
    phone: string,
    service: string,
    date: string,
    time: string,
    message: string
};
export type IchapterDetails = {
	catagory_id: number
	chapter_name: string | null
	content: string | null
	course_id: string 
	created_at: string
	description: string | null
	id: number
	instructor: string
	module_id: string 
	chapterno:string 
	slug: string 
};

export type IModule = {
   id: number
   created_at: string;
   module_name: string;
   module_description: string;
   module_number: number;
   course_id: string;
   slug:string;
};

export type IModules = {
	course_id: string;
    created_at: string;
    id: number;
    module_description: string;
    module_name: string;
    module_number: number;
    slug: string;
 }[];

export type IAuthor = {
	author: string 
	Bio: string | null
	created_at: string
	github: string 
	id: string
	instagram: string 
	linkdin: string 
	Name: string 
	twiter: string 
	profile:string
} ;
export type Icourse ={
	banner_image: string;
	Catogory_id: string;
	created_at: string;
	Description: string;
	instructor: string;
	Name: string;
	price: string;
	slug:string;
} ;
export type Coments ={
	coment: string;
    created_at: string;
    slug_id: string;
    user_id: string;
} ;
export type Catagories ={
	created_at: string
	description: string
	id: number
	name: string
  };


export type IBlogForm = {
	created_at: string;
	id: string;
	image: string;
	is_premium: boolean;
	is_published: boolean;
	title: string;
	blog_content: {
		blog_id: string;
		content: string;
		created_at: string;
	};
};

export type Iuser = {
	created_at: string;
	display_name: string;
	email: string;
	id: string;
	image_url: string;
	role: string;
	stripe_customer_id: string | null;
	stripe_subscriptoin_id: string | null;
	subscription_status: boolean;
} | null;
