import TestimonialSlider from "./TestimonialSlider";

type Review = {
  id: number;
  rating: number;
  comment: string | null;
  user: { name: string | null };
};

export default function TestimonialSection({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) return null; // Approved রিভিউ না থাকলে সেকশনই দেখাবে না

  return (
    <div className="bg-yellow-50 py-6 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-green-800">
            আমাদের সন্তুষ্ট গ্রাহকদের অভিজ্ঞতা
          </h2>
        </div>
        <TestimonialSlider reviews={reviews} />
      </div>
    </div>
  );
}
