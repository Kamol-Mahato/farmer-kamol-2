import Link from "next/link";
import Image from "next/image";

type Blog = {
  id: number;
  slug: string;
  slugEn: string | null;
  image: string | null;
  category: string;
  titleEn: string | null;
  createdAt: Date;
};
type CategoryMap = { bn: string; en: string }[];

export default function BlogSection({
  blogs,
  categories,
}: {
  blogs: Blog[];
  categories: CategoryMap;
}) {
  if (blogs.length === 0) return null;

  return (
    <div className="bg-green-50 py-6 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-green-800">
            Our Farming Blog
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          {blogs.map((blog) => (
            <Link
              key={blog.id}
              href={`/en/blog/${blog.slugEn}`}
              className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-green-100 overflow-hidden group transition-all duration-500 ease-out hover:shadow-md hover:border-green-200"
            >
              {blog.image && blog.image.startsWith("/") && (
                <div className="relative w-full h-48 overflow-hidden">
                  <Image
                    src={blog.image}
                    alt={blog.titleEn || ""}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                  />
                </div>
              )}
              <div className="p-4 text-left">
                <span className="self-start text-xs font-semibold bg-green-100 text-green-700 px-3 py-1 rounded-full">
                  {categories.find((c) => c.bn === blog.category)?.en ||
                    blog.category}
                </span>
                <h3 className="text-lg font-bold text-green-800 mt-2 group-hover:text-green-600 transition">
                  {blog.titleEn}
                </h3>
                <div className="mt-auto pt-4 flex items-center justify-between border-t border-green-50">
                  <p className="text-gray-500 text-xs">
                    {new Date(blog.createdAt).toLocaleDateString("en-US")}
                  </p>
                  <span className="text-xs font-semibold text-green-700 inline-flex items-center gap-1">
                    Read more
                    <span>→</span>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="text-center mt-6">
          <Link
            href="/en/blog"
            className="inline-flex items-center gap-2 border-2 border-green-700 text-green-700 px-6 py-2.5 rounded-full font-semibold hover:bg-green-700 hover:text-white transition"
          >
            View All Blogs →
          </Link>
        </div>
      </div>
    </div>
  );
}
