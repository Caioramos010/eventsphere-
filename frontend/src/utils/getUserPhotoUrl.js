export default function getUserPhotoUrl(photo) {
  if (!photo) return null;
  if (photo.startsWith('data:image')) return photo;
  return `data:image/png;base64,${photo}`;
}
