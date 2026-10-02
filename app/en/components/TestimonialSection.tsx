import TestimonialSlider from "@/app/components/TestimonialSlider";

type Review = {
  id: number;
  rating: number;
  comment: string | null;
  user: { name: string | null };
};

export default function TestimonialSection({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) return null; // Hide the section when there are no approved reviews

  return (
    <div className="bg-yellow-50 py-6 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-green-800">
            What Our Happy Customers Say
          </h2>
        </div>
        <TestimonialSlider reviews={reviews} locale="en" />
      </div>
    </div>
  );
}