import { AdminInterface } from "../../../interfaces/IAdmin";
import { SignInInterface } from "../../../interfaces/SignIn";

const apiUrl = "http://localhost:8000";

// Ensure token and Bearer are correctly fetched from localStorage
const Authorization = localStorage.getItem("token");
const Bearer = localStorage.getItem("token_type");

const requestOptions = {
  method: 'GET',
  headers: {
    "Content-Type": "application/json",
    Authorization: `${Bearer} ${Authorization}`,
  },
};

// Function to get all admins using fetch
export const getAllAdmins = async (): Promise<AdminInterface[]> => {
  try {
    // Check if token and Bearer are present in localStorage
    if (!Authorization || !Bearer) {
      console.error("Authorization or token_type is missing"); // Log an error if token or Bearer is not found
      throw new Error("Authorization token or token_type is missing");
    }

    // Log the token and Bearer to check if they are correctly retrieved
    console.log("Token retrieved from localStorage:", Authorization);
    console.log("Bearer retrieved from localStorage:", Bearer);

    // Make the fetch request to get all admins
    const response = await fetch(`${apiUrl}/admin`, requestOptions);

    // Log the response to check what is being returned by the API
    console.log("Response from API:", response);

    // Check if the response status is ok (status code 200-299)
    if (!response.ok) {
      console.error(`Error: ${response.status} - ${response.statusText}`);
      throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }

    // Parse the response JSON data
    const data: AdminInterface[] = await response.json();

    // Log the data to check the contents of the response
    console.log("Data from API:", data);

    return data;
  } catch (error: unknown) {
    // Enhanced error handling
    if (error instanceof Error) {
      console.error("Error fetching admins:", error.message);
    } else {
      console.error("An unknown error occurred:", error);
    }
    throw error; // Re-throw the error for further handling
  }
};

// Function to fetch admin data by ID using fetch
// Updated function to return AdminInterface
export const getAdminById = async (id: string): Promise<AdminInterface> => {
  try {
    const response = await fetch(`${apiUrl}/admin/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }

    const data: AdminInterface = await response.json();
    return data; // Return AdminInterface directly
  } catch (error) {
    console.error("Error fetching admin:", error);
    throw error;
  }
};


// Function to update admin data by ID using fetch
// Function to update admin data by ID using fetch
export const updateAdminById = async (id: string, updatedData: AdminInterface) => {
  try {
    // Retrieve the token from localStorage
    const token = localStorage.getItem('token'); // Assuming you store your token in localStorage
    const tokenType = localStorage.getItem('token_type') || 'Bearer'; // Default to Bearer if token type is not available

    if (!token) {
      throw new Error("Authorization token is missing");
    }

    const response = await fetch(`${apiUrl}/admin/${id}`, {
      method: 'PUT',
      headers: {
        "Content-Type": "application/json",
        Authorization: `${tokenType} ${token}`, // Add Bearer token to Authorization header
      },
      body: JSON.stringify(updatedData), // Send updated data in the request body
    });

    if (!response.ok) {
      console.error(`Error: ${response.status} - ${response.statusText}`);
      throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json(); // Parse the response JSON data
    return data; // Return the updated data
  } catch (error) {
    console.error("Error updating admin:", error);
    throw error;
  }
};
