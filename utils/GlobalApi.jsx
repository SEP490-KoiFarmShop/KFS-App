import { gql, request } from 'graphql-request';
import axios from 'axios';

const Master_URL = 'https://us-west-2.cdn.hygraph.com/content/cm5sq0qhf01dq07v06fhe4ing/master';
const API_BASE_URL = 'https://kfsapis.azurewebsites.net/api/v1';

const getSlider = async () => {
    const query = gql`
    query GetSlider {
        sliders {
            id
            name
            image {
                url
            }
        }
    }
  `
    try {
        const result = await request(Master_URL, query);
        return result;
    } catch (error) {
        console.error("Error fetching sliders:", error);
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
    const query = gql`
    query GetKoi {
            kois {
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

const getKoisList = async (page = 1, pageSize = 10, searchValue = "") => {
    try {
        const response = await axios.get(`${API_BASE_URL}/koi-fishes?search-value=${searchValue}&page-number=${page}&page-size=${pageSize}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching koi fishes list:', error);
        throw error;
    }
};

const getKoisById = async (id) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/koi-fishes/${id}`);
        // console.log(response.data)
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
}