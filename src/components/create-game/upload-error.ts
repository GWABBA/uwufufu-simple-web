export const getFriendlyCoverUploadError = (rawMessage: string) => {
  const message = rawMessage.toLowerCase();

  if (
    message.includes('unsupported file type') ||
    message.includes('invalid file type')
  ) {
    return 'Unsupported file type. Use JPG, PNG, GIF, or WEBP.';
  }

  if (message.includes('image dimensions are too large')) {
    return 'Image dimensions are too large. Please upload a smaller image.';
  }

  if (
    message.includes('file too large') ||
    message.includes('limit file size')
  ) {
    return 'File is too large. Maximum size is 12 MB.';
  }

  if (message.includes('no file uploaded')) {
    return 'No file was uploaded. Choose an image and try again.';
  }

  if (
    message.includes('upload service is temporarily unavailable') ||
    message.includes('failed to upload file')
  ) {
    return 'Upload service is temporarily unavailable. Try again in a moment.';
  }

  if (message.includes('network error')) {
    return 'Network error while uploading. Check your connection and try again.';
  }

  return 'Upload failed unexpectedly. Try again.';
};
