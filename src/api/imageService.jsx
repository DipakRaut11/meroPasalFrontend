import { API_BASE } from '../utils/constants';

const IMAGE_API = `${API_BASE}/image`;

export const uploadImages = async (productId, file, token) => {
  const formData = new FormData();
  file.forEach(file => formData.append('file', file));

  const response = await fetch(`${IMAGE_API}/upload?productId=${productId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Image upload failed');
  }

  return response.json();
};

export const deleteImage = async (imageId, token) => {
  const response = await fetch(`${IMAGE_API}/${imageId}/delete`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Image delete failed');
  }

  return response.json();
};

export const getImageUrl = (imageId, type = 'view') => {
  return `${IMAGE_API}/images/${type}/${imageId}`;
};

export const fetchImageBlob = async (imageId, token) => {
  const response = await fetch(`${IMAGE_API}/images/download/${imageId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch image');
  }

  return response.blob();
};

export const getImageObjectUrl = async (imageId, token) => {
  const blob = await fetchImageBlob(imageId, token);
  return URL.createObjectURL(blob);
};
