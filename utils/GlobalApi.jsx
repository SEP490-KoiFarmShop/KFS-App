import { gql, request } from 'graphql-request';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Master_URL = 'https://us-west-2.cdn.hygraph.com/content/cm5sq0qhf01dq07v06fhe4ing/master';
const API_BASE_URL = 'https://kfsapis.azurewebsites.net/api/v1';

const getSlider = async () => {
    try {
        const response = await axios.get(`https://kfsapis.azurewebsites.net/api/Blog/GetAll`);
        return response.data;
    } catch (error) {
        console.error('Error fetching kois:', error);
        throw error;
    }
}

const getCategories = async () => {
    const query = gql`
    query GetCategories {
        categories {
            id
            name
            icon {
                url
            }
        }
    }
  `
    const result = await request(Master_URL, query);
    return result;
}

const getKois = async () => {
    try {
        const response = await axios.get(`https://kfsapis.azurewebsites.net/api/v1/products?page-number=1&page-size=10`);
        return response.data.data;
    } catch (error) {
        console.error('Error fetching koi breeders:', error);
        throw error;
    }
}

const getKoisList = async (
    page = 1,
    pageSize = 10,
    searchValue = "",
    gender = "",
    type = "",
    variety = "",
    breeder = "",
    sortOrder
) => {
    const validSortOrder = sortOrder && sortOrder.trim() !== "" ? sortOrder : "updatedAt desc";

    const url = `${API_BASE_URL}/products?variety=${variety}&gender=${gender}&type=${type}&breeder=${breeder}&status=Listing&search-value=${searchValue}&page-number=${page}&page-size=${pageSize}&order-by=${validSortOrder}`;

    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error("Error fetching koi fishes list:", error);
        throw error;
    }
};

const getAuctionList = async (
    page = 1,
    pageSize = 10,
    searchValue = "",
    fromDate = "",
    toDate = "",
    status = "",
    sortOrder
) => {
    const userData = await AsyncStorage.getItem("userData");
    const parsedToken = JSON.parse(userData);
    const jwtToken = parsedToken?.accessToken;

    const validSortOrder = sortOrder && sortOrder.trim() !== "" ? sortOrder : "updatedAt desc";

    const url = `${API_BASE_URL}/auctions?status=Live&from-date=${fromDate}&to-date=${toDate}&search-value=${searchValue}&page-number=${page}&page-size=${pageSize}&order-by=${validSortOrder}`;
    try {
        const response = await axios.get(url
            ,
            {
                headers: {
                    Authorization: `Bearer ${jwtToken}`,
                    "Content-Type": "application/json",
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching koi fishes list:", error);
        throw error;
    }
};

const getAuctionsById = async (id) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/auctions/${id}/lots`);
        return response.data;
    } catch (error) {
        console.error('Error fetching koi auction lot list:', error);
        throw error;
    }
}

const getKoisById = async (id) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/products/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching koi fishes list:', error);
        throw error;
    }
}

const getBreeders = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/breeders`);
        return response.data;
    } catch (error) {
        console.error('Error fetching koi breeders:', error);
        throw error;
    }
}

const getVarieties = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/varieties`);
        return response.data;
    } catch (error) {
        console.error('Error fetching koi varieties:', error);
        throw error;
    }
}

const getLotById = async (id) => {
    try {
        const userData = await AsyncStorage.getItem("userData");
        const parsedToken = JSON.parse(userData);
        const jwtToken = parsedToken?.accessToken;

        const response = await axios.get(`${API_BASE_URL}/auctions/lot/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${jwtToken}`,
                    "Content-Type": "application/json",
                },
            });
        return response.data;
    } catch (error) {
        console.error('Error fetching koi fishes list:', error);
        throw error;
    }
}

const getKoisByCategory = async (category) => {
    const query = gql`
    query GetKoi {
            kois(where: {category: {name: "`+ category + `"}}) {
                id
                name
                sex
                description
                size
                price
                breeder
                image {
                    url
                }
                category{
                name
                }
            }
    }
  `
    const result = await request(Master_URL, query);
    return result;
}

const getKoisByBreeder = async (breeder) => {
    const query = gql`
    query GetKoi {
            kois(where: {breeder: "`+ breeder + `"}) {
                id
                name
                sex
                description
                size
                price
                breeder
                image {
                    url
                }
                category{
                name
                }
            }
    }
  `
    const result = await request(Master_URL, query);
    return result;
}



export default {
    getSlider,
    getCategories,
    getKois,
    getKoisByCategory,
    getKoisById,
    getKoisByBreeder,
    getKoisList,
    getBreeders,
    getVarieties,
    getAuctionList,
    getAuctionsById,
    getLotById
}