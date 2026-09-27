import { MDXRemote } from 'next-mdx-remote/rsc';
import React from 'react';

interface Props {
  source: string;
}

export default function BlogBody({ source }: Props) {
  return (
    <div className="max-w-none md:mx-2 mx-4">
      <MDXRemote 
        source={source} 
       components={{
                  h1: ({ children }) => (
                    <h1 className="text-3xl md:text-5xl font-medium text-gray-800 leading-tight mb-8 mt-12 font-serif">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-6 mt-12 font-serif">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-xl md:text-2xl font-semibold text-gray-900 leading-tight mb-4 mt-8 font-serif">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="text-gray-800 text-lg leading-relaxed mb-6 font-serif">
                      {children}
                    </p>
                  ),
                  code: ({ children }) => (
                    <code className=" text-gray-700 px-2 py-1 rounded font-mono text-sm">
                      {children}
                    </code>
                  ),
                  CodeBlock: ({ children }) => (
                    <pre className="bg-gray-100 text-gray-400 p-6 rounded-lg my-8 overflow-x-auto border border-gray-200 font-mono text-sm">
                      {children}
                    </pre>
                  ),
                  pre: ({ children }) => (
                    <pre className="bg-gray-100 text-gray-400 p-6 rounded-lg my-8 overflow-x-auto border border-gray-200 font-mono text-sm">
                      {children}
                    </pre>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-gray-300 bg-gray-50 p-6 my-8 rounded-r-lg italic text-gray-700 text-lg font-serif">
                      {children}
                    </blockquote>
                  ),
                  ul: ({ children }) => (
                    <ul className="my-6 space-y-3 text-gray-800 text-lg font-serif">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="my-6 space-y-3 text-gray-800 text-lg font-serif">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-gray-800 leading-relaxed ml-6 list-disc">
                      {children}
                    </li>
                  ),
                  a: ({ children, href }) => (
                    <a 
                      href={href} 
                      className="text-blue-600 hover:text-blue-800 underline decoration-2 underline-offset-2 transition-colors"
                    >
                      {children}
                    </a>
                  ),
                  strong: ({ children }) => (
                    <strong className="text-gray-900 font-semibold">
                      {children}
                    </strong>
                  ),
                  em: ({ children }) => (
                    <em className="text-gray-700 italic">
                      {children}
                    </em>
                  ),
                  img: ({ src, alt }) => (
                    <img 
                      src={src} 
                      alt={alt} 
                      className="w-full rounded-lg shadow-lg my-8 border border-gray-200"
                    />
                  ),
                  table: ({ children }) => (
      <div className="overflow-x-auto my-8">
        <table className="w-full border border-gray-300 rounded-lg text-left text-gray-800 font-serif text-base">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="bg-gray-100 text-gray-700 font-semibold">
        {children}
      </thead>
    ),
    tbody: ({ children }) => (
      <tbody className="divide-y divide-gray-200">
        {children}
      </tbody>
    ),
    tr: ({ children }) => (
      <tr className="border-b border-gray-200">
        {children}
      </tr>
    ),
    th: ({ children }) => (
      <th className="px-4 py-3 border-b border-gray-300">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="px-4 py-3">
        {children}
      </td>
    ),
                }}
      />
    </div>
  );
}
