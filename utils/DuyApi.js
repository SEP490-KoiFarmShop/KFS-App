import { gql, request } from "graphql-request";

const Master_URL =
  "https://ap-south-1.cdn.hygraph.com/content/cm7k8rd5s01hv07wbguiwft45/master";

const getAppUsers = async () => {
  const query = gql`
    query GetAppUsers {
      appUsers {
        id
        username
        email
        phoneNumber
        address
        loyaltyPoints
        walletBalance
        avatarUrl
      }
    }
  `;
  try {
    const result = await request(Master_URL, query);
    return result;
  } catch (error) {
    console.error("Error fetching AppUsers:", error);
  }
};

export default {
  getAppUsers,
};
