import { gql, request } from 'graphql-request';

const Master_URL = 'https://us-west-2.cdn.hygraph.com/content/cm5sq0qhf01dq07v06fhe4ing/master';
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

const getKoisByCategory = async (category) => {
    const query = gql`
    query GetKoi {
            kois(where: {category: {name: "`+category+`"}}) {
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
            kois(where: {breeder: "`+breeder+`"}) {
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

const getKoisById = async (id) => {
    const query = gql`
    query GetKoi {
            kois(where: {id: "`+id+`"}) {
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
    getKoisByBreeder
}