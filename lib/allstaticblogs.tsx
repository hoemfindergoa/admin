import supabase from '@/utils/supabase/supabase';

export async function getStaticProps({ params }: { params: { id: string } }) {
  const { data: blogs, error: blogError } = await supabase
    .from('blog')
    .select('*')
    .eq('slug', params.id)
    .single();

  if (blogError) {
    throw blogError;
  }

  const blog = blogs;

  const { data: author, error: authorError } = await supabase
    .from('instructor')
    .select('*')
    .eq('id', blog?.author)
    .single();

  if (authorError) {
    throw authorError;
  }

  return {
    props: {
      id: params.id,
      blog,
      author,
    },
  };
}