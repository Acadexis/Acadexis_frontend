"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

import apiService, {
  Course,
  Module,
  Recommendation,
} from "@/services/apiService";
import { Loader2 } from "lucide-react";

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const router = useRouter();
  const { courseId } = useParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch courses from API
    apiService.courses
      .getAll()
      .then((response) => {
        setCourses(response.data);
      })
      .catch((error) => {
        console.error("Error fetching courses:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="max-w-[1500px] mx-auto px-8 py-8 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={40} className="animate-spin text-green-600" />
          <p className="text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    // A grid display of courses with cards showing course name, description, and progress
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">My Courses</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Example course card */}

        {/* In a real implementation, this would be mapped from the `courses` state */}
        {courses.map((course) => (
          <div className="bg-white rounded-lg shadow p-4" key={course.id}>
            <Link href={`courses/${course.id}`}>
              {" "}
              {/* Added leading slash for safety */}
              <h3 className="text-lg font-semibold mb-2">{course.title}</h3>
            </Link>
            <p className="text-gray-600 mb-4">{course.description}</p>

            {/* Dynamic Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
              <div
                className="bg-green-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${course.progress}%` }} // Dynamic width
              ></div>
            </div>

            {/* Dynamic Progress Text */}
            <span className="text-sm font-medium text-green-600">
              {course.progress}% Complete
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
