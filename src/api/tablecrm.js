import axios from "axios"

const API_BASE = "https://app.tablecrm.com/api/v1"

export async function getOrganizations(token) {
  const response = await axios.get(`${API_BASE}/organizations/`, {
    params: { token },
  })
  return response.data
}

export async function getPayboxes(token) {
  const response = await axios.get(`${API_BASE}/payboxes/`, {
    params: { token },
  })
  return response.data
}

export async function getWarehouses(token) {
  const response = await axios.get(`${API_BASE}/warehouses/`, {
    params: { token },
  })
  return response.data
}

export async function getPriceTypes(token) {
  const response = await axios.get(`${API_BASE}/price_types/`, {
    params: { token },
  })
  return response.data
}

export async function getContragents(token, phone) {
  const response = await axios.get(`${API_BASE}/contragents/`, {
    params: {
      token,
      phone,
      limit: 20,
      offset: 0,
      sort: "created_at:desc",
      add_tags: false,
    },
  })

  return response.data
}

export async function getNomenclature(token, search) {
  const response = await axios.get(`${API_BASE}/nomenclature/`, {
    params: {
      token,
      search,
      limit: 20,
      offset: 0,
    },
  })

  return response.data
}

export async function createDocSale(token, payload) {
  const response = await axios.post(`${API_BASE}/docs_sales/`, payload, {
    params: { token },
  })

  return response.data
}