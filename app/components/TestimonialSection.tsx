import TestimonialSlider from "./TestimonialSlider";
import { buildTestimonials, type RealReview } from "@/lib/placeholderReviews";

export default function TestimonialSection({ reviews }: { reviews: RealReview[] }) {
  const items = buildTestimonials(reviews, "bn");
  if (items.length === 0) return null;

  return (
    <div className="bg-yellow-50 py-6 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-green-800">
            আমাদের সন্তুষ্ট গ্রাহকদের অভিজ্ঞতা
          </h2>
        </div>
        <TestimonialSlider reviews={items} />
      </div>
    </div>
  );
}
