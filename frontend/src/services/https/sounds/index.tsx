import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;

export const getSoundsByTypeID = async (typeID: number) => {
  try {
    const response = await axios.get(`${apiUrl}/sounds/type/${typeID}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data; // { sounds: [...] }
  } catch (error) {
    console.error(`Error fetching sounds for typeID ${typeID}:`, error);
    throw error;
  }
};
