import axios from "axios";
import { Sound } from "../../../interfaces/ISound";

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

export const getAllSounds = async () => {
  try {
    const response = await axios.get(`${apiUrl}/AllSounds`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data; // { sounds: [...] }
  } catch (error) {
    console.error("Error fetching all sounds:", error);
    throw error;
  }
};

export const updateSoundByID = async (id: number,data : Sound) => {
  try {
    const response = await axios.patch(`${apiUrl}/Sound/Update/${id}`,data, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
     
      
    });
    return response.data; // { sounds: [...] }
  } catch (error) {
    console.error("Error fetching all sounds:", error);
    throw error;
  }
};
export const deleteSoundByID = async (id: number) => {
  try {
    const response = await axios.delete(`${apiUrl}/Sound/Delete/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
     
      
    });
    return response.data; // { sounds: [...] }
  } catch (error) {
    console.error("Error fetching all sounds:", error);
    throw error;
  }
};

export const getSoundByID = async (id: number) => {
  try {
    const response = await axios.get(`${apiUrl}/Sound/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data; // { sounds: [...] }
  } catch (error) {
    console.error("Error fetching all sounds:", error);
    throw error;
  }
};
