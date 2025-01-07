import { useQuery, useMutation } from "react-query";
import axios, { all } from "axios";
import convert from "xml-js";
import { useSession } from "next-auth/react";
import { getJwt } from "next-auth/jwt";
import { queryClient } from "@/queryClient";
import { useAuth } from "@clerk/nextjs";
import { usePatientContext } from "@/components/context/PatientContext";

const API_ENDPOINTS = {
  TRIAL_DATA: "trials",
  ARTICLES: "articles",
  INSTITUTIONS: "institutions",
  PROVIDERS: "providers",
  REASEARCH: "research",
  CLINCIAL_TRIALS: "clinical-trials",
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5194/api/",
};


async function fetchApi({ endpoint, token }) {
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  return axios
    .get(`${API_ENDPOINTS.BASE_URL}${endpoint}`, {
      headers,
      withCredentials: true,
    })
    .then((response) => response.data);
}

export async function fetchRelatedMedicationsByPatientMedicationId({ id, patientId }) {
  return axios
    .get(`${API_ENDPOINTS.BASE_URL}${patientId}medications/${id}/related`, {}, { withCredentials: true, })
    .then((response) => response.data);
}

export async function fetchTags(session, id) {
  const token = session?.token.systemToken;
  return axios
    .get(`${API_ENDPOINTS.BASE_URL}organizations/${id}/tags`, {
      headers: {
        userId: session.user.userId,
        Authorization: `Bearer ${token}`,
      },
    })
    .then((response) => response.data);
}

export function useFetchAuthorizedAccounts() {
  const { getToken } = useAuth();
  const fetchData = async () => {
    try {
      const token = await getToken();
      const endpoint = `users/auth/access`;
      return fetchApi({ endpoint, token });
    } catch (error) {
      console.error("Error fetching token:", error);
      throw error;
    }
  };

  return useQuery(["panels"], fetchData);
}

export function useSearchInstitutions(searchTerm) {
  const { getToken } = useAuth();

  const fetchData = async ({ queryKey }) => {
    const [_key, { searchTerm }] = queryKey; // Destructure to get searchTerm
    try {
      const token = await getToken();
      const endpoint = `institutions/search?title=${encodeURIComponent(searchTerm)}`;
      return fetchApi({ endpoint, token });
    } catch (error) {
      console.error("Error fetching token:", error);
      throw error;
    }
  };

  return useQuery(
    ["institutions", { searchTerm }],
    fetchData,
    {
      enabled: !!searchTerm,
    }
  );
}


export async function fetchAllOrganizations(session) {
  const token = session?.token.systemToken;

  return axios
    .get(`${API_ENDPOINTS.BASE_URL}organizations`, {
      headers: {
        userId: session.user.userId,
        Authorization: `Bearer ${token}`,
      },
    })
    .then((response) => response.data);
}

async function fetchInternalArticles() {
  return axios
    .get(
      `${API_ENDPOINTS.BASE_URL}organizations/${COA_ORG_ID}/${API_ENDPOINTS.ARTICLES}`
    )
    .then((response) => response.data);
}

export async function fetchResourcesByOrganization(id) {
  return axios
    .get(`${API_ENDPOINTS.BASE_URL}organizations/${id}/resources`, {})
    .then((response) => response.data);
}

export async function selectedPatientIdPOST(postData) {
  //todo: does this need to be tokenized before sending?
  const requestBody = {
    patientId: postData.patientId,
  };
  const headers = {
    Authorization: `Bearer ${postData.token}`,
  };
  return axios
    .post(`${API_ENDPOINTS.BASE_URL}auth`, requestBody, {
      headers,
      withCredentials: true,
    })
    .then((response) => response.data);
}

export async function clearTokenPOST(token) {
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios
    .post(`${API_ENDPOINTS.BASE_URL}clear-token`, {}, {
      headers,
      withCredentials: true,
    })
    .then((response) => response.data);
}


export async function updatePatientPATCH({ data }) {
  const requestBody = {
    data,
  };
  const headers = {
    Authorization: `Bearer ${data.token}`,
  };

  return axios
    .patch(`${API_ENDPOINTS.BASE_URL}patients`, requestBody,
      {
        headers,
        withCredentials: true,
      })
    .then((response) => response.data);
}

export async function updateDiagnosisPATCH({ data }) {
  const { id, ...payload } = data.data;
  const requestBody = {
    data: payload,
  };

  const headers = {
    Authorization: `Bearer ${data.token}`,
  };

  return axios
    .patch(`${API_ENDPOINTS.BASE_URL}diagnoses/${id}/update`, requestBody,
      {
        headers,
        withCredentials: true,
      })
    .then((response) => response.data);
}

export async function updateInstitutionPATCH({ data }) {
  const { id, ...payload } = data.data;
  const requestBody = {
    data: payload,
  };

  const headers = {
    Authorization: `Bearer ${data.token}`,
  };

  return axios
    .patch(`${API_ENDPOINTS.BASE_URL}institutions/${id}/update`, requestBody,
      {
        headers,
        withCredentials: true,
      })
    .then((response) => response.data);
}


export async function createTimelineEventPOST({ data, }) {
  const requestBody = {
    data,
  };
  const headers = {
    Authorization: `Bearer ${data.data.token}`,
  };
  return axios
    .post(`${API_ENDPOINTS.BASE_URL}patients/timeline/create`, requestBody,
      {
        headers,
        withCredentials: true,
      })
    .then((response) => response.data);
}


export async function createProviderPOST({ data, }) {
  const requestBody = {
    data,
  };
  const headers = {
    Authorization: `Bearer ${data.token}`,
  };

  return axios
    .post(`${API_ENDPOINTS.BASE_URL}providers/create`, requestBody,
      {
        headers,
        withCredentials: true,
      })
    .then((response) => response.data);
}

export async function createDiagnosisPOST({ data, }) {
  const requestBody = {
    data,
  };
  const headers = {
    Authorization: `Bearer ${data.token}`,
  };

  return axios
    .post(`${API_ENDPOINTS.BASE_URL}diagnoses/create`, requestBody,
      {
        headers,
        withCredentials: true,
      })
    .then((response) => response.data);
}

export async function createImagingPOST({ data, }) {
  const requestBody = {
    data,
  };
  const headers = {
    Authorization: `Bearer ${data.token}`,
  };

  return axios
    .post(`${API_ENDPOINTS.BASE_URL}imaging/create`, requestBody,
      {
        headers,
        withCredentials: true,
      })
    .then((response) => response.data);
}

export async function createInterventionPOST({ data, }) {
  const requestBody = {
    data,
  };
  const headers = {
    Authorization: `Bearer ${data.token}`,
  };

  return axios
    .post(`${API_ENDPOINTS.BASE_URL}interventions/create`, requestBody,
      {
        headers,
        withCredentials: true,
      })
    .then((response) => response.data);
}

export async function updateInterventionLinksPATCH({ data }) {

  const requestBody = {
    data,
  };
  const headers = {
    Authorization: `Bearer ${data.token}`,
  };
  return axios
    .patch(`${API_ENDPOINTS.BASE_URL}interventions/${data.interventionId}/update`, requestBody,
      {
        headers,
        withCredentials: true,
      })
    .then((response) => response.data);
}

export async function updateImagingPATCH({ data }) {

  const requestBody = {
    ...data
  };
  const headers = {
    Authorization: `Bearer ${data.token}`,
  };
  return axios
    .patch(`${API_ENDPOINTS.BASE_URL}imaging/${data.data.id}/update`, requestBody,
      {
        headers,
        withCredentials: true,
      })
    .then((response) => response.data);
}

export async function updateProviderPATCH({ data }) {
  const requestBody = {
    ...data
  };
  const headers = {
    Authorization: `Bearer ${data.token}`,
  };
  return axios
    .patch(`${API_ENDPOINTS.BASE_URL}providers/${data.payload.id}/update`, requestBody,
      {
        headers,
        withCredentials: true,
      })
    .then((response) => response.data);
}

export async function updateMedicationPATCH({ data }) {
  const requestBody = {
    ...data
  };
  const headers = {
    Authorization: `Bearer ${data.token}`,
  };
  return axios
    .patch(`${API_ENDPOINTS.BASE_URL}medications/${data.payload.id}/update`, requestBody,
      {
        headers,
        withCredentials: true,
      })
    .then((response) => response.data);
}





export async function createAttachmentPOST({ data, type = "attachment", timelineID = null }) {

  const token = data.data.token;
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  //todo: this will likely need to revise when we use this endpoint elsewhere
  const formData = new FormData();
  formData.append('file', data.data.file);
  formData.append('highlight', data.data.highlight);
  formData.append('category', data.data.category);
  formData.append('startDate', data.data.startDate);
  formData.append('link', data.data.link);
  formData.append('title', data.data.title);
  formData.append('notes', data.data.notes);
  formData.append('patientId', data.data.patientId);
  formData.append('providers', JSON.stringify(data.data.providers));
  formData.append('diagnoses', JSON.stringify(data.data.diagnoses));
  formData.append('interventions', JSON.stringify(data.data.interventions));
  formData.append('imaging', JSON.stringify(data.data.imaging));
  formData.append('medications', JSON.stringify(data.data.medications));
  formData.append('institutions', JSON.stringify(data.data.institutions));
  formData.append('type', type === "timeline" ? "timeline" : "attachment");
  formData.append('timelineId', timelineID ? timelineID : null);
  return axios
    .post(`${API_ENDPOINTS.BASE_URL}attachments/create`, formData,
      {
        headers,
        withCredentials: true,
      })
    .then((response) => response.data);
}

export async function updateResearchInterestsPATCH({ researchData }) {
  const requestBody = {
    data: researchData.researchData,
  };
  const headers = {
    Authorization: `Bearer ${researchData.token}`,
  };

  return axios
    .post(`${API_ENDPOINTS.BASE_URL}research-interests/update`, requestBody, {
      headers,
      withCredentials: true,
    })
    .then((response) => response.data);
}

export async function updateResearchInterestLinkPATCH({ data, patientId }) {
  const requestBody = {
    data: data.payload,
  };
  const headers = {
    Authorization: `Bearer ${data.token}`,
  };

  return axios
    .post(
      `${API_ENDPOINTS.BASE_URL}research-interests/${data.payload.researchInterestId}/update-link`,
      requestBody,
      {
        headers,
        withCredentials: true,
      }
    )
    .then((response) => response.data);
}

export async function updateResearchCommentPATCH({ data, patientId }) {
  const requestBody = {
    data: data.payload,
  };
  const headers = {
    Authorization: `Bearer ${data.token}`,
  };

  return axios
    .post(
      `${API_ENDPOINTS.BASE_URL}research-interests/${data.payload.researchInterestId}/update-comment`,
      requestBody,
      {
        headers,
        withCredentials: true,
      }
    )
    .then((response) => response.data);
}

export async function createLabsPOST({ data, patientId }) {
  const requestBody = {
    data: data.labsData,
  };
  const headers = {
    Authorization: `Bearer ${data.token}`,
  };

  return axios
    .post(
      `${API_ENDPOINTS.BASE_URL}patients/labs/create`,
      requestBody,
      {
        headers,
        withCredentials: true,
      }
    )
    .then((response) => response.data);
}

export async function createMedicationPOST({ data }) {
  const requestBody = {
    data
  };
  const headers = {
    Authorization: `Bearer ${data.token}`,
  };
  return axios
    .post(
      `${API_ENDPOINTS.BASE_URL}medications/create`,
      requestBody,
      {
        headers,
        withCredentials: true,
      }
    )
    .then((response) => response.data);
}



export async function createResearchPOST({ researchData }) {
  const requestBody = {
    data: researchData.researchData,
  };

  const headers = {
    Authorization: `Bearer ${requestBody.data.token}`,
  };

  return axios
    .post(`${API_ENDPOINTS.BASE_URL}research-interests/create`, requestBody, {
      headers,
      withCredentials: true,
    })
    .then((response) => response.data);
}

export async function createResearchInterestLinkPOST({ data, patientId }) {
  const requestBody = {
    data: data.payload,
  };

  const headers = {
    Authorization: `Bearer ${data.token}`,
  };
  return axios
    .post(
      `${API_ENDPOINTS.BASE_URL}research-interests/${data.payload.researchInterestId}/create-link`,
      requestBody,
      {
        headers,
        withCredentials: true,
      }
    )
    .then((response) => response.data);
}

export async function createResearchCommentPOST({ data, patientId }) {
  const requestBody = {
    data: data.payload,
  };
  const headers = {
    Authorization: `Bearer ${data.token}`,
  };
  return axios
    .post(
      `${API_ENDPOINTS.BASE_URL}research-interests/${data.payload.researchInterestId}/create-comment`,
      requestBody,
      {
        headers,
        withCredentials: true,
      }
    )
    .then((response) => response.data);
}

export async function createInstitutionPOST({ data, token }) {
  const requestBody = {
    data: data.payload,
  };
  const headers = {
    Authorization: `Bearer ${data.token}`,
  };
  return axios
    .post(`${API_ENDPOINTS.BASE_URL}institutions/create`, requestBody,
      {
        headers,
        withCredentials: true,
      })
    .then((response) => response.data);
}

export async function createOrganizationPOST({ data, session }) {
  const requestBody = {
    data,
  };
  return axios
    .post(`${API_ENDPOINTS.BASE_URL}organizations/create`, requestBody, {
      // config
      headers: {
        userId: session.user.userId,
        Authorization: `Bearer ${session.token.systemToken}`,
      },
      withCredentials: true,
    })
    .then((response) => response.data);
}

export async function createAuthorPOST({ data, session, articleId }) {
  const token = session?.token.systemToken;
  const requestBody = {
    data,
  };

  return axios
    .post(
      `${API_ENDPOINTS.BASE_URL}articles/${articleId}/author/create`,
      requestBody,
      {
        // config
        headers: {
          userId: session.user.userId,
          Authorization: `Bearer ${session.token.systemToken}`,
        },
      }
    )
    .then((response) => response.data);
}

export async function deleteAuthorsPOST({ data, session, articleId }) {
  const token = session?.token.systemToken;
  const requestBody = {
    data,
  };

  return axios
    .delete(`${API_ENDPOINTS.BASE_URL}articles/${articleId}/author/delete`, {
      data: requestBody,
      headers: {
        userId: session.user.userId,
        Authorization: `Bearer ${session.token.systemToken}`,
      },
    })
    .then((response) => response.data);
}

export async function updateAuthorsPOST({ data, session, articleId }) {
  const token = session?.token.systemToken;
  const requestBody = {
    data,
  };

  return axios
    .patch(
      `${API_ENDPOINTS.BASE_URL}articles/${articleId}/author/update`,
      requestBody,
      {
        headers: {
          userId: session.user.userId,
          Authorization: `Bearer ${session.token.systemToken}`,
        },
      }
    )
    .then((response) => response.data);
}

export async function createArticlePOST({ data, session }) {
  //this will need to be stored in the session and swapped out for the actual org id
  data.organizationId = "5058ba10-88d5-48b1-9d01-041e6777e80e";
  const requestBody = {
    data,
  };

  return axios
    .post(`${API_ENDPOINTS.BASE_URL}articles/create`, requestBody, {
      // config
      headers: {
        userId: session.user.userId,
        Authorization: `Bearer ${session.token.systemToken}`,
      },
    })
    .then((response) => response.data);
}

export async function updateArticlePATCH({ data, session }) {
  //this will need to be stored in the session and swapped out for the actual org id
  data.organizationId = "5058ba10-88d5-48b1-9d01-041e6777e80e";
  const requestBody = {
    data: data,
  };

  return axios
    .patch(
      `${API_ENDPOINTS.BASE_URL}articles/${data.pastArticle.id}/update`,
      requestBody,
      {
        // config
        headers: {
          userId: session.user.userId,
          Authorization: `Bearer ${session.token.systemToken}`,
        },
      }
    )
    .then((response) => response.data);
}

export function useFetchArticles(queryOptions) {
  if (queryOptions.length < 1) return useQuery(["articles"], () => []);
  return useQuery(["articles", queryOptions], () =>
    fetchArticles(queryOptions)
  );
}

export function useImportantDocuments({ id }) {
  const { getToken } = useAuth();
  const fetchData = async () => {
    try {
      const token = await getToken();
      const endpoint = `patients/documents`;
      return fetchApi({ endpoint, token, patientId: id });
    } catch (error) {
      console.error("Error fetching token:", error);
      throw error;
    }
  };

  return useQuery(["documents", id], fetchData);
}

export function useSequencing({ id }) {
  const { getToken } = useAuth();
  const fetchData = async () => {
    try {
      const token = await getToken();
      const endpoint = `patients/sequencing`;
      return fetchApi({ endpoint, token, patientId: id });
    } catch (error) {
      console.error("Error fetching token:", error);
      throw error;
    }
  };

  return useQuery(["sequencing", id], fetchData);
}

export function useProviders({ id = null, lastLogin = null } = {}) {
  const { getToken } = useAuth();
  const fetchData = async () => {
    try {
      const token = await getToken();
      let endpoint = 'providers';

      if (lastLogin) {
        const date = new Date(lastLogin);
        const formattedDate = date.toISOString().split("T")[0];
        endpoint += `?lastLogin=${formattedDate}`;
      }

      if (id) {
        endpoint += endpoint.includes('?') ? `&patientId=${id}` : `?patientId=${id}`;
      }

      return fetchApi({ endpoint, token });
    } catch (error) {
      console.error("Error fetching token:", error);
      throw error;
    }
  };

  return useQuery(["providers", id, lastLogin], fetchData);
}


export function useIntervention({ interventionId }) {
  const { getToken } = useAuth();
  const fetchData = async () => {
    try {
      const token = await getToken();
      const endpoint = `interventions/${interventionId}`;
      return fetchApi({ endpoint, token });
    } catch (error) {
      console.error("Error fetching token:", error);
      throw error;
    }
  };

  return useQuery(["intervention", interventionId], fetchData);
}

export function useProviderById({ providerID }) {
  const { getToken } = useAuth();
  const fetchData = async () => {
    try {
      const token = await getToken();
      const endpoint = `providers/${providerID}`;
      return fetchApi({ endpoint, token });
    } catch (error) {
      console.error("Error fetching token:", error);
      throw error;
    }
  };

  return useQuery(["provider", providerID], fetchData, {
    enabled: !!providerID,
  });
}

export function useProviderDiagnoses({ providerID, patientId }) {
  const { getToken } = useAuth();
  const fetchData = async () => {
    try {
      const token = await getToken();
      const endpoint = `diagnoses/provider/${providerID}`;
      return fetchApi({ endpoint, token, patientId });
    } catch (error) {
      console.error("Error fetching token:", error);
      throw error;
    }
  };

  return useQuery(["providerDiagnoses", providerID], fetchData);
}

export function useGetAllCancers() {
  const { getToken } = useAuth();
  const fetchData = async () => {
    try {
      const token = await getToken();
      const endpoint = `diagnoses/cancers/`;
      return fetchApi({ endpoint, token });
    } catch (error) {
      console.error("Error fetching token:", error);
      throw error;
    }
  };

  return useQuery(["allCancers"], fetchData);
}


export function useGetAllSubtypes({ id }, enabled = true) {
  const { getToken } = useAuth();

  const fetchData = async () => {
    try {
      const token = await getToken();
      const endpoint = `diagnoses/cancers/${id}/subtypes`;
      return fetchApi({ endpoint, token });
    } catch (error) {
      console.error("Error fetching token:", error);
      throw error;
    }
  };

  return useQuery(["subtypes", id], fetchData, { enabled });
}


export function useTissue({ id }) {
  const { getToken } = useAuth();
  const fetchData = async () => {
    try {
      const token = await getToken();
      const endpoint = `patients/${id}/tissue`;
      return fetchApi({ endpoint, token, patientId: id });
    } catch (error) {
      console.error("Error fetching token:", error);
      throw error;
    }
  };

  return useQuery(["tissue", id], fetchData);
}

export function useDiagnosisProviders({ id }) {
  const { getToken } = useAuth();
  const fetchData = async () => {
    try {
      const token = await getToken();
      const endpoint = `diagnoses/${id}/providers`;
      return fetchApi({ endpoint, token });
    } catch (error) {
      console.error("Error fetching token:", error);
      throw error;
    }
  };

  return useQuery(["diagnosisProviders", id], fetchData);
}

export function useDiagnosis({ id, patientId }) {
  const { getToken } = useAuth();
  const fetchData = async () => {
    try {
      const token = await getToken();
      const endpoint = `diagnoses/${id}`;
      return fetchApi({ endpoint, token, patientId });
    } catch (error) {
      console.error("Error fetching token:", error);
      throw error;
    }
  };

  return useQuery(["diagnosis", id], fetchData);
}


export function useDiagnoses({ id = null, lastLogin = null } = {}) {
  const { getToken } = useAuth();
  const fetchData = async () => {
    try {
      const token = await getToken();
      const endpoint = `diagnoses`;
      return fetchApi({ endpoint, token, patientId: id });
    } catch (error) {
      console.error("Error fetching token:", error);
      throw error;
    }
  };

  return useQuery(["diagnoses", id], fetchData);
}

export function useImagingByDiagnosis({ id, patientId }) {
  const { getToken } = useAuth();
  const fetchData = async () => {
    try {
      const token = await getToken();
      const endpoint = `imaging/diagnosis/${id}`;
      return fetchApi({ endpoint, token, patientId });
    } catch (error) {
      console.error("Error fetching token:", error);
      throw error;
    }
  };

  return useQuery(["diagnosis_imaging", id], fetchData);
}

export function useInterventionsByDiagnosis({ id, patientId }) {
  const { getToken } = useAuth();
  const fetchData = async () => {
    try {
      const token = await getToken();
      const endpoint = `interventions/diagnosis/${id}`;
      return fetchApi({ endpoint, token, patientId });
    } catch (error) {
      console.error("Error fetching token:", error);
      throw error;
    }
  };

  return useQuery(["diagnosis_interventions", id], fetchData);
}

export function useMedicationsByDiagnosis({ id }) {
  const { getToken } = useAuth();
  const fetchData = async () => {
    try {
      const token = await getToken();
      const endpoint = `medications/diagnosis/${id}`;
      return fetchApi({ id, endpoint, token });
    } catch (error) {
      console.error("Error fetching token:", error);
      throw error;
    }
  };

  return useQuery(["diagnosis_medications", id], fetchData);
}
export function useRelatedMedicationsByPatientMedicationId({ id }) {
  const { getToken } = useAuth();
  const fetchData = async () => {
    try {
      const token = await getToken();
      const endpoint = `medications/${id}/related`;

      return fetchApi({ id, endpoint, token });
    } catch (error) {
      console.error("Error fetching token:", error);
      throw error;
    }
  };

  return useQuery(["medications_relations", id], fetchData);
}

export function useAttachmentsByDiagnosis({ id }) {
  const { getToken } = useAuth();
  const fetchData = async () => {
    try {
      const token = await getToken();
      const endpoint = `diagnoses/${id}/attachments`;

      return fetchApi({ id, endpoint, token });
    } catch (error) {
      console.error("Error fetching token:", error);
      throw error;
    }
  };

  return useQuery(["diagnosis_attachments", id], fetchData);
}

export function useAttachmentsByIntervention({ id }) {
  const { getToken } = useAuth();
  const fetchData = async () => {
    try {
      const token = await getToken();
      const endpoint = `interventions/${id}/attachments`;

      return fetchApi({ id, endpoint, token });
    } catch (error) {
      console.error("Error fetching token:", error);
      throw error;
    }
  };

  return useQuery(["intervention_attachments", id], fetchData);
}

export function useAttachmentsByImaging({ id }) {
  const { getToken } = useAuth();
  const fetchData = async () => {
    try {
      const token = await getToken();
      const endpoint = `imaging/${id}/attachments`;

      return fetchApi({ id, endpoint, token });
    } catch (error) {
      console.error("Error fetching token:", error);
      throw error;
    }
  };

  return useQuery(["imaging_attachments", id], fetchData);
}

export function useResearchInterests({ id, lastLogin }, options) {
  const { getToken } = useAuth();
  const fetchData = async () => {
    try {
      const token = await getToken();
      let endpoint;
      if (lastLogin) {
        const date = new Date(lastLogin);
        const formattedDate = date.toISOString().split("T")[0];
        endpoint = `research-interests?lastLogin=${formattedDate}`;
      } else {
        endpoint = `research-interests`;
      }
      return fetchApi({ id, endpoint, token });
    } catch (error) {
      throw error;
    }
  };

  return useQuery(["researchInterests", id, lastLogin], fetchData, options);
}

export function useLabsHighlighted({ id }) {
  const { getToken } = useAuth();
  const fetchData = async () => {
    try {
      const token = await getToken();
      const endpoint = `patients/labs?highlighted=true`;
      return fetchApi({ id, endpoint, token });
    } catch (error) {
      console.error("Error fetching token:", error);
      throw error;
    }
  };

  return useQuery(["highlighted_labs", id], fetchData);
}

export function useLabPanels() {
  const { getToken } = useAuth();
  const fetchData = async () => {
    try {
      const token = await getToken();
      const endpoint = `patients/lab/panels`;
      return fetchApi({ endpoint, token });
    } catch (error) {
      console.error("Error fetching token:", error);
      throw error;
    }
  };

  return useQuery(["panels"], fetchData);
}

export function useLabs({ id, lastLogin }) {
  const { getToken } = useAuth();
  const fetchData = async () => {
    try {
      const token = await getToken();
      let endpoint;
      if (lastLogin) {
        const date = new Date(lastLogin);
        const formattedDate = date.toISOString().split("T")[0];
        endpoint = `patients/labs?lastLogin=${formattedDate}`;
      } else {
        endpoint = `patients/labs`;
      }
      return fetchApi({ id, endpoint, token });
    } catch (error) {
      console.error("Error fetching token:", error);
      throw error;
    }
  };

  return useQuery(["labs", id], fetchData);
}

export function useLabsByDateRange(
  { id, startDate, daysBefore, daysAfter },
  options
) {
  const { getToken } = useAuth();

  const fetchData = async ({ queryKey }) => {
    const [key, id, startDate] = queryKey;

    try {
      const token = await getToken();
      const endpoint = `patients/labs/range?startDate=${startDate}&daysBefore=${daysBefore}&daysAfter=${daysAfter}`;
      return fetchApi({ id, endpoint, token });
    } catch (error) {
      console.error("Error fetching token:", error);
      throw error;
    }
  };

  return useQuery(["labs", id, startDate], fetchData, options);
}

export function useInstitutions({ id, lastLogin }) {
  const { getToken } = useAuth();
  const fetchData = async () => {
    try {
      const token = await getToken();
      let endpoint;
      if (lastLogin) {
        const date = new Date(lastLogin);
        const formattedDate = date.toISOString().split("T")[0];
        endpoint = `institutions?lastLogin=${formattedDate}`;
      } else {
        endpoint = `institutions`;
      }
      return fetchApi({ id, endpoint, token });
    } catch (error) {
      console.error("Error fetching token:", error);
      throw error;
    }
  };

  return useQuery(["institutions", id], fetchData);
}

export function useInstitution(institutionId) {
  const { getToken } = useAuth();
  const fetchData = async () => {
    try {
      if (!institutionId) return;
      const token = await getToken();
      const endpoint = `institutions/${institutionId}`;
      return fetchApi({ institutionId, endpoint, token });
    } catch (error) {
      console.error("Error fetching token:", error);
      throw error;
    }
  };

  return useQuery(["institutions", institutionId], fetchData, {
    enabled: !!institutionId,
  });
}

export function usePatient({ id }) {
  const { getToken } = useAuth();
  const fetchData = async () => {
    try {
      const token = await getToken();
      const endpoint = `patients`;
      return fetchApi({ id, endpoint, token });
    } catch (error) {
      console.error("Error fetching token:", error);
      throw error;
    }
  };

  return useQuery(["patient", id], fetchData);
}
export function useTimeline({ id }) {
  const { getToken } = useAuth();
  const fetchData = async () => {
    try {
      const token = await getToken();
      const endpoint = `patients/timeline`;
      return fetchApi({ id, endpoint, token });
    } catch (error) {
      console.error("Error fetching token:", error);
      throw error;
    }
  };

  return useQuery(["timeline", id], fetchData);
}

export function useTimelineEvent({ patientId, timelineId }) {
  const { getToken } = useAuth();
  const fetchData = async () => {
    try {
      const token = await getToken();
      const endpoint = `patients/timeline/${timelineId}`;

      return fetchApi({ patientId, endpoint, token });
    } catch (error) {
      console.error("Error fetching token:", error);
      throw error;
    }
  };

  return useQuery(["timelineEvent", patientId], fetchData, {
    enabled: !!timelineId,
  });
}

export function useResearchInterestById({ patientId, researchInterestId }) {
  const { getToken } = useAuth();
  const fetchData = async () => {
    try {
      const token = await getToken();

      const endpoint = `research-interests/${researchInterestId}`;

      return fetchApi({ patientId, endpoint, token });
    } catch (error) {
      console.error("Error fetching token:", error);
      throw error;
    }
  };

  return useQuery(["researchInterest", researchInterestId], fetchData, {
    enabled: !!researchInterestId,
  });
}

export function useFamilyHistory({ id }) {
  const { getToken } = useAuth();
  const fetchData = async () => {
    try {
      const token = await getToken();
      const endpoint = `patients/family-history`;
      return fetchApi({ id, endpoint, token });
    } catch (error) {
      console.error("Error fetching token:", error);
      throw error;
    }
  };

  return useQuery(["family", id], fetchData);
}

export function useAppointments({ id }) {
  const { getToken } = useAuth();
  const fetchData = async () => {
    try {
      const token = await getToken();
      const endpoint = `patients/appointments`;
      return fetchApi({ id, endpoint, token });
    } catch (error) {
      console.error("Error fetching token:", error);
      throw error;
    }
  };

  return useQuery(["appointments", id], fetchData);
}

export function useAppointmentById({ id }) {
  const { getToken } = useAuth();
  const fetchData = async () => {
    try {
      const token = await getToken();
      const endpoint = `patients/appointments/${id}`;
      return fetchApi({ id, endpoint, token });
    } catch (error) {
      console.error("Error fetching token:", error);
      throw error;
    }
  };

  return useQuery(["appt_by_id", id], fetchData);
}

export function useAppointmentsByDiagnosisId({ id }) {
  const { getToken } = useAuth();
  const fetchData = async () => {
    try {
      const token = await getToken();
      const endpoint = `patients/appointments/diagnosis/${id}`;
      return fetchApi({ id, endpoint, token });
    } catch (error) {
      console.error("Error fetching token:", error);
      throw error;
    }
  };

  return useQuery(["appt_by_id", id], fetchData);
}

export function useInterventions({ id, lastLogin }) {
  const { getToken } = useAuth();
  const fetchData = async () => {
    try {
      const token = await getToken();
      let endpoint;
      if (lastLogin) {
        const date = new Date(lastLogin);
        const formattedDate = date.toISOString().split("T")[0];
        endpoint = `interventions?lastLogin=${formattedDate}`;
      } else {
        endpoint = `interventions`;
      }

      return fetchApi({ id, endpoint, token });
    } catch (error) {
      console.error("Error fetching token:", error);
      throw error;
    }
  };

  return useQuery(["interventions", id], fetchData);
}

export function useMedication({ id }) {
  const { getToken } = useAuth();
  const fetchData = async () => {
    try {
      const token = await getToken();
      const endpoint = `medications/${id}`;
      return fetchApi({ id, endpoint, token });
    } catch (error) {
      console.error("Error fetching token:", error);
      throw error;
    }
  };

  return useQuery(["medication_id", id], fetchData);
}

export function useMedications({ id, lastLogin }) {
  const { getToken } = useAuth();
  const fetchData = async () => {
    try {
      const token = await getToken();
      let endpoint;
      if (lastLogin) {
        const date = new Date(lastLogin);
        const formattedDate = date.toISOString().split("T")[0];
        endpoint = `medications?lastLogin=${formattedDate}`;
      } else {
        endpoint = `medications`;
      }
      return fetchApi({ id, endpoint, token });
    } catch (error) {
      console.error("Error fetching token:", error);
      throw error;
    }
  };

  return useQuery(["medications", id], fetchData);
}

export function useImagingById({ id }) {
  const { getToken } = useAuth();
  const fetchData = async () => {
    try {
      const token = await getToken();
      const endpoint = `imaging/${id}`;
      return fetchApi({ id, endpoint, token });
    } catch (error) {
      console.error("Error fetching token:", error);
      throw error;
    }
  };

  return useQuery(["imaging_id", id], fetchData);
}

export function useImaging({ id, lastLogin }) {
  const { getToken } = useAuth();
  const fetchData = async () => {
    try {
      const token = await getToken();
      let endpoint;
      if (lastLogin) {
        const date = new Date(lastLogin);
        const formattedDate = date.toISOString().split("T")[0];
        endpoint = `imaging?lastLogin=${formattedDate}`;
      } else {
        endpoint = `imaging`;
      }
      return fetchApi({ id, endpoint, token });
    } catch (error) {
      console.error("Error fetching token:", error);
      throw error;
    }
  };

  return useQuery(["imaging", id], fetchData);
}

export function useInteralArticles() {
  return useQuery(["internalArticles"], () => fetchInternalArticles());
}



export async function uploadPhotoPOST(data, session) {
  const token = session?.token.systemToken;

  return axios
    .post(`${API_ENDPOINTS.BASE_URL}upload`, data, {
      // config
      headers: {
        "Content-Type": "multipart/form-data",
        userId: session.user.userId,
        Authorization: `Bearer ${session.token.systemToken}`,
      },
    })
    .then((response) => response.data);
}

// function patchProfile(id, data) {
//   return axios
//     .patch(`${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.PROFILE}/${id}`, data)
//     .then((response) => response.data);
// }

// function patchAccess(id, data) {
//   return axios
//     .patch(
//       `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.PROFILE}/${id}/access`,
//       data
//     )
//     .then((response) => response.data);
// }

export async function useFetchToken(user, token) {
  const response = await axios.get(`${API_ENDPOINTS.BASE_URL}login`, {
    // config
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response;
}

export function useClinicalTrials() {
  const { getToken } = useAuth();
  const fetchData = async () => {
    try {
      const token = await getToken();
      const endpoint = `articles/trials`;
      return fetchApi({ endpoint, token });
    } catch (error) {
      console.error("Error fetching token:", error);
      throw error;
    }
  };

  return useQuery(["trials"], fetchData);
}

export function useCreateOrganization(data) {
  return useQuery(["organizations"], () => createOrganizationPOST(data));
}

export function useCreateAuthor(data) {
  return useQuery(["article"], () => createAuthorPOST(data));
}

export function useDeleteAuthors(data) {
  return useQuery(["article"], () => deleteAuthorsPOST(data));
}

export function useUpdateAuthors(data) {
  return useQuery(["authors"], () => updateAuthorsPOST(data));
}

export function usePatchProfile() {
  const mutation = useMutation((payload) =>
    patchProfile(payload.id, payload.data)
  );
  return mutation;
}

export function usePatchAccess() {
  const mutation = useMutation((payload) =>
    patchAccess(payload.id, payload.data)
  );
  return mutation;
}

export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildQuery(options) {
  return options
    .map((option) => {
      if (option.value.split(" ") === undefined) return undefined;
      if (option.field === "Author") {
        const names = option.value.split(" ");
        const formattedName = `${names[0]}+${names[1]}`;
        return `${formattedName}`;
      }
      return `${option.value}[${option.field}]`;
    })
    .join(" OR ");
}

const secondRequest = async () => {
  const response2 = await axios.get(secondRequest);
  const xml2 = response2.data;

  const result2 = convert.xml2js(xml2, { compact: true });
};

function transformQueryToPubmedUrl(queryKeywords) {
  // Split the keywords by comma and trim any whitespace
  const keywords = queryKeywords.split(",").map((keyword) => keyword.trim());

  // Group the keywords with 'AND' within parentheses and join groups with 'OR'
  const groupedQuery = keywords
    .map((keyword) => {
      const terms = keyword
        .split(" ")
        .map((term) => `"${term}"[Title]`)
        .join(" AND ");
      return `(${terms})`;
    })
    .join(" OR ");

  // Encode the query for a URL
  const encodedQuery = encodeURIComponent(groupedQuery);

  // Construct the PubMed URL
  const pubmedUrl = `https://pubmed.ncbi.nlm.nih.gov/?term=${encodedQuery}&sort=date`;
  return pubmedUrl;
}

export const fetchArticles = async (queryOptions) => {
  try {
    const baseUrl =
      "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi";
    const query = await buildQuery(queryOptions);
    const keywords = queryOptions.map((option) => option.value).join(",");

    if (!query) return [];

    const dateRange = "[2018/01/01:2023/12/31]";
    const url = `${baseUrl}?db=pubmed&term=${query}&retmode=xml`;
    const pubmedUrl = transformQueryToPubmedUrl(keywords);
    const secondRequest = `${url}&RetStart=20&RetMax=40`;

    const response = await axios.get(url);
    const xml = response.data;
    const result = convert.xml2js(xml, { compact: true });

    // Get the PubMed IDs

    const ids = result.eSearchResult.IdList.Id?.map((idObj) => idObj._text);

    const fetchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${ids.join(
      ","
    )}&retmode=xml`;

    const allArticles = [];

    const fetchResponse = await axios.get(fetchUrl);

    const fetchXml = fetchResponse.data;
    const fetchResult = convert.xml2js(fetchXml, { compact: true });
    allArticles.push(...fetchResult.PubmedArticleSet.PubmedArticle);

    await delay(1205);

    const response2 = await axios.get(secondRequest);
    const xml2 = response2.data;
    const result2 = convert.xml2js(xml2, { compact: true });

    const ids2 = result2.eSearchResult.IdList.Id?.map((idObj) => idObj._text);
    if (Array.isArray(ids2)) {
      const fetchUrl2 = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${ids2.join(
        ","
      )}&retmode=xml`;

      await delay(1005); // Another delay before the next fetch

      const fetchResponse2 = await axios.get(fetchUrl2);
      const fetchXml2 = fetchResponse2.data;
      const fetchResult2 = convert.xml2js(fetchXml2, { compact: true });

      allArticles.push(...fetchResult2.PubmedArticleSet.PubmedArticle);
    }

    const articles = allArticles.map((article) => {
      const { MedlineCitation } = article;
      const { Article, DateCompleted } = MedlineCitation;
      const { ArticleTitle, Abstract } = Article;

      function getDate(Article, DateCompleted) {
        if (Article && Article.ArticleDate) {
          const { Month, Day, Year } = Article.ArticleDate;

          if (Month && Day && Year && Month._text && Day._text && Year._text) {
            return `${Month._text}/${Day._text}/${Year._text}`;
          }
        } else if (DateCompleted) {
          const { Month, Day, Year } = DateCompleted;

          if (Month && Day && Year && Month._text && Day._text && Year._text) {
            return `${Month._text}/${Day._text}/${Year._text}`;
          }
          return "";
        }
        return "";
      }

      const date = getDate(Article, DateCompleted);

      let abstract = {};
      if (Array.isArray(Article?.Abstract?.AbstractText)) {
        abstract = Article.Abstract.AbstractText.reduce((obj, item) => {
          const label = item._attributes.Label;
          const text = item._text;
          obj[label] = text;
          return obj;
        }, {});
      }

      let authors = [];
      if (Array.isArray(MedlineCitation?.Article?.AuthorList?.Author)) {
        authors = MedlineCitation.Article.AuthorList.Author.map((author) => {
          const { LastName, ForeName, AffiliationInfo } = author;
          return {
            firstName: ForeName?._text ?? "",
            lastName: LastName?._text ?? "",
            affiliation: AffiliationInfo?.Affiliation?._text ?? "",
          };
        });
      }

      const getTageType = getTagType(ArticleTitle);
      const getType = getTypeSwitch(ArticleTitle);

      return {
        title: ArticleTitle?._text ?? "",
        abstract: abstract,
        date: date ?? "",
        authors: authors,
        PMID: MedlineCitation?.PMID?._text ?? "",
        tag: getTageType ?? "other",
        type: getType ?? "other",
      };
    });

    return { articles, queryUrl: pubmedUrl };
  } catch (error) {
    //swallowing this error - need to come back and surface it
    console.log(error);
  }
};

function getTagType(articleTitle) {
  if (
    !articleTitle ||
    !articleTitle._text ||
    Array.isArray(articleTitle._text)
  ) {
    return "other";
  }
  const title = articleTitle?._text.toLowerCase();
  switch (true) {
    case title.includes("case"):
      return "case";
    case title.includes("review"):
      return "review";
    case title.includes("retrospective"):
      return "retro";
    default:
      return "other";
  }
}

function getTypeSwitch(articleTitle) {
  if (
    !articleTitle ||
    !articleTitle._text ||
    Array.isArray(articleTitle._text)
  ) {
    return "other";
  }
  const title = articleTitle?._text?.toLowerCase();
  switch (true) {
    case title.includes("oncocytoma"):
      return "oncocytoma";
    case title.includes("chromophobe"):
      return "chromophobe";
    default:
      return "other";
  }
}

export const getDrugNames = async (drugName) => {
  const url = `https://rxnav.nlm.nih.gov/REST/drugs.json?name=${drugName}`;
  return axios.get(url).then((response) => response.data);
}


export const getProviders = async ({ providerFirstName, providerLastName, providerState }) => {
  fetchApi({ url, token, })
  return axios.get(url).then((response) => response.data);
}

export function useGetProvidersFromNpi({ providerFirstName, providerLastName, providerState, searchTrigger }) {
  const { getToken } = useAuth();
  const fetchData = async ({ queryKey }) => {

    try {
      const token = await getToken();
      const endpoint = `providers/npi?version=2.1&first_name=${providerFirstName ?? ""}&last_name=${providerLastName}&state=${providerState ?? ""}&output_format=json`;
      return fetchApi({ endpoint, token });
    } catch (error) {
      console.error("Error fetching token:", error);
      throw error;
    }
  };

  return useQuery(
    ["providersNPI", searchTrigger],
    fetchData,
    {
      enabled: !!searchTrigger,
    }
  );
}


export default API_ENDPOINTS;
