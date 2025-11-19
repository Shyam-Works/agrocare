import { useRouter } from "next/router";
import React from "react";
import Link from "next/link";

const blogPosts = [
  {
    id: 1,
    title: "How AI Is Transforming Modern Agriculture",
    content: [
      { type: "paragraph", text: "Agriculture is going through a massive shift as advanced technologies become integral to farm operations. From drones scanning fields to satellites monitoring crop health, AI-powered systems are enabling real-time insights that were previously impossible." },
      { type: "heading", text: "What’s changing" },
      { type: "paragraph", text: "Precision monitoring: Satellite and drone imagery combined with machine learning algorithms detect stress in plants, nutrient deficiencies, pest infestations and more." },
      { type: "paragraph", text: "Data-driven decision making: Sensor networks, weather data, and soil analytics feed into AI systems that recommend fertilization, irrigation schedules, and harvest timing." },
      { type: "paragraph", text: "Sustainability gains: Optimizing resource usage and improving yields reduces waste and environmental impact." },
      { type: "heading", text: "Real-world applications" },
      { type: "paragraph", text: "AI models have helped increase yields by 10-20% and reduce input costs significantly. Drone imagery coupled with deep learning can map areas of a field needing targeted treatment rather than blanket spraying." },
      { type: "heading", text: "Key takeaways" },
      { type: "paragraph", text: "Adoption is accelerating, but challenges like data silos and connectivity remain." },
      { type: "paragraph", text: "Edge computing and autonomous machines are shaping the future of smart agriculture." },
      { type: "paragraph", text: "By embracing AI, the future of farming isn’t just higher yield — it’s smarter, more sustainable, and more resilient." },
    ]
  },
  {
    id: 2,
    title: "Top 10 Early Signs of Plant Diseases",
    content: [
      { type: "paragraph", text: "Detecting plant diseases at an early stage is essential to avoid severe crop losses. By the time large patches of discoloration or wilting appear, the disease may be hard to control." },
      { type: "heading", text: "Top early signs" },
      { type: "paragraph", text: "1. Yellowing or pale leaves — especially when new leaves appear dull or chlorotic." },
      { type: "paragraph", text: "2. Wilting of leaves or stems even when soil moisture is adequate." },
      { type: "paragraph", text: "3. Small, irregular leaf spots or speckling — that may enlarge over time." },
      { type: "paragraph", text: "4. Abnormal growths or deformities on leaves, stems, or fruits." },
      { type: "paragraph", text: "5. Stunted plants or uneven growth patterns in a field." },
      { type: "paragraph", text: "6. Presence of mold, mildew, fuzzy growths — especially in humid conditions." },
      { type: "paragraph", text: "7. Unusual fruit shapes or sizes, premature dropping or internal discoloration." },
      { type: "paragraph", text: "8. Drooping stems or weaker plants than neighbours." },
      { type: "paragraph", text: "9. Slow germination or patchy emergence of seedlings." },
      { type: "paragraph", text: "10. Discoloration on stems or roots — sometimes hidden underground." },
      { type: "heading", text: "Role of technology" },
      { type: "paragraph", text: "Smartphone apps, computer vision, and drone imagery can detect subtle cues before the disease spreads." },
      { type: "heading", text: "Practical tips" },
      { type: "paragraph", text: "Walk fields regularly, use remote imagery for early detection, and maintain good plant hygiene." },
    ]
  },
  {
    id: 3,
    title: "Building AgroCare: The Future of Smart Plant Diagnosis",
    content: [
      { type: "paragraph", text: "AgroCare combines AI, IoT sensors, and field experience to monitor plant health in real-time." },
      { type: "heading", text: "Our approach" },
      { type: "paragraph", text: "Real-time monitoring with sensors, computer vision detects stress, deficiencies, pests, or disease." },
      { type: "paragraph", text: "Actionable recommendations for interventions." },
      { type: "paragraph", text: "Scalable design for small and large farms." },
      { type: "heading", text: "Why it matters" },
      { type: "paragraph", text: "Traditional scouting is labor-intensive and slow. AI provides objective insight across entire fields, improving efficiency." },
      { type: "heading", text: "What’s next" },
      { type: "paragraph", text: "Predictive models for crop health." },
      { type: "paragraph", text: "Autonomous field systems." },
      { type: "paragraph", text: "Community learning to improve model accuracy." },
    ]
  },
  {
    id: 4,
    title: "Why Soil Health Determines 80% of Your Crop Success",
    content: [
      { type: "paragraph", text: "Soil health is the foundation of productive farming." },
      { type: "heading", text: "What is soil health?" },
      { type: "paragraph", text: "Nutrient balance, pH, soil structure, microbial activity, and moisture retention." },
      { type: "heading", text: "How AI helps" },
      { type: "paragraph", text: "Sensor networks measure soil conditions and guide fertilization, irrigation, and rotation planning." },
      { type: "heading", text: "Best practices" },
      { type: "paragraph", text: "Conduct annual soil tests, map field variability, use cover crops, and monitor sensor data." },
    ]
  },
  {
    id: 5,
    title: "Smart Irrigation: Saving Water with Precision Technology",
    content: [
      { type: "paragraph", text: "Smart irrigation uses technology to make every drop count." },
      { type: "heading", text: "Key components" },
      { type: "paragraph", text: "Soil moisture sensors, weather forecasting, AI control systems, variable-rate irrigation." },
      { type: "heading", text: "Benefits" },
      { type: "paragraph", text: "Water savings up to 50%, better yields, reduced energy and costs, sustainable field management." },
      { type: "heading", text: "Implementation" },
      { type: "paragraph", text: "Map fields, install sensors in representative areas, use AI controllers and monitor results." },
    ]
  },
  {
    id: 6,
    title: "The Rise of Urban Farming & How Tech Is Leading the Way",
    content: [
      { type: "paragraph", text: "Urban farming is growing with rooftops, vertical farms, and hydroponics." },
      { type: "heading", text: "Technologies" },
      { type: "paragraph", text: "Hydroponics, aeroponics, LED lighting, climate control, sensor networks, AI monitoring." },
      { type: "heading", text: "Benefits" },
      { type: "paragraph", text: "Local produce, year-round crops, high yield per square foot, community impact." },
      { type: "heading", text: "Challenges" },
      { type: "paragraph", text: "High energy costs, startup capital, technical expertise, scaling and business viability." },
    ]
  },
];
export default function BlogPost() {
  const router = useRouter();
  const { id } = router.query;
  const post = blogPosts.find((p) => p.id === parseInt(id));

  if (!post) return <p className="text-center mt-20">Blog not found!</p>;

  return (
    <div className="max-w-4xl mx-auto py-16 px-6">
      <h1 className="text-4xl font-bold text-[#283618] mb-8">{post.title}</h1>

      <div className="mb-12">
        {post.content.map((block, i) => {
          if (block.type === "heading") {
            return (
              <h2 key={i} className="text-2xl font-bold text-[#283618] mt-6 mb-3">
                {block.text}
              </h2>
            );
          }
          return (
            <p key={i} className="text-lg text-[#283618] mb-3">
              {block.text}
            </p>
          );
        })}
      </div>

      <div className="text-center">
        <Link
          href="/Blog"
          className="bg-[#283618] hover:bg-[#1e2a12] text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all"
        >
          Back to Blog
        </Link>
      </div>
    </div>
  );
}
