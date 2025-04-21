import {
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { format } from "date-fns";

interface BlogData {
  id: number;
  title: string;
  content: string;
  authorName: string;
  imageUrls: string[];
  createdAt: string;
  updatedBy: string | null;
  updatedAt: string;
  isApproved: boolean;
  isPublished: boolean;
  isDeleted: boolean;
  staffId: number;
}

export default function BlogDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [blog, setBlog] = useState<BlogData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Default image to use when URL is invalid
  const defaultImage =
    "https://via.placeholder.com/640x360?text=Default+Blog+Image";

  useEffect(() => {
    const fetchBlogDetail = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://kfsapis.azurewebsites.net/api/Blog/GetBlogDetail?id=${id}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch blog: ${response.status}`);
        }

        const data = await response.json();
        setBlog(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
        console.error("Error fetching blog:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBlogDetail();
    }
  }, [id]);

  // Fixed function with explicit type checking
  const isValidImageUrl = (url: string): boolean => {
    if (typeof url !== "string") return false;
    return url.startsWith("http") && url !== "string";
  };

  // Function to check if a URL is valid and return default image if not
  const getImageUrl = (url: string): string => {
    return isValidImageUrl(url) ? url : defaultImage;
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    try {
      return format(new Date(dateString), "MMMM dd, yyyy");
    } catch (e) {
      return "Invalid date";
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text className="mt-4 text-gray-600">Loading blog details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-white p-4">
        <Text className="text-red-500 text-lg font-bold mb-2">Error</Text>
        <Text className="text-gray-700 mb-4">{error}</Text>
        <TouchableOpacity
          className="bg-blue-500 px-4 py-2 rounded-lg"
          onPress={() => router.back()}
        >
          <Text className="text-white font-medium">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!blog) {
    return (
      <View className="flex-1 justify-center items-center bg-white p-4">
        <Text className="text-lg font-bold mb-2">Blog Not Found</Text>
        <Text className="text-gray-700 mb-4">
          The blog you're looking for doesn't exist.
        </Text>
        <TouchableOpacity
          className="bg-blue-500 px-4 py-2 rounded-lg"
          onPress={() => router.back()}
        >
          <Text className="text-white font-medium">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">
      {/* Header with back button */}
      <View className="bg-white pt-12 pb-4 px-4 border-b border-gray-200">
        <TouchableOpacity
          className="flex-row items-center"
          onPress={() => router.back()}
        >
          <Text className="text-blue-500 font-medium">← Back</Text>
        </TouchableOpacity>
      </View>

      {/* Main content */}
      <View className="p-4">
        {/* Title */}
        <Text className="text-3xl font-bold mb-2">
          {blog.title !== "string" ? blog.title : "Untitled Blog Post"}
        </Text>

        {/* Author and date */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-gray-700">
            By {blog.authorName !== "string" ? blog.authorName : "Anonymous"}
          </Text>
          <Text className="text-gray-500 text-sm">
            {formatDate(blog.createdAt)}
          </Text>
        </View>

        {/* Main image */}
        {blog.imageUrls && blog.imageUrls.length > 0 && (
          <Image
            source={{ uri: getImageUrl(blog.imageUrls[0]) }}
            className="w-full h-64 rounded-lg mb-4"
            resizeMode="cover"
          />
        )}

        {/* Content */}
        <Text className="text-lg leading-7 mb-6">
          {blog.content !== "string"
            ? blog.content
            : "No content available for this blog post."}
        </Text>

        {/* Additional images gallery if available */}
        {blog.imageUrls && blog.imageUrls.length > 1 && (
          <View className="mb-8">
            <Text className="text-xl font-bold mb-2">Gallery</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {blog.imageUrls.slice(1).map((imageUrl, index) => (
                <Image
                  key={index}
                  source={{ uri: getImageUrl(imageUrl) }}
                  className="w-40 h-40 rounded-md mr-2"
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Last updated info */}
        {blog.updatedAt && blog.updatedAt !== blog.createdAt && (
          <View className="mt-4 pt-4 border-t border-gray-200">
            <Text className="text-gray-500 text-sm">
              Last updated: {formatDate(blog.updatedAt)}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
